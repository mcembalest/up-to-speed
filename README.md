# Up to Speed

Everyone has something to teach.

Up to Speed helps you put together what it is that you can teach in the following manner:

- **Structured Learning Plans**: Plans with time estimates and exercises
- **Practicables**: Discrete skills that can be practiced to mastery
- **Measurables**: Quantitative metrics to track learning progress
- **Recordables**: Complete workflows for screen recording demonstrations

## How to use

1. Run the app with `npm start`
2. Upload a video or reference a YouTube URL
3. Click "Process Video"
4. Up to Speed scans the video to look for the teachable materials it contains
5. Once complete, you can download the learning plan with exercises and assessments

## How It Works

Gemini analyzes the video and extracts:
   - **Skills**: Individual capabilities demonstrated
   - **Practicables**: Tasks that can be practiced
   - **Measurables**: Quantitative success metrics
   - **Recordables**: Complete workflows for demonstration

## How It's Made

- **Frontend**: Vanilla JavaScript, HTML, CSS
- **Backend**: Node.js, Express
- **Video Analysis**: Google Gemini 2.5 Flash
- **PDF Generation**: html-pdf-node
