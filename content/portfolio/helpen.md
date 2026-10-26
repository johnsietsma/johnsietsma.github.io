---
title: "Helpen"
organization: Family project
position: Developer
date: 2026-01-04
to-date: 2026-02-13
platforms: [iOS, Android, Cloud]
technologies: [React Native, Expo, VAPI, LLMs, Python, AWS Lambda, MCP, Todoist, Ollama]
www: https://johnsietsma.com/posts/voice-assistant-for-mum/
splash: "/assets/images/helpen/tile.jpg"
hero: false
order: 2
categories: [personal]
---

My mum is losing her central vision so my siblings and I built her an AI voice assistant. We called it Helpen, Dutch for "to help".

<figure>
  <video autoplay muted loop playsinline preload="metadata" width="100%">
    <source src="https://media.johnsietsma.com/video/helpen/helpen-ui-loop-3.mp4" type="video/mp4">
  </video>
  <figcaption>My sister's design: ebbing light and colour, because low vision doesn't mean no vision.</figcaption>
</figure>

## How it's built

![How Helpen fits together: mum asks Siri to open the Helpen app, the app starts a VAPI voice call, VAPI calls tools on a Python API on AWS Lambda, the tools read and write Todoist, and Todoist notifies the family's phones.](/assets/images/helpen/flow.svg)

- **App**: React Native and Expo, deployed to iOS and Android outside the App Store. Almost no screen, just light, colour and a few tones.
- **Voice**: VAPI runs the call, speech and LLM in the cloud.
- **Backend**: a Python API on AWS Lambda. It started as an MCP server, which still runs locally so the family's scenarios work as integration tests against Ollama.
- **Storage**: no database. Todoist holds the notes and tasks, and its notifications reach the family's phones.

The full story, and what we learnt about designing for voice: [We made mum an AI voice assistant](/posts/voice-assistant-for-mum/).
