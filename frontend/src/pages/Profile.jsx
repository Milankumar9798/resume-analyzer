import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import AppShell from '../components/AppShell.jsx';
import { useAuth } from '../hooks/useAuth';
import { updateProfile as updateProfileApi } from '../api/authApi';

export default function Profile() {
  const { user, setUser } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit } = useForm({
    defaultValues: { name: user?.name, headline: user?.headline || '' },
  });

  const onSubmit = async (values) => {
    setSubmitting(true);
    try {
      const { data } = await updateProfileApi(values);
      setUser(data.data);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-lg mx-auto">
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-brand-600 to-signal-600 text-white flex items-center justify-center text-2xl font-display font-bold mb-4">
            {user?.avatarInitials || user?.name?.[0]}
          </div>
          <h1 className="text-xl font-bold">{user?.name}</h1>
          <p className="text-sm text-slate-400">{user?.email}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="card space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Full name</label>
            <input className="input-field" {...register('name')} />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Headline</label>
            <input
              className="input-field"
              placeholder="e.g. Frontend Engineer @ Acme"
              {...register('headline')}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Email</label>
            <input className="input-field opacity-60" value={user?.email} disabled />
            <p className="text-xs text-slate-400 mt-1">Email cannot be changed.</p>
          </div>
          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting && <Loader2 size={16} className="animate-spin" />}
            Save changes
          </button>
        </form>
      </div>
    </AppShell>
  );
}
