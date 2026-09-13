---
title: "CultCap: A day at the Newcastle Art Gallery"
publishDate: 2026-09-13T00:00:00+10:00
description: "Three sculptures captured with the CultCap phone app at the newly renovated Newcastle Art Gallery, processed in the cloud with no hand clean-up, and shown as turntable clips the coverage map chose."
tags:
  - cultcap
  - capture
  - gaussian-splatting
  - newcastle
draft: false
---

The [Newcastle Art Gallery](https://newcastleartgallery.nsw.gov.au/) has recently reopened. It's really, really good, I encourage anyone in Newcastle, Australia to have a look.

Here are three sculptures I captured while I was visiting the gallery. They show the process of capturing using the CultCap app. Walking around the objects, capturing all angles. The capture is then uploaded to be processed in the cloud. This is fully automatic, there is no clean up or manual background removal. As you can see the capture takes under a minute.

It's a work in progress. There is still more to be done; cleaner edges, tone mapping and faithful colour reproduction. 

Next I want to strip out the gallery lighting and relight the object virtually: virtual production for captured objects.


## Pink caravan

The first one is a challenging subject. It's behind glass and I couldn't walk all the way around. It's not perfect, but I'm very happy with the result given the circumstances.

The app keeps track of all the angles covered, so I can create the video from well trained angles. This sidesteps a key issue in gaussian splats of messy splats in unknown areas.

Unfortunately I couldn't find the name of the art work or the artist. Please tell me if you know so I can credit properly.

<figure>
  <video controls muted loop playsinline preload="metadata" width="100%">
    <source src="/assets/video/cultcap/newcastle/caravan_model.mp4" type="video/mp4">
  </video>
  <figcaption>The reconstructed model, orbiting only through the angles the capture covered.</figcaption>
</figure>

<figure>
  <video controls muted loop playsinline preload="metadata" width="100%">
    <source src="/assets/video/cultcap/newcastle/caravan_capture.mp4" type="video/mp4">
  </video>
  <figcaption>The capture: one pass along the front of the case.</figcaption>
</figure>


## Lovers' Metamorphosis, Guy Boyd, 1979

This one is a little easier, a bronze on a plinth in the middle of a room. The tricky parts are reflections on the sculpture and trying not to cast a shadow as I walk around.

<figure>
  <video controls muted loop playsinline preload="metadata" width="100%">
    <source src="/assets/video/cultcap/newcastle/bronze_model.mp4" type="video/mp4">
  </video>
  <figcaption>The reconstructed model.</figcaption>
</figure>

<figure>
  <video controls muted loop playsinline preload="metadata" width="100%">
    <source src="/assets/video/cultcap/newcastle/bronze_capture.mp4" type="video/mp4">
  </video>
  <figcaption>The capture: a full walk around the plinth.</figcaption>
</figure>


## Puff, John Turier, 2004

Another capture from one side only. This is a tricky one with long, thin objects.


<figure>
  <video controls muted loop playsinline preload="metadata" width="100%">
    <source src="/assets/video/cultcap/newcastle/wall_model.mp4" type="video/mp4">
  </video>
  <figcaption>The reconstructed model, from the covered side.</figcaption>
</figure>

<figure>
  <video controls muted loop playsinline preload="metadata" width="100%">
    <source src="/assets/video/cultcap/newcastle/wall_capture.mp4" type="video/mp4">
  </video>
  <figcaption>The capture, from one side only.</figcaption>
</figure>


## Not a Capture, Looking for Felix

Not a capture, just an amazing tactile sculpture. Dani Marti's *Looking for Felix* (2000) is a room of hanging beads you walk through. It feels and looks amazing, the light, parallax of beads, the tinkling sounds. A sensory experience with big themes, quite sobering at the same time.

<figure>
  <video controls muted loop playsinline preload="metadata" width="100%">
    <source src="/assets/video/cultcap/newcastle/hangingbead_walk.mp4" type="video/mp4">
  </video>
  <figcaption>Walking through Looking for Felix.</figcaption>
</figure>

## Follow along

If any of this interests you, I'd like to hear from you. Curators, artists, anyone with an object worth capturing: email me at [john@cultcap.app](mailto:john@cultcap.app) or find me on [LinkedIn](https://www.linkedin.com/in/jsietsma/).

For updates as the app grows, there's a newsletter on the [CultCap website](https://cultcap.app/). A few emails a year, only when there's something to see.
