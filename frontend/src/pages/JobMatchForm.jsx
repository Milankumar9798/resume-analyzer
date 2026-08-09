import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Loader2, Target } from 'lucide-react';
import AppShell from '../components/AppShell.jsx';
import { getResumes, createJobMatch } from '../api/resumeApi';

export default function JobMatchForm() {
  const navigate = useNavigate();
  const [resumes, setResumes] = useState([]);
  const [loadingResumes, setLoadingResumes] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const jdLength = watch('jobDescription')?.length || 0;

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
    setSubmitting(true);
    try {
      const { data } = await createJobMatch(values);
      toast.success('Job match analysis complete!');
      navigate(`/job-match/${data.data.id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Job match failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <span className="label-eyebrow">Step 2 of 2</span>
          <h1 className="text-2xl font-bold mt-2">Match against a job description</h1>
          <p className="text-sm text-slate-400 mt-1">
            Pick an uploaded resume and paste the job posting you're targeting.
          </p>
        </div>

        {!loadingResumes && resumes.length === 0 ? (
          <div className="card text-center py-10">
            <p className="text-sm text-slate-400 mb-4">
              You need to upload a resume before running a job match.
            </p>
            <a href="/upload" className="btn-primary inline-flex">
              Upload a resume
            </a>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="card space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Resume</label>
              <select
                className="input-field"
                disabled={loadingResumes}
                {...register('resumeId', { required: 'Select a resume' })}
              >
                <option value="">{loadingResumes ? 'Loading…' : 'Select a resume'}</option>
                {resumes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.originalFileName}
                  </option>
                ))}
              </select>
              {errors.resumeId && <p className="text-xs text-rose-500 mt-1">{errors.resumeId.message}</p>}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Job title (optional)</label>
                <input className="input-field" placeholder="Senior Frontend Engineer" {...register('jobTitle')} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Company (optional)</label>
                <input className="input-field" placeholder="Acme Inc." {...register('companyName')} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium">Job description</label>
                <span className="text-xs text-slate-400 font-mono">{jdLength} chars</span>
              </div>
              <textarea
                rows={10}
                className="input-field resize-none"
                placeholder="Paste the full job description here…"
                {...register('jobDescription', {
                  required: 'Job description is required',
                  minLength: { value: 50, message: 'Paste the full job description for accurate matching' },
                })}
              />
              {errors.jobDescription && (
                <p className="text-xs text-rose-500 mt-1">{errors.jobDescription.message}</p>
              )}
            </div>

            <button type="submit" disabled={submitting} className="btn-primary w-full">
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <Target size={16} />}
              {submitting ? 'Analyzing match…' : 'Run job match analysis'}
            </button>
          </form>
        )}
      </div>
    </AppShell>
  );
}
