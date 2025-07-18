import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Upload, Users, FileText, BookOpen } from "lucide-react";
import { useState, useEffect } from 'react';
import { detectAIEssay } from '@/lib/aiEssayApi';

interface LecturerDashboardOverviewProps {
  onTabChange: (tab: string) => void;
}

export const LecturerDashboardOverview = ({ onTabChange }: LecturerDashboardOverviewProps) => {
  const [aiScore, setAiScore] = useState<number | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [essayText, setEssayText] = useState('');
  const [aiResults, setAiResults] = useState<{ text: string; score: number | null; error?: string }[]>([]);

  // Example essays array (replace with real data from props or context)
  const essays = [
    "This is a sample student essay about the importance of TVET education.",
    "AI-generated text often has certain patterns that can be detected.",
    "I learned a lot in my course and enjoyed the practical assignments.",
    "The quick brown fox jumps over the lazy dog."
  ];

  const handleCheckEssay = async () => {
    setAiLoading(true);
    setAiError(null);
    try {
      const score = await detectAIEssay(essayText);
      setAiScore(score);
    } catch (err) {
      setAiError('Failed to check essay.');
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    const detectAllEssays = async () => {
      setAiLoading(true);
      const results: { text: string; score: number | null; error?: string }[] = [];
      for (const essay of essays) {
        try {
          const score = await detectAIEssay(essay);
          results.push({ text: essay, score });
        } catch (err) {
          results.push({ text: essay, score: null, error: 'Detection failed' });
        }
      }
      setAiResults(results);
      setAiLoading(false);
    };
    detectAllEssays();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Welcome to Lecturer Dashboard</CardTitle>
          <CardDescription>Manage your units and course content</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm text-gray-600">
            <p>• Click on any unit to manage its content</p>
            <p>• Add assignments, CATs, exams, and notes</p>
            <p>• Set up WhatsApp groups for communication</p>
            <p>• Schedule online classes</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button className="w-full" onClick={() => onTabChange('units')}>
            <BookOpen className="w-4 h-4 mr-2" />
            Manage My Units
          </Button>
          <Button className="w-full" variant="outline" onClick={() => onTabChange('assignments')}>
            <Upload className="w-4 h-4 mr-2" />
            Assignment Manager
          </Button>
          <Button className="w-full" variant="outline" onClick={() => onTabChange('attendance')}>
            <Users className="w-4 h-4 mr-2" />
            Take Attendance
          </Button>
          <Button className="w-full" variant="outline" onClick={() => onTabChange('notes')}>
            <FileText className="w-4 h-4 mr-2" />
            Notes Manager
          </Button>
        </CardContent>
      </Card>

      <div style={{ marginBottom: 24 }}>
        <textarea
          value={essayText}
          onChange={e => setEssayText(e.target.value)}
          placeholder="Paste student essay here..."
          rows={6}
          style={{ width: '100%', marginBottom: 8 }}
        />
        <button onClick={handleCheckEssay} disabled={aiLoading || !essayText.trim()}>
          {aiLoading ? 'Checking...' : 'Check for AI'}
        </button>
        {aiScore !== null && (
          <div>
            AI Probability: {aiScore}%<br />
            <span>{aiScore > 50 ? 'Likely AI-generated' : 'Likely human-written'}</span>
          </div>
        )}
        {aiError && <div style={{ color: 'red' }}>{aiError}</div>}
      </div>

      {/* Automated AI detection table */}
      <div className="col-span-1 md:col-span-2">
        <h2 className="text-lg font-bold mb-2">AI Detection Results for All Essays</h2>
        {aiLoading ? (
          <div>Checking essays for AI...</div>
        ) : (
          <table className="w-full border text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-2 py-1">Essay</th>
                <th className="border px-2 py-1">AI Probability</th>
                <th className="border px-2 py-1">Verdict</th>
              </tr>
            </thead>
            <tbody>
              {aiResults.map((result, idx) => (
                <tr key={idx}>
                  <td className="border px-2 py-1">{result.text}</td>
                  <td className="border px-2 py-1">{result.score !== null ? `${result.score}%` : 'Error'}</td>
                  <td className="border px-2 py-1">
                    {result.score !== null
                      ? result.score > 50
                        ? 'Likely AI-generated'
                        : 'Likely human-written'
                      : result.error || 'Error'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
