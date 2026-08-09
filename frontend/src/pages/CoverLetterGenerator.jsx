import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Loader2, FileText, Copy, Check, RefreshCcw } from 'lucide-react';
import AppShell from '../components/AppShell.jsx';
import { getResumes, generateCoverLetter } from '../api/resumeApi';

export default function CoverLetterGenerator() {
  const [resumes, setResumes] = useState([]);
  const [loadingResumes, setLoadingResumes] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [letter, setLetter] = useState(null);
  const [copied, setCopied] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await getResumes();
        setResumes(data.data);
      } catch {
        toast.error('Could not load your resumes');
      } finally {
        setLoadingResumes(false);
      }
    };
    load();
  }, []);

  const onSubmit = async (values) => {
    setGenerating(true);
    setLetter(null);
    try {
      const { data } = await generateCoverLetter(values);
      setLetter(data.data);
      toast.success('Cover letter generated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!letter) return;
    await navigator.clipboard.writeText(letter.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleDownload = () => {
    if (!letter) return;
    const blob = new Blob([letter.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cover-letter-${letter.companyName || 'draft'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <span className="label-eyebrow">AI Generator</span>
          <h1 className="text-2xl font-bold mt-2">Cover letter generator</h1>
          <p className="text-sm text-slate-400 mt-1">
            Grounded in your real resume - never invents skills or experience.
          </p>
        </div>

        {!loadingResumes && resumes.length === 0 ? (
          <div className="card text-center py-10">
            <p className="text-sm text-slate-400 mb-4">Upload a resume first to generate a cover letter.</p>
            <a href="/upload" className="btn-primary inline-flex">Upload a resume</a>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="card space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Resume</label>
              <select className="input-field" disabled={loadingResumes} {...register('resumeId', { required: 'Select a resume' })}>
                <option value="">{loadingResumes ? 'Loading…' : 'Select a resume'}</option>
                {resumes.map((r) => (
                  <option key={r.id} value={r.id}>{r.originalFileName}</option>
                ))}
              </select>
              {errors.resumeId && <p className="text-xs text-rose-500 mt-1">{errors.resumeId.message}</p>}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Job title</label>
                <input className="input-field" placeholder="Senior Frontend Engineer" {...register('jobTitle', { required: 'Required' })} />
                {errors.jobTitle && <p className="text-xs text-rose-500 mt-1">{errors.jobTitle.message}</p>}
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Company</label>
                <input className="input-field" placeholder="Acme Inc." {...register('companyName', { required: 'Required' })} />
                {errors.companyName && <p className="text-xs text-rose-500 mt-1">{errors.companyName.message}</p>}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Job description</label>
              <textarea
                rows={8}
                className="input-field resize-none"
                placeholder="Paste the job description here…"
                {...register('jobDescription', { required: 'Job description is required' })}
              />
              {errors.jobDescription && <p className="text-xs text-rose-500 mt-1">{errors.jobDescription.message}</p>}
            </div>

            <button type="submit" disabled={generating} className="btn-primary w-full">
              {generating ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
              {generating ? 'Writing your letter…' : letter ? 'Regenerate' : 'Generate cover letter'}
            </button>
          </form>
        )}

        {letter && (
          <div className="card mt-6 animate-slideUp">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">
                {letter.jobTitle} {letter.companyName ? `· ${letter.companyName}` : ''}
              </h3>
              <div className="flex gap-2">
                <button onClick={handleCopy} className="btn-secondary !px-3 !py-1.5 text-xs">
                  {copied ? <Check size={13} /> : <Copy size={13} />} {copied ? 'Copied' : 'Copy'}
                </button>
                <button onClick={handleDownload} className="btn-secondary !px-3 !py-1.5 text-xs">
                  <RefreshCcw size={13} /> Download .txt
                </button>
              </div>
            </div>
            <div className="whitespace-pre-wrap text-sm leading-relaxed text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-ink-900 rounded-xl p-5">
              {letter.content}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
