const express = require('express');
const multer = require('multer');
const cors = require('cors');
const dotenv = require('dotenv');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const { structureResumeText, deepAnalyzeResume, matchJob, generateRewrite, getCareerAdvice } = require('./services/aiService');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

async function extractText(file) {
  if (file.mimetype === 'application/pdf') {
    const data = await pdfParse(file.buffer);
    return data.text;
  } else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.mimetype === 'application/msword') {
    const result = await mammoth.extractRawText({ buffer: file.buffer });
    return result.value;
  }
  throw new Error("Unsupported file format. Please upload PDF, DOC, or DOCX.");
}

app.post('/api/analyze-resume', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No resume uploaded.' });
    // Stage 1a: Extract OCR text
    const text = await extractText(req.file);
    // Stage 1b: STRICT Resume Structuring
    const structuredData = await structureResumeText(text);
    // Stage 2: Deep Analysis based ONLY on structured data
    const analysis = await deepAnalyzeResume(structuredData);
    
    res.json({ text, structuredData, analysis });
  } catch (error) {
    console.error('Error analyzing resume:', error);
    res.status(500).json({ error: 'Failed to analyze resume: ' + error.message });
  }
});

app.post('/api/match-job', async (req, res) => {
  try {
    const { structuredData, jobDescription } = req.body;
    if (!structuredData || !jobDescription) return res.status(400).json({ error: 'Missing input.' });
    const match = await matchJob(structuredData, jobDescription);
    res.json(match);
  } catch (error) {
    console.error('Error matching job:', error);
    res.status(500).json({ error: 'Failed to match job' });
  }
});

app.post('/api/rewrite-section', async (req, res) => {
  try {
    const { sectionText, tone } = req.body;
    if (!sectionText || !tone) return res.status(400).json({ error: 'Missing input.' });
    const rewrites = await generateRewrite(sectionText, tone);
    res.json(rewrites);
  } catch (error) {
    console.error('Error rewriting section:', error);
    res.status(500).json({ error: 'Failed to rewrite section' });
  }
});

app.post('/api/career-coach', async (req, res) => {
  try {
    const { structuredData } = req.body;
    if (!structuredData) return res.status(400).json({ error: 'Missing input.' });
    const advice = await getCareerAdvice(structuredData);
    res.json(advice);
  } catch (error) {
    console.error('Error generating career advice:', error);
    res.status(500).json({ error: 'Failed to get career advice' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
