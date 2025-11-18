import { parseNutrientProfile, calculateMealNutrients, checkDietaryCompliance } from '@/lib/usda-api';

describe('USDA API', () => {
  describe('parseNutrientProfile', () => {
    it('should parse basic macronutrients', () => {
      const mockFood = {
        fdcId: 123,
        description: 'Test Food',
        dataType: 'Branded',
        foodNutrients: [
          { nutrientId: 1008, nutrientName: 'Energy', value: 200, unitName: 'kcal', nutrientNumber: '208' },
          { nutrientId: 1003, nutrientName: 'Protein', value: 20, unitName: 'g', nutrientNumber: '203' },
          { nutrientId: 1005, nutrientName: 'Carbohydrate', value: 30, unitName: 'g', nutrientNumber: '205' },
          { nutrientId: 1004, nutrientName: 'Total lipid (fat)', value: 10, unitName: 'g', nutrientNumber: '204' },
        ],
      };

      const profile = parseNutrientProfile(mockFood);

      expect(profile.calories).toBe(200);
      expect(profile.protein).toBe(20);
      expect(profile.carbs).toBe(30);
      expect(profile.fat).toBe(10);
    });
  });

  describe('calculateMealNutrients', () => {
    it('should calculate total nutrients for multiple foods', () => {
      const foods = [
        {
          profile: { calories: 200, protein: 20, carbs: 30, fat: 10, fiber: 5, sugar: 2 },
          servings: 1,
        },
        {
          profile: { calories: 150, protein: 10, carbs: 20, fat: 5, fiber: 3, sugar: 1 },
          servings: 2,
        },
      ];

      const total = calculateMealNutrients(foods);

      expect(total.calories).toBe(500); // 200 + (150 * 2)
      expect(total.protein).toBe(40); // 20 + (10 * 2)
      expect(total.carbs).toBe(70); // 30 + (20 * 2)
      expect(total.fat).toBe(20); // 10 + (5 * 2)
    });
  });

  describe('checkDietaryCompliance', () => {
    it('should identify violations of dietary requirements', () => {
      const profile = {
        calories: 500,
        protein: 20,
        carbs: 60,
        fat: 20,
        fiber: 5,
        sugar: 30,
        sodium: 1000,
      };

      const requirements = {
        maxSugar: 20,
        maxSodium: 800,
        minProtein: 25,
      };

      const result = checkDietaryCompliance(profile, requirements);

      expect(result.compliant).toBe(false);
      expect(result.violations).toHaveLength(3);
      expect(result.violations[0]).toContain('Sugar');
      expect(result.violations[1]).toContain('Sodium');
      expect(result.violations[2]).toContain('Protein');
    });

    it('should pass when requirements are met', () => {
      const profile = {
        calories: 500,
        protein: 30,
        carbs: 60,
        fat: 20,
        fiber: 5,
        sugar: 10,
        sodium: 500,
      };

      const requirements = {
        maxSugar: 20,
        maxSodium: 800,
        minProtein: 25,
      };

      const result = checkDietaryCompliance(profile, requirements);

      expect(result.compliant).toBe(true);
      expect(result.violations).toHaveLength(0);
    });
  });
});
