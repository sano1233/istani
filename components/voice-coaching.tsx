'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface VoiceMessage {
  id: string;
  text: string;
  type: 'instruction' | 'motivation' | 'correction' | 'rest';
  timestamp: Date;
}

interface WorkoutSession {
  exercise: string;
  sets: number;
  reps: number;
  currentSet: number;
  currentRep: number;
  isResting: boolean;
  restTime: number;
}

export function VoiceCoaching() {
  const [isActive, setIsActive] = useState(false);
  const [messages, setMessages] = useState<VoiceMessage[]>([]);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<string>('motivational');
  const [session, setSession] = useState<WorkoutSession>({
    exercise: 'Squats',
    sets: 3,
    reps: 10,
    currentSet: 1,
    currentRep: 0,
    isResting: false,
    restTime: 60,
  });

  const audioQueueRef = useRef<VoiceMessage[]>([]);
  const isPlayingRef = useRef(false);

  const voices = [
    { id: 'motivational', name: 'Motivational Coach', description: 'Energetic and encouraging' },
    { id: 'calm', name: 'Calm Instructor', description: 'Soothing and focused' },
    { id: 'professional', name: 'Professional Trainer', description: 'Direct and technical' },
  ];

  const generateVoiceGuidance = async (text: string, type: VoiceMessage['type']) => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/ai/voice-coaching', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          voiceType: selectedVoice,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate voice guidance');
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      const message: VoiceMessage = {
        id: Math.random().toString(36),
        text,
        type,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, message]);
      audioQueueRef.current.push(message);

      // Play audio
      if (!isPlayingRef.current) {
        playNextAudio(audio);
      }
    } catch (error) {
      console.error('Voice generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const playNextAudio = async (audio: HTMLAudioElement) => {
    isPlayingRef.current = true;
    setCurrentAudio(audio);

    audio.onended = () => {
      URL.revokeObjectURL(audio.src);
      audioQueueRef.current.shift();

      if (audioQueueRef.current.length > 0) {
        // Play next in queue
        const nextMessage = audioQueueRef.current[0];
        generateVoiceGuidance(nextMessage.text, nextMessage.type);
      } else {
        isPlayingRef.current = false;
        setCurrentAudio(null);
      }
    };

    await audio.play();
  };

  const startWorkout = () => {
    setIsActive(true);
    generateVoiceGuidance(
      `Let's get started! We'll be doing ${session.sets} sets of ${session.reps} ${session.exercise}. Focus on your form and breathing. Ready? Let's go!`,
      'instruction'
    );

    // Start first set
    setTimeout(() => {
      generateVoiceGuidance(`Set 1, begin! ${session.reps} reps, you've got this!`, 'instruction');
    }, 3000);
  };

  const nextRep = () => {
    const newRep = session.currentRep + 1;

    if (newRep <= session.reps) {
      setSession({ ...session, currentRep: newRep });

      // Provide encouraging feedback every few reps
      if (newRep === Math.floor(session.reps / 2)) {
        generateVoiceGuidance(`Halfway there! Keep your form tight!`, 'motivation');
      } else if (newRep === session.reps - 2) {
        generateVoiceGuidance(`Last 2 reps! Push through!`, 'motivation');
      } else if (newRep === session.reps) {
        generateVoiceGuidance(`And rest! Great set!`, 'instruction');
        startRest();
      }
    }
  };

  const startRest = () => {
    const newSet = session.currentSet + 1;

    if (newSet <= session.sets) {
      setSession({
        ...session,
        currentSet: newSet,
        currentRep: 0,
        isResting: true,
      });

      generateVoiceGuidance(
        `Take ${session.restTime} seconds rest. Breathe deeply and prepare for the next set.`,
        'rest'
      );

      // End rest period
      setTimeout(() => {
        setSession((prev) => ({ ...prev, isResting: false }));
        generateVoiceGuidance(
          `Set ${newSet}, let's go! Remember to maintain proper form.`,
          'instruction'
        );
      }, session.restTime * 1000);
    } else {
      // Workout complete
      setIsActive(false);
      generateVoiceGuidance(
        `Workout complete! Excellent work today. You finished all ${session.sets} sets. Great job on maintaining consistency!`,
        'motivation'
      );
    }
  };

  const provideFormCorrection = (correction: string) => {
    generateVoiceGuidance(correction, 'correction');
  };

  const stopWorkout = () => {
    setIsActive(false);
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }
    audioQueueRef.current = [];
    isPlayingRef.current = false;
    generateVoiceGuidance(
      'Workout paused. Take a moment to rest, and we can continue when you\'re ready.',
      'instruction'
    );
  };

  return (
    <div className="space-y-6">
      {/* Voice Settings Card */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined">record_voice_over</span>
          AI Voice Coaching
        </h2>
        <p className="text-white/60 mb-6">
          Get real-time audio guidance during your workouts with ElevenLabs AI voice
        </p>

        {/* Voice Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-3">Select Voice Type</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {voices.map((voice) => (
              <button
                key={voice.id}
                onClick={() => setSelectedVoice(voice.id)}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  selectedVoice === voice.id
                    ? 'border-primary bg-primary/10'
                    : 'border-white/10 bg-white/5 hover:border-white/20'
                }`}
              >
                <div className="font-semibold mb-1">{voice.name}</div>
                <div className="text-sm text-white/60">{voice.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Workout Configuration */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">Exercise</label>
            <input
              type="text"
              value={session.exercise}
              onChange={(e) => setSession({ ...session, exercise: e.target.value })}
              disabled={isActive}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-primary focus:outline-none disabled:opacity-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Sets</label>
            <input
              type="number"
              value={session.sets}
              onChange={(e) => setSession({ ...session, sets: parseInt(e.target.value) })}
              disabled={isActive}
              min="1"
              max="10"
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-primary focus:outline-none disabled:opacity-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Reps</label>
            <input
              type="number"
              value={session.reps}
              onChange={(e) => setSession({ ...session, reps: parseInt(e.target.value) })}
              disabled={isActive}
              min="1"
              max="50"
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-primary focus:outline-none disabled:opacity-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Rest (sec)</label>
            <input
              type="number"
              value={session.restTime}
              onChange={(e) => setSession({ ...session, restTime: parseInt(e.target.value) })}
              disabled={isActive}
              min="30"
              max="180"
              step="15"
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-primary focus:outline-none disabled:opacity-50"
            />
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex gap-3">
          {!isActive ? (
            <Button
              onClick={startWorkout}
              size="lg"
              className="flex-1"
              disabled={isGenerating}
            >
              <span className="material-symbols-outlined mr-2">play_arrow</span>
              Start Workout with Voice Coaching
            </Button>
          ) : (
            <>
              <Button
                onClick={nextRep}
                size="lg"
                className="flex-1"
                disabled={session.isResting}
              >
                <span className="material-symbols-outlined mr-2">add</span>
                Complete Rep ({session.currentRep}/{session.reps})
              </Button>
              <Button
                onClick={stopWorkout}
                size="lg"
                variant="outline"
              >
                <span className="material-symbols-outlined mr-2">stop</span>
                Stop
              </Button>
            </>
          )}
        </div>
      </Card>

      {/* Current Status */}
      {isActive && (
        <Card className="p-6 bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold">{session.exercise}</h3>
              <p className="text-white/60">
                Set {session.currentSet} of {session.sets}
              </p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-primary">
                {session.currentRep}/{session.reps}
              </div>
              <div className="text-sm text-white/60">Reps completed</div>
            </div>
          </div>

          {session.isResting && (
            <div className="flex items-center gap-2 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
              <span className="material-symbols-outlined text-yellow-500">timer</span>
              <span className="text-yellow-500 font-medium">
                Resting for {session.restTime} seconds
              </span>
            </div>
          )}

          {/* Quick Correction Buttons */}
          <div className="mt-4 pt-4 border-t border-white/10">
            <p className="text-sm text-white/60 mb-2">Quick Form Corrections:</p>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => provideFormCorrection('Keep your back straight and core engaged')}
              >
                Back Posture
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => provideFormCorrection('Go deeper, aim for full range of motion')}
              >
                Range of Motion
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => provideFormCorrection('Slow down your tempo, control the movement')}
              >
                Tempo
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => provideFormCorrection('Great work! Keep that form perfect!')}
              >
                Encouragement
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Voice Message History */}
      {messages.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined">history</span>
            Voice Guidance History
          </h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {messages.map((message, idx) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`p-3 rounded-lg border ${
                  message.type === 'motivation'
                    ? 'bg-green-500/10 border-green-500/20'
                    : message.type === 'correction'
                      ? 'bg-yellow-500/10 border-yellow-500/20'
                      : message.type === 'rest'
                        ? 'bg-blue-500/10 border-blue-500/20'
                        : 'bg-white/5 border-white/10'
                }`}
              >
                <div className="flex items-start gap-2">
                  <span
                    className={`material-symbols-outlined text-lg ${
                      message.type === 'motivation'
                        ? 'text-green-500'
                        : message.type === 'correction'
                          ? 'text-yellow-500'
                          : message.type === 'rest'
                            ? 'text-blue-500'
                            : 'text-white/60'
                    }`}
                  >
                    {message.type === 'motivation'
                      ? 'sentiment_satisfied'
                      : message.type === 'correction'
                        ? 'build'
                        : message.type === 'rest'
                          ? 'timer'
                          : 'info'}
                  </span>
                  <div className="flex-1">
                    <p className="text-white/90">{message.text}</p>
                    <p className="text-xs text-white/40 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
