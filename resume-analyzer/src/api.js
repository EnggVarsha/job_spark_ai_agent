import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

export const analyzeResume = async (file) => {
  const formData = new FormData();
  formData.append('resume', file);
  const response = await axios.post(`${API_URL}/analyze-resume`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const matchJob = async (structuredData, jobDescription) => {
  const response = await axios.post(`${API_URL}/match-job`, { structuredData, jobDescription });
  return response.data;
};

export const rewriteSection = async (sectionText, tone) => {
  const response = await axios.post(`${API_URL}/rewrite-section`, { sectionText, tone });
  return response.data;
};

export const getCareerAdvice = async (structuredData) => {
  const response = await axios.post(`${API_URL}/career-coach`, { structuredData });
  return response.data;
};
