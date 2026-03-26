# EvoWit MVP

EvoWit is an MVP for an AI reading, recitation, homework, and writing coach for students ages 6-22.

It is designed around the lowest-latency architecture that is realistic today:

1. `iPhone local`
   - front camera + ARKit gaze proxy
   - back camera page capture
   - local speech transcription
   - ROI crop around the likely focus area
2. `Home edge server`
   - session orchestration
   - state aggregation
   - OpenAI token minting for realtime
3. `OpenAI`
   - `gpt-5.4` for high-quality multimodal tutoring analysis
   - `Realtime` path reserved for lower-latency voice later

## Project layout

```text
backend/
  src/
ios/
  EvoWit/
  fastlane/
docs/
scripts/
```

## Implemented in this repo

- iPhone SwiftUI app
- back camera frame capture
- ARKit gaze proxy
- ROI crop around the focus point
- local speech transcription
- backend session memory across turns
- optional local OCR fallback with `tesseract.js`
- `gpt-5.4` focus-frame analysis with scaffold-style guidance
- realtime token endpoint for future OpenAI Realtime voice loop
- basic release scripts for Mac build and TestFlight upload flow

## Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Server default: `http://0.0.0.0:8787`

Important:

- set `OPENAI_API_KEY` in `backend/.env`
- without it, upload analysis will reach the backend and OCR stage, but fail on the model call

## Browser demo

After starting the backend, open:

```text
http://127.0.0.1:8787
```

The browser demo now uploads an image file directly and shows:

- OCR fallback text
- recognized text from the model
- diagnosis
- scaffold-style next-step guidance
- rolling session summary

## iOS setup on Mac

1. Install XcodeGen
   - `brew install xcodegen`
2. Install Fastlane if needed
   - `brew install fastlane`
3. Generate the Xcode project
   - `cd ios`
   - `xcodegen generate`
4. Open `ios/EvoWit.xcodeproj`
5. Update [AppConfig.swift](D:/AI/evowit/ios/EvoWit/AppConfig.swift) with your edge-server LAN IP
6. Connect the iPhone and run

## Fast path for product validation

- Use the iPhone as the sensing node.
- Use the 4090 server as the home edge node.
- Upload only the gaze-centered ROI, not the full page.
- Keep a rolling session summary to detect where the student gets stuck.
- Move voice to OpenAI Realtime only after the visual loop is stable.

## Current limitations

- iPhone 11 class devices may not sustain the ideal MultiCam + AR face pipeline under load.
- Current speech flow uses Apple Speech for MVP stability, not the final latency target.
- OCR currently relies on model vision. A local OCR service should be added on the edge node next.

## Recommended next experiments

1. Add local OCR on the 4090 server.
2. Add a realtime voice loop via OpenAI Realtime WebRTC.
3. Add a session state machine with teaching strategies per mode.
4. Add keyframe selection and temporal memory instead of analyzing every frame equally.
