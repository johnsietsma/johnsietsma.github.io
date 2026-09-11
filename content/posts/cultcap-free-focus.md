---
title: "CultCap: Free focus and camera intrinsics"
publishDate: 2026-09-11T00:00:00+10:00
description: "Focal length, principal point, distortion — what camera intrinsics are, why a splat pipeline lives or dies on them."
tags:
  - cultcap
  - camera
  - photogrammetry
  - intrinsics
draft: false
---

I chose to write my own app and splat trainer for a number of reasons. I'm going to walk through the entire process in a series of posts to show why I thought this was necessary.

A key goal for CultCap was to avoid needing expensive equipment and technical knowledge. Traditionally the recommendation is to use a DSLR camera and lock exposure, focus and white balance. This requires the operator to know how to get an appropriate depth of field and to maintain a constant distance from the subject.

I decided to unlock everything and deal with the changing focus, exposure and white balance in the app and training pipeline. In a later post I'll explain why I reversed the white balance decision.

In this post I just want to talk about focus. 

In order to do a 3D reconstruction we need a series of images that are consistent with each other. We're going to try to match each image and use parallax to find points in 3D space using a process called Structure from Motion (SfM). If the images differ from each other, then those points will be in the wrong position.

The camera properties that map from a 3D point in the real world to a pixel on a sensor are called intrinsics.

## The pinhole model

The simplest camera is a pinhole. Light from a point in the world passes through the
pinhole and lands on the sensor. People have been walking into them since the 1600s.

![Kircher's 1646 engraving of a room-sized camera obscura: the landscape outside projects through a hole onto the wall inside.](/assets/images/cultcap/intrinsics/camera-obscura-kircher-1646.jpg)

Two things determine where the light lands:

**Focal length** — the distance from the pinhole to the sensor, measured in pixels. It
sets how big things look. A longer focal length is a narrower field of view. Double the
focal length and everything in the image moves twice as far from the centre.

**Principal point** — where the optical axis meets the sensor. Usually near the centre of the image, but probably not exactly in the centre.

![Diagram of a pinhole camera: a 3D point projects through the pinhole onto the sensor; focal length and principal point labelled.](/assets/images/cultcap/intrinsics/pinhole.svg)

Real lenses aren't pinholes. Glass bends light differently at the edges than the centre,
so straight lines bow outward or inward — **radial distortion**. Phone lenses are wide and cheap, and they distort noticeably.

![Barrel distortion: straight lines bow outward from the centre.](/assets/images/cultcap/intrinsics/barrel-distortion.svg)

## Traditional Solution

In image processing, the standard way to deal with this is to lock focus and calibrate the lens.

You can either trust the lens manufacturer's distortion numbers or you can calibrate the lens yourself by taking a picture of a ChArUco board. It's a real world reference that has a grid of known size. Then you can figure out the radial distortion and undistort all your images before you process them. OpenCV has standard functions to help you do this.

![A ChArUco calibration board: a chessboard with a marker in every white square.](/assets/images/cultcap/intrinsics/charuco-board.png)

Theoretically I can unlock the focus, get intrinsics from the camera API and undistort each image before SfM and splat training. Perfect undistorted images.

But there are some gotchas with this approach. It remaps the focal length and principal point, each image crops slightly differently and sampling images makes the image more blurry. These silently harm your result.

## What I did

Use the recorded intrinsics in both SfM and the splat training.

The SfM solver I'm using accepts cameras for each image, so I can set them up with my pre-recorded data. Importantly I don't let the solver change these values. By default it will "solve" camera intrinsics, but this led to ghost geometry. The focal lengths it generated varied 86 percent across a capture when the lens itself moved 3.5 percent, because the solver found the dolly-zoom ambiguity instead of the lens.

![Solver-fitted focal length per frame swinging 68 percent, against the lens's measured value, which varies 3.5 percent.](/assets/images/cultcap/intrinsics/fitted-vs-measured-focal.png)

The splat trainer will use the intrinsics to render the splats. So the training loss compares the distorted source image against the distorted splat render. Rather than change the source image, I change the rendered image.

This has been a key learning throughout this process and a flip from my traditional approach. Don't move pixels, build distortions into the trainer. More on that in future posts.

## Gotchas

**Two intrinsics sources in Android Camera2 API.** Camera2 gives you intrinsics in two places, and they are not the same. `CameraCharacteristics.LENS_INTRINSIC_CALIBRATION` is a static table for the device. `CaptureResult.LENS_INTRINSIC_CALIBRATION` comes back with every frame, and on a device that supports it, changes with focus. Same for `LENS_DISTORTION`.

Testing on a Google Pixel showed the static table was several percent off — the per-frame values sit consistently above it. [A post by a Google camera engineer](https://groups.google.com/a/android.com/g/camerax-developers/c/HR6D7OR7jzU) said "These values are best used from the capture results since they may change based on the camera's focus distance, physical orientation, and device age."

![Per-frame focal length against focus distance for one capture: a straight line, with the static table value far below.](/assets/images/cultcap/intrinsics/focus-breathing.png)

**Two pixel frames, one conversion, easy to get wrong.** Intrinsics are in sensor-array
pixel space. Your image is in image pixel space. The scale between them is not necessarily what the aspect ratio suggests, because the readout may crop as well as scale. Record it; don't infer it.

**Orientation metadata will rotate your world.** Phone sensors are mounted landscape.
The saved image is stored sensor-native, and there's a `SENSOR_ORIENTATION` field that
says how to rotate it for display. I computed the rotation between the accelerometer
frame and the camera frame for a portrait camera, and stored landscape frames. Every
session had its notion of "up" twisted 90 degrees about the lens axis. What made it
hard to find: a top-down capture only spins the up-vector's azimuth, which is harmless,
while a level walk-around rotates "up" into the horizontal. It surfaced as one model
rendering on its side, months in. The fix was one matrix multiply and a marker in the
metadata so old sessions get corrected on load.

![Two frames with the gravity direction drawn on: computed the old way it points sideways; computed the corrected way it points at the table.](/assets/images/cultcap/intrinsics/gravity-before-after.jpg)

**Stabilisation moves the principal point.** Optical image stabilisation physically
shifts the lens to counter hand shake. The principal point moves with it, by tens of
pixels between frames. It's another argument for per-frame cameras rather than one
shared camera per capture.

![Principal point per frame across one capture, a cloud 200 pixels wide, moved by optical stabilisation.](/assets/images/cultcap/intrinsics/principal-point-ois.png)

**Same rule for higher-order distortion.** The higher-order distortion terms only act near the corners of the frame, and a walk-around never puts the object there. The solver had no evidence to fit them against, so it used them to shave a little error off the centre and pushed them to values no lens could have. Fix them at the recorded values, don't solve for them.

**Per-frame intrinsics don't make free focus free.** They handle the geometry of a lens that keeps refocusing. They do nothing for a frame exposed while the lens was still moving, and that turned out to be the real cost of unlocking focus. More in a future post.
