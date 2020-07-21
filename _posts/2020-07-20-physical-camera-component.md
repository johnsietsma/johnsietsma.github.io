---
layout: post
title: Physical Camera Component
tags: unity, hdrp, camera
---

[![Physical Camera Control]({{ site.assetsurl }}/images/physical_camera/PhysicalCameraControlComponent.PNG)](https://github.com/johnsietsma/PhysicalCameraControl)

Unity HDRP has a physical section on it's camera component. It mimics real-life camera settings like sensor, size, ISO, focal length and aperture. These settings are used by the camera itself, but also by other systems that affect rendering, like the `Exposure` and `Depth of Field` volume overrides.

This allows someone who is familiar with cameras to operate within Unity. But it also helps the user setup physically realistic camera settings, all in one place.

The settings in physical camera are simply raw values, so can be difficult to get right. I made a component that sits along side the camera component to help with this.

Current features:

* Standard camera presets for ISO, F/Stop and focal lengths.
* Exposure locking by automatically adjusting shutter speed or aperture settings. Makes it easy to set up depth of field.
* Dolly zoom to make it easy to frame a shot while adjusting the focal length.

Find the project on [Github](https://github.com/johnsietsma/PhysicalCameraControl).

Here's a short tutorial video on the the physical camera settings and using this component to frame and expose a shot.

[![Framing and Exposure using Unity's HDRP Physical Camera](https://img.youtube.com/vi/loddo4XcYng/0.jpg)](https://youtu.be/loddo4XcYng)

<!--more-->


Wide shot:

![Wide Shot]({{ site.assetsurl }}/images/physical_camera/close2.PNG){:height="40%" width="40%"}

Narrow shot:

![Narrow Shot]({{ site.assetsurl }}/images/physical_camera/narrow1.PNG){:height="40%" width="40%"}

Dolly Zoom:

![Dolly Zoom]({{ site.assetsurl }}/images/physical_camera/DollyZoom.gif){:height="40%" width="40%"}

Lock Exposure - Change F/Stop for Depth of Field effect without ruining exposure:

![Lock Exposure]({{ site.assetsurl }}/images/physical_camera/LockExposure.gif){:height="40%" width="40%"}
