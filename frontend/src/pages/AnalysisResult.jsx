import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Download, Target, ThumbsUp, ThumbsDown } from 'lucide-react';
import AppShell from '../components/AppShell.jsx';
import ScoreRing from '../components/ScoreRing.jsx';
import TagList from '../components/TagList.jsx';
import ReportSection from '../components/ReportSection.jsx';
import ChatWidget from '../components/ChatWidget.jsx';
import { AnalysisSkeleton } from '../components/Skeletons.jsx';
import { getAnalysisById, getResumeChatHistory, sendResumeChatMessage } from '../api/resumeApi';
import { exportNodeToPdf } from '../utils/pdfExport';

export default function AnalysisResult() {
  const { id } = useParams();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const reportRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await getAnalysisById(id);
        setAnalysis(data.data);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Could not load analysis');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportNodeToPdf(reportRef.current, `ats-analysis-${id}.pdf`);
    } catch {
      toast.error('Failed to generate PDF');
    } finally {
      setExporting(false);
    }
  };

  return (
    <AppShell>
      {loading || !analysis ? (
        <AnalysisSkeleton />
      ) : (
        <div>
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <div>
              <span className="label-eyebrow">ATS Analysis Report</span>
              <h1 className="text-2xl font-bold mt-1">{analysis.resumeFileName}</h1>
            </div>
            <div className="flex gap-2">
              <button onClick={handleExport} disabled={exporting} className="btn-secondary">
                <Download size={15} /> {exporting ? 'Exporting…' : 'Download PDF'}
              </button>
              <Link to="/job-match" className="btn-primary">
                <Target size={15} /> Match to a job
              </Link>
            </div>
          </div>

          <div ref={reportRef} className="space-y-6 bg-slate-50 dark:bg-ink-900 p-1">
            <div className="card">
              <div className="flex flex-wrap gap-8 justify-center sm:justify-between items-center">
                <ScoreRing score={analysis.atsScore} label="ATS Score" size={128} />
                <ScoreRing score={analysis.grammarScore} label="Grammar" size={100} />
                <ScoreRing score={analysis.formattingScore} label="Formatting" size={100} />
                <ScoreRing score={analysis.resumeQualityScore} label="Overall Quality" size={100} />
              </div>
            </div>

            {analysis.summary && (
              <div className="card">
                <h3 className="font-semibold mb-2">Summary</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {analysis.summary}
                </p>
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-6">
              <div className="card">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <ThumbsUp size={16} className="text-signal-500" /> Strengths
                </h3>
                <TagList items={analysis.strengths} tone="positive" icon={false} />
              </div>
              <div className="card">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <ThumbsDown size={16} className="text-rose-500" /> Weaknesses
                </h3>
                <TagList items={analysis.weaknesses} tone="negative" icon={false} />
              </div>
              <div className="card">
                <h3 className="font-semibold mb-3">Missing skills</h3>
                <TagList items={analysis.missingSkills} tone="negative" />
              </div>
              <div className="card">
                <h3 className="font-semibold mb-3">Missing keywords</h3>
                <TagList items={analysis.missingKeywords} tone="negative" />
              </div>
            </div>

            <ReportSection title="Improvement suggestions" items={analysis.improvementSuggestions} numbered />
            <ReportSection title="Career recommendations" items={analysis.careerRecommendations} />

            <div className="grid sm:grid-cols-2 gap-6">
              <ReportSection title="Technical interview questions" items={analysis.technicalInterviewQuestions} numbered />
              <ReportSection title="HR interview questions" items={analysis.hrInterviewQuestions} numbered />
            </div>
          </div>

          <ChatWidget
            contextId={analysis.resumeId}
            historyFn={getResumeChatHistory}
            sendFn={sendResumeChatMessage}
            title="Resume Coach"
            suggestions={[
              'How can I improve my resume?',
              'Which skills should I learn next?',
              'Which jobs fit my profile?',
              'How can I improve my projects?',
            ]}
          />
        </div>
      )}
    </AppShell>
  );
}
