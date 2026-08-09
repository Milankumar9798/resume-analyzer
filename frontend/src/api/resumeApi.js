import api from './axios';

// --- Resumes ---------------------------------------------------------------
export const uploadResume = (file, onUploadProgress) => {
  const formData = new FormData();
  formData.append('resume', file);
  return api.post('/resumes/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress,
  });
};

export const getResumes = () => api.get('/resumes');
export const getResumeById = (id) => api.get(`/resumes/${id}`);
export const deleteResume = (id) => api.delete(`/resumes/${id}`);

// --- AI Analysis -------------------------------------------------------------
export const analyzeResume = (resumeId) => api.post(`/ai/analyze/${resumeId}`);
export const getAnalysisById = (id) => api.get(`/ai/analysis/${id}`);

// --- Job Matching -------------------------------------------------------------
export const createJobMatch = (payload) => api.post('/job-match', payload);
export const getJobMatchById = (id) => api.get(`/job-match/${id}`);
export const getJobMatches = () => api.get('/job-match');

// --- History / Dashboard -------------------------------------------------------
export const getDashboardStats = () => api.get('/history/dashboard');
export const getAnalysisHistory = () => api.get('/history/analyses');
export const getJobMatchHistory = () => api.get('/history/job-matches');

// --- Chat (Resume Chat + Job Match Chat) ---------------------------------------
export const getResumeChatHistory = (resumeId) => api.get(`/chat/resume/${resumeId}`);
export const sendResumeChatMessage = (resumeId, message) =>
  api.post(`/chat/resume/${resumeId}`, { message });

export const getJobMatchChatHistory = (jobMatchId) => api.get(`/chat/job-match/${jobMatchId}`);
export const sendJobMatchChatMessage = (jobMatchId, message) =>
  api.post(`/chat/job-match/${jobMatchId}`, { message });

// --- Generators (Cover Letter + LinkedIn Summary) ------------------------------
export const generateCoverLetter = (payload) => api.post('/generate/cover-letter', payload);
export const generateLinkedInSummary = (payload) => api.post('/generate/linkedin-summary', payload);
