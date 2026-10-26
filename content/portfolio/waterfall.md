---
title: "Waterfall"
organization: Personal project
position: Creator and developer
date: 2026-10-01
platforms: [Windows]
technologies: [Unity, URP, Compute shaders, Fluid simulation, Intel RealSense, C#]
www: https://johnsietsma.com/portfolio/waterfall/
splash: "/assets/images/waterfall/tile.jpg"
hero: false
order: 1
categories: [personal]
---

At the 2011 Melbourne International Jazz Festival at Fed Square I saw a life-changing performance by [Chiri](https://simonbarker.bandcamp.com/album/chiri-the-return-of-spring).

I loved the music, the power and imagery. I remember Bae Il-dong falling to his knees at some point during the performance as it reached its peak. It was really amazing.

There was a backstory of Bae Il-dong living near, and doing voice training with a waterfall. I imagined him wrestling, learning, growing as he tested himself against the power of the water.

I've talked to many people about this project and finally, after many years it is coming to life.

<figure>
  <video autoplay muted loop playsinline preload="metadata" style="display: block; margin-inline: auto; max-height: 80vh; width: auto; max-width: 100%;">
    <source src="https://media.johnsietsma.com/video/waterfall/in-the-room.mp4" type="video/mp4">
  </video>
  <figcaption>Work in progress, on a sheet in the lounge room.</figcaption>
</figure>

## Seven moods

<figure>
  <video autoplay muted loop playsinline preload="metadata" width="100%">
    <source src="https://media.johnsietsma.com/video/waterfall/moods.mp4" type="video/mp4">
  </video>
  <figcaption>The same movement through all seven moods: Awe, Anticipation, Fear, Rage, Sorrow, Mysterious, Playfulness.</figcaption>
</figure>

How you stand and move influences the waterfall's energy: reaching up, crouching low, spreading wide. You go through an experience of push and pull with the water.

## The music

The music is cut, live, from Chiri's album *The Return of Spring*: Bae Il-dong's p'ansori voice, Simon Barker's drums and Scott Tinkler's trumpet. Each mood draws from its own part of the album, and of the story it sings, *Chunhyang-ga*: the love song, the laments, the exam, the return.

Music: Chiri, "The Return of Spring" (Bae Il-dong, Simon Barker, Scott Tinkler), Kimnara Records. Used with kind permission of Simon Barker. [Listen on Bandcamp](https://simonbarker.bandcamp.com/music).

## How it's built

- **Fluid simulation**: a 2D Navier-Stokes solver on compute shaders (Unity, URP), about two million cells at 60 fps, stylised into falling water with ribbons, foam and spray.
- **Depth**: an Intel RealSense depth camera, background subtraction and clean-up, the silhouette placed on the wall at real size through a measured calibration.
- **Moving water**: the body is a moving boundary in the simulation, its edge speed measured from frame to frame, so a swept arm throws the water rather than just blocking it.
- **Moods**: posture read from the silhouette relative to each visitor's own stance, so a child's reach counts as an adult's.

See also: [Multi-Kinect Installations](/portfolio/many_monkeys/).
