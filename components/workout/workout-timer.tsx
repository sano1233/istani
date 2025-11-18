'use client';

import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Exercise {
  name: string;
  duration: number; // in seconds
  rest: number; // in seconds
  sets?: number;
}

interface WorkoutTimerProps {
  exercises?: Exercise[];
  onComplete?: () => void;
}

export function WorkoutTimer({ exercises: initialExercises, onComplete }: WorkoutTimerProps) {
  const [exercises] = useState<Exercise[]>(
    initialExercises || [
      { name: 'Push-ups', duration: 30, rest: 15, sets: 3 },
      { name: 'Squats', duration: 45, rest: 20, sets: 3 },
      { name: 'Plank', duration: 60, rest: 30, sets: 2 },
      { name: 'Burpees', duration: 30, rest: 20, sets: 3 },
    ],
  );

  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [totalTime, setTotalTime] = useState(0);
  const [workoutComplete, setWorkoutComplete] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Create audio element for beeps
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isRunning && !isPaused) {
      intervalRef.current = setInterval(() => {
        setTotalTime((t) => t + 1);
        setTimeRemaining((time) => {
          if (time <= 1) {
            handleIntervalComplete();
            return 0;
          }
          if (time <= 3) {
            playBeep();
          }
          return time - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isPaused, currentExerciseIndex, currentSet, isResting]);

  const startWorkout = () => {
    const exercise = exercises[0];
    setCurrentExerciseIndex(0);
    setCurrentSet(1);
    setTimeRemaining(exercise.duration);
    setIsResting(false);
    setIsRunning(true);
    setIsPaused(false);
    setTotalTime(0);
    setWorkoutComplete(false);
  };

  const pauseWorkout = () => {
    setIsPaused(true);
  };

  const resumeWorkout = () => {
    setIsPaused(false);
  };

  const skipExercise = () => {
    handleIntervalComplete();
  };

  const handleIntervalComplete = () => {
    const currentExercise = exercises[currentExerciseIndex];

    if (isResting) {
      // Rest period done, start next set or next exercise
      if (currentSet < (currentExercise.sets || 1)) {
        setCurrentSet(currentSet + 1);
        setTimeRemaining(currentExercise.duration);
        setIsResting(false);
      } else {
        // Move to next exercise
        if (currentExerciseIndex < exercises.length - 1) {
          setCurrentExerciseIndex(currentExerciseIndex + 1);
          setCurrentSet(1);
          setTimeRemaining(exercises[currentExerciseIndex + 1].duration);
          setIsResting(false);
        } else {
          // Workout complete!
          completeWorkout();
        }
      }
    } else {
      // Exercise done, start rest period
      setTimeRemaining(currentExercise.rest);
      setIsResting(true);
    }
  };

  const completeWorkout = () => {
    setIsRunning(false);
    setWorkoutComplete(true);
    if (onComplete) {
      onComplete();
    }
  };

  const resetWorkout = () => {
    setIsRunning(false);
    setIsPaused(false);
    setCurrentExerciseIndex(0);
    setCurrentSet(1);
    setTimeRemaining(0);
    setIsResting(false);
    setTotalTime(0);
    setWorkoutComplete(false);
  };

  const playBeep = () => {
    // Simple beep using Web Audio API
    if (typeof window !== 'undefined') {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentExercise = exercises[currentExerciseIndex];
  const progress = currentExercise
    ? isResting
      ? ((currentExercise.rest - timeRemaining) / currentExercise.rest) * 100
      : ((currentExercise.duration - timeRemaining) / currentExercise.duration) * 100
    : 0;

  if (workoutComplete) {
    return (
      <Card className="p-12">
        <div className="text-center">
          <div className="text-8xl mb-6">🎉</div>
          <h2 className="text-4xl font-bold text-white mb-4">Workout Complete!</h2>
          <p className="text-2xl text-white/60 mb-2">Total Time: {formatTime(totalTime)}</p>
          <p className="text-lg text-white/60 mb-8">
            {exercises.reduce((sum, e) => sum + (e.sets || 1), 0)} exercises completed
          </p>
          <div className="flex gap-4 justify-center">
            <Button onClick={resetWorkout}>Start New Workout</Button>
            <Button variant="outline" onClick={() => setWorkoutComplete(false)}>
              View Summary
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  if (!isRunning) {
    return (
      <Card className="p-8">
        <h2 className="text-3xl font-bold text-white mb-6">Workout Timer</h2>

        <div className="space-y-4 mb-8">
          {exercises.map((exercise, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-white/5 rounded-lg"
            >
              <div>
                <p className="text-white font-semibold">{exercise.name}</p>
                <p className="text-white/60 text-sm">
                  {exercise.sets} sets × {exercise.duration}s work / {exercise.rest}s rest
                </p>
              </div>
              <span className="material-symbols-outlined text-white/40">fitness_center</span>
            </div>
          ))}
        </div>

        <div className="flex gap-4">
          <Button onClick={startWorkout} className="flex-1">
            <span className="material-symbols-outlined mr-2">play_arrow</span>
            Start Workout
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Timer Display */}
      <Card className="p-8">
        <div className="text-center mb-8">
          <p className="text-white/60 text-sm mb-2">
            Exercise {currentExerciseIndex + 1} of {exercises.length}
          </p>
          <h2 className="text-4xl font-bold text-white mb-2">{currentExercise.name}</h2>
          <p className="text-xl text-white/60">
            Set {currentSet} of {currentExercise.sets || 1}
          </p>
        </div>

        {/* Circular Timer */}
        <div className="relative w-64 h-64 mx-auto mb-8">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="10"
            />

            {/* Progress circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke={isResting ? '#f59e0b' : '#00ffff'}
              strokeWidth="10"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-linear"
            />
          </svg>

          {/* Time Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className={`text-6xl font-bold ${isResting ? 'text-yellow-500' : 'text-primary'}`}>
              {formatTime(timeRemaining)}
            </p>
            <p className="text-white/60 text-lg mt-2">{isResting ? 'REST' : 'WORK'}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="w-full bg-white/10 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${isResting ? 'bg-yellow-500' : 'bg-primary'}`}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-4 justify-center">
          {isPaused ? (
            <Button onClick={resumeWorkout} size="lg">
              <span className="material-symbols-outlined mr-2">play_arrow</span>
              Resume
            </Button>
          ) : (
            <Button onClick={pauseWorkout} size="lg" variant="outline">
              <span className="material-symbols-outlined mr-2">pause</span>
              Pause
            </Button>
          )}

          <Button onClick={skipExercise} size="lg" variant="outline">
            <span className="material-symbols-outlined mr-2">skip_next</span>
            Skip
          </Button>

          <Button onClick={resetWorkout} size="lg" variant="outline">
            <span className="material-symbols-outlined mr-2">stop</span>
            Stop
          </Button>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-white">{formatTime(totalTime)}</p>
          <p className="text-white/60 text-sm">Total Time</p>
        </Card>

        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-white">
            {currentExerciseIndex + 1}/{exercises.length}
          </p>
          <p className="text-white/60 text-sm">Exercises</p>
        </Card>

        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-white">
            {currentSet}/{currentExercise.sets || 1}
          </p>
          <p className="text-white/60 text-sm">Sets</p>
        </Card>
      </div>

      {/* Next Exercise Preview */}
      {currentExerciseIndex < exercises.length - 1 && (
        <Card className="p-4">
          <p className="text-white/60 text-sm mb-2">Up Next:</p>
          <p className="text-white font-semibold">{exercises[currentExerciseIndex + 1].name}</p>
        </Card>
      )}
    </div>
  );
}
