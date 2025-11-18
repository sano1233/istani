'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface FormIssue {
  issue: string;
  severity: 'minor' | 'moderate' | 'critical';
  explanation: string;
  correction: string;
  cue: string;
}

interface InjuryRisk {
  body_part: string;
  risk_level: 'low' | 'moderate' | 'high';
  prevention: string;
}

interface FormAnalysis {
  summary: string;
  overall_rating: number;
  confidence_score: number;
  form_analysis: {
    positive_aspects: string[];
    areas_for_improvement: FormIssue[];
    potential_injuries: InjuryRisk[];
  };
  detailed_breakdown: {
    setup: { assessment: string; recommendations: string[] };
    execution: { assessment: string; recommendations: string[] };
    breathing: { assessment: string; recommendations: string[] };
    tempo: { assessment: string; recommendations: string[] };
  };
  progressive_cues: Array<{ level: string; cue: string }>;
  video_resources: string[];
  alternatives: Array<{ exercise: string; reason: string; when_to_use: string }>;
  next_steps: string[];
  encouragement: string;
}

export function FormChecker() {
  const [exerciseName, setExerciseName] = useState('');
  const [description, setDescription] = useState('');
  const [equipment, setEquipment] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('intermediate');
  const [analysis, setAnalysis] = useState<FormAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function analyzeForm() {
    if (!exerciseName.trim() || !description.trim()) {
      setError('Please provide both exercise name and description');
      return;
    }

    setLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const response = await fetch('/api/ai/form-check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          exercise_name: exerciseName,
          user_description: description,
          equipment: equipment || undefined,
          experience_level: experienceLevel,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze form');
      }

      const data = await response.json();
      setAnalysis(data.analysis);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'moderate':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'minor':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      default:
        return 'bg-white/10 text-white/60 border-white/30';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high':
        return 'text-red-400';
      case 'moderate':
        return 'text-yellow-400';
      case 'low':
        return 'text-green-400';
      default:
        return 'text-white/60';
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 8) return 'text-green-400';
    if (rating >= 6) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Exercise Form Checker</h1>
        <p className="text-white/60">
          Get AI-powered feedback on your exercise form to improve safety and effectiveness
        </p>
      </div>

      {/* Input Form */}
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-white/80 text-sm font-semibold mb-2">
              Exercise Name *
            </label>
            <input
              type="text"
              value={exerciseName}
              onChange={(e) => setExerciseName(e.target.value)}
              placeholder="e.g., Barbell Back Squat"
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white/80 text-sm font-semibold mb-2">
                Equipment (optional)
              </label>
              <select
                value={equipment}
                onChange={(e) => setEquipment(e.target.value)}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
              >
                <option value="">Select equipment</option>
                <option value="barbell">Barbell</option>
                <option value="dumbbell">Dumbbell</option>
                <option value="machine">Machine</option>
                <option value="cables">Cables</option>
                <option value="bodyweight">Bodyweight</option>
                <option value="kettlebell">Kettlebell</option>
                <option value="resistance_band">Resistance Band</option>
              </select>
            </div>

            <div>
              <label className="block text-white/80 text-sm font-semibold mb-2">
                Your Experience Level
              </label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
              >
                <option value="beginner">Beginner (0-1 year)</option>
                <option value="intermediate">Intermediate (1-3 years)</option>
                <option value="advanced">Advanced (3+ years)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-white/80 text-sm font-semibold mb-2">
              Describe Your Form *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe how you're performing the exercise. Include details about your setup, movement pattern, any pain or discomfort, and specific concerns you have..."
              rows={6}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white resize-none"
            />
            <p className="text-white/40 text-xs mt-1">
              Be as detailed as possible. Mention your grip, stance, movement path, any cues you focus
              on, etc.
            </p>
          </div>

          {error && (
            <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
              <p className="text-red-400">{error}</p>
            </div>
          )}

          <Button onClick={analyzeForm} disabled={loading} className="w-full">
            {loading ? (
              <>
                <span className="material-symbols-outlined mr-2 animate-spin">refresh</span>
                Analyzing...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined mr-2">psychology</span>
                Analyze My Form
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Analysis Results */}
      {analysis && (
        <div className="space-y-6">
          {/* Overall Rating */}
          <Card className="p-6 bg-gradient-to-br from-primary/20 to-purple-500/10">
            <div className="text-center mb-4">
              <p className={`text-6xl font-bold ${getRatingColor(analysis.overall_rating)}`}>
                {analysis.overall_rating.toFixed(1)}/10
              </p>
              <p className="text-white/60 text-sm mt-2">Overall Form Rating</p>
            </div>

            <p className="text-white/80 text-lg text-center mb-4">{analysis.summary}</p>

            <div className="flex items-center justify-center gap-2 text-sm text-white/60">
              <span className="material-symbols-outlined text-sm">verified</span>
              <span>Confidence: {(analysis.confidence_score * 100).toFixed(0)}%</span>
            </div>
          </Card>

          {/* Positive Aspects */}
          {analysis.form_analysis.positive_aspects.length > 0 && (
            <Card className="p-6 border-green-500/50 bg-green-500/5">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-green-400 text-2xl">
                  check_circle
                </span>
                <h3 className="text-xl font-bold text-white">What You're Doing Well</h3>
              </div>

              <ul className="space-y-2">
                {analysis.form_analysis.positive_aspects.map((aspect, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-green-400 text-lg mt-0.5">
                      done
                    </span>
                    <span className="text-white/80">{aspect}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* Areas for Improvement */}
          {analysis.form_analysis.areas_for_improvement.length > 0 && (
            <Card className="p-6">
              <h3 className="text-xl font-bold text-white mb-4">Areas for Improvement</h3>

              <div className="space-y-4">
                {analysis.form_analysis.areas_for_improvement.map((issue, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${getSeverityColor(issue.severity)}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-semibold text-white">{issue.issue}</h4>
                      <span className="px-2 py-0.5 rounded text-xs uppercase font-semibold">
                        {issue.severity}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <p className="text-white/60 text-sm font-semibold mb-1">Why this matters:</p>
                        <p className="text-white/80 text-sm">{issue.explanation}</p>
                      </div>

                      <div>
                        <p className="text-white/60 text-sm font-semibold mb-1">How to fix it:</p>
                        <p className="text-white/80 text-sm">{issue.correction}</p>
                      </div>

                      <div className="p-3 bg-white/5 rounded-lg">
                        <p className="text-white/60 text-xs font-semibold mb-1">💡 MENTAL CUE:</p>
                        <p className="text-primary font-semibold">&quot;{issue.cue}&quot;</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Injury Risks */}
          {analysis.form_analysis.potential_injuries.length > 0 && (
            <Card className="p-6 border-red-500/30">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-red-400 text-2xl">warning</span>
                <h3 className="text-xl font-bold text-white">Injury Risk Prevention</h3>
              </div>

              <div className="space-y-3">
                {analysis.form_analysis.potential_injuries.map((risk, index) => (
                  <div key={index} className="p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-white capitalize">{risk.body_part}</h4>
                      <span className={`text-sm font-semibold ${getRiskColor(risk.risk_level)}`}>
                        {risk.risk_level.toUpperCase()} RISK
                      </span>
                    </div>
                    <p className="text-white/80 text-sm">{risk.prevention}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Detailed Breakdown */}
          <Card className="p-6">
            <h3 className="text-xl font-bold text-white mb-4">Detailed Breakdown</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(analysis.detailed_breakdown).map(([key, value]) => (
                <div key={key} className="p-4 bg-white/5 rounded-lg">
                  <h4 className="font-semibold text-white capitalize mb-2">{key}</h4>
                  <p className="text-white/80 text-sm mb-3">{value.assessment}</p>
                  {value.recommendations.length > 0 && (
                    <ul className="space-y-1">
                      {value.recommendations.map((rec, idx) => (
                        <li key={idx} className="text-white/60 text-sm flex items-start gap-2">
                          <span className="text-primary">→</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Progressive Cues */}
          <Card className="p-6">
            <h3 className="text-xl font-bold text-white mb-4">Progressive Training Cues</h3>

            <div className="space-y-3">
              {analysis.progressive_cues.map((cue, index) => (
                <div key={index} className="p-4 bg-white/5 rounded-lg">
                  <p className="text-primary font-semibold capitalize mb-2">{cue.level} Level</p>
                  <p className="text-white/80">&quot;{cue.cue}&quot;</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Next Steps */}
          <Card className="p-6 bg-primary/10 border-primary/30">
            <h3 className="text-xl font-bold text-white mb-4">Next Steps</h3>

            <ol className="space-y-2">
              {analysis.next_steps.map((step, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </span>
                  <span className="text-white/80 mt-0.5">{step}</span>
                </li>
              ))}
            </ol>

            <div className="mt-6 p-4 bg-primary/20 rounded-lg">
              <p className="text-white/60 text-sm mb-1">Encouragement:</p>
              <p className="text-white font-semibold">{analysis.encouragement}</p>
            </div>
          </Card>

          {/* Alternative Exercises */}
          {analysis.alternatives && analysis.alternatives.length > 0 && (
            <Card className="p-6">
              <h3 className="text-xl font-bold text-white mb-4">Alternative Exercises</h3>

              <div className="space-y-3">
                {analysis.alternatives.map((alt, index) => (
                  <div key={index} className="p-4 bg-white/5 rounded-lg">
                    <h4 className="font-semibold text-white mb-2">{alt.exercise}</h4>
                    <p className="text-white/80 text-sm mb-2">{alt.reason}</p>
                    <p className="text-white/60 text-xs">
                      <span className="text-primary font-semibold">When to use:</span>{' '}
                      {alt.when_to_use}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
