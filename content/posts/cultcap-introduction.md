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

<div class="compare-wipe" id="shoe-wipe">
<img src="/assets/images/cultcap/shoes-photograph.jpg" alt="Photograph of a pair of leather shoes on an oak floor.">
<img class="top" src="/assets/images/cultcap/shoes-reconstruction.jpg" alt="The same view rendered from the reconstructed 3D model, with the background removed.">
<span class="wipe-tag left">Photograph</span>
<span class="wipe-tag right">Reconstruction</span>
<input id="shoe-wipe-input" type="range" min="0" max="100" value="50" aria-label="Wipe between the photograph and the reconstruction">
<div class="wipe-handle" aria-hidden="true"></div>
</div>

<style>
.compare-wipe { position: relative; aspect-ratio: 4 / 3; overflow: hidden; background: #08080a; touch-action: pan-y; cursor: ew-resize; margin: 2rem 0; }
.compare-wipe img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; margin: 0; user-select: none; -webkit-user-drag: none; }
.compare-wipe .top { clip-path: inset(0 0 0 var(--split, 50%)); }
.compare-wipe .wipe-handle { position: absolute; top: 0; bottom: 0; left: var(--split, 50%); width: 2px; background: #c98a3e; pointer-events: none; }
.compare-wipe .wipe-handle::after { content: ""; position: absolute; top: 50%; left: 50%; width: 40px; height: 40px; transform: translate(-50%, -50%); border: 2px solid #c98a3e; border-radius: 50%; background: rgba(8,8,10,0.55); }
.compare-wipe .wipe-tag { position: absolute; top: 0.8rem; font-size: 0.7rem; letter-spacing: 0.12em; text-transform: uppercase; color: #e8e4dd; background: rgba(8,8,10,0.72); padding: 0.3rem 0.55rem; pointer-events: none; }
.compare-wipe .wipe-tag.left { left: 0.8rem; }
.compare-wipe .wipe-tag.right { right: 0.8rem; }
.compare-wipe input { position: absolute; inset: 0; width: 100%; height: 100%; opacity: 0; margin: 0; cursor: ew-resize; }
</style>

<script>
(function () {
  var box = document.getElementById("shoe-wipe");
  var input = document.getElementById("shoe-wipe-input");
  function set(pct) {
    var v = Math.max(0, Math.min(100, pct));
    box.style.setProperty("--split", v + "%");
    if (Number(input.value) !== Math.round(v)) input.value = Math.round(v);
  }
  input.addEventListener("input", function () { set(Number(input.value)); });
  function fromPointer(e) {
    var r = box.getBoundingClientRect();
    set(((e.clientX - r.left) / r.width) * 100);
  }
  var dragging = false;
  function stop(e) {
    if (!dragging) return;
    dragging = false;
    if (box.hasPointerCapture(e.pointerId)) box.releasePointerCapture(e.pointerId);
  }
  box.addEventListener("pointerdown", function (e) { dragging = true; box.setPointerCapture(e.pointerId); fromPointer(e); });
  box.addEventListener("pointermove", function (e) { if (dragging) fromPointer(e); });
  box.addEventListener("pointerup", stop);
  box.addEventListener("pointercancel", stop);
  set(50);
})();
</script>

