export interface NutritionPlan {
  id: string;
  name: string;
  description: string;
  goal: 'weight-loss' | 'muscle-gain' | 'maintenance' | 'performance';
  calorieTarget: string;
  macroRatios: {
    protein: number;
    carbs: number;
    fats: number;
  };
  meals: Meal[];
}

export interface Meal {
  id: string;
  name: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  description: string;
  ingredients: string[];
  instructions: string[];
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    fiber?: number;
  };
  prepTime: string;
  cookTime: string;
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  imageUrl?: string;
  tags: string[];
}

export const meals: Meal[] = [
  {
    id: 'protein-oatmeal',
    name: 'High-Protein Oatmeal',
    type: 'breakfast',
    description: 'A muscle-building breakfast packed with slow-digesting carbs and protein.',
    ingredients: [
      '1 cup rolled oats',
      '1 scoop vanilla protein powder',
      '1 banana, sliced',
      '2 tbsp almond butter',
      '1 tbsp chia seeds',
      '1 cup almond milk',
      'Cinnamon to taste',
      'Handful of berries'
    ],
    instructions: [
      'Cook oats according to package directions with almond milk',
      'Remove from heat and stir in protein powder',
      'Top with banana, almond butter, chia seeds, and berries',
      'Sprinkle with cinnamon',
      'Serve immediately'
    ],
    nutrition: {
      calories: 550,
      protein: 35,
      carbs: 65,
      fats: 18,
      fiber: 12
    },
    prepTime: '5 minutes',
    cookTime: '5 minutes',
    servings: 1,
    difficulty: 'easy',
    tags: ['high-protein', 'breakfast', 'muscle-building', 'vegetarian']
  },
  {
    id: 'chicken-rice-bowl',
    name: 'Grilled Chicken & Rice Bowl',
    type: 'lunch',
    description: 'A classic bodybuilding meal with lean protein and complex carbs.',
    ingredients: [
      '6 oz grilled chicken breast',
      '1 cup cooked brown rice',
      '1 cup broccoli, steamed',
      '1/2 avocado, sliced',
      '1 tbsp olive oil',
      'Salt, pepper, garlic powder',
      'Hot sauce (optional)'
    ],
    instructions: [
      'Season chicken with salt, pepper, and garlic powder',
      'Grill chicken until internal temp reaches 165°F',
      'Steam broccoli until tender-crisp',
      'Assemble bowl with rice, chicken, and broccoli',
      'Top with avocado and drizzle with olive oil',
      'Add hot sauce if desired'
    ],
    nutrition: {
      calories: 620,
      protein: 52,
      carbs: 55,
      fats: 20,
      fiber: 10
    },
    prepTime: '10 minutes',
    cookTime: '15 minutes',
    servings: 1,
    difficulty: 'easy',
    tags: ['high-protein', 'lunch', 'meal-prep', 'gluten-free']
  },
  {
    id: 'salmon-sweet-potato',
    name: 'Baked Salmon with Sweet Potato',
    type: 'dinner',
    description: 'Omega-3 rich salmon paired with nutrient-dense sweet potato.',
    ingredients: [
      '6 oz wild-caught salmon',
      '1 large sweet potato',
      '2 cups mixed greens',
      '1 tbsp coconut oil',
      'Lemon juice',
      'Fresh dill',
      'Salt and pepper',
      'Balsamic vinegar for salad'
    ],
    instructions: [
      'Preheat oven to 400°F',
      'Pierce sweet potato and bake for 45 minutes',
      'Season salmon with salt, pepper, and dill',
      'Bake salmon for 12-15 minutes until flaky',
      'Prepare salad with mixed greens and balsamic',
      'Serve salmon with sweet potato and salad'
    ],
    nutrition: {
      calories: 580,
      protein: 42,
      carbs: 48,
      fats: 22,
      fiber: 8
    },
    prepTime: '10 minutes',
    cookTime: '45 minutes',
    servings: 1,
    difficulty: 'easy',
    tags: ['high-protein', 'dinner', 'omega-3', 'paleo-friendly']
  },
  {
    id: 'greek-yogurt-parfait',
    name: 'Greek Yogurt Parfait',
    type: 'snack',
    description: 'A quick protein-packed snack perfect post-workout.',
    ingredients: [
      '1 cup Greek yogurt (plain, non-fat)',
      '1/4 cup granola',
      '1/2 cup mixed berries',
      '1 tbsp honey',
      '1 tbsp sliced almonds',
      'Dash of cinnamon'
    ],
    instructions: [
      'Layer Greek yogurt in a bowl or jar',
      'Add berries and granola',
      'Drizzle with honey',
      'Top with sliced almonds',
      'Sprinkle with cinnamon',
      'Enjoy immediately'
    ],
    nutrition: {
      calories: 320,
      protein: 25,
      carbs: 42,
      fats: 8,
      fiber: 4
    },
    prepTime: '3 minutes',
    cookTime: '0 minutes',
    servings: 1,
    difficulty: 'easy',
    tags: ['high-protein', 'snack', 'quick', 'vegetarian', 'post-workout']
  },
  {
    id: 'turkey-egg-scramble',
    name: 'Turkey & Veggie Egg Scramble',
    type: 'breakfast',
    description: 'A high-protein, low-carb breakfast perfect for fat loss.',
    ingredients: [
      '3 whole eggs',
      '2 egg whites',
      '4 oz ground turkey',
      '1 cup spinach',
      '1/2 bell pepper, diced',
      '1/4 onion, diced',
      '1 oz feta cheese',
      'Olive oil spray',
      'Salt, pepper, paprika'
    ],
    instructions: [
      'Cook ground turkey in a pan until browned',
      'Add onions and bell peppers, sauté until soft',
      'Add spinach and cook until wilted',
      'Beat eggs and egg whites together',
      'Pour eggs into pan and scramble',
      'Top with feta cheese',
      'Season with salt, pepper, and paprika'
    ],
    nutrition: {
      calories: 425,
      protein: 48,
      carbs: 12,
      fats: 20,
      fiber: 3
    },
    prepTime: '5 minutes',
    cookTime: '10 minutes',
    servings: 1,
    difficulty: 'easy',
    tags: ['high-protein', 'breakfast', 'low-carb', 'keto-friendly']
  },
  {
    id: 'quinoa-veggie-bowl',
    name: 'Quinoa Buddha Bowl',
    type: 'lunch',
    description: 'A plant-based powerhouse with complete protein and fiber.',
    ingredients: [
      '1 cup cooked quinoa',
      '1 can chickpeas, roasted',
      '1 cup kale, massaged',
      '1/2 cup shredded carrots',
      '1/4 cup hummus',
      '2 tbsp tahini dressing',
      '1/4 avocado',
      'Lemon juice',
      'Everything bagel seasoning'
    ],
    instructions: [
      'Cook quinoa according to package',
      'Roast chickpeas with olive oil and spices at 400°F for 25 min',
      'Massage kale with lemon juice',
      'Assemble bowl with quinoa as base',
      'Add kale, carrots, and chickpeas',
      'Top with hummus, avocado, and tahini',
      'Sprinkle with everything bagel seasoning'
    ],
    nutrition: {
      calories: 540,
      protein: 22,
      carbs: 68,
      fats: 22,
      fiber: 18
    },
    prepTime: '10 minutes',
    cookTime: '25 minutes',
    servings: 1,
    difficulty: 'medium',
    tags: ['vegan', 'lunch', 'high-fiber', 'plant-based']
  }
];

export const nutritionPlans: NutritionPlan[] = [
  {
    id: 'muscle-gain-plan',
    name: 'Muscle Building Plan',
    description: 'A calorie surplus plan optimized for lean muscle growth with emphasis on protein intake.',
    goal: 'muscle-gain',
    calorieTarget: '2800-3200 calories/day',
    macroRatios: {
      protein: 30, // 30%
      carbs: 45,   // 45%
      fats: 25     // 25%
    },
    meals: [
      meals[0], // Protein Oatmeal
      meals[3], // Greek Yogurt (snack)
      meals[1], // Chicken Rice Bowl
      meals[3], // Greek Yogurt (snack)
      meals[2], // Salmon Sweet Potato
    ]
  },
  {
    id: 'fat-loss-plan',
    name: 'Fat Loss Plan',
    description: 'A moderate calorie deficit with high protein to preserve muscle while losing fat.',
    goal: 'weight-loss',
    calorieTarget: '1800-2000 calories/day',
    macroRatios: {
      protein: 35, // 35%
      carbs: 35,   // 35%
      fats: 30     // 30%
    },
    meals: [
      meals[4], // Turkey Egg Scramble
      meals[3], // Greek Yogurt
      meals[5], // Quinoa Buddha Bowl
      meals[2], // Salmon Sweet Potato (smaller portion)
    ]
  },
  {
    id: 'maintenance-plan',
    name: 'Maintenance Plan',
    description: 'Balanced nutrition for maintaining current weight and supporting active lifestyle.',
    goal: 'maintenance',
    calorieTarget: '2200-2500 calories/day',
    macroRatios: {
      protein: 30, // 30%
      carbs: 40,   // 40%
      fats: 30     // 30%
    },
    meals: [
      meals[0], // Protein Oatmeal
      meals[1], // Chicken Rice Bowl
      meals[3], // Greek Yogurt
      meals[2], // Salmon Sweet Potato
    ]
  }
];

export const nutritionTips = [
  {
    id: 'meal-timing',
    title: 'Meal Timing Matters',
    content: 'While total daily intake is most important, timing can optimize performance. Eat carbs around workouts for energy and protein throughout the day for muscle protein synthesis.',
    category: 'timing'
  },
  {
    id: 'hydration',
    title: 'Stay Hydrated',
    content: 'Aim for half your bodyweight in ounces of water daily. Increase during workouts. Dehydration reduces performance and recovery.',
    category: 'hydration'
  },
  {
    id: 'flexible-dieting',
    title: 'Flexible Dieting',
    content: 'The 80/20 rule: eat nutritious whole foods 80% of the time, enjoy treats 20% of the time. Sustainability beats perfection.',
    category: 'mindset'
  },
  {
    id: 'protein-sources',
    title: 'Quality Protein Sources',
    content: 'Best sources: chicken breast, lean beef, fish, eggs, Greek yogurt, legumes, tofu. Aim for 0.8-1g per pound of bodyweight.',
    category: 'protein'
  },
  {
    id: 'meal-prep',
    title: 'Meal Prep Success',
    content: 'Dedicate 2-3 hours on Sunday to prep meals for the week. This ensures consistency and saves time during busy weekdays.',
    category: 'preparation'
  }
];

export const supplements = [
  {
    id: 'protein-powder',
    name: 'Whey Protein',
    description: 'Fast-digesting protein ideal post-workout',
    benefits: ['Muscle recovery', 'Convenient protein source', 'Supports muscle growth'],
    dosage: '20-30g post-workout',
    timing: 'Post-workout or anytime',
    evidence: 'Strong scientific support'
  },
  {
    id: 'creatine',
    name: 'Creatine Monohydrate',
    description: 'Most researched supplement for strength and power',
    benefits: ['Increased strength', 'Improved power output', 'Enhanced muscle growth'],
    dosage: '5g daily',
    timing: 'Anytime (timing doesn\'t matter)',
    evidence: 'Extensive research backing'
  },
  {
    id: 'omega-3',
    name: 'Fish Oil (Omega-3)',
    description: 'Essential fatty acids for overall health',
    benefits: ['Reduces inflammation', 'Heart health', 'Brain function', 'Joint health'],
    dosage: '2-3g EPA+DHA daily',
    timing: 'With meals',
    evidence: 'Well-established benefits'
  },
  {
    id: 'vitamin-d',
    name: 'Vitamin D3',
    description: 'Essential vitamin often deficient in many people',
    benefits: ['Bone health', 'Immune function', 'Hormone production', 'Mood regulation'],
    dosage: '2000-5000 IU daily',
    timing: 'With fatty meal',
    evidence: 'Strong evidence for deficiency correction'
  },
  {
    id: 'caffeine',
    name: 'Caffeine',
    description: 'Natural stimulant for energy and focus',
    benefits: ['Increased energy', 'Enhanced focus', 'Improved endurance', 'Fat oxidation'],
    dosage: '200-400mg pre-workout',
    timing: '30-60 min before workout',
    evidence: 'Extensively researched ergogenic aid'
  }
];
