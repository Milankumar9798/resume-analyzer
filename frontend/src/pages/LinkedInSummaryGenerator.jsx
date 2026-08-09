import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Loader2, Linkedin, Copy, Check } from 'lucide-react';
import AppShell from '../components/AppShell.jsx';
import { getResumes, generateLinkedInSummary } from '../api/resumeApi';

const TONES = [
  { value: 'professional', label: 'Professional' },
  { value: 'conversational', label: 'Conversational' },
  { value: 'confident', label: 'Confident' },
];

export default function LinkedInSummaryGenerator() {
  const [resumes, setResumes] = useState([]);
  const [loadingResumes, setLoadingResumes] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [summary, setSummary] = useState(null);
  const [copied, setCopied] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues: { tone: 'professional' } });

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
    setSummary(null);
    try {
      const { data } = await generateLinkedInSummary(values);
      setSummary(data.data);
      toast.success('LinkedIn summary generated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!summary) return;
    await navigator.clipboard.writeText(summary.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <span className="label-eyebrow">AI Generator</span>
          <h1 className="text-2xl font-bold mt-2">LinkedIn summary generator</h1>
          <p className="text-sm text-slate-400 mt-1">
            A polished "About" section written from your actual resume content.
          </p>
        </div>

        {!loadingResumes && resumes.length === 0 ? (
          <div className="card text-center py-10">
            <p className="text-sm text-slate-400 mb-4">Upload a resume first to generate a summary.</p>
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

            <div>
              <label className="text-sm font-medium mb-1.5 block">Tone</label>
              <div className="grid grid-cols-3 gap-2">
                {TONES.map((t) => (
                  <label key={t.value} className="cursor-pointer">
                    <input type="radio" value={t.value} className="peer sr-only" {...register('tone')} />
                    <div className="text-center text-sm py-2.5 rounded-xl border border-slate-200 dark:border-ink-700 peer-checked:border-brand-500 peer-checked:bg-brand-50 dark:peer-checked:bg-brand-500/10 peer-checked:text-brand-700 dark:peer-checked:text-brand-300 transition-colors">
                      {t.label}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <button type="submit" disabled={generating} className="btn-primary w-full">
              {generating ? <Loader2 size={16} className="animate-spin" /> : <Linkedin size={16} />}
              {generating ? 'Writing your summary…' : summary ? 'Regenerate' : 'Generate summary'}
            </button>
          </form>
        )}

        {summary && (
          <div className="card mt-6 animate-slideUp">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold capitalize">{summary.tone} tone</h3>
              <button onClick={handleCopy} className="btn-secondary !px-3 !py-1.5 text-xs">
                {copied ? <Check size={13} /> : <Copy size={13} />} {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <div className="whitespace-pre-wrap text-sm leading-relaxed text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-ink-900 rounded-xl p-5">
              {summary.content}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
