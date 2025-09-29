# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Up to Speed** is a web application that transforms educational videos into structured learning plans. Users upload MP4 videos, which are processed to extract skills, tasks, and workflows, then converted into actionable lesson plans with practice exercises and assessments.

### Core Concepts

- **Video Unpacking**: The process of analyzing a video to identify and describe all demonstrated skills, tasks, and actions
- **Practicables**: Discrete tasks/skills that can be practiced to mastery (e.g., command sequences, tool operations)
- **Measurables**: Quantitative aspects of tasks (e.g., speed metrics, success criteria, output quality)
- **Recordables**: Complete workflows that learners can perform while screen recording to demonstrate skill mastery

## Architecture

### Frontend (Vanilla JavaScript)
- `index.html` - Main UI with file upload and two-panel results display
- `app.js` - Client-side logic for file upload, API calls, and download generation
- `styles.css` - Simple CSS styling

**UI Flow:**
1. User selects video
2. File is uploaded to `/api/process-video` endpoint
3. Two panels display results:
   - Left panel: Video unpacking (skills, practicables, measurables, recordables)
   - Right panel: Lesson/practice/quiz plan with download buttons

### Backend (Node.js/Express)
- `server.js` - Express server with two main endpoints:
  - `POST /api/process-video` - Accepts video file, processes with Gemini API
  - `POST /api/generate-pdf` - Converts markdown lesson plan to PDF using html-pdf-node

**Video Processing:**
- Uses Google Gemini 2.5 Flash for real video analysis
- Uploads video to Gemini Files API
- Makes two API calls:
  1. Extract structured data (skills, practicables, measurables, recordables) as JSON
  2. Generate lesson plan markdown based on extracted data

## Development Commands

**Setup:**
1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file with your Google API key:
```bash
GOOGLE_API_KEY=your_google_api_key_here
```
Get your API key from: https://ai.google.dev/

**Start the server:**
```bash
npm start
```
The server runs on `http://localhost:3000` and serves both the API and frontend files.

## Gemini API Integration

The app uses Google's Gemini 2.5 Flash model for video analysis:

**Processing Flow:**
1. Video uploaded via multer to temporary storage
2. File uploaded to Gemini Files API
3. Wait for Gemini to process the video (polls every 2s)
4. First API call extracts structured JSON data (skills, practicables, measurables, recordables)
5. Second API call generates markdown lesson plan based on extracted data

**Video Limits:**
- Gemini 2.5 Flash supports videos up to 2 hours (2M context window)
- Default sampling: 1 frame per second
- Approximately 300 tokens per second of video

**Customization Options (not yet implemented):**
- Set custom FPS with `videoMetadata.fps`
- Clip videos with `videoMetadata.start_offset` and `end_offset`
- Use YouTube URLs directly instead of uploading files
