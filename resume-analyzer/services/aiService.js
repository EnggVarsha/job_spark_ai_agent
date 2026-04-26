const { GoogleGenAI } = require('@google/genai');

const getClient = () => {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === '') {
    return null;
  }
  try {
     return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  } catch (e) {
     return null;
  }
};

const extractJSONFromText = (text) => {
    try {
        const jsonMatch = text.match(/```json([\s\S]*?)```/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[1].trim());
        }
        return JSON.parse(text);
    } catch(e) {
        console.error("Could not parse JSON:", text);
        throw new Error("Failed to parse AI response as JSON");
    }
}

// STAGE 1: RESUME UNDERSTANDING
async function structureResumeText(rawText) {
  const ai = getClient();
  if (!ai) {
    return {
      name: "John Doe",
      education: ["B.S. Computer Science, Demo University"],
      skills: ["JavaScript", "React", "Node.js"],
      experience: [
        {
          role: "Software Engineer",
          company: "Tech Corp",
          duration: "2020 - Present",
          responsibilities: ["Did some coding for the main site.", "Handled server bugs."],
          achievements: ["Hard worker."]
        }
      ],
      projects: ["missing"],
      certifications: ["missing"],
      summary: "Experienced software engineer looking for new opportunities."
    };
  }

  const prompt = `
  STAGE 1: RESUME UNDERSTANDING.
  Parse the uploaded resume text and extract the data into the exact strict JSON format below.
  Clean and normalize the text (remove noise, fix formatting issues).
  If any section is missing, explicitly mark its value as an array containing exactly one string "missing", or if it's a string/object field, just "missing".
  Do NOT add any keys not present in this structure. Do NOT proceed until structured data is complete.

  Format:
  {
    "name": "string",
    "education": ["array of strings"],
    "skills": ["array of strings"],
    "experience": [
      {
        "role": "string",
        "company": "string",
        "duration": "string",
        "responsibilities": ["array of strings"],
        "achievements": ["array of strings"]
      }
    ],
    "projects": ["array of strings"],
    "certifications": ["array of strings"],
    "summary": "string"
  }

  Resume Text:
  ${rawText}
  `;

  const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
  });

  return extractJSONFromText(response.text);
}

// STAGE 2: DEEP ANALYSIS
async function deepAnalyzeResume(structuredData) {
  const ai = getClient();
  if (!ai) {
    return {
      overallScore: 72,
      atsScore: 60,
      sectionsPresent: ["Summary", "Experience", "Education", "Skills"],
      missingSections: ["Projects", "Certifications"],
      formatting: "Basic. Structure is readable but lacks quantifiable achievements.",
      criticalFixes: [
        { original: "Did some coding for the main site.", suggestion: "Developed responsive features for the main application using React." },
        { original: "Hard worker.", suggestion: "Consistently delivered tasks ahead of schedule." }
      ],
      improvements: [
        "Add quantifiable metrics to your responsibilities (e.g., 'reduced load time by 15%').",
        "Separate responsibilities from major achievements where possible."
      ],
      optionalEnhancements: [
        "Add personal coding projects.",
        "Add an active GitHub link."
      ]
    };
  }

  const prompt = `
  STAGE 2: DEEP ANALYSIS.
  Analyze the following structured resume data ONLY. Do not invent details.
  Detect weak bullet points, identify missing metrics, detect skill gaps, and check formatting quality.

  Format the output as valid JSON with exactly following keys:
  - overallScore (number 0-100)
  - atsScore (number 0-100)
  - sectionsPresent (array of strings)
  - missingSections (array of strings)
  - formatting (string finding)
  - criticalFixes (array of objects with "original" and "suggestion" for fixing weak action verbs/grammar)
  - improvements (array of strings)
  - optionalEnhancements (array of strings)

  Structured Data:
  ${JSON.stringify(structuredData, null, 2)}
  `;

  const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
  });

  return extractJSONFromText(response.text);
}

// STAGE 3: ATS & KEYWORD ENGINE
async function matchJob(structuredData, jobDescription) {
  const ai = getClient();
  if (!ai) {
    return {
      matchScore: 45,
      missingKeywords: ["React", "Node.js", "Docker", "AWS"],
      matchingKeywords: ["JavaScript"],
      analysis: "You lack some key technical skills required for this position."
    };
  }

  const prompt = `
  STAGE 3: ATS & KEYWORD ENGINE.
  Compare the following structured resume data against the job description.
  Extract keywords from the job description and match them strictly with the resume skills and experience.
  
  Format the output as valid JSON with exactly following keys:
  - matchScore (number 0-100)
  - missingKeywords (array of strings)
  - matchingKeywords (array of strings)
  - analysis (string)

  Structured Resume Data: ${JSON.stringify(structuredData, null, 2)}
  Job Description: ${jobDescription}
  `;

  const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
  });

  return extractJSONFromText(response.text);
}

// STAGE 4: REWRITE ENGINE
async function generateRewrite(sectionText, tone) {
    const ai = getClient();
    if (!ai) {
        return {
            rewrites: [
                `Revised (${tone}): Increased system functionality by executing robust code solutions.`,
                `Revised (${tone}): Streamlined main site operations through proactive development.`,
                `Revised (${tone}): Engineered highly efficient codebase to meet company objectives.`
            ]
        }
    }

    const prompt = `
    STAGE 4: REWRITE ENGINE.
    Rewrite ONLY based on original content. Do NOT hallucinate fake experience.
    Improve the following bullet point using action verbs and quantifiable impact where logically possible without inventing numbers.
    Target tone: ${tone}.
    
    Format the output as valid JSON with a "rewrites" key containing an array of exactly 3 different string versions.

    Text: ${sectionText}
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });

    return extractJSONFromText(response.text);
}

// STAGE 5: CAREER COACH MODE
async function getCareerAdvice(structuredData) {
    const ai = getClient();
    if (!ai) {
        return {
            careerPaths: ["Frontend Developer", "Full Stack Developer", "UI/UX Engineer"],
            missingSkills: ["TypeScript", "GraphQL", "Next.js"],
            portfolioIdeas: ["Build a personal portfolio website with a blog", "Create a full-stack e-commerce app with Supabase"],
            generalAdvice: "Focus on adding more projects to your resume and learning TypeScript. Your experience in JavaScript is solid, but transitioning to full stack will increase your marketability."
        };
    }

    const prompt = `
    STAGE 5: CAREER COACH MODE.
    Based on the following structured resume data, provide personalized realistic advice.
    Suggest missing skills (role-specific), certifications, and projects to add.
    
    Format the output as valid JSON with exactly following keys:
    - careerPaths (array of strings: suggested roles)
    - missingSkills (array of strings: skills they should learn next)
    - portfolioIdeas (array of strings)
    - generalAdvice (string)

    Structured Resume Data: ${JSON.stringify(structuredData, null, 2)}
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });

    return extractJSONFromText(response.text);
}

module.exports = { structureResumeText, deepAnalyzeResume, matchJob, generateRewrite, getCareerAdvice };
