#  KAT KUT AI Subtitle Plugin for Adobe After Effects

A full pipeline that converts audio → transcription → AI-enhanced typography → styled subtitles inside After Effects.

---

#  Features

* Audio transcription using Whisper (Groq)
* AI-based subtitle styling (Gemini)
* Multi-layer typography (highlight words, font pairing)
* Accurate timing from Whisper
* After Effects panel integration (CEP)

---

# 📁 Project Structure

```
project-root/
│
├── server/                # Node backend
│   ├── server.js
│   ├── whisper.js
│   ├── .env
│   └── package.json
│
├── client/                # Panel UI
│   ├── index.html
│   ├── main.js
│   └── CSInterface.js
│
├── host/                  # After Effects scripting
│   └── extendscript.jsx
│
└── manifest.xml           # CEP panel config
```

---

# Setup Guide

## 1. Install Node Dependencies

Go to the **server folder**:

```bash
cd server
npm install
```

Required packages:

```bash
npm install express cors multer dotenv @google/generative-ai
```

---

# API Keys Setup

You need **2 APIs**:

---

## 1. Gemini API (for styling)

Get it from: https://makersuite.google.com/app/apikey

Add to `.env`:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

---

## 2. Groq API (for Whisper transcription)

Get it from: https://console.groq.com/keys

Add to `.env`:

```env
GROQ_API_KEY=your_groq_api_key_here
```

---

# Example `.env` file

```env
GEMINI_API_KEY=xxxxxxxxxxxxxxxx
GROQ_API_KEY=xxxxxxxxxxxxxxxx
PORT=3000
```

Important:

* `.env` must be inside **/server folder**
* Do NOT add quotes around keys
* Restart server after editing

---

# Run the Server

Inside `/server`:

```bash
node server.js
```

You should see:

```
Server running on http://localhost:3000
```

---

# After Effects Setup

1. Copy plugin folder to:

```
C:\Program Files (x86)\Common Files\Adobe\CEP\extensions\
```

2. Enable debugging:

* Open:

```
C:\Users\<YourUser>\AppData\Roaming\Adobe\CEP\cep_debug.txt
```

Add:

```
PlayerDebugMode=1
```

3. Restart After Effects

4. Open panel:

```
Window → Extensions → Your Plugin Name
```

---

# Workflow

1. Click **Render Audio**
2. Audio is sent to server → Whisper
3. Whisper returns:

   * text
   * timestamps
4. Each sentence is sent to Gemini
5. Gemini returns:

   * styled text parts (highlight + base)
6. Data sent to After Effects
7. AE creates:

   * multiple text layers
   * styled typography
   * timed subtitles

---

# Data Flow

```
Audio
  ↓
Whisper (Groq)
  ↓
Segments (text + timestamps)
  ↓
Gemini
  ↓
Styled Parts
  ↓
After Effects
  ↓
Final Subtitles
```

---

# Common Issues

## API key undefined

Check:

* `.env` is in correct folder
* `require('dotenv').config()` is in server.js
* Restart server

---

## Transcription fails

* Check GROQ key
* Ensure audio file is valid
* Check server logs

---

## Panel not updating

* Clear CEP cache
* Restart After Effects
* Check manifest.xml path

---

## Fonts not applying

* Font must be installed in system
* Use correct PostScript name (not display name)

---

# Customization

You can control:

* Font pairing (base + highlight)
* Colors
* Positioning
* Animation (extend later)

---

# Future Improvements

* Word-level timing (karaoke style)
* Animation presets
* Style themes (cinematic, reels, podcast)
* Preset saving system
* Expression-based global controller

---

# Important Note

* Whisper controls **timing**
* Gemini controls **styling**
* After Effects controls **rendering**

Do NOT mix responsibilities.

---

# Credits

Built using:

* Whisper (via Groq)
* Gemini AI
* Adobe After Effects CEP

---

# Final Tip

Start simple → verify pipeline → then enhance styling.

If you try to overbuild early, everything breaks.

---
