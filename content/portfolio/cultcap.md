---
title: "CultCap"
organization: CultCap
position: Creator and developer
date: 2026-05-01
platforms: [Android, Cloud]
technologies: [Gaussian splatting, gsplat, PyTorch, COLMAP, Kotlin, Camera2, Python, Cloudflare]
www: https://cultcap.app/
splash: "/assets/images/cultcap/tile.jpg"
hero: false
order: 0
categories: [project]
---

A minute of walking around an object with your phone. Back comes a 3D model you can see from any angle.

<figure>
  <video autoplay muted loop playsinline preload="metadata" style="display: block; margin-inline: auto; max-height: 80vh; width: auto; max-width: 100%;">
    <source src="https://media.johnsietsma.com/video/cultcap/project/bronze-capture-and-model-vertical.mp4" type="video/mp4">
  </video>
  <figcaption>Lovers' Metamorphosis, Guy Boyd, 1979, at the Newcastle Art Gallery. Top: the capture. Bottom: the model.</figcaption>
</figure>

CultCap is a phone capture app and a Gaussian splat pipeline for objects: a sculpture in a regional
gallery, an artefact in a historical society's back room, a product for a shopfront. No markers,
no rig, no studio lighting, no manual clean-up. The capture uploads, the pipeline removes the room,
and what comes back is something you can put on a website: a turntable, a video, an image from any angle.

## From the gallery floor

<div class="video"><div class="row">
  <video controls muted loop playsinline preload="metadata" width="100%">
    <source src="https://media.johnsietsma.com/video/cultcap/newcastle/caravan_model.mp4" type="video/mp4">
  </video>
  <video controls muted loop playsinline preload="metadata" width="100%">
    <source src="https://media.johnsietsma.com/video/cultcap/newcastle/wall_model.mp4" type="video/mp4">
  </video>
</div></div>

A piece behind glass, and a long, thin wall piece (Puff, John Turier, 2004) captured from one side
only. The app tracks which angles the capture covered, and the camera path stays inside them, so the
model is never shown from somewhere it wasn't photographed.

## Photograph vs reconstruction

Drag the handle: the left half is the photograph, the right half is the reconstruction rendered from
the same camera position, with the room removed. This photograph was held out of training, so the
model never saw it.

<img-comparison-slider aria-label="Drag to compare the photograph with the reconstruction">
  <figure slot="first" class="compare-pane">
    <img src="/assets/images/cultcap/bronze-photograph.jpg" alt="Photograph of a bronze sculpture of two embracing figures on a white plinth, on a stone gallery floor.">
    <figcaption>Photograph</figcaption>
  </figure>
  <figure slot="second" class="compare-pane">
    <img src="/assets/images/cultcap/bronze-reconstruction.jpg" alt="The same view rendered from the reconstructed 3D model, with the gallery removed.">
    <figcaption>Reconstruction</figcaption>
  </figure>
</img-comparison-slider>

## How it's built

- **Capture app**: native Android (Kotlin, Camera2). Full-resolution stills with per-frame exposure,
  focus and motion-sensor metadata, because a splat reproduces every quirk of the camera.
- **Pipeline**: structure from motion on the original photographs, never resampled; automatic
  background removal; frames that disagree with the consensus object are dropped; gsplat training
  with lens distortion handled at the loss.
- **Measured, not guessed**: every change is scored on held-out photographs before it's adopted,
  and dropped if it doesn't earn its place.

## Writing

- [Why I'm doing this](/posts/cultcap-why-im-doing-this/)
- [A day at the Newcastle Art Gallery](/posts/cultcap-newcastle-art-gallery/)
- [Free focus and camera intrinsics](/posts/cultcap-free-focus/)
- [All CultCap posts](/tags/cultcap/)

Curators, artists, anyone with an object worth capturing: [john@cultcap.app](mailto:john@cultcap.app).
