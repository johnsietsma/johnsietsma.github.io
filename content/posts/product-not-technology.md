---
title: "Nobody buys a technology"
publishDate: 2026-08-26T00:00:00+10:00
description: "AR companies put AR in the name and spent a decade looking for a problem. Gaussian splatting is at the same fork now. CultCap is a bet that object capture is the product, and splats are just how it works."
tags:
  - cultcap
  - gaussian-splatting
  - augmented-reality
  - product
draft: true
---

I've watched a technology spend a decade looking for a place to live, from the inside.

I built AR at [Dekko](/portfolio/dekko/) in San Francisco — virtual objects interacting
with real surfaces, no markers, no depth sensor, just the camera. Later I was Unity's
technical evangelist for Australia and New Zealand while ARKit and ARCore landed, wrote
shaders that still ship in AR Foundation, and stood on stages telling rooms full of
people how to build AR apps.

So I say this with affection: the AR era had a naming problem that was really a thinking
problem. Every company had AR in the title. AR this, AR that — pitch decks, booth
banners, my own conference talks. We were all branding ourselves with the *ingredient*.

And nobody cares about the ingredient. No customer has ever had the problem "I don't have
enough augmented reality." The demos were magic, the tech genuinely worked, and it still
spent years wandering, because "AR" was an answer holding auditions for a question.

<!-- TODO: a specific Dekko-era anecdote — a pitch or user test where the tech wowed and the follow-up question was "...for what?" -->

The AR that survived did it by disappearing into products. Measuring apps. Try-before-you-
buy furniture. Face filters that a billion people use without once saying "augmented
reality." The technology found its place at exactly the moment it stopped being the
headline.

## Splats are at the same fork

Gaussian splatting is where AR was around 2013: genuinely magical, moving fast, full of
people who love it. Timeline demos of drone captures and living-room scans. A thriving
scene of hobbyists — and I mean that as a compliment; I'm one of them, my
[Sketchfab](https://sketchfab.com/john.sietsma/models) is full of street art and
industrial heritage captures done for love.

But watch what happens when someone in that scene tries to turn it into a business. The
pitch is almost always the ingredient again: *splat capture*, *splat hosting*, *splats
for X*. Selling the noun. And the market keeps giving the same answer it gave AR: shrug.
Nobody has the problem "I don't have enough Gaussian splats."

<!-- TODO: soften/sharpen — maybe a composite example of the "splat startup" pitch shape, without pointing at anyone specific -->

The technology is not the business. The technology is never the business. The business is
a problem someone already has, already knows they have, and would already pay to make go
away — where the new technology quietly makes solving it possible, or ten times cheaper.

## The problem that was already there

A museum shouldn't need a $50,000 scanner to put an object online. Most collections hold
millions of items and give each one a single flat photograph. That's not a problem
Gaussian splatting created — it's a problem that has sat there for decades, with a price
tag on every existing solution that regional museums simply cannot pay.

CultCap is a bet on that framing. The product is **object capture**: walk around the
thing with a phone, get archival-quality 3D. For heritage collections first — and the
same shape of problem exists for product photography, for insurance documentation, for
e-commerce. "Capture this object, cheaply, well" is a sentence a curator understands and
has budget lines near.

Splats are in the pipeline because they're currently the best tool for part of the job.
If something better arrives next year, CultCap swaps it in and no customer notices or
cares — *and that's the test*. If your business survives its core technology being
replaced, you built a product. If it doesn't, you built a demo with a subscription page.

<!-- TODO: tie to the capture protocol / one-object framing from the simplifying-assumptions post — the product decision and the technical assumption are the same move -->

## Product, not feature

There's a second trap waiting after the first one. Suppose you do find the real problem —
you're solving capture, not selling splats. The next question is harsher: is that a
*product*, or is it a *feature* of someone else's product?

A better splat trainer is a feature — of a game engine, of someone's capture app. A 3D
viewer is a feature — of a collections management system, of an e-commerce platform. A
feature gets acquired cheap, cloned by the platform it sits on, or waits for one API
change to die. Plenty of the AR era's "companies" were a single feature wearing a Series
A — and the platforms ate them the moment the feature mattered.

<!-- TODO: an AR-era example of the feature-that-thought-it-was-a-product, ideally one I saw up close -->

What makes something a product is owning the whole job, not the clever step in the
middle. For CultCap the job isn't "make a splat" — it's a museum going from object on a
shelf to object online and archived: capture protocol a volunteer can follow, processing,
quality checks, archival mesh out the other end, into whatever system the collection
already uses. The splat step is maybe a tenth of that. It's the tenth I find most
interesting technically — which is exactly why the discipline matters. The parts that
make it a product are mostly the unglamorous ones nobody would ever put in a demo reel.

## The tell

The heuristic I wish I could send back to 2013: **look at what's in the name and what's
in the verb.**

If the technology is in the name — AR Inc, SplatCo — the question hasn't been found yet.
If the customer's verb is in the name — measure, try on, capture, keep — someone found
it. The AR winners weren't "AR companies," and whoever wins with splats won't be a splat
company. They'll be solving capture, or inspection, or memory, and splatting will be a
detail in their architecture diagram.

I named CultCap after the thing being kept, not the technique keeping it. That's the
whole thesis in one word.

<!-- TODO: closer needs work — maybe end on the museum shelf rather than the naming point? -->
