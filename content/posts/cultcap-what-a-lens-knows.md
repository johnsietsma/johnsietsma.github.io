---
title: "CultCap: What a lens knows about itself"
publishDate: 2026-09-16T00:00:00+10:00
description: "Focal length, principal point, distortion and focus breathing — what camera intrinsics are, why a splat pipeline lives or dies on them, and why the numbers on the spec sheet aren't the ones you want."
tags:
  - cultcap
  - camera
  - photogrammetry
  - intrinsics
draft: true
---

Every 3D reconstruction, splat or otherwise, rests on one small piece of maths: given a
point in the world and a camera, where does that point land in the image? The camera
half of that question is the *intrinsics* — a handful of numbers describing the lens.

Get them slightly wrong and everything downstream is slightly wrong in a way that no
amount of training can fix. So this post is about what those numbers mean, where they
come from on a phone, and the several ways I got them wrong before I got them right.

## The pinhole model, and what's missing from it

The simplest camera is a pinhole. Light from a point in the world passes through the
pinhole and lands on the sensor. Two things determine where:

**Focal length** — the distance from the pinhole to the sensor, measured in pixels. It
sets how big things look. A longer focal length is a narrower field of view. Halve the
focal length and everything in the image moves twice as far from the centre.

**Principal point** — where the optical axis meets the sensor. Usually near the centre of
the image, never exactly.

<!-- TODO: diagram — pinhole, sensor plane, focal length f, principal point (cx, cy), a world point projecting to (u, v) -->

Real lenses aren't pinholes. Glass bends light differently at the edges than the centre,
so straight lines bow outward or inward — **radial distortion**, usually modelled as a
polynomial in distance from the centre with coefficients called k1, k2, k3 and so on.
Phone lenses are wide and cheap, and they distort noticeably.

And real lenses focus. To focus closer, the lens elements move, and moving them changes
the effective focal length. This is **focus breathing**: as the camera refocuses through
a capture, the field of view changes by a few percent. On a phone with continuous
autofocus, walking around a sculpture means refocusing constantly.

So a full description of "the camera" for one frame is: a focal length, a principal
point, some distortion coefficients — and all of them can differ from the previous
frame.

## Why I care

The pose solver (next post) works by finding the same physical points in many images and
asking what camera positions would explain where they landed. It can solve for the
intrinsics too, but only by trading them off against everything else. If you tell it the
focal length is 1350 pixels and it's really 1450, it will bend the camera positions to
compensate, and those bent positions are what the splat trains against.

Focal error is particularly nasty because it's *radial*: points near the edge of the
frame are displaced more than points near the centre. A wrong principal point shifts the
whole image uniformly, and a small camera rotation absorbs that almost perfectly. A wrong
focal length can't be absorbed by any pose. It shows up as blur, because the same
surface point projects to slightly different places in different views and the model
splits the difference.

## Where the numbers come from on Android

Camera2 gives you intrinsics in two places, and they are not the same.

`CameraCharacteristics.LENS_INTRINSIC_CALIBRATION` is a static table for the device. One
set of numbers, forever.

`CaptureResult.LENS_INTRINSIC_CALIBRATION` comes back with every frame, and on a device
that supports it, changes with focus. Same for `LENS_DISTORTION`.

The static table is what every tutorial reaches for. It's also, on the phone I'm using,
several percent off — the per-frame values sit consistently above it. Google's own
camera engineers have said the static figures are design values that change with focus
distance, orientation and the age of the device, and that the per-frame results are what
you want for structure-from-motion. It's just not where anyone looks first.

<!-- TODO: chart — per-frame fx vs focus distance across one capture, with the static value as a horizontal line -->

## What I did

1. **Record the per-frame intrinsics and distortion**, straight from the capture
   result, for every frame. The app already writes a metadata row per frame; these are
   four more fields.

2. **Record the sensor geometry too.** The intrinsics are expressed in the sensor's
   full pixel array, and my saved frames are a scaled crop of it. I tried deriving the
   scale factor from the principal point and got a value that was very nearly, but not
   exactly, right — a couple of pixels at the frame edge, which is the same size as the
   solver's tolerance for a good match. Now the app writes the array dimensions and the
   pipeline computes the scale exactly.

3. **Seed the solver with what the lens said, and don't let it argue.** Each frame gets
   its own camera in the reconstruction, initialised from its own recorded values, with
   focal length held fixed. The solver still refines poses freely. The next post is about
   what happened when I let it refine focal length too.

4. **Retrofit old captures.** Sessions recorded before the app logged these values still
   have focus distance in their metadata, and breathing is a clean linear function of
   focus distance, so their per-frame focal lengths can be reconstructed from a fitted
   curve. Not as good as a measurement, much better than the static table.

## Gotchas

**The spec sheet lies a little, consistently.** Not a bug, just a design value. But it's
a systematic error, and systematic errors in the focal length can't be averaged away by
having more frames. If you only fix one thing after reading this post, use the per-frame
values.

**Two pixel frames, one conversion, easy to get wrong.** Intrinsics are in sensor-array
pixels. Your image is in image pixels. The scale between them is not necessarily what
the aspect ratio suggests, because the readout may crop as well as scale. Record it;
don't infer it.

**Orientation metadata will rotate your world.** Phone sensors are mounted landscape.
The saved image is stored sensor-native, and there's a `SENSOR_ORIENTATION` field that
says how to rotate it for display. I computed the rotation between the accelerometer
frame and the camera frame for a portrait camera, and stored landscape frames. Every
session had its notion of "up" twisted 90 degrees about the lens axis. What made it
hard to find: a top-down capture only spins the up-vector's azimuth, which is harmless,
while a level walk-around rotates "up" into the horizontal. It surfaced as one model
rendering on its side, months in. The fix was one matrix multiply and a marker in the
metadata so old sessions get corrected on load.

<!-- TODO: image — gravity vector drawn onto a frame, before and after the fix -->

**Stabilisation moves the principal point.** Optical image stabilisation physically
shifts the lens to counter hand shake. The principal point moves with it, by tens of
pixels between frames. It's another argument for per-frame cameras rather than one
shared camera per capture.

**The solver can't constrain what the data doesn't show.** A distortion model with six
coefficients sounds better than one with three. But the higher-order terms only matter
at the extreme corners of the frame, and if your object never reaches the corners the
solver has no evidence to fit them against. Left free, they don't stay near zero — they
wander to physically impossible values that happen to reduce the error on the data they
*do* see, and take the rest of the solution with them. Fix them at the recorded values.

## The pattern

Everything in this post is the same move: the camera already knows something about
itself, the standard tooling ignores it, and the reconstruction pays. Reading the
per-frame values instead of the static table, recording the sensor geometry instead of
inferring it, composing the orientation instead of assuming it. None of it is novel. All
of it is the difference between a model that's slightly soft everywhere and one that
isn't.

Next: finding where the camera was, and the surprising ways a solver will cheat if you
let it.
