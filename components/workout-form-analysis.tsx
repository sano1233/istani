'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface FormAnalysis {
  exercise: string;
  overallScore: number;
  aspects: {
    posture: { score: number; feedback: string };
    range_of_motion: { score: number; feedback: string };
    tempo: { score: number; feedback: string };
    stability: { score: number; feedback: string };
  };
  corrections: string[];
  injury_risks: string[];
  recommendations: string[];
  confidence: number;
}

export function WorkoutFormAnalysis() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [exerciseName, setExerciseName] = useState('');
  const [analysis, setAnalysis] = useState<FormAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 50MB for video)
    if (file.size > 50 * 1024 * 1024) {
      alert('Video file is too large. Please upload a video smaller than 50MB.');
      return;
    }

    setVideoFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setVideoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const analyzeForm = async () => {
    if (!videoFile || !exerciseName) {
      alert('Please upload a video and specify the exercise name');
      return;
    }

    setIsAnalyzing(true);
    try {
      // Convert video to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Video = reader.result as string;

        const response = await fetch('/api/ai/analyze-workout-form', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            video: base64Video,
            exercise: exerciseName,
          }),
        });

        const data = await response.json();

        if (data.success) {
          setAnalysis(data.analysis);
        } else {
          alert(data.error || 'Failed to analyze form');
        }
      };
      reader.readAsDataURL(videoFile);
    } catch (error) {
      console.error('Form analysis failed:', error);
      alert('Failed to analyze workout form. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-500/10 border-green-500/20';
    if (score >= 60) return 'bg-yellow-500/10 border-yellow-500/20';
    return 'bg-red-500/10 border-red-500/20';
  };

  return (
    <div className="space-y-6">
      {/* Video Upload Card */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Workout Form Analysis</h2>
        <p className="text-white/60 mb-6">
          Upload a video of your exercise and get AI-powered form feedback with injury prevention tips
        </p>

        {/* Exercise Name Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Exercise Name</label>
          <input
            type="text"
            value={exerciseName}
            onChange={(e) => setExerciseName(e.target.value)}
            placeholder="e.g., Barbell Squat, Bench Press, Deadlift"
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-primary focus:outline-none"
          />
        </div>

        {/* Video Upload Area */}
        <div
          onClick={() => videoInputRef.current?.click()}
          className="relative aspect-video rounded-2xl border-2 border-dashed border-white/20 hover:border-primary/50 transition-colors cursor-pointer overflow-hidden bg-white/5"
        >
          {videoPreview ? (
            <video
              ref={videoRef}
              src={videoPreview}
              controls
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="material-symbols-outlined text-6xl text-white/40 mb-2">
                video_file
              </span>
              <p className="text-white/60">Click to upload workout video</p>
              <p className="text-sm text-white/40 mt-2">Max 50MB • MP4, MOV, or AVI</p>
            </div>
          )}
        </div>
        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={handleVideoUpload}
        />

        {/* Analyze Button */}
        <Button
          onClick={analyzeForm}
          disabled={!videoFile || !exerciseName || isAnalyzing}
          className="w-full mt-6"
          size="lg"
        >
          {isAnalyzing ? (
            <>
              <span className="material-symbols-outlined animate-spin mr-2">
                progress_activity
              </span>
              Analyzing form with Gemini Vision...
            </>
          ) : (
            <>
              <span className="material-symbols-outlined mr-2">video_camera_front</span>
              Analyze Workout Form
            </>
          )}
        </Button>
      </Card>

      {/* Analysis Results */}
      <AnimatePresence>
        {analysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Overall Score Card */}
            <Card className="p-6 bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-2xl">
                      fitness_center
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{analysis.exercise}</h3>
                    <p className="text-sm text-white/60">
                      AI Form Analysis • {analysis.confidence}% confident
                    </p>
                  </div>
                </div>

                {/* Overall Score */}
                <div className="text-center">
                  <div className={`text-5xl font-bold ${getScoreColor(analysis.overallScore)}`}>
                    {analysis.overallScore}
                  </div>
                  <div className="text-sm text-white/60">Overall Score</div>
                </div>
              </div>

              {/* Aspect Scores Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(analysis.aspects).map(([key, aspect]) => (
                  <div
                    key={key}
                    className={`p-4 rounded-lg border ${getScoreBgColor(aspect.score)}`}
                  >
                    <div className="text-xs text-white/60 mb-1 capitalize">
                      {key.replace('_', ' ')}
                    </div>
                    <div className={`text-2xl font-bold ${getScoreColor(aspect.score)}`}>
                      {aspect.score}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Injury Risks Alert */}
            {analysis.injury_risks.length > 0 && (
              <Card className="p-6 bg-red-500/5 border-red-500/20">
                <div className="flex items-start gap-3 mb-4">
                  <span className="material-symbols-outlined text-red-500 text-2xl">
                    warning
                  </span>
                  <div>
                    <h4 className="font-semibold text-red-500 mb-1">Injury Risk Detected</h4>
                    <p className="text-sm text-white/80">
                      Please address these issues to prevent potential injuries
                    </p>
                  </div>
                </div>
                <ul className="space-y-2">
                  {analysis.injury_risks.map((risk, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-white/90">
                      <span className="material-symbols-outlined text-red-500 text-lg mt-0.5">
                        error
                      </span>
                      <span>{risk}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {/* Form Corrections */}
            <Card className="p-6">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-yellow-500">build</span>
                Form Corrections Needed
              </h4>
              <div className="space-y-3">
                {analysis.corrections.map((correction, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20"
                  >
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-yellow-500 text-xl">
                        edit
                      </span>
                      <p className="text-white/90">{correction}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>

            {/* Detailed Feedback */}
            <Card className="p-6">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-500">feedback</span>
                Detailed Feedback by Aspect
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(analysis.aspects).map(([key, aspect]) => (
                  <div key={key} className="p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-semibold capitalize">{key.replace('_', ' ')}</div>
                      <div className={`text-lg font-bold ${getScoreColor(aspect.score)}`}>
                        {aspect.score}/100
                      </div>
                    </div>
                    <p className="text-sm text-white/70">{aspect.feedback}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* AI Recommendations */}
            <Card className="p-6 bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/20">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-purple-500">lightbulb</span>
                AI Recommendations
              </h4>
              <div className="space-y-3">
                {analysis.recommendations.map((rec, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/20"
                  >
                    <p className="text-white/90">{rec}</p>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
