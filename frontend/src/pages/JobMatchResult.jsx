import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Download } from 'lucide-react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
} from 'recharts';
import AppShell from '../components/AppShell.jsx';
import ScoreRing from '../components/ScoreRing.jsx';
import ScoreBar from '../components/ScoreBar.jsx';
import TagList from '../components/TagList.jsx';
import ReportSection from '../components/ReportSection.jsx';
import ChatWidget from '../components/ChatWidget.jsx';
import { AnalysisSkeleton } from '../components/Skeletons.jsx';
import { getJobMatchById, getJobMatchChatHistory, sendJobMatchChatMessage } from '../api/resumeApi';
import { exportNodeToPdf } from '../utils/pdfExport';

export default function JobMatchResult() {
  const { id } = useParams();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const reportRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await getJobMatchById(id);
        setMatch(data.data);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Could not load job match');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportNodeToPdf(reportRef.current, `job-match-${id}.pdf`);
    } catch {
      toast.error('Failed to generate PDF');
    } finally {
      setExporting(false);
    }
  };

  const radarData = match
    ? [
        { metric: 'Skills', score: match.skillsMatchScore },
        { metric: 'Keywords', score: match.keywordMatchScore },
        { metric: 'Experience', score: match.experienceMatchScore },
        { metric: 'Education', score: match.educationMatchScore },
        { metric: 'Projects', score: match.projectMatchScore },
      ]
    : [];

  return (
    <AppShell>
      {loading || !match ? (
        <AnalysisSkeleton />
      ) : (
        <div>
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <div>
              <span className="label-eyebrow">Job Match Report</span>
              <h1 className="text-2xl font-bold mt-1">
                {match.jobTitle || 'Job match analysis'}
                {match.companyName ? ` · ${match.companyName}` : ''}
              </h1>
            </div>
            <button onClick={handleExport} disabled={exporting} className="btn-secondary">
              <Download size={15} /> {exporting ? 'Exporting…' : 'Download PDF'}
            </button>
          </div>

          <div ref={reportRef} className="space-y-6 bg-slate-50 dark:bg-ink-900 p-1">
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="card grid sm:grid-cols-[auto_1fr] gap-8 items-center">
                <div className="flex justify-center">
                  <ScoreRing score={match.jobMatchScore} label="Overall Match" size={140} />
                </div>
                <div className="grid grid-cols-1 gap-y-4">
                  <ScoreBar label="Skills" score={match.skillsMatchScore} />
                  <ScoreBar label="Keywords" score={match.keywordMatchScore} />
                  <ScoreBar label="Experience" score={match.experienceMatchScore} />
                  <ScoreBar label="Education" score={match.educationMatchScore} />
                  <ScoreBar label="Projects" score={match.projectMatchScore} />
                </div>
              </div>

              <div className="card">
                <h3 className="font-semibold mb-2">Fit breakdown</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <RadarChart data={radarData} outerRadius="75%">
                    <PolarGrid className="stroke-slate-200 dark:stroke-ink-700" />
                    <PolarAngleAxis dataKey="metric" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                    <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                    <Radar
                      dataKey="score"
                      stroke="#14b8a6"
                      fill="#14b8a6"
                      fillOpacity={0.35}
                      strokeWidth={2}
                    />
                    <Tooltip contentStyle={{ borderRadius: 12, border: 'none', fontSize: 13 }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div className="card">
                <h3 className="font-semibold mb-3">Matched skills</h3>
                <TagList items={match.matchedSkills} tone="positive" />
              </div>
              <div className="card">
                <h3 className="font-semibold mb-3">Missing skills</h3>
                <TagList items={match.missingSkills} tone="negative" />
              </div>
              <div className="card">
                <h3 className="font-semibold mb-3">Matched keywords</h3>
                <TagList items={match.matchedKeywords} tone="positive" />
              </div>
              <div className="card">
                <h3 className="font-semibold mb-3">Missing keywords</h3>
                <TagList items={match.missingKeywords} tone="negative" />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div className="card">
                <h3 className="font-semibold mb-3">Strengths for this role</h3>
                <TagList items={match.strengths} tone="positive" icon={false} />
              </div>
              <div className="card">
                <h3 className="font-semibold mb-3">Gaps for this role</h3>
                <TagList items={match.weaknesses} tone="negative" icon={false} />
              </div>
            </div>

            <ReportSection title="Resume optimization suggestions" items={match.optimizationSuggestions} numbered />
            <ReportSection title="Personalized learning roadmap" items={match.learningRoadmap} numbered />
            <ReportSection title="Job-specific interview questions" items={match.jobSpecificInterviewQuestions} numbered />
          </div>

          <ChatWidget
            contextId={match.id}
            historyFn={getJobMatchChatHistory}
            sendFn={sendJobMatchChatMessage}
            title="Job Match Coach"
            suggestions={[
              'Why is my score low?',
              'Which skills are missing?',
              'What should I learn first?',
              'Am I suitable for this role?',
            ]}
          />
        </div>
      )}
    </AppShell>
  );
}
