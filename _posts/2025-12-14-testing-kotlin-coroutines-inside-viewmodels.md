---
layout: post
title: Testing Kotlin coroutines inside ViewModels
date: 2025-12-14
description: best practices for coroutine testing in Android
tags:
categories:
published: true
---
Testing coroutines in the Kotlin / Android world can be confusing to set up nicely, and can cause unexpected behaviour if not done correctly. This guide will outline some best practices to set you up for success.
## Setup
The `kotlinx.coroutines.test` library is used for testing coroutines in Kotlin.
```kotlin
dependencies {
    testImplementation "org.jetbrains.kotlinx:kotlinx-coroutines-test:$coroutines_version"
}
```
## Coroutine testing basics
To call any `suspend` function we must run it within a coroutine context, this is no different for our tests. For testing we call our `suspend` functions inside the `runTest` function. This is a test helper function that creates a `TestCoroutineScheduler`, a `TestDispatcher` and a `TestScope` for running our coroutine tests.

The `TestCoroutineScheduler` is useful for skipping and managing delays, making our tests run faster.

There are two types of `TestDispatcher`:
- `StandardTestDispatcher` (default) - Gives most control over our testing, more deterministic. Does not run immediately and requires calling `advanceUntilIdle()` and similar. Typically we use this for unit tests.  
- `UnconfinedTestDispatcher` - Runs the coroutine immediately (eagerly), continuing until first suspension. Not recommended unless you explicitly want eager execution.

`runTest` runs the test in a `TestScope`. For ViewModel tests we want the tests themselves to run inside a `TestScope`, we do not want to inject this scope into our ViewModels. ViewModels should use their own `viewModelScope`. What matters is that both the test and the ViewModel run on dispatchers that are driven by the same `TestCoroutineScheduler`, so we can deterministically advance and drain work.
## Setup ViewModel for testing
Say we have a ViewModel that has an injected service that calls an API that we wish to run on the `Dispatchers.IO` dispatcher:

```kotlin
class UserViewModel(
	private val userService: UserService,
) : ViewModel() {

    fun getUsers() {
        viewModelScope.launch {
	        withContext(Dispatchers.IO) {
	            val result = userService.getUsers()
	        }
        }
    }
}
```

Note: If `userService.getUsers()` is a Retrofit `suspend` function, wrapping it in `Dispatchers.IO` is not strictly required, as Retrofit handles threading internally. Dispatcher injection is still shown here to demonstrate how to control explicitly dispatched or blocking work in tests.

As previously mentioned, our tests should run on the same test dispatcher. Currently, in our ViewModel we don't have a way to change the dispatcher for testing. The solution is injecting the dispatcher like so:

```kotlin
class UserViewModel(
	private val userService: UserService,
	private val dispatcher: CoroutineDispatcher = Dispatchers.IO,
) : ViewModel() {

    fun getUsers() {
        viewModelScope.launch {
	        withContext(dispatcher) {
	            val result = userService.getUsers()
	        }
        }
    }
}
```

By injecting our dispatcher we now have the flexibility to inject our test dispatchers. A basic coroutine test would then be set up something like this:

```kotlin
class UserViewModelTest {

    @Mock
    lateinit var userService: UserService

    private lateinit var viewModel: UserViewModel

    @Before
    fun setup() {
        MockitoAnnotations.openMocks(this)
    }

    @Test
    fun `user service fetches users successfully`() = runTest {
        // Use the SAME scheduler as runTest so advanceUntilIdle() controls everything
        val testDispatcher = StandardTestDispatcher(testScheduler)

        viewModel = UserViewModel(
            userService = userService,
            dispatcher = testDispatcher
        )

        // Given
        whenever(userService.fetchUsers())
            .thenReturn(listOf(User("Alice")))

        // When
        viewModel.loadUsers()

        // Drive queued coroutines
        advanceUntilIdle()

        // Then
        assertEquals(
            UiState.Success(listOf(User("Alice"))),
            viewModel.uiState.value
        )
    }
}

```

## Cleaner setup for ViewModels that do not explicitly define a dispatcher
If your ViewModel only uses `viewModelScope.launch { }` and does not explicitly use a dispatcher such as `Dispatchers.IO` or `Dispatchers.Default`, we do not have to inject a dispatcher and can structure our code in a more convenient and cleaner way.

Note that `viewModelScope.launch { }` runs on `Dispatchers.Main.immediate`, i.e. it implicitly behaves the same as `viewModelScope.launch(Dispatchers.Main.immediate) { }`.

This simplified approach can be achieved with two supporting functions provided by the coroutine testing framework:
- `Dispatchers.setMain(StandardTestDispatcher())` - Temporarily overrides the main dispatcher with the test dispatcher.
- `Dispatchers.resetMain()` - Resets the dispatcher back to the real main thread dispatcher.

Setting the main should be done before every test and resetting the main after each test. For convenience we can utilise the `TestWatcher()` class and override its function to create reusable logic for our tests. 

```kotlin
class MainDispatcherRule(
    val dispatcher: TestDispatcher = StandardTestDispatcher()
) : TestWatcher() {
    override fun starting(description: Description) {
        Dispatchers.setMain(dispatcher)
    }

    override fun finished(description: Description) {
        Dispatchers.resetMain()
    }
}

```

With this rule setup, testing a ViewModel that exclusively uses the main dispatcher without injection setup might look something like this:

```kotlin
class UserViewModelTest {

    @get:Rule
    val mainDispatcherRule = MainDispatcherRule()

    @Mock
    lateinit var userService: UserService

    private lateinit var viewModel: UserViewModel

    @Before
    fun setup() {
        MockitoAnnotations.openMocks(this)

        viewModel = UserViewModel(
            userService = userService
        )
    }

    @Test
    fun `user service fetches users successfully`() = runTest {
        // Given
        whenever(userService.fetchUsers())
            .thenReturn(listOf(User("Alice")))

        // When
        viewModel.loadUsers()

        advanceUntilIdle()

        // Then
        assertEquals(
            UiState.Success(listOf(User("Alice"))),
            viewModel.uiState.value
        )
    }
}
```

This results in less boilerplate and easier to read code.
## Controlling coroutine test execution
When you use the `StandardTestDispatcher`, coroutines are scheduled rather than executed immediately. This is by design, as it lets us control how the tests run.

Inside `runTest { }` you get a few helper functions to drive it:
- `runCurrent()` - for asserting immediate states without completing everything
- `advanceUntilIdle()` - getting the final state after all work completes.
- `advanceTimeBy()` - when testing logic involving `delay(...)`, timeouts etc...

Here is an example of asserting an intermediate state in our ViewModel using `runCurrent()` followed by an `advanceUntilIdle()` call:

```kotlin
// boilerplate as per previous code blocks here

@Test
fun `loadUsers emits Loading before Success`() = runTest {
	// Given
    whenever(userService.fetchUsers()).thenReturn(listOf(User("Alice")))

	// When
    viewModel.loadUsers()

    // Run tasks scheduled "now" (e.g., the launch start + set Loading)
    runCurrent()
    assertEquals(UiState.Loading, viewModel.uiState.value)

    // Drain everything to completion
    advanceUntilIdle()
    assertEquals(UiState.Success(listOf(User("Alice"))), viewModel.uiState.value)
}
```

Here is another example that uses `advanceTimeBy()` to test our `delay` in our ViewModel:

```kotlin
// Say we have something like this in our ViewModel
viewModelScope.launch {
    _uiState.value = UiState.Loading
    delay(1_000)
    _uiState.value = UiState.Done
}

@Test
fun `delayed transition happens after 1 second`() = runTest {
    viewModel.doWork()

    runCurrent()
    assertEquals(UiState.Loading, viewModel.uiState.value)

    advanceTimeBy(999)
    assertEquals(UiState.Loading, viewModel.uiState.value)

    advanceTimeBy(1)
    runCurrent()
    assertEquals(UiState.Done, viewModel.uiState.value)
}
```


When using `StandardTestDispatcher` nothing runs until you tell it to. Understanding its associated helper functions is the key for making coroutine-based ViewModel tests fast and deterministic.
## Sources
- https://developer.android.com/kotlin/coroutines/test
- https://medium.com/@kacper.wojciechowski/kotlin-unit-testing-guide-part-3-coroutines-8f740bfb5e4c
