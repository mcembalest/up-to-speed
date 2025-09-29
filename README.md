# Up to Speed

Everyone has something to teach.

## Why?

We are building Up to Speed to help everyone make their skills teachable and learnable for others.

Teaching is really hard. Just telling people what they need to do and know is not enough. Learning only happens in the presence of some amount of motivation or fun.

The most important reason people don't learn is they are uninterested, distracted, pressed for time, and not having fun.

We want to make skillbuilding and demonstrating growth much more fun. That is the north star purpose of Up to Speed: a fun, decentralized platform for teaching and learning to flourish organically, since everyone has something to teach.

## How to use

1. Run the app with `npm start`
2. Upload a video or reference a YouTube URL
3. Click "Process Video"
4. Up to Speed scans the video to look for the teachable materials it contains
5. Once complete, you can download the learning plan with exercises and assessments

## How it works

Gemini analyzes the video and extracts:
   - **Skills**: Individual capabilities demonstrated
   - **Practicables**: Tasks that can be practiced
   - **Measurables**: Quantitative success metrics
   - **Recordables**: Complete workflows for demonstration

## How it's made

- **Frontend**: Vanilla JavaScript, HTML, CSS
- **Backend**: Node.js, Express
- **Video Analysis**: Google Gemini 2.5 Flash
- **PDF Generation**: html-pdf-node
