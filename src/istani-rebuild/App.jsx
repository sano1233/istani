import React, { useState, useEffect, useCallback } from 'react';
import {
  Play,
  Pause,
  Check,
  ChevronRight,
  Award,
  Target,
  Brain,
  Moon,
  Zap,
  BookOpen,
  Timer,
  X,
  Download,
  ExternalLink,
  RotateCcw,
  Coffee,
  TrendingUp,
  Calendar,
  Clock
} from 'lucide-react';
import { useSafeLocalStorage } from './hooks/useSafeLocalStorage';

const IstaniCompleteProduct = () => {
  const [currentDay, setCurrentDay] = useSafeLocalStorage('istani_current_day', 1);
  const [completedDays, setCompletedDays] = useSafeLocalStorage(
    'istani_completed_days',
    () => []
  );
  const [notes, setNotes] = useSafeLocalStorage('istani_notes', () => ({}));
  const [showWelcome, setShowWelcome] = useSafeLocalStorage(
    'istani_welcome_seen',
    true
  );
  const [startDate, setStartDate] = useSafeLocalStorage(
    'istani_start_date',
    () => new Date().toISOString()
  );
  const [completionDates, setCompletionDates] = useSafeLocalStorage(
    'istani_completion_dates',
    () => ({})
  );

  const [activeTimer, setActiveTimer] = useState(null);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState('default');
  const [streak, setStreak] = useState(0);

  const calculateStreak = useCallback(() => {
    if (completedDays.length === 0) {
      setStreak(0);
      return;
    }

    const uniqueDays = new Set(completedDays);
    const latestDay = Math.max(...uniqueDays);
    let currentStreak = 1;
    let dayToCheck = latestDay - 1;

    while (uniqueDays.has(dayToCheck)) {
      currentStreak += 1;
      dayToCheck -= 1;
    }

    setStreak(currentStreak);
  }, [completedDays]);

  useEffect(() => {
    calculateStreak();
  }, [completedDays, calculateStreak]);

  useEffect(() => {
    let interval;
    if (timerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(prev => {
          if (prev <= 1) {
            setTimerRunning(false);
            sendNotification('Timer Complete!', 'Great work! Time to move to the next exercise.');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning, timerSeconds]);

  const isBrowser = typeof window !== 'undefined';
  const hasNotificationSupport = isBrowser && 'Notification' in window;

  useEffect(() => {
    if (hasNotificationSupport) {
      setNotificationPermission(Notification.permission);
    }
  }, [hasNotificationSupport]);

  useEffect(() => {
    calculateStreak();
  }, [calculateStreak]);

  const programData = React.useMemo(() => ({
    1: {
      title: 'Nervous System Reset',
      subtitle: 'Get Out of Fight or Flight',
      icon: Brain,
      description:
        "Stress destroys recovery. When your nervous system is stuck in overdrive, your muscles can't grow and your body holds onto fat, not muscle. Today you're rewiring your autonomic response.",
      color: 'from-red-600 to-red-700',
      tasks: [
        {
          name: '4-7-8 Breathing Technique (3 rounds)',
          duration: '9 min',
          timerSeconds: 540,
          instructions:
            'Inhale through nose for 4 counts, hold for 7, exhale through mouth for 8. Repeat 3 times. This activates your parasympathetic nervous system.'
        },
        {
          name: 'Neck Rolls',
          duration: '2 min',
          timerSeconds: 120,
          instructions: '10 slow rolls each direction. No forcing, just gentle mobility. Release tension stored in your neck and shoulders.'
        },
        {
          name: 'Cat-Cow Stretches',
          duration: '2 min',
          timerSeconds: 120,
          instructions: '10 reps. Arch back (cow), round spine (cat). Breathe with movement. Mobilize your spine and connect breath to motion.'
        },
        {
          name: 'Deep Squat Holds',
          duration: '3 min',
          timerSeconds: 180,
          instructions: 'Hold deep squat position for 30 seconds. Rest 30s. Repeat 3 times. Open your hips and decompress your spine.'
        }
      ],
      science: [
        {
          text: 'Chronic stress blocks muscle protein synthesis and increases cortisol-driven fat storage by disrupting mTOR signaling pathways',
          link: 'https://pubmed.ncbi.nlm.nih.gov/29469942'
        },
        {
          text: 'Controlled breathing activates parasympathetic nervous system, reducing cortisol by up to 25% and lowering heart rate variability',
          link: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5455070'
        }
      ],
      hormozi:
        "You don't have a motivation problem. You have a nervous system problem. Fix the wiring, everything else follows."
    },
    2: {
      title: 'Joint Strength Activation',
      subtitle: 'Before You Lift, You Reinforce',
      icon: Target,
      description:
        "Weak joints equal injury. Most beginner pain comes from poor connective tissue support. Today you're building the foundation that prevents the injuries that kill momentum.",
      color: 'from-orange-600 to-red-600',
      tasks: [
        {
          name: 'Wall Angels',
          duration: '5 min',
          timerSeconds: 300,
          instructions:
            '2 sets of 10 reps. Back flat against wall, arms at 90 degrees. Slide arms up and down slowly. This corrects rounded shoulders.'
        },
        {
          name: 'Glute Bridges',
          duration: '5 min',
          timerSeconds: 300,
          instructions: '2 sets of 10 reps. Squeeze glutes at top. Hold 2 seconds. Activate dormant glutes and protect your lower back.'
        },
        {
          name: 'Single-Leg Toe Taps',
          duration: '5 min',
          timerSeconds: 300,
          instructions: '2 sets of 10 each leg. Focus on stability, not speed. Build ankle and knee stability for injury prevention.'
        },
        {
          name: 'Resistance Band Work (Optional)',
          duration: '5 min',
          timerSeconds: 300,
          instructions: 'Add bands to any movement above for extra activation. Increases time under tension and proprioception.'
        }
      ],
      science: [
        {
          text: 'Joint stability and proprioceptive training prevents injury more effectively than raw strength training alone, reducing injury risk by 50%',
          link: 'https://pubmed.ncbi.nlm.nih.gov/25915182'
        },
        {
          text: 'Pre-activation of stabilizer muscles improves force production in compound movements by 12-18% through improved motor unit recruitment',
          link: 'https://www.health.harvard.edu/staying-healthy/the-importance-of-stretching'
        }
      ],
      hormozi: "The reason you quit isn't lack of willpower. It's because you got hurt. We're injury-proofing you first."
    },
    3: {
      title: 'Breathing Power + Core Priming',
      subtitle: 'Oxygen Is Your Hidden Superpower',
      icon: Zap,
      description:
        "Breath equals performance. Most beginners are oxygen-deficient during workouts and wonder why they're exhausted. Today you're unlocking your aerobic engine.",
      color: 'from-yellow-600 to-orange-600',
      tasks: [
        {
          name: 'Hollow Body Holds',
          duration: '6 min',
          timerSeconds: 360,
          instructions: '3 sets of 10 reps. Lie on back, press lower back down, lift shoulders and legs. Core stability is injury prevention.'
        },
        {
          name: 'Bird-Dogs',
          duration: '6 min',
          timerSeconds: 360,
          instructions: '3 sets of 10 reps. Extend opposite arm and leg. Hold 3 seconds per rep. Anti-rotation core strength.'
        },
        {
          name: 'Nasal-Only Breathing Walk',
          duration: '1 min',
          timerSeconds: 60,
          instructions:
            'Walk around. Breathe ONLY through your nose. Feel the CO2 tolerance build. This trains your respiratory system.'
        }
      ],
      science: [
        {
          text: 'VO₂ max is the single strongest predictor of all-cause mortality and correlates with fat oxidation capacity during exercise',
          link: 'https://pubmed.ncbi.nlm.nih.gov/29627963'
        },
        {
          text: 'Nasal breathing increases oxygen uptake by 10-15% through nitric oxide production and improves endurance performance',
          link: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8922923'
        }
      ],
      hormozi: "You're not out of shape. You're out of oxygen. Fix your breathing, watch your capacity explode."
    },
    4: {
      title: 'Muscle Reawakening',
      subtitle: 'Wake Up the Right Fibers',
      icon: Zap,
      description:
        "Skip the biceps. Start with your posterior chain—glutes, hamstrings, and back. These muscles drive every athletic movement and fix 90% of postural dysfunction.",
      color: 'from-green-600 to-emerald-600',
      tasks: [
        {
          name: 'Bodyweight Squats',
          duration: '3 min',
          timerSeconds: 180,
          instructions: '1-2 rounds of 8 reps. Full depth, chest up, knees out. Build foundational movement pattern.'
        },
        {
          name: 'Incline Push-Ups',
          duration: '3 min',
          timerSeconds: 180,
          instructions: '1-2 rounds of 10 reps. Hands elevated, elbows at 45 degrees. Scale push-ups properly.'
        },
        {
          name: 'Glute Bridge Hold',
          duration: '2 min',
          timerSeconds: 120,
          instructions: '1-2 rounds of 30 second holds. Maximum glute squeeze at top. Activate posterior chain.'
        },
        {
          name: 'Bent-Over Superman Rows',
          duration: '3 min',
          timerSeconds: 180,
          instructions: '1-2 rounds of 10 reps. Hinge at hips, pull shoulder blades together. Build upper back strength.'
        }
      ],
      science: [
        {
          text: 'Posterior chain training prevents muscle imbalances and reduces chronic lower back pain by 43% through improved load distribution',
          link: 'https://pubmed.ncbi.nlm.nih.gov/21558530'
        }
      ],
      hormozi: 'Everyone trains what they can see in the mirror. Winners train what makes them perform.'
    },
    5: {
      title: 'Sleep Rewire Protocol',
      subtitle: 'You Grow in the Dark',
      icon: Moon,
      description:
        "Your gains equal how well you sleep. Most beginners overtrain and under-recover. Sleep is where the magic happens—muscle growth, fat loss, cognitive recovery. Today you're optimizing the invisible 33% of your life.",
      color: 'from-blue-600 to-indigo-600',
      tasks: [
        {
          name: 'Screen Shutdown Protocol',
          duration: '60 min before bed',
          instructions:
            'All screens off 60 minutes before sleep. Blue light destroys melatonin production and delays sleep onset by 90 minutes.'
        },
        {
          name: 'Magnesium Glycinate (Optional)',
          duration: 'Before bed',
          instructions: "400mg. Helps GABA production and muscle relaxation. Glycinate form doesn't cause digestive issues."
        },
        {
          name: 'Mental Unload Journaling',
          duration: '10 min',
          timerSeconds: 600,
          instructions:
            'Brain dump everything on your mind. Get it out of your head and onto paper. This reduces rumination and improves sleep latency.'
        }
      ],
      science: [
        {
          text: 'Sleep deprivation reduces muscle protein synthesis by 18% and increases ghrelin (hunger hormone) while decreasing leptin (satiety)',
          link: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC2656292'
        }
      ],
      hormozi: "You can't out-train bad sleep. Period. Fix this, or nothing else matters."
    },
    6: {
      title: 'Mental Lock Removal',
      subtitle: 'Reframe Your Identity',
      icon: BookOpen,
      description:
        "Your mindset determines your consistency. Most people fail not because they don't know what to do, but because their self-image doesn't match their goals. Today you're reprogramming the operating system.",
      color: 'from-purple-600 to-pink-600',
      tasks: [
        {
          name: 'Write 3 Self-Doubts',
          duration: '5 min',
          timerSeconds: 300,
          instructions: "What stories are you telling yourself about why you can't succeed? Write them down raw and honest."
        },
        {
          name: 'Rewrite Into Identity Goals',
          duration: '5 min',
          timerSeconds: 300,
          instructions: "Transform 'I want to lose weight' into 'I am someone who trains 4x/week.' Change outcome to identity."
        },
        {
          name: 'Read Aloud Twice Daily',
          duration: '2 min',
          timerSeconds: 120,
          instructions: 'Morning and evening. Out loud. This is identity installation through repetition and vocalization.'
        }
      ],
      science: [
        {
          text: 'Identity-based goal setting increases adherence by 62% compared to outcome-based goals through self-perception theory',
          link: 'https://psycnet.apa.org/doi/10.1037/0022-3514.88.5.778'
        }
      ],
      hormozi:
        "You don't rise to your goals. You fall to your identity. Change who you are, results follow automatically."
    },
    7: {
      title: 'Full Body Reboot Circuit',
      subtitle: "It's Time to Build — Not Just Heal",
      icon: Award,
      description:
        "Your joints are stable. Your breath is powerful. Your mind is clear. Your nervous system is regulated. Now you're ready to actually build. This is where transformation begins.",
      color: 'from-red-600 to-pink-600',
      tasks: [
        {
          name: 'Bodyweight Squats',
          duration: '5 min',
          timerSeconds: 300,
          instructions: '2-3 rounds of 10 reps. Perfect form every rep. Quality over quantity always.'
        },
        {
          name: 'Incline Push-Ups',
          duration: '5 min',
          timerSeconds: 300,
          instructions: '2-3 rounds of 10 reps. Control the descent, explosive up. Build pressing strength properly.'
        },
        {
          name: 'Reverse Lunges',
          duration: '5 min',
          timerSeconds: 300,
          instructions: '2-3 rounds of 10 reps per leg. Step back, not forward. Easier on knees, better glute activation.'
        },
        {
          name: 'Plank Hold',
          duration: '3 min',
          timerSeconds: 180,
          instructions: '2-3 rounds of 30 second holds. Squeeze everything. Full-body tension creates stability.'
        },
        {
          name: 'Recovery Walk',
          duration: '1 min',
          timerSeconds: 60,
          instructions: 'Between rounds. Keep moving, shake it out. Active recovery improves performance.'
        }
      ],
      science: [],
      hormozi: 'You just proved something to yourself. You can follow through. That’s worth more than any workout.'
    }
  }), []);

  const currentDayData = programData[currentDay];
  const DayIcon = currentDayData.icon;
  const progress = (completedDays.length / 7) * 100;

  const sendNotification = (title, body) => {
    if (hasNotificationSupport && Notification.permission === 'granted') {
      try {
        new Notification(title, { body, icon: '/favicon.ico' });
      } catch (error) {
        console.error('Notification error:', error);
      }
    }
  };

  const requestNotificationPermission = async () => {
    if (hasNotificationSupport && Notification.permission === 'default') {
      try {
        const permission = await Notification.requestPermission();
        setNotificationPermission(permission);
      } catch (error) {
        console.error('Notification permission error:', error);
      }
    }
  };

  const toggleDayComplete = day => {
    const newCompleted = completedDays.includes(day)
      ? completedDays.filter(d => d !== day)
      : [...completedDays, day].sort((a, b) => a - b);

    setCompletedDays(newCompleted);

    if (!completedDays.includes(day)) {
      const newDates = { ...completionDates, [day]: new Date().toISOString() };
      setCompletionDates(newDates);

      if (day === 7) {
        setTimeout(() => setShowDonateModal(true), 1500);
      }
    }
  };

  const startTimer = task => {
    setActiveTimer(task.name);
    setTimerSeconds(task.timerSeconds || 0);
    setTimerRunning(true);

    if (notificationPermission === 'default') {
      requestNotificationPermission();
    }
  };

  const pauseTimer = () => {
    setTimerRunning(false);
  };

  const resetTimer = () => {
    setTimerRunning(false);
    setTimerSeconds(0);
    setActiveTimer(null);
  };

  const formatTime = seconds => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleWelcomeComplete = () => {
    try {
      setShowWelcome(false);
    } catch (error) {
      console.error('Error saving welcome status:', error);
      setShowWelcome(false);
    }
  };

  const exportProgress = () => {
    try {
      const data = {
        completedDays,
        notes,
        currentDay,
        startDate,
        completionDates,
        streak,
        exportDate: new Date().toISOString(),
        version: '1.0'
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `istani-progress-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
      alert('Error exporting progress. Please try again.');
    }
  };

  const calculateDaysInProgram = () => {
    try {
      const start = new Date(startDate);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    } catch (error) {
      return 0;
    }
  };

  const calculateCompletionRate = () => {
    const daysInProgram = calculateDaysInProgram();
    if (daysInProgram === 0) return 0;
    return Math.min(100, Math.round((completedDays.length / daysInProgram) * 100));
  };

  const resetProgress = () => {
    if (!isBrowser) {
      return;
    }

    if (window.confirm('Are you sure you want to reset ALL progress? This cannot be undone.')) {
      try {
        localStorage.removeItem('istani_current_day');
        localStorage.removeItem('istani_completed_days');
        localStorage.removeItem('istani_notes');
        localStorage.removeItem('istani_completion_dates');
        localStorage.removeItem('istani_start_date');
        localStorage.removeItem('istani_welcome_seen');
        setCurrentDay(1);
        setCompletedDays([]);
        setNotes({});
        setCompletionDates({});
        setStartDate(new Date().toISOString());
        setStreak(0);
        setShowWelcome(true);
      } catch (error) {
        console.error('Reset error:', error);
      }
    }
  };

  if (showWelcome) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-red-900 text-white overflow-x-hidden">
        <div className="max-w-4xl mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-screen">
          <div className="text-center space-y-8">
            <div className="space-y-2">
              <h1 className="text-7xl md:text-8xl font-black tracking-tighter text-red-500 animate-pulse">ISTANI</h1>
              <div className="h-1 w-32 bg-red-500 mx-auto" />
            </div>

            <div className="space-y-3">
              <h2 className="text-5xl md:text-6xl font-bold">The 7-Day Rebuild</h2>
              <p className="text-3xl md:text-4xl text-red-400 font-bold">Fix Your Body, Reset Your Mind</p>
            </div>

            <div className="space-y-6 max-w-2xl mt-12 text-left bg-gray-800/50 backdrop-blur-xl p-8 rounded-xl border border-red-500/20 shadow-2xl">
              <p className="text-xl text-gray-200 font-medium leading-relaxed">
                This isn't another workout plan. This is a complete system reset for people who've been stuck, spinning their wheels, wondering why nothing works.
              </p>

              <div className="bg-red-900/40 border-l-4 border-red-500 rounded-lg p-6 my-6">
                <p className="text-lg font-bold text-red-400 mb-3 uppercase tracking-wide">THE TRUTH:</p>
                <p className="text-gray-200 text-lg leading-relaxed">
                  You don't have a motivation problem. You don't have a discipline problem. You have a <span className="text-red-400 font-bold">systems</span> problem. Fix the system, everything else falls into place.
                </p>
              </div>

              <div className="space-y-4">
                <p className="text-sm font-bold text-red-400 uppercase tracking-wider">What You Actually Get:</p>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start gap-3">
                    <Check className="w-6 h-6 text-red-500 mt-1 flex-shrink-0" />
                    <span className="text-lg">Real working timers for every exercise (not just descriptions)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-6 h-6 text-red-500 mt-1 flex-shrink-0" />
                    <span className="text-lg">Progress tracking that actually saves (no more starting over)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-6 h-6 text-red-500 mt-1 flex-shrink-0" />
                    <span className="text-lg">Direct links to peer-reviewed research (science, not broscience)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-6 h-6 text-red-500 mt-1 flex-shrink-0" />
                    <span className="text-lg">Personal notes that persist (build self-awareness)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-6 h-6 text-red-500 mt-1 flex-shrink-0" />
                    <span className="text-lg">7 days to rebuild your foundation from the ground up</span>
                  </li>
                </ul>
              </div>

              <div className="bg-yellow-900/30 border-l-4 border-yellow-500 rounded-lg p-6 mt-6">
                <p className="text-yellow-400 font-bold mb-2 text-lg">100% FREE. FOREVER.</p>
                <p className="text-gray-300">
                  No paywalls. No upsells. No credit card. If it changes your life, support the mission. Zero pressure. Zero guilt.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleWelcomeComplete}
              className="mt-12 bg-red-600 hover:bg-red-700 text-white font-bold py-5 px-16 rounded-xl text-2xl transition-all transform hover:scale-105 shadow-2xl border border-red-500"
            >
              START DAY 1 →
            </button>

            <p className="text-gray-500 text-sm mt-8">Your progress auto-saves. Come back anytime. No account required.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white">
      <div className="bg-black/50 backdrop-blur-xl border-b border-gray-800 sticky top-0 z-50 shadow-xl">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-black text-red-500">ISTANI</h1>
              <p className="text-sm text-gray-400">7-Day Rebuild Program</p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <button
                type="button"
                onClick={() => setShowStatsModal(true)}
                className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                title="View Stats"
              >
                <TrendingUp className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={exportProgress}
                className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                title="Export Progress"
              >
                <Download className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={() => setShowDonateModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg font-bold text-sm transition-colors"
              >
                <Coffee className="w-4 h-4" />
                SUPPORT
              </button>

              <div className="text-right">
                <div className="text-sm text-gray-400">Progress</div>
                <div className="text-2xl font-bold">{completedDays.length}/7</div>
                <div className="w-32 h-2 bg-gray-700 rounded-full mt-1 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-red-500 to-red-600 transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {streak >= 3 && (
          <div className="mb-6 bg-gradient-to-r from-orange-600 to-red-600 rounded-lg p-4 flex items-center gap-3 shadow-lg">
            <Award className="w-8 h-8 text-white" />
            <div>
              <div className="font-bold text-xl">{streak} Day Streak!</div>
              <div className="text-sm text-white/90">Don't break the chain. Keep going.</div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-6 sticky top-24 border border-gray-700 shadow-xl">
              <h3 className="text-xl font-bold mb-4">Program Days</h3>
              <div className="space-y-2">
                {[1, 2, 3, 4, 5, 6, 7].map(day => {
                  const dayData = programData[day];
                  const DayIconSmall = dayData.icon;
                  return (
                    <button
                      type="button"
                      key={day}
                      onClick={() => setCurrentDay(day)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                        currentDay === day
                          ? `bg-gradient-to-r ${dayData.color} text-white shadow-lg scale-105`
                          : 'bg-gray-700/50 hover:bg-gray-700'
                      }`}
                    >
                      <DayIconSmall className="w-5 h-5 flex-shrink-0" />
                      <div className="flex-1 text-left">
                        <div className="text-sm font-semibold">Day {day}</div>
                        <div className="text-xs opacity-80 truncate">{dayData.title}</div>
                      </div>
                      {completedDays.includes(day) && <Check className="w-5 h-5 text-green-400 flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className={`bg-gradient-to-r ${currentDayData.color} rounded-xl p-8 shadow-2xl border border-white/10`}>
              <div className="flex items-start gap-4">
                <DayIcon className="w-16 h-16 flex-shrink-0 drop-shadow-lg" />
                <div className="flex-1">
                  <div className="text-sm font-bold opacity-90 uppercase tracking-wider">DAY {currentDay} OF 7</div>
                  <h2 className="text-4xl font-black mt-1 drop-shadow-md">{currentDayData.title}</h2>
                  <p className="text-xl mt-2 font-semibold opacity-90">{currentDayData.subtitle}</p>
                </div>
              </div>
            </div>

            {currentDayData.hormozi && (
              <div className="bg-red-900/40 border-l-4 border-red-500 rounded-lg p-6 backdrop-blur-xl shadow-lg">
                <p className="text-lg font-semibold italic text-gray-100 leading-relaxed">"{currentDayData.hormozi}"</p>
              </div>
            )}

            <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-6 border border-gray-700 shadow-lg">
              <p className="text-lg text-gray-200 leading-relaxed">{currentDayData.description}</p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-6 border border-gray-700 shadow-lg">
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Target className="w-6 h-6 text-red-500" />
                What To Do Today:
              </h3>
              <div className="space-y-4">
                {currentDayData.tasks.map(task => (
                  <div key={task.name} className="bg-gray-700/50 rounded-lg p-4 border border-gray-600 hover:border-gray-500 transition-all">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1">
                        <div className="font-bold text-lg">{task.name}</div>
                        <div className="text-sm text-gray-400 mt-1 flex items-center gap-2">
                          <Clock className="w-3 h-3" />
                          {task.duration}
                        </div>
                      </div>
                      {task.timerSeconds && (
                        <div className="flex gap-2">
                          {activeTimer === task.name ? (
                            <>
                              <div className="bg-red-600 px-4 py-2 rounded-lg font-mono font-bold text-lg min-w-[80px] text-center">
                                {formatTime(timerSeconds)}
                              </div>
                              <button
                                type="button"
                                onClick={timerRunning ? pauseTimer : () => setTimerRunning(true)}
                                className="p-2 bg-gray-600 hover:bg-gray-500 rounded-lg transition-colors"
                                title={timerRunning ? 'Pause' : 'Resume'}
                              >
                                {timerRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                              </button>
                              <button
                                type="button"
                                onClick={resetTimer}
                                className="p-2 bg-gray-600 hover:bg-gray-500 rounded-lg transition-colors"
                                title="Reset Timer"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              onClick={() => startTimer(task)}
                              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors font-semibold shadow-lg"
                            >
                              <Timer className="w-4 h-4" />
                              Start
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                    {task.instructions && (
                      <div className="text-sm text-gray-300 mt-3 pl-3 border-l-2 border-red-500/50 leading-relaxed">{task.instructions}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {currentDayData.science.length > 0 && (
              <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-6 border border-gray-700 shadow-lg">
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <BookOpen className="w-6 h-6 text-red-500" />
                  The Science:
                </h3>
                <div className="space-y-4">
                  {currentDayData.science.map(item => (
                    <div key={item.link} className="flex items-start gap-3 bg-gray-700/30 p-4 rounded-lg hover:bg-gray-700/50 transition-all">
                      <BookOpen className="w-5 h-5 text-red-500 mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-gray-200 leading-relaxed">{item.text}</p>
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 mt-2 text-sm text-red-400 hover:text-red-300 underline font-semibold transition-colors"
                        >
                          View Research <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-6 border border-gray-700 shadow-lg">
              <h3 className="text-2xl font-bold mb-4">My Notes:</h3>
              <textarea
                value={notes[currentDay] || ''}
                onChange={event => setNotes({ ...notes, [currentDay]: event.target.value })}
                placeholder="How did today feel? What did you notice? What will you do differently tomorrow?"
                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg p-4 text-white placeholder-gray-400 min-h-32 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
              />
              <p className="text-xs text-gray-500 mt-2">Auto-saved locally. Your notes never leave your device.</p>
            </div>

            <button
              type="button"
              onClick={() => toggleDayComplete(currentDay)}
              className={`w-full py-5 rounded-xl font-bold text-xl transition-all shadow-2xl border-2 ${
                completedDays.includes(currentDay)
                  ? 'bg-green-600 hover:bg-green-700 border-green-500'
                  : 'bg-red-600 hover:bg-red-700 border-red-500'
              }`}
            >
              {completedDays.includes(currentDay) ? (
                <span className="flex items-center justify-center gap-2">
                  <Check className="w-6 h-6" />
                  Day {currentDay} Complete
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Mark Day {currentDay} Complete
                  <ChevronRight className="w-6 h-6" />
                </span>
              )}
            </button>

            {currentDay < 7 && completedDays.includes(currentDay) && (
              <button
                type="button"
                onClick={() => setCurrentDay(currentDay + 1)}
                className="w-full py-4 bg-gray-700 hover:bg-gray-600 rounded-xl font-bold text-lg transition-all shadow-lg border border-gray-600"
              >
                Continue to Day {currentDay + 1} →
              </button>
            )}

            {currentDay === 7 && completedDays.includes(7) && (
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-8 text-center shadow-2xl border border-green-500">
                <Award className="w-20 h-20 mx-auto mb-4 animate-pulse" />
                <h3 className="text-4xl font-black mb-3">YOU DID IT</h3>
                <p className="text-xl font-semibold mb-4">7-Day Rebuild Complete</p>
                <p className="text-lg text-gray-100 mb-6 max-w-2xl mx-auto leading-relaxed">
                  Your foundation is set. Your nervous system is reset. Your joints are stable. Your mind is clear. You just proved to yourself that you can follow through.
                </p>
                <p className="text-2xl font-bold text-white">Now the real work begins.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showStatsModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-8 max-w-md w-full border border-gray-700 shadow-2xl">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-2xl font-bold">Your Stats</h3>
              <button
                type="button"
                onClick={() => setShowStatsModal(false)}
                className="p-1 hover:bg-gray-700 rounded transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Calendar className="w-5 h-5 text-red-500" />
                  <span className="text-sm text-gray-400">Days in Program</span>
                </div>
                <div className="text-3xl font-bold">{calculateDaysInProgram()}</div>
              </div>

              <div className="bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Award className="w-5 h-5 text-red-500" />
                  <span className="text-sm text-gray-400">Current Streak</span>
                </div>
                <div className="text-3xl font-bold">{streak} days</div>
              </div>

              <div className="bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="w-5 h-5 text-red-500" />
                  <span className="text-sm text-gray-400">Completion Rate</span>
                </div>
                <div className="text-3xl font-bold">{calculateCompletionRate()}%</div>
              </div>

              <div className="bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Check className="w-5 h-5 text-red-500" />
                  <span className="text-sm text-gray-400">Days Completed</span>
                </div>
                <div className="text-3xl font-bold">{completedDays.length}/7</div>
              </div>

              <button
                type="button"
                onClick={resetProgress}
                className="w-full py-3 bg-red-900/50 hover:bg-red-900/70 border border-red-500 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Reset All Progress
              </button>
            </div>
          </div>
        </div>
      )}

      {showDonateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-8 max-w-md w-full border border-gray-700 shadow-2xl">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-2xl font-bold">Support ISTANI</h3>
              <button
                type="button"
                onClick={() => setShowDonateModal(false)}
                className="p-1 hover:bg-gray-700 rounded transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-gray-300 leading-relaxed">
                This product is <span className="text-red-400 font-bold">100% free</span>. No paywalls. No upsells. No manipulation.
              </p>

              <div className="bg-yellow-900/30 border-l-4 border-yellow-500 rounded-lg p-4">
                <p className="text-yellow-400 font-bold mb-2">Pay What It's Worth</p>
                <p className="text-sm text-gray-300 leading-relaxed">
                  If this program changed your life, helped you break through, or gave you clarity, help us build more tools that actually work. Every dollar goes directly into building better systems.
                </p>
              </div>

              <div className="bg-gray-700/50 rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-2">Your support enables:</p>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• More free programs</li>
                  <li>• Video demonstrations</li>
                  <li>• Mobile app development</li>
                  <li>• Zero ads, forever</li>
                </ul>
              </div>

              <a
                href="https://buymeacoffee.com/istanifitn"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full py-4 bg-yellow-600 hover:bg-yellow-700 text-center rounded-lg font-bold text-lg transition-colors shadow-lg flex items-center justify-center gap-2"
              >
                <Coffee className="w-5 h-5" />
                Support on Buy Me A Coffee
              </a>

              <button
                type="button"
                onClick={() => setShowDonateModal(false)}
                className="w-full py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition-colors"
              >
                Maybe Later
              </button>

              <p className="text-xs text-gray-500 text-center">Donation is 100% optional. The program stays free regardless.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IstaniCompleteProduct;
