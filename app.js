let selectedFile = null;
let youtubeUrl = null;
let currentMode = 'upload';
let lessonPlanMarkdown = '';

const uploadModeBtn = document.getElementById('uploadModeBtn');
const youtubeModeBtn = document.getElementById('youtubeModeBtn');
const uploadMode = document.getElementById('uploadMode');
const youtubeMode = document.getElementById('youtubeMode');
const videoUpload = document.getElementById('videoUpload');
const youtubeUrlInput = document.getElementById('youtubeUrl');
const videoPreview = document.getElementById('videoPreview');
const uploadedVideoPreview = document.getElementById('uploadedVideoPreview');
const youtubeVideoPreview = document.getElementById('youtubeVideoPreview');
const processBtn = document.getElementById('processBtn');
const loadingIndicator = document.getElementById('loadingIndicator');
const resultsContainer = document.getElementById('resultsContainer');
const unpackingResults = document.getElementById('unpackingResults');
const lessonPlan = document.getElementById('lessonPlan');
const downloadMarkdownBtn = document.getElementById('downloadMarkdown');
const downloadPDFBtn = document.getElementById('downloadPDF');

uploadModeBtn.addEventListener('click', () => {
    currentMode = 'upload';
    uploadModeBtn.classList.add('active');
    youtubeModeBtn.classList.remove('active');
    uploadMode.classList.remove('hidden');
    youtubeMode.classList.add('hidden');
    videoPreview.classList.add('hidden');
    processBtn.disabled = !selectedFile;
});

youtubeModeBtn.addEventListener('click', () => {
    currentMode = 'youtube';
    youtubeModeBtn.classList.add('active');
    uploadModeBtn.classList.remove('active');
    youtubeMode.classList.remove('hidden');
    uploadMode.classList.add('hidden');
    videoPreview.classList.add('hidden');
    processBtn.disabled = !youtubeUrl;
});

videoUpload.addEventListener('change', (e) => {
    selectedFile = e.target.files[0];

    if (selectedFile) {
        const videoURL = URL.createObjectURL(selectedFile);
        uploadedVideoPreview.src = videoURL;
        uploadedVideoPreview.classList.remove('hidden');
        youtubeVideoPreview.classList.add('hidden');
        videoPreview.classList.remove('hidden');
        processBtn.disabled = false;
    } else {
        videoPreview.classList.add('hidden');
        processBtn.disabled = true;
    }
});

youtubeUrlInput.addEventListener('input', (e) => {
    const url = e.target.value.trim();

    if (url) {
        const videoId = extractYouTubeId(url);

        if (videoId) {
            youtubeUrl = url;
            youtubeVideoPreview.src = `https://www.youtube.com/embed/${videoId}`;
            youtubeVideoPreview.classList.remove('hidden');
            uploadedVideoPreview.classList.add('hidden');
            videoPreview.classList.remove('hidden');
            processBtn.disabled = false;
        } else {
            youtubeUrl = null;
            videoPreview.classList.add('hidden');
            processBtn.disabled = true;
        }
    } else {
        youtubeUrl = null;
        videoPreview.classList.add('hidden');
        processBtn.disabled = true;
    }
});

function extractYouTubeId(url) {
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
        /^([a-zA-Z0-9_-]{11})$/
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }

    return null;
}

processBtn.addEventListener('click', async () => {
    if (currentMode === 'upload' && !selectedFile) return;
    if (currentMode === 'youtube' && !youtubeUrl) return;

    loadingIndicator.classList.remove('hidden');
    resultsContainer.classList.add('hidden');
    processBtn.disabled = true;

    try {
        let response;

        if (currentMode === 'upload') {
            const formData = new FormData();
            formData.append('video', selectedFile);

            response = await fetch('http://localhost:3000/api/process-video', {
                method: 'POST',
                body: formData
            });
        } else {
            response = await fetch('http://localhost:3000/api/process-youtube', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ youtubeUrl })
            });
        }

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to process video');
        }

        displayUnpackingResults(data.unpacking);
        displayLessonPlan(data.lessonPlan);

        resultsContainer.classList.remove('hidden');
    } catch (error) {
        alert('Error processing video: ' + error.message);
    } finally {
        loadingIndicator.classList.add('hidden');
        processBtn.disabled = false;
    }
});

function displayUnpackingResults(unpacking) {
    let html = '<h3>Skills & Tasks Identified</h3>';
    html += '<ul>';
    unpacking.skills.forEach(skill => {
        html += `<li>${skill}</li>`;
    });
    html += '</ul>';

    html += '<h3>Practicables</h3>';
    html += '<ul>';
    unpacking.practicables.forEach(p => {
        html += `<li><strong>${p.name}</strong>: ${p.description}</li>`;
    });
    html += '</ul>';

    html += '<h3>Measurables</h3>';
    html += '<ul>';
    unpacking.measurables.forEach(m => {
        html += `<li><strong>${m.metric}</strong>: ${m.description}</li>`;
    });
    html += '</ul>';

    html += '<h3>Recordables</h3>';
    html += '<ul>';
    unpacking.recordables.forEach(r => {
        html += `<li><strong>${r.name}</strong>: ${r.workflow}</li>`;
    });
    html += '</ul>';

    unpackingResults.innerHTML = html;
}

function displayLessonPlan(plan) {
    lessonPlanMarkdown = plan;
    let html = plan
        .replace(/^### (.+)$/gm, '<h3>$1</h3>')
        .replace(/^## (.+)$/gm, '<h2>$1</h2>')
        .replace(/^# (.+)$/gm, '<h1>$1</h1>')
        .replace(/^\- (.+)$/gm, '<li>$1</li>')
        .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n\n/g, '<br><br>');

    lessonPlan.innerHTML = html;
}

downloadMarkdownBtn.addEventListener('click', () => {
    const blob = new Blob([lessonPlanMarkdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lesson-plan.md';
    a.click();
    URL.revokeObjectURL(url);
});

downloadPDFBtn.addEventListener('click', async () => {
    try {
        const response = await fetch('http://localhost:3000/api/generate-pdf', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ markdown: lessonPlanMarkdown })
        });

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'lesson-plan.pdf';
        a.click();
        URL.revokeObjectURL(url);
    } catch (error) {
        alert('Error generating PDF: ' + error.message);
    }
});