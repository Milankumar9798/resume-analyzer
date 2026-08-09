import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ScanLine, Target, FileCheck2, Sparkles, ArrowRight } from 'lucide-react';
import Navbar from '../components/Navbar.jsx';

const features = [
  {
    icon: ScanLine,
    title: 'ATS Score Scan',
    desc: 'See exactly how applicant tracking systems parse your resume before a recruiter ever does.',
  },
  {
    icon: Target,
    title: 'Job Match Scoring',
    desc: 'Paste any job description and get a precise fit score across skills, keywords, and experience.',
  },
  {
    icon: FileCheck2,
    title: 'Actionable Rewrites',
    desc: 'Specific, honest suggestions grounded in your real experience — never fabricated skills.',
  },
  {
    icon: Sparkles,
    title: 'Interview Prep',
    desc: 'Technical and HR questions generated from your actual resume and target role.',
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-ink-900">
      <Navbar />

      <section className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
        <motion.span
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="label-eyebrow inline-block mb-5"
        >
          AI-Powered Resume Intelligence
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl sm:text-6xl font-bold tracking-tight leading-[1.1]"
        >
          Know exactly why your
          <br />
          <span className="bg-gradient-to-r from-brand-600 to-signal-500 bg-clip-text text-transparent">
            resume gets rejected.
          </span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto"
        >
          Upload your resume, paste any job description, and get an ATS score, gap analysis,
          and interview questions — powered by Gemini, grounded in your real experience.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-9 flex items-center justify-center gap-3"
        >
          <Link to="/register" className="btn-primary">
            Analyze my resume <ArrowRight size={16} />
          </Link>
          <Link to="/login" className="btn-secondary">
            Sign in
          </Link>
        </motion.div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="card"
            >
              <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-brand-600 to-signal-600 text-white mb-4">
                <Icon size={18} />
              </span>
              <h3 className="font-semibold mb-1.5">{title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
