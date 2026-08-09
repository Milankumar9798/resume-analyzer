import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import UploadResume from './pages/UploadResume.jsx';
import AnalysisResult from './pages/AnalysisResult.jsx';
import JobMatchForm from './pages/JobMatchForm.jsx';
import JobMatchResult from './pages/JobMatchResult.jsx';
import CoverLetterGenerator from './pages/CoverLetterGenerator.jsx';
import LinkedInSummaryGenerator from './pages/LinkedInSummaryGenerator.jsx';
import History from './pages/History.jsx';
import Profile from './pages/Profile.jsx';
import NotFound from './pages/NotFound.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

export default function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          className: '!bg-white dark:!bg-ink-800 !text-slate-900 dark:!text-slate-100 !rounded-xl !text-sm',
        }}
      />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/upload"
          element={
            <ProtectedRoute>
              <UploadResume />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analysis/:id"
          element={
            <ProtectedRoute>
              <AnalysisResult />
            </ProtectedRoute>
          }
        />
        <Route
          path="/job-match"
          element={
            <ProtectedRoute>
              <JobMatchForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/job-match/:id"
          element={
            <ProtectedRoute>
              <JobMatchResult />
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <History />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cover-letter"
          element={
            <ProtectedRoute>
              <CoverLetterGenerator />
            </ProtectedRoute>
          }
        />
        <Route
          path="/linkedin-summary"
          element={
            <ProtectedRoute>
              <LinkedInSummaryGenerator />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
