require('dotenv').config();
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const marked = require('marked');
const htmlPdf = require('html-pdf-node');
const { GoogleGenAI, createUserContent, createPartFromUri } = require('@google/genai');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

const upload = multer({ dest: 'uploads/' });

if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

async function processVideoWithGemini(videoPath, mimeType) {
    try {
        const uploadedFile = await ai.files.upload({
            file: videoPath,
            config: { mimeType }
        });

        console.log(`File uploaded: ${uploadedFile.uri}`);
        let file = await ai.files.get({ name: uploadedFile.name });
        while (file.state === 'PROCESSING') {
            await new Promise(resolve => setTimeout(resolve, 2000));
            file = await ai.files.get({ name: uploadedFile.name });
        }

        if (file.state === 'FAILED') {
            throw new Error('Video processing failed');
        }

        console.log('File processing complete');

        const result = await generateLearningPlan(uploadedFile.uri, uploadedFile.mimeType, true);

        return result;
    } catch (error) {
        console.error('Gemini processing error:', error);
        throw error;
    }
}

async function processYouTubeWithGemini(youtubeUrl) {
    try {
        console.log(`Processing YouTube URL: ${youtubeUrl}`);
        return await generateLearningPlan(youtubeUrl, null, false);
    } catch (error) {
        console.error('Gemini YouTube processing error:', error);
        throw error;
    }
}

async function generateLearningPlan(videoUri, mimeType = null, isUploadedFile = false) {
    const unpackingPrompt = `Analyze this video in detail and provide a comprehensive breakdown of all skills, tasks, and workflows demonstrated.

Please structure your response as a JSON object with the following format:
{
  "skills": ["skill 1", "skill 2", ...],
  "practicables": [
    {"name": "practicable name", "description": "how to practice this specific skill/task"},
    ...
  ],
  "measurables": [
    {"metric": "metric name", "description": "what quantitative aspect can be measured"},
    ...
  ],
  "recordables": [
    {"name": "workflow name", "workflow": "step-by-step description of a recordable workflow"},
    ...
  ]
}

Definitions:
- Skills: Individual capabilities demonstrated in the video
- Practicables: Discrete tasks/skills that can be practiced to mastery
- Measurables: Quantitative aspects (speed, accuracy, success rate, quality metrics)
- Recordables: Complete workflows that can be performed while screen recording to demonstrate mastery

Provide detailed, actionable information for each category.`;

    let contents;
    if (isUploadedFile) {
        contents = createUserContent([
            createPartFromUri(videoUri, mimeType),
            unpackingPrompt
        ]);
    } else {
        contents = [
            { fileData: { fileUri: videoUri } },
            { text: unpackingPrompt }
        ];
    }

    const unpackingResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents
    });

    const unpackingText = unpackingResponse.text
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

    const unpacking = JSON.parse(unpackingText);
    const lessonPrompt = `Based on the following video analysis, create a detailed learning plan in markdown format.

Video Analysis:
${JSON.stringify(unpacking, null, 2)}

Create a comprehensive learning plan that includes:
1. Overview of what will be learned
2. Lesson structure with time estimates
3. Step-by-step practice exercises
4. Measurable goals and success criteria
5. Quiz questions to test understanding
6. Assessment criteria for different skill levels

Format the response as clean markdown suitable for a learner to follow.`;

    if (isUploadedFile) {
        contents = createUserContent([
            createPartFromUri(videoUri, mimeType),
            lessonPrompt
        ]);
    } else {
        contents = [
            { fileData: { fileUri: videoUri } },
            { text: lessonPrompt }
        ];
    }

    const lessonResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents
    });

    const lessonPlan = lessonResponse.text
        .replace(/```markdown\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

    return { unpacking, lessonPlan };
}


app.post('/api/process-video', upload.single('video'), async (req, res) => {
    let videoPath = null;

    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No video file uploaded' });
        }

        if (!process.env.GOOGLE_API_KEY) {
            return res.status(500).json({ error: 'GOOGLE_API_KEY not configured. Please set up your API key.' });
        }

        videoPath = req.file.path;
        const mimeType = req.file.mimetype;

        console.log(`Processing video: ${req.file.originalname}`);

        const result = await processVideoWithGemini(videoPath, mimeType);
        res.json(result);

    } catch (error) {
        console.error('Error processing video:', error);
        res.status(500).json({ error: 'Failed to process video: ' + error.message });

    } finally {
        if (videoPath && fs.existsSync(videoPath)) {
            fs.unlink(videoPath, (err) => {
                if (err) console.error('Error deleting file:', err);
            });
        }
    }
});

app.post('/api/process-youtube', async (req, res) => {
    try {
        const { youtubeUrl } = req.body;

        if (!youtubeUrl) {
            return res.status(400).json({ error: 'No YouTube URL provided' });
        }

        if (!process.env.GOOGLE_API_KEY) {
            return res.status(500).json({ error: 'GOOGLE_API_KEY not configured. Please set up your API key.' });
        }

        console.log(`Processing YouTube URL: ${youtubeUrl}`);

        const result = await processYouTubeWithGemini(youtubeUrl);
        res.json(result);

    } catch (error) {
        console.error('Error processing YouTube video:', error);
        res.status(500).json({ error: 'Failed to process YouTube video: ' + error.message });
    }
});

app.post('/api/generate-pdf', async (req, res) => {
    try {
        const { markdown } = req.body;

        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        line-height: 1.6;
                        padding: 40px;
                        max-width: 800px;
                        margin: 0 auto;
                    }
                    h1 { color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px; }
                    h2 { color: #555; margin-top: 30px; }
                    h3 { color: #666; margin-top: 20px; }
                    code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; }
                    ul { margin-left: 20px; }
                    li { margin: 8px 0; }
                </style>
            </head>
            <body>
                ${marked.parse(markdown)}
            </body>
            </html>
        `;

        const file = { content: html };
        const options = {
            format: 'A4',
            margin: {
                top: '20mm',
                right: '20mm',
                bottom: '20mm',
                left: '20mm'
            }
        };

        const pdfBuffer = await htmlPdf.generatePdf(file, options);

        res.contentType('application/pdf');
        res.send(pdfBuffer);
    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).json({ error: 'Failed to generate PDF' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    if (!process.env.GOOGLE_API_KEY) {
        console.warn('WARNING: GOOGLE_API_KEY not set.');
    }
});