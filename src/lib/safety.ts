// Basic fitness-domain safety checks and content hardening

const DANGEROUS_PATTERNS: RegExp[] = [
  /steroid/i,
  /anabolic/i,
  /sar[mn]/i,
  /no\s*rest\s*days/i,
  /max\s*out\s*every\s*set/i,
  /starv(e|ation)/i,
  /dry\s*fast(ing)?\s*\d{2,}/i, // long dry fasting
  /no\s*water/i,
  /illegal/i,
  /self\s*-?harm/i,
];

// Clamp extreme reps/sets recommendations
function clampVolume(text: string): string {
  return text.replace(/(\d{2,})\s*(sets|reps)/gi, (m, n, unit) => {
    const val = parseInt(n, 10);
    const max = unit.toLowerCase().startsWith('sets') ? 8 : 30;
    return `${Math.min(val, max)} ${unit}`;
  });
}

// Ensure a minimum daily calorie suggestion if present
function enforceMinCalories(text: string): string {
  return text.replace(/(\d{2,5})\s*(k?cal|calories)/gi, (m, n, unit) => {
    const val = parseInt(n, 10);
    const min = 1200; // conservative lower bound
    if (val < min) return `${min} ${unit}`;
    return m;
  });
}

export function safetyFilter(planText: string, planType: 'workout' | 'meal'): { safeText: string; flagged: boolean; reasons: string[] } {
  const reasons: string[] = [];
  let safe = planText || '';

  for (const r of DANGEROUS_PATTERNS) {
    if (r.test(safe)) reasons.push(`Matched pattern: ${r}`);
  }

  // Redact dangerous mentions
  safe = safe.replace(/steroid[s]?|anabolic|sarm[s]?/gi, '[unsafe-substance]');

  if (planType === 'workout') {
    safe = clampVolume(safe);
  } else {
    safe = enforceMinCalories(safe);
  }

  // Append a medical disclaimer
  const disclaimer = `\n\nDisclaimer: This AI-generated plan is for educational purposes and is not medical advice. Consult a qualified professional before starting any program, especially if you have existing conditions.`;
  if (!safe.toLowerCase().includes('disclaimer')) {
    safe += disclaimer;
  }

  return { safeText: safe, flagged: reasons.length > 0, reasons };
}

