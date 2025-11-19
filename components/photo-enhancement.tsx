'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface PhotoAnalysis {
  bodyComposition: {
    estimatedBodyFat: number;
    muscleMass: string;
    posture: string;
    confidence: number;
  };
  comparison?: {
    weightChange: string;
    muscleGain: string;
    fatLoss: string;
    improvements: string[];
  };
  recommendations: string[];
}

export function PhotoEnhancement() {
  const [currentPhoto, setCurrentPhoto] = useState<string | null>(null);
  const [previousPhoto, setPreviousPhoto] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<PhotoAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [mode, setMode] = useState<'single' | 'comparison'>('single');

  const currentInputRef = useRef<HTMLInputElement>(null);
  const previousInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = async (file: File, type: 'current' | 'previous') => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      if (type === 'current') {
        setCurrentPhoto(base64);
      } else {
        setPreviousPhoto(base64);
      }
    };
    reader.readAsDataURL(file);
  };

  const analyzePhotos = async () => {
    if (!currentPhoto) return;

    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/ai/analyze-progress-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPhoto,
          previousPhoto: mode === 'comparison' ? previousPhoto : null,
          analysisType: mode,
        }),
      });

      const data = await response.json();
      setAnalysis(data.analysis);
    } catch (error) {
      console.error('Photo analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Mode Selector */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Progress Photo Analysis</h2>
        <p className="text-white/60 mb-6">
          Upload photos for AI-powered body composition analysis and progress tracking
        </p>

        <div className="flex gap-3 mb-6">
          <Button
            onClick={() => setMode('single')}
            variant={mode === 'single' ? 'default' : 'outline'}
            className="flex-1"
          >
            <span className="material-symbols-outlined mr-2">photo_camera</span>
            Single Photo Analysis
          </Button>
          <Button
            onClick={() => setMode('comparison')}
            variant={mode === 'comparison' ? 'default' : 'outline'}
            className="flex-1"
          >
            <span className="material-symbols-outlined mr-2">compare</span>
            Before & After Comparison
          </Button>
        </div>

        {/* Photo Upload Area */}
        <div className={`grid gap-6 ${mode === 'comparison' ? 'md:grid-cols-2' : 'grid-cols-1'}`}>
          {/* Current Photo */}
          <div>
            <label className="block text-sm font-medium mb-2">
              {mode === 'comparison' ? 'Current Photo' : 'Upload Photo'}
            </label>
            <div
              onClick={() => currentInputRef.current?.click()}
              className="relative aspect-[3/4] rounded-2xl border-2 border-dashed border-white/20 hover:border-primary/50 transition-colors cursor-pointer overflow-hidden bg-white/5"
            >
              {currentPhoto ? (
                <img
                  src={currentPhoto}
                  alt="Current"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="material-symbols-outlined text-6xl text-white/40 mb-2">
                    add_photo_alternate
                  </span>
                  <p className="text-white/60">Click to upload photo</p>
                </div>
              )}
            </div>
            <input
              ref={currentInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) =>
                e.target.files?.[0] && handlePhotoUpload(e.target.files[0], 'current')
              }
            />
          </div>

          {/* Previous Photo (Comparison Mode) */}
          {mode === 'comparison' && (
            <div>
              <label className="block text-sm font-medium mb-2">Previous Photo</label>
              <div
                onClick={() => previousInputRef.current?.click()}
                className="relative aspect-[3/4] rounded-2xl border-2 border-dashed border-white/20 hover:border-primary/50 transition-colors cursor-pointer overflow-hidden bg-white/5"
              >
                {previousPhoto ? (
                  <img
                    src={previousPhoto}
                    alt="Previous"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="material-symbols-outlined text-6xl text-white/40 mb-2">
                      history
                    </span>
                    <p className="text-white/60">Upload before photo</p>
                  </div>
                )}
              </div>
              <input
                ref={previousInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) =>
                  e.target.files?.[0] && handlePhotoUpload(e.target.files[0], 'previous')
                }
              />
            </div>
          )}
        </div>

        {/* Analyze Button */}
        <Button
          onClick={analyzePhotos}
          disabled={!currentPhoto || (mode === 'comparison' && !previousPhoto) || isAnalyzing}
          className="w-full mt-6"
          size="lg"
        >
          {isAnalyzing ? (
            <>
              <span className="material-symbols-outlined animate-spin mr-2">
                progress_activity
              </span>
              Analyzing with Gemini Vision...
            </>
          ) : (
            <>
              <span className="material-symbols-outlined mr-2">psychology</span>
              Analyze {mode === 'comparison' ? 'Progress' : 'Photo'} with AI
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
          >
            <Card className="p-6 bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-2xl">
                    insights
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-bold">AI Analysis Results</h3>
                  <p className="text-sm text-white/60">
                    Powered by Gemini Vision • {analysis.bodyComposition.confidence}% confident
                  </p>
                </div>
              </div>

              {/* Body Composition */}
              <div className="mb-6">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-500">
                    monitoring
                  </span>
                  Body Composition Analysis
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-white/5 rounded-lg">
                    <div className="text-sm text-white/60 mb-1">Estimated Body Fat</div>
                    <div className="text-2xl font-bold">
                      {analysis.bodyComposition.estimatedBodyFat}%
                    </div>
                  </div>
                  <div className="p-4 bg-white/5 rounded-lg">
                    <div className="text-sm text-white/60 mb-1">Muscle Mass</div>
                    <div className="text-2xl font-bold">{analysis.bodyComposition.muscleMass}</div>
                  </div>
                  <div className="p-4 bg-white/5 rounded-lg">
                    <div className="text-sm text-white/60 mb-1">Posture</div>
                    <div className="text-2xl font-bold">{analysis.bodyComposition.posture}</div>
                  </div>
                </div>
              </div>

              {/* Comparison Results */}
              {analysis.comparison && (
                <div className="mb-6">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-green-500">
                      trending_up
                    </span>
                    Progress Comparison
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                      <div className="text-sm text-green-400 mb-1">Weight Change</div>
                      <div className="text-xl font-bold">{analysis.comparison.weightChange}</div>
                    </div>
                    <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                      <div className="text-sm text-blue-400 mb-1">Muscle Gain</div>
                      <div className="text-xl font-bold">{analysis.comparison.muscleGain}</div>
                    </div>
                    <div className="p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                      <div className="text-sm text-yellow-400 mb-1">Fat Loss</div>
                      <div className="text-xl font-bold">{analysis.comparison.fatLoss}</div>
                    </div>
                  </div>

                  {/* Improvements List */}
                  {analysis.comparison.improvements.length > 0 && (
                    <div className="mt-4 p-4 bg-white/5 rounded-lg">
                      <h5 className="font-semibold mb-2">Key Improvements:</h5>
                      <ul className="space-y-2">
                        {analysis.comparison.improvements.map((improvement, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="material-symbols-outlined text-primary text-lg mt-0.5">
                              check_circle
                            </span>
                            <span className="text-white/80">{improvement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Recommendations */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-purple-500">
                    lightbulb
                  </span>
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
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
