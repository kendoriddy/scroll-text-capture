# Scroll Text Capture

A mobile-first web app that uses your device camera (or uploaded screenshots) to capture text regions, extract text via OpenAI GPT-4o Vision, and accumulate results into an editable document.

## Features

- Back-camera capture with draggable, resizable focus box
- Screenshot upload fallback when camera is unavailable
- Canvas-based crop of the focus area before OCR
- Append-mode text accumulator for multi-scroll capture sessions
- Copy to clipboard and clear-all with confirmation

## Prerequisites

- Node.js 18+
- An [OpenAI API key](https://platform.openai.com/api-keys) with access to `gpt-4o`

## Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure environment variables**

   Copy the example file and add your API key:

   ```bash
   cp .env.local.example .env.local
   ```

   Edit `.env.local`:

   ```
   OPENAI_API_KEY=sk-your-key-here
   ```

   The API key is only used server-side in `/api/ocr` and is never exposed to the browser.

3. **Run locally**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

   To test on a phone over your local network:

   ```bash
   npm run dev -- -H 0.0.0.0
   ```

   Then visit `http://<your-computer-ip>:3000` from your phone.

   > **Note:** Camera access requires HTTPS in production. Localhost is exempt. For LAN testing, some browsers may still require HTTPS.

## Deploy to Vercel

1. Push this repo to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Add the environment variable:
   - `OPENAI_API_KEY` = your OpenAI API key
4. Deploy

Vercel provides HTTPS automatically, which is required for `getUserMedia` on mobile devices.

## Project Structure

```
src/
├── app/
│   ├── api/ocr/route.ts   # OpenAI Vision proxy
│   ├── layout.tsx
│   ├── page.tsx           # Main app shell
│   └── globals.css
├── components/
│   ├── CameraViewport.tsx
│   ├── FocusBox.tsx
│   ├── CaptureButton.tsx
│   ├── TextEditor.tsx
│   ├── Toolbar.tsx
│   └── ConfirmModal.tsx
├── hooks/
│   ├── useCamera.ts
│   └── useFocusBox.ts
└── lib/
    ├── cropImage.ts
    └── types.ts
```

## Environment Variables

| Variable         | Required | Description                          |
| ---------------- | -------- | ------------------------------------ |
| `OPENAI_API_KEY` | Yes      | OpenAI API key for GPT-4o Vision OCR |

## Usage

1. Allow camera access (or upload a screenshot)
2. Drag and resize the focus box over the text you want to read
3. Tap **Capture Text** — extracted text appends to the editor
4. Scroll your document, adjust the box, and capture again
5. Edit the accumulated text as needed
6. Use **Copy Text** or **Clear All** when done
