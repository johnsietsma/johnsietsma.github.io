---
layout: post
title: A fluid sim with flow map ShaderToy experiment.
tags: fluidsim,shadertoy,flowmap,shader
---

Following on from my previous [Flow Map post]({% post_url 2015-12-01-flow-maps %}), I wanted to see what flow maps would look like with maps generated in real time using a fluid sim.

<!--more-->

Using the well known [GPU Gems fluid sim article](http.developer.nvidia.com/GPUGems/gpugems_ch38.html) and a [ShaderToy implmentation](https://www.shadertoy.com/view/ldd3WS) as reference I added my flow map shader over the top and got this result.

<iframe width="640" height="360" frameborder="0" src="https://www.shadertoy.com/embed/4d3SRX?gui=true&t=10&paused=true&muted=false" allowfullscreen></iframe>

It came out better then I expected, especially considering the Jacobi solver is only run once! (rather then the 20+ time suggested in the article).

The next step may be to write a WebGL version and try some more stylised water rendering.
