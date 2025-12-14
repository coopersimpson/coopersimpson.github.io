// get the ninja-keys element
const ninja = document.querySelector('ninja-keys');

// add the home and posts menu items
ninja.data = [{
    id: "nav-about",
    title: "about",
    section: "Navigation",
    handler: () => {
      window.location.href = "/";
    },
  },{id: "nav-blog",
          title: "blog",
          description: "",
          section: "Navigation",
          handler: () => {
            window.location.href = "/blog/";
          },
        },{id: "post-testing-kotlin-coroutines-inside-viewmodels",
        
          title: "Testing Kotlin coroutines inside ViewModels",
        
        description: "best practices for coroutine testing in Android",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/testing-kotlin-coroutines-inside-viewmodels/";
          
        },
      },{id: "books-the-godfather",
          title: 'The Godfather',
          description: "",
          section: "Books",handler: () => {
              window.location.href = "/books/the_godfather/";
            },},{id: "news-personal-website-goes-live",
          title: 'Personal website goes live!',
          description: "",
          section: "News",},{id: "news-accepted-offer-to-study-a-graduate-diploma-in-information-technology-at-uq",
          title: 'Accepted offer to study a Graduate Diploma in Information Technology at UQ',
          description: "",
          section: "News",},{id: "news-graduated-from-uq-with-a-graduate-diploma-in-information-technology",
          title: 'Graduated from UQ with a Graduate Diploma in Information Technology',
          description: "",
          section: "News",},{id: "news-commenced-my-online-masters-of-science-in-computer-science-at-georgia-tech",
          title: 'Commenced my Online Masters of Science in Computer Science at Georgia Tech',
          description: "",
          section: "News",},{id: "news-started-my-role-as-a-digital-graduate-at-services-australia",
          title: 'Started my role as a digital graduate at Services Australia',
          description: "",
          section: "News",},{id: "news-promoted-to-software-developer-android-at-services-australia",
          title: 'Promoted to Software Developer (Android) at Services Australia',
          description: "",
          section: "News",},{
        id: 'social-email',
        title: 'email',
        section: 'Socials',
        handler: () => {
          window.open("mailto:%63%6F%6F%70%65%72@%63%6F%6F%70%65%72%73%69%6D%70%73%6F%6E.%63%6F%6D", "_blank");
        },
      },{
        id: 'social-github',
        title: 'GitHub',
        section: 'Socials',
        handler: () => {
          window.open("https://github.com/coopersimpson", "_blank");
        },
      },{
        id: 'social-linkedin',
        title: 'LinkedIn',
        section: 'Socials',
        handler: () => {
          window.open("https://www.linkedin.com/in/coopersimpson", "_blank");
        },
      },{
      id: 'light-theme',
      title: 'Change theme to light',
      description: 'Change the theme of the site to Light',
      section: 'Theme',
      handler: () => {
        setThemeSetting("light");
      },
    },
    {
      id: 'dark-theme',
      title: 'Change theme to dark',
      description: 'Change the theme of the site to Dark',
      section: 'Theme',
      handler: () => {
        setThemeSetting("dark");
      },
    },
    {
      id: 'system-theme',
      title: 'Use system default theme',
      description: 'Change the theme of the site to System Default',
      section: 'Theme',
      handler: () => {
        setThemeSetting("system");
      },
    },];
