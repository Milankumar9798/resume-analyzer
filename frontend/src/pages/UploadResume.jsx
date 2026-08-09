import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Loader2, ScanLine } from 'lucide-react';
import AppShell from '../components/AppShell.jsx';
import FileDropzone from '../components/FileDropzone.jsx';
import { uploadResume, analyzeResume } from '../api/resumeApi';

export default function UploadResume() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState('idle'); // idle | uploading | analyzing

  const handleFileSelect = (selected, err) => {
    setFile(selected);
    setError(err);
    setProgress(0);
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setStage('uploading');
    try {
      const { data: uploadData } = await uploadResume(file, (evt) => {
        setProgress(Math.round((evt.loaded * 100) / evt.total));
      });
      const resumeId = uploadData.data.id;

      setStage('analyzing');
      const { data: analysisData } = await analyzeResume(resumeId);
      toast.success('Analysis complete!');
      navigate(`/analysis/${analysisData.data.id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
      setStage('idle');
    }
  };

  const isBusy = stage !== 'idle';

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <span className="label-eyebrow">Step 1 of 2</span>
          <h1 className="text-2xl font-bold mt-2">Upload your resume</h1>
          <p className="text-sm text-slate-400 mt-1">
            We'll extract the text and run a full ATS analysis with Gemini.
          </p>
        </div>

        <div className="card">
          <FileDropzone file={file} onFileSelect={handleFileSelect} error={error} />

          {isBusy && (
            <div className="mt-6">
              <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400 mb-2">
                <Loader2 size={15} className="animate-spin text-brand-500" />
                {stage === 'uploading' ? 'Uploading & parsing…' : 'Running AI analysis…'}
              </div>
              {stage === 'uploading' && (
                <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-ink-700 overflow-hidden">
                  <motion.div
                    className="h-full bg-brand-500"
                    animate={{ width: `${progress}%` }}
                    transition={{ ease: 'linear' }}
                  />
                </div>
              )}
              {stage === 'analyzing' && (
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <ScanLine size={13} className="animate-pulse" />
                  Gemini is scanning your resume against ATS heuristics…
                </div>
              )}
            </div>
          )}

          <button
            onClick={handleAnalyze}
            disabled={!file || isBusy}
            className="btn-primary w-full mt-6"
          >
            {isBusy && <Loader2 size={16} className="animate-spin" />}
            {isBusy ? 'Please wait…' : 'Analyze resume'}
          </button>
        </div>
      </div>
    </AppShell>
  );
}
