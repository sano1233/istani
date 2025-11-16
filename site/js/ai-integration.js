// Istani Fitness - AI Integration
// Secure AI model integration with OpenRouter and ElevenLabs

// Configuration
const AI_CONFIG = {
  openRouterBaseUrl: 'https://openrouter.ai/api/v1/chat/completions',
  elevenlabsBaseUrl: 'https://api.elevenlabs.io/v1',
  models: {
    primary: 'qwen/qwen-2.5-coder-32b-instruct',
    backup: 'mistralai/mistral-small-24b-instruct-2501',
    creative: 'nousresearch/hermes-3-llama-3.1-405b',
  },
};

// Fitness context for AI
const FITNESS_CONTEXT = `You are an expert AI fitness coach for Istani Fitness, a science-backed training platform.
Your knowledge includes:
- Exercise science and biomechanics
- Progressive overload principles
- Hypertrophy training (6-12 reps, 70-85% 1RM, 10-20 sets/muscle/week)
- Nutrition (protein: 1.6-2.2g/kg, nutrient timing, caloric balance)
- Periodization and training programming
- Injury prevention and recovery protocols

Provide evidence-based, actionable advice. Reference research when relevant. Be encouraging and supportive.
Keep responses concise (2-3 paragraphs) unless detailed programming is requested.`;

// Get AI response using OpenRouter
async function getAIResponse(userMessage) {
  try {
    // Try to call backend API first (for secure API key handling)
    const response = await fetch('/api/ai-chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: userMessage,
        context: FITNESS_CONTEXT,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return data.response;
    }

    // Fallback to demo response if backend not available
    return getDemoResponse(userMessage);
  } catch (error) {
    console.error('AI API error:', error);
    return getDemoResponse(userMessage);
  }
}

// Demo responses for when backend is not available
function getDemoResponse(message) {
  const lowerMessage = message.toLowerCase();

  // Workout plan requests
  if (
    lowerMessage.includes('workout') ||
    lowerMessage.includes('plan') ||
    lowerMessage.includes('program')
  ) {
    return `I'd love to create a personalized workout plan for you! To optimize your program, I need to know:

1. **Your goal**: Build muscle, lose fat, increase strength, or improve athletic performance?
2. **Experience level**: Beginner, intermediate, or advanced?
3. **Training frequency**: How many days per week can you train?
4. **Available equipment**: Full gym, home gym, or bodyweight only?

Once you share these details, I'll design a science-backed program using progressive overload principles and optimal training volume (10-20 sets per muscle group per week).`;
  }

  // Nutrition questions
  if (
    lowerMessage.includes('nutrition') ||
    lowerMessage.includes('diet') ||
    lowerMessage.includes('eat') ||
    lowerMessage.includes('protein')
  ) {
    return `Great question about nutrition! Here are evidence-based guidelines:

**Protein**: Aim for 1.6-2.2g per kg of bodyweight daily, distributed across 4-6 meals (0.4-0.55g/kg per meal) to maximize muscle protein synthesis.

**Nutrient Timing**: Consume protein + carbs within 2 hours post-workout. Pre-workout nutrition isn't critical if you've eaten in the past 3-4 hours.

**Caloric Balance**: For fat loss, maintain a 300-500 calorie deficit. For muscle gain, aim for a 200-300 calorie surplus. Track progress weekly and adjust.

Would you like me to help calculate your specific macros based on your goals and stats?`;
  }

  // Plateau questions
  if (
    lowerMessage.includes('plateau') ||
    lowerMessage.includes('stuck') ||
    lowerMessage.includes('progress')
  ) {
    return `Breaking through plateaus requires strategic manipulation of training variables:

**1. Volume**: Increase weekly sets by 10-20% if you're under 20 sets per muscle group
**2. Intensity**: Incorporate heavy (85-90% 1RM) and light (60-70% 1RM) training phases
**3. Exercise Variation**: Change exercises every 4-6 weeks to provide novel stimulus
**4. Deload**: Take a deload week (50% volume) every 4-6 weeks to super-compensate

Research shows varied training increases strength gains by 2-3% compared to monotonous programming. Which of these areas do you think might be limiting your progress?`;
  }

  // Form questions
  if (
    lowerMessage.includes('form') ||
    lowerMessage.includes('technique') ||
    lowerMessage.includes('bench') ||
    lowerMessage.includes('squat') ||
    lowerMessage.includes('deadlift')
  ) {
    return `Proper form is crucial for both safety and maximizing results! Here are key coaching cues:

**Bench Press**: Retract scapula, arch lower back slightly, feet flat on ground. Bar path should be diagonal (over shoulders at top, mid-chest at bottom). Elbows at 45-degree angle.

**Squat**: Hip-width stance, toes slightly out. Break at hips and knees simultaneously. Keep chest up, knees tracking over toes. Depth: hip crease below knee.

**Deadlift**: Bar over mid-foot, shoulders over bar. Engage lats (protect back), brace core. Drive through floor with legs, finish with hip extension (not lower back hyperextension).

For personalized form analysis, consider recording a video of your lift. I can provide specific corrections based on your movement patterns.`;
  }

  // Recovery questions
  if (
    lowerMessage.includes('recovery') ||
    lowerMessage.includes('rest') ||
    lowerMessage.includes('sleep') ||
    lowerMessage.includes('sore')
  ) {
    return `Recovery is when adaptation happens! Here's how to optimize it:

**Sleep**: 7-9 hours nightly. Muscle protein synthesis peaks 24-48 hours post-training during sleep. Growth hormone release is maximized in deep sleep stages.

**Active Recovery**: Light cardio (20-30 min at 50-60% max HR) increases blood flow and reduces DOMS by 30-40%.

**Nutrition**: Post-workout protein (20-40g) within 2 hours. Omega-3s (2-3g EPA/DHA daily) reduce inflammation.

**Rest Days**: Take 1-2 full rest days weekly. Muscle growth occurs during recovery, not training. Overtraining increases cortisol and inhibits gains.

How's your current sleep and recovery routine? That might be the key to unlocking better progress!`;
  }

  // Cardio questions
  if (
    lowerMessage.includes('cardio') ||
    lowerMessage.includes('running') ||
    lowerMessage.includes('hiit')
  ) {
    return `Strategic cardio supports your goals without compromising muscle growth:

**For Fat Loss**:
- HIIT: 15-20 min, 2-3x/week (30s work, 90s rest intervals)
- LISS: 30-45 min, 3-4x/week (60-70% max HR)
- Timing: Post-workout or separate from lifting (6+ hours apart)

**For Muscle Gain**:
- Minimal HIIT (interference effect reduces hypertrophy by 10-15%)
- LISS: 20-30 min, 2-3x/week for cardiovascular health
- Keep cardio volume low to preserve calories for recovery

Research shows cardio + resistance training yields best body composition results, but excessive cardio can impair muscle growth. What's your primary goal, and I'll optimize your cardio protocol?`;
  }

  // Supplements
  if (
    lowerMessage.includes('supplement') ||
    lowerMessage.includes('creatine') ||
    lowerMessage.includes('vitamin')
  ) {
    return `Evidence-based supplements that actually work:

**Tier 1 (Proven Effective)**:
- **Creatine Monohydrate**: 5g daily. Increases strength 5-15%, muscle mass 1-2kg. Most researched supplement.
- **Protein Powder**: Convenient way to hit protein targets. Whey isolate for fast absorption, casein for slow.
- **Caffeine**: 3-6mg/kg bodyweight pre-workout. Improves performance 3-5%.

**Tier 2 (Good Evidence)**:
- **Vitamin D**: 2000-5000 IU daily if deficient. Supports testosterone and immune function.
- **Omega-3s**: 2-3g EPA/DHA daily. Reduces inflammation, supports joint health.
- **Beta-Alanine**: 3-6g daily. Buffers lactic acid, improves high-rep performance.

Save your money on proprietary blends and "fat burners." Creatine + adequate protein covers 90% of supplementation benefits!`;
  }

  // Default response
  return `I'm here to help with your fitness journey! I can assist with:

• **Training Programs**: Personalized workout plans based on your goals and experience
• **Nutrition Guidance**: Macro calculations, meal timing, and dietary strategies
• **Form Checks**: Technique coaching for all major lifts
• **Progress Troubleshooting**: Breaking through plateaus and optimizing training variables
• **Recovery Protocols**: Sleep, rest days, and active recovery strategies

What specific aspect of fitness would you like to explore? Feel free to ask about workouts, nutrition, supplements, or any training-related topic!`;
}

// Initialize ElevenLabs voice agent (optional premium feature)
async function initializeElevenLabsAgent() {
  try {
    const response = await fetch('/api/elevenlabs/init', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log('ElevenLabs agent initialized:', data);
      return data;
    }
  } catch (error) {
    console.error('ElevenLabs initialization error:', error);
  }
  return null;
}

// Workout plan generator
async function generateWorkoutPlan(userProfile) {
  const { goal, experience, frequency, equipment } = userProfile;

  const prompt = `Create a detailed ${frequency}-day per week ${goal} workout program for a ${experience} lifter with ${equipment}.

Include:
- Exercise selection (compound movements prioritized)
- Sets, reps, and rest periods
- Progressive overload strategy
- Weekly volume (sets per muscle group)
- Periodization approach

Base recommendations on exercise science research for optimal results.`;

  return await getAIResponse(prompt);
}

// Nutrition calculator
function calculateMacros(bodyweight, goal, activityLevel) {
  // Bodyweight in kg
  const weight = bodyweight;

  // Base calorie needs (Mifflin-St Jeor x activity multiplier)
  const bmr = 10 * weight + 6.25 * 175 - 5 * 30; // Rough estimate
  const activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    veryActive: 1.9,
  };

  let tdee = bmr * (activityMultipliers[activityLevel] || 1.55);

  // Adjust based on goal
  let calories = tdee;
  if (goal === 'fat-loss') calories -= 500;
  if (goal === 'muscle-gain') calories += 300;

  // Calculate macros
  const protein = weight * 2.0; // 2g per kg
  const fat = weight * 1.0; // 1g per kg
  const proteinCals = protein * 4;
  const fatCals = fat * 9;
  const carbCals = calories - proteinCals - fatCals;
  const carbs = carbCals / 4;

  return {
    calories: Math.round(calories),
    protein: Math.round(protein),
    carbs: Math.round(carbs),
    fat: Math.round(fat),
  };
}

// Export functions for use in main app
window.aiIntegration = {
  getAIResponse,
  generateWorkoutPlan,
  calculateMacros,
  initializeElevenLabsAgent,
};

console.log('AI Integration loaded successfully');
