import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Sparkles } from 'lucide-react';
import { getProfile, getResumeSuggestions } from '../api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import jsPDF from 'jspdf';

export const Resume = () => {
  const [profile, setProfile] = useState(null);
  const [suggestions, setSuggestions] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await getProfile();
      setProfile(response.data);
    } catch (error) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleGetSuggestions = async () => {
    setLoadingSuggestions(true);
    try {
      const response = await getResumeSuggestions();
      setSuggestions(response.data.suggestions);
      toast.success('AI suggestions generated!');
    } catch (error) {
      toast.error('Failed to get suggestions');
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!profile) return;

    const doc = new jsPDF();
    let yPos = 20;

    // Header
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text(profile.full_name || 'Your Name', 20, yPos);
    yPos += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`${profile.email} | ${profile.mobile}`, 20, yPos);
    yPos += 15;

    // Education
    if (profile.education) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('EDUCATION', 20, yPos);
      yPos += 7;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(profile.education, 20, yPos);
      yPos += 12;
    }

    // Skills
    if (profile.skills && profile.skills.length > 0) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('SKILLS', 20, yPos);
      yPos += 7;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const skillsText = profile.skills.join(', ');
      const splitSkills = doc.splitTextToSize(skillsText, 170);
      doc.text(splitSkills, 20, yPos);
      yPos += 7 * splitSkills.length + 5;
    }

    // Experience
    if (profile.experience) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('EXPERIENCE', 20, yPos);
      yPos += 7;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const splitExp = doc.splitTextToSize(profile.experience, 170);
      doc.text(splitExp, 20, yPos);
      yPos += 7 * splitExp.length + 5;
    }

    // Certifications
    if (profile.certifications && profile.certifications.length > 0) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('CERTIFICATIONS', 20, yPos);
      yPos += 7;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      profile.certifications.forEach(cert => {
        doc.text(`• ${cert}`, 20, yPos);
        yPos += 6;
      });
    }

    doc.save(`${profile.full_name.replace(/\s+/g, '_')}_Resume.pdf`);
    toast.success('Resume downloaded!');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8" data-testid="resume-page">
      <div>
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Resume Maker</h1>
        <p className="text-slate-600 text-lg">Create an ATS-friendly resume with AI suggestions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left - Preview */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm"
          data-testid="resume-preview"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-orange-500" />
              Resume Preview
            </h2>
            <Button
              onClick={handleDownloadPDF}
              className="bg-orange-500 hover:bg-orange-600 text-white"
              data-testid="download-resume-button"
            >
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
          </div>

          {/* Resume Content */}
          <div className="space-y-6 text-sm">
            {/* Header */}
            <div className="border-b border-slate-200 pb-4">
              <h3 className="text-2xl font-bold text-slate-900 mb-2">{profile?.full_name || 'Your Name'}</h3>
              <p className="text-slate-600">{profile?.email} | {profile?.mobile}</p>
            </div>

            {/* Education */}
            {profile?.education && (
              <div>
                <h4 className="text-sm font-bold text-slate-900 uppercase mb-2">Education</h4>
                <p className="text-slate-700">{profile.education}</p>
              </div>
            )}

            {/* Skills */}
            {profile?.skills && profile.skills.length > 0 && (
              <div>
                <h4 className="text-sm font-bold text-slate-900 uppercase mb-2">Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill, idx) => (
                    <span key={idx} className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Experience */}
            {profile?.experience && (
              <div>
                <h4 className="text-sm font-bold text-slate-900 uppercase mb-2">Experience</h4>
                <p className="text-slate-700 whitespace-pre-line">{profile.experience}</p>
              </div>
            )}

            {/* Certifications */}
            {profile?.certifications && profile.certifications.length > 0 && (
              <div>
                <h4 className="text-sm font-bold text-slate-900 uppercase mb-2">Certifications</h4>
                <ul className="list-disc list-inside space-y-1">
                  {profile.certifications.map((cert, idx) => (
                    <li key={idx} className="text-slate-700">{cert}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </motion.div>

        {/* Right - AI Suggestions */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm"
          data-testid="ai-suggestions"
        >
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-orange-500" />
              AI Resume Suggestions
            </h2>
            <p className="text-sm text-slate-600 mb-4">
              Get personalized suggestions to make your resume more ATS-friendly and impactful.
            </p>
            <Button
              onClick={handleGetSuggestions}
              disabled={loadingSuggestions}
              className="bg-orange-500 hover:bg-orange-600 text-white w-full"
              data-testid="get-suggestions-button"
            >
              {loadingSuggestions ? 'Generating...' : 'Get AI Suggestions'}
            </Button>
          </div>

          {suggestions && (
            <div className="bg-slate-50 rounded-lg p-6" data-testid="suggestions-content">
              <p className="text-slate-700 whitespace-pre-line leading-relaxed">{suggestions}</p>
            </div>
          )}

          {!suggestions && !loadingSuggestions && (
            <div className="text-center py-12 text-slate-400">
              <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Click the button above to get AI-powered resume suggestions</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};