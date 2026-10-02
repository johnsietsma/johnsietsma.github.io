---
title: "CultCap - Introduction"
publishDate: 2026-08-26T00:00:00+10:00
description: "I've been working on a capture app that turns an object into 3D you can look at from any angle — a sculpture in a gallery, an important cultural artefact, or a product for your shopfront."
tags:
  - cultcap
  - gaussian-splatting
  - photogrammetry
draft: false
---

I've been working on a capture app. The primary purpose is to capture objects and then
present them in the best way possible. This could be a sculpture in a gallery, an important
cultural artefact, or a product you'd like to have on your shopfront.

Here is a pair of shoes I've captured with the app.

It's early days, but I'm aiming to add custom lighting, virtual cameras and sharing. It's
virtual production for real-world objects.

Drag the handle: the left half is the photograph, the right half is the reconstruction
rendered from the same camera position, with the room removed.

<img-comparison-slider aria-label="Drag to compare the photograph with the reconstruction">
  <figure slot="first" class="compare-pane">
    <img src="/assets/images/cultcap/shoes-photograph.jpg" alt="Photograph of a pair of leather shoes on an oak floor.">
    <figcaption>Photograph</figcaption>
  </figure>
  <figure slot="second" class="compare-pane">
    <img src="/assets/images/cultcap/shoes-reconstruction.jpg" alt="The same view rendered from the reconstructed 3D model, with the background removed.">
    <figcaption>Reconstruction</figcaption>
  </figure>
</img-comparison-slider>

