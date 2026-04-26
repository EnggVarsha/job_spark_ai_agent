import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { UploadCloud, CheckCircle, Briefcase, PenTool, Lightbulb, User } from 'lucide-react';
import { analyzeResume, matchJob, rewriteSection, getCareerAdvice } from './api';

function App() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resumeData, setResumeData] = useState(null); // { text, structuredData, analysis }
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, match, rewrite, coach

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;
    const uploadedFile = acceptedFiles[0];
    setFile(uploadedFile);
    setLoading(true);
    try {
      // Executes Stage 1 (understanding) and Stage 2 (deep analysis)
      const data = await analyzeResume(uploadedFile);
      setResumeData(data);
    } catch (err) {
      console.error(err);
      alert("Failed to analyze resume. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'application/pdf': ['.pdf'], 'application/msword': ['.doc'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] } });

  // Job Match State
  const [jobDescription, setJobDescription] = useState('');
  const [jobMatchResult, setJobMatchResult] = useState(null);
  const [matchingLoader, setMatchingLoader] = useState(false);

  const handleMatchJob = async () => {
    if (!jobDescription) return;
    setMatchingLoader(true);
    try {
      // Executes Stage 3 (Keyword match via structured data)
      const result = await matchJob(resumeData.structuredData, jobDescription);
      setJobMatchResult(result);
    } catch (err) {
      console.error(err);
    } finally {
      setMatchingLoader(false);
    }
  };

  // Rewrite State
  const [sectionToRewrite, setSectionToRewrite] = useState('');
  const [rewriteTone, setRewriteTone] = useState('impactful');
  const [rewriteOptions, setRewriteOptions] = useState([]);
  const [rewritingLoader, setRewritingLoader] = useState(false);

  const handleRewrite = async () => {
    if (!sectionToRewrite) return;
    setRewritingLoader(true);
    try {
      // Executes Stage 4 (Rewrite Engine)
      const res = await rewriteSection(sectionToRewrite, rewriteTone);
      setRewriteOptions(res.rewrites || []);
    } catch (err) {
      console.error(err);
    } finally {
      setRewritingLoader(false);
    }
  };

  // Coach State
  const [coachData, setCoachData] = useState(null);
  const [coachLoader, setCoachLoader] = useState(false);

  const handleLoadCoach = async () => {
    if (coachData || coachLoader) return;
    setCoachLoader(true);
    try {
      // Executes Stage 5 (Career Coach via structured data)
      const res = await getCareerAdvice(resumeData.structuredData);
      setCoachData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setCoachLoader(false);
    }
  };

  return (
    <div className="container">
      <div className="header">
        <h1>AI Resume Analyzer</h1>
        <p style={{ color: 'var(--text-muted)' }}>Get strictly structured expert feedback, ATS scores, and precise career guidance.</p>
      </div>

      {!resumeData ? (
        <div className={`upload-zone ${isDragActive ? 'active' : ''}`} {...getRootProps()}>
          <input {...getInputProps()} />
          <UploadCloud size={48} color="var(--primary)" />
          {loading ? (
            <div>
              <div className="loader"></div>
              <p style={{ marginTop: '12px' }}>Stricly parsing & understanding your resume...</p>
            </div>
          ) : (
            <>
              <h3>Drag & Drop your resume</h3>
              <p style={{ color: 'var(--text-muted)' }}>Supports PDF, DOC, DOCX</p>
              <button className="btn">Browse Files</button>
            </>
          )}
        </div>
      ) : (
        <>
          <div className="tabs">
            <button className={`tab ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}><CheckCircle size={16} style={{ display: 'inline', marginRight: '6px' }} />Dashboard</button>
            <button className={`tab ${activeTab === 'match' ? 'active' : ''}`} onClick={() => setActiveTab('match')}><Briefcase size={16} style={{ display: 'inline', marginRight: '6px' }} />Job Match</button>
            <button className={`tab ${activeTab === 'rewrite' ? 'active' : ''}`} onClick={() => setActiveTab('rewrite')}><PenTool size={16} style={{ display: 'inline', marginRight: '6px' }} />Rewrite Assistant</button>
            <button className={`tab ${activeTab === 'coach' ? 'active' : ''}`} onClick={() => { setActiveTab('coach'); handleLoadCoach(); }}><Lightbulb size={16} style={{ display: 'inline', marginRight: '6px' }} />Career Coach</button>
          </div>

          {activeTab === 'dashboard' && (
            <div className="dashboard-grid">
              <div className="glass-panel">
                <h2>Analysis Metrics</h2>
                <div className="score-container">
                  <div className="score-item">
                    <CircularProgressbar
                      value={resumeData.analysis.overallScore}
                      text={`${resumeData.analysis.overallScore}`}
                      styles={buildStyles({ pathColor: 'var(--primary)', textColor: '#fff', trailColor: 'rgba(255,255,255,0.1)' })}
                    />
                    <h4>Overall Score</h4>
                  </div>
                  <div className="score-item">
                    <CircularProgressbar
                      value={resumeData.analysis.atsScore}
                      text={`${resumeData.analysis.atsScore}`}
                      styles={buildStyles({ pathColor: 'var(--success)', textColor: '#fff', trailColor: 'rgba(255,255,255,0.1)' })}
                    />
                    <h4>ATS Score</h4>
                  </div>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <h4>Sections Found</h4>
                  <div>
                    {resumeData.analysis.sectionsPresent?.map(s => <span key={s} className="tag success">{s}</span>)}
                  </div>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <h4>Missing Sections</h4>
                  <div>
                    {resumeData.analysis.missingSections?.length > 0 ?
                      resumeData.analysis.missingSections.map(s => <span key={s} className="tag danger">{s}</span>) :
                      <span style={{ color: 'var(--text-muted)' }}>None</span>
                    }
                  </div>
                </div>

                <div>
                  <h4>Formatting</h4>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{resumeData.analysis.formatting}</p>
                </div>
              </div>

              <div className="glass-panel" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                <h2>Actionable Suggestions</h2>

                {resumeData.analysis.criticalFixes?.map((fix, idx) => (
                  <div key={idx} className="feedback-item critical">
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--danger)', marginBottom: '4px' }}>Critical Fix</div>
                    <div className="original">"{fix.original}"</div>
                    <div className="suggestion">{fix.suggestion}</div>
                  </div>
                ))}

                {resumeData.analysis.improvements?.map((imp, idx) => (
                  <div key={idx} className="feedback-item improvement">
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--warning)', marginBottom: '4px' }}>Improvement</div>
                    <div className="suggestion">{imp}</div>
                  </div>
                ))}

                {resumeData.analysis.optionalEnhancements?.map((enh, idx) => (
                  <div key={idx} className="feedback-item enhancement">
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--success)', marginBottom: '4px' }}>Enhancement</div>
                    <div className="suggestion">{enh}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'match' && (
            <div className="glass-panel">
              <h2>Job Description Match</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>Paste a job description below to strictly match your structured resume experience against industry standards.</p>
              <textarea
                className="input-field"
                placeholder="Paste Job Description here..."
                value={jobDescription}
                onChange={e => setJobDescription(e.target.value)}
              ></textarea>
              <button className="btn" onClick={handleMatchJob} disabled={matchingLoader}>
                {matchingLoader ? <div className="loader" style={{ width: 16, height: 16, marginRight: 8 }}></div> : null} Analyze Match
              </button>

              {jobMatchResult && (
                <div className="dashboard-grid" style={{ marginTop: '24px' }}>
                  <div>
                    <div style={{ width: 120, margin: '0 auto', marginBottom: '24px' }}>
                      <CircularProgressbar
                        value={jobMatchResult.matchScore}
                        text={`${jobMatchResult.matchScore}%`}
                        styles={buildStyles({ pathColor: jobMatchResult.matchScore > 70 ? 'var(--success)' : 'var(--warning)', textColor: '#fff', trailColor: 'rgba(255,255,255,0.1)' })}
                      />
                    </div>
                    <h4 style={{ textAlign: 'center' }}>Match Analysis</h4>
                    <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>{jobMatchResult.analysis}</p>
                  </div>
                  <div>
                    <div style={{ marginBottom: '16px' }}>
                      <h4>Matching Keywords</h4>
                      <div>{jobMatchResult.matchingKeywords?.map(k => <span key={k} className="tag success">{k}</span>)}</div>
                    </div>
                    <div>
                      <h4>Missing Keywords</h4>
                      <div>{jobMatchResult.missingKeywords?.map(k => <span key={k} className="tag danger">{k}</span>)}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'rewrite' && (
            <div className="glass-panel">
              <div className="dashboard-grid">
                <div>
                  <h2>Rewrite Assistant</h2>
                  <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>Paste a bullet point. We'll rewrite it based strictly on your original text—no hallucinated facts.</p>
                  <textarea
                    className="input-field"
                    placeholder="e.g. I did coding for the company website..."
                    value={sectionToRewrite}
                    onChange={e => setSectionToRewrite(e.target.value)}
                  ></textarea>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ marginRight: '12px' }}>Tone:</label>
                    <select
                      style={{ background: 'rgba(0,0,0,0.2)', color: 'white', padding: '8px', borderRadius: '4px', border: '1px solid var(--border)' }}
                      value={rewriteTone}
                      onChange={e => setRewriteTone(e.target.value)}
                    >
                      <option value="formal">Formal</option>
                      <option value="concise">Concise</option>
                      <option value="impactful">Impactful (Action Verbs)</option>
                    </select>
                  </div>
                  <button className="btn" onClick={handleRewrite} disabled={rewritingLoader}>
                    {rewritingLoader ? <div className="loader" style={{ width: 16, height: 16, marginRight: 8 }}></div> : null} Generate Options
                  </button>
                </div>
                <div>
                  {rewriteOptions.length > 0 && (
                    <div>
                      <h3 style={{ marginBottom: '16px' }}>Strict AI Suggestions</h3>
                      <div className="rewrite-options">
                        {rewriteOptions.map((opt, i) => (
                          <div key={i} className="rewrite-card">
                            {opt}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'coach' && (
            <div className="glass-panel">
              <h2>Career Coach Mode</h2>
              {coachLoader ? (
                <div style={{ textAlign: 'center', padding: '40px' }}><div className="loader"></div><p style={{ marginTop: '12px' }}>Coach is analyzing your structured profile...</p></div>
              ) : coachData ? (
                <div className="dashboard-grid">
                  <div>
                    <div style={{ marginBottom: '24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <User size={20} color="var(--primary)" />
                        <h3>General Advice</h3>
                      </div>
                      <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>{coachData.generalAdvice}</p>
                    </div>
                    <div style={{ marginBottom: '24px' }}>
                      <h3 style={{ marginBottom: '8px' }}>Recommended Career Paths</h3>
                      <div>{coachData.careerPaths?.map(p => <span key={p} className="tag" style={{ background: 'var(--primary)', color: 'white' }}>{p}</span>)}</div>
                    </div>
                  </div>
                  <div>
                    <div style={{ marginBottom: '24px' }}>
                      <h3 style={{ marginBottom: '8px' }}>Skills to Learn Next</h3>
                      <ul style={{ listStylePosition: 'inside', color: 'var(--text-muted)' }}>
                        {coachData.missingSkills?.map(s => <li key={s} style={{ marginBottom: '4px' }}>{s}</li>)}
                      </ul>
                    </div>
                    <div style={{ marginBottom: '24px' }}>
                      <h3 style={{ marginBottom: '8px' }}>Portfolio / Project Ideas</h3>
                      <ul style={{ listStylePosition: 'inside', color: 'var(--text-muted)' }}>
                        {coachData.portfolioIdeas?.map(idea => <li key={idea} style={{ marginBottom: '4px' }}>{idea}</li>)}
                      </ul>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          )}

        </>
      )}
    </div>
  );
}

export default App;
