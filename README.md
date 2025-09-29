# Up to Speed

Everyone has something to teach.

## Overview

**Up to Speed** analyzes educational videos and generates comprehensive learning plans with practice exercises, measurable goals, and assessment criteria. 

## Features

- **Video Analysis**: AI-powered extraction of skills, tasks, and workflows from videos
- **Structured Learning Plans**: Auto-generated lesson plans with time estimates and exercises
- **Practicables**: Discrete skills that can be practiced to mastery
- **Measurables**: Quantitative metrics to track learning progress
- **Recordables**: Complete workflows for screen recording demonstrations
- **Export Options**: Download lesson plans as Markdown or PDF

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up your API key:**

   Create a `.env` file:
   ```bash
   GOOGLE_API_KEY=your_google_api_key_here
   ```

   Get your free API key: https://ai.google.dev/

3. **Start the server:**
   ```bash
   npm start
   ```

4. **Open your browser:**

   Navigate to `http://localhost:3000`

## Usage

1. Click the file upload button
2. Select an MP4 video (educational content, tutorials, demonstrations)
3. Click "Process Video"
4. View the results in two panels:
   - **Video Unpacking**: Skills, practicables, measurables, and recordables
   - **Lesson Plan**: Structured learning plan with exercises and assessments
5. Download the lesson plan as Markdown or PDF

## Technology

- **Frontend**: Vanilla JavaScript, HTML, CSS
- **Backend**: Node.js, Express
- **AI**: Google Gemini 2.5 Flash for video analysis
- **PDF Generation**: html-pdf-node

## How It Works

1. Video is uploaded to the server
2. Server sends video to Google Gemini API
3. Gemini analyzes the video and extracts:
   - **Skills**: Individual capabilities demonstrated
   - **Practicables**: Tasks that can be practiced
   - **Measurables**: Quantitative success metrics
   - **Recordables**: Complete workflows for demonstration
4. Gemini generates a comprehensive lesson plan
5. Results displayed in the UI with download options

## Examples

**Terminal/Command-Line Video:**
- Skills: cd, ls, mkdir, file navigation
- Practicables: Directory navigation, file creation
- Measurables: Command execution speed, accuracy rate
- Recordables: Complete project setup workflow

**Music Production Video:**
- Skills: Track recording, mixing, MIDI editing
- Practicables: Using QWERTY keyboard as MIDI controller
- Measurables: Track production speed, output quality
- Recordables: Complete song production workflow

## License

MIT