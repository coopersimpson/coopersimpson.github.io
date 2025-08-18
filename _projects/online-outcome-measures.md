---
layout: page
title: Online Outcome Measures
description: orthopedic outcome measures for clinicians and patients
img: assets/img/online-outcome-measures.jpg
importance: 3
category: portfolio
---

An online tool allowing for simple and quick completion of orthopedic outcome measures by clinicians or patients. Results can be exported into PDF format. For each outcome measure page, some brief information about the score and its relevant literature is cited. View live deployment <a href="https://www.coopersimpson.com/online-outcome-measures/">here</a>.

<div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid path="assets/img/online-outcome-measures.jpg" title="neck disability index" class="img-fluid rounded z-depth-1" %}
    </div>
</div>

<h1>Libraries</h1>
<h2>PDF Lib</h2>
This app utilises the pdf-lib library for filling out the PDF forms and modifying existing PDF content. After some research, I found this tool to be the most suitable for my use, as many PDF libraries only allow for the creation of PDFs, rather than modification of existing PDFs.

<h2>Motivation</h2>
Compared to tools like OrthoToolKit, Online Outcome Measures opts to modify existing and official outcome measure PDFs, rather than generating a unique form. Therefore the resultant document retains the formatting as intended by the score developer.

Using these tools can reduce friction and increase the productivity of clincians. Because the tool is hosted on a simple webpage, the outcome measures can be filled out easily by patients rather than clincians.