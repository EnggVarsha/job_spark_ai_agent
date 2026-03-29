import React, { useState } from "react";
import * as pdfjsLib from "pdfjs-dist";

const ResumeAnalyzer = () => {
  const [resumeFile, setResumeFile] = useState(null);
  const [jobDesc, setJobDesc] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  // 📄 Extract text from PDF
  const extractTextFromPDF = async (file) => {
    const reader = new FileReader();

    return new Promise((resolve, reject) => {
      reader.onload = async () => {
        try {
          const typedArray = new Uint8Array(reader.result);

          const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise;
          let text = "";

          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            const strings = content.items.map((item) => item.str);
            text += strings.join(" ");
          }

          resolve(text);
        } catch (error) {
          reject(error);
        }
      };

      reader.readAsArrayBuffer(file);
    });
  };

  // 🤖 Gemini AI Analyzer
  const handleAnalyze = async () => {
    if (!resumeFile || !jobDesc) {
      alert("Upload resume & enter job description");
      return;
    }

    setLoading(true);

    try {
      // Extract text
      const resumeText = await extractTextFromPDF(resumeFile);

      // Limit text (important for API)
      const limitedResumeText = resumeText.substring(0, 15000);

      // Call Gemini API
      const response = await fetch(
        'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=AIzaSyBkE_tTKKHtF2f43OlTclrWrkuZNNMoLts',
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `
You are an ATS Resume Analyzer AI.

Analyze the resume against the job description.

Resume:
${limitedResumeText}

Job Description:
${jobDesc}

Return STRICT format:

Match Percentage: XX%

Missing Skills:
- skill 1
- skill 2

Suggestions:
- suggestion 1
- suggestion 2
                    `,
                  },
                ],
              },
            ],
          }),
        }
      );

      const data = await response.json();

      console.log("Gemini Response:", data); // Debug

      const aiText =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "No response from AI";

      setResult(aiText);
    } catch (error) {
      console.error("FULL ERROR:", error);
      setResult("❌ Error analyzing resume. Check console (F12)");
    }

    setLoading(false);
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h2>🤖 AI Resume Analyzer</h2>

      {/* Upload Resume */}
      <input
        type="file"
        accept="application/pdf"
        onChange={(e) => setResumeFile(e.target.files[0])}
      />

      <br /><br />

      {/* Job Description */}
      <textarea
        placeholder="Paste Job Description..."
        rows="6"
        cols="60"
        value={jobDesc}
        onChange={(e) => setJobDesc(e.target.value)}
      />

      <br /><br />

      {/* Analyze Button */}
      <button onClick={handleAnalyze}>
        {loading ? "Analyzing..." : "Analyze Resume"}
      </button>

      <br /><br />

      {/* Result */}
      {result && (
        <div
          style={{
            whiteSpace: "pre-wrap",
            background: "#f5f5f5",
            padding: "15px",
            borderRadius: "10px",
          }}
        >
          {result}
        </div>
      )}
    </div>
  );
};

export default ResumeAnalyzer;