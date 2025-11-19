import { describe, it, expect } from 'vitest';
import {
  calculateBMI,
  calculateBMR,
  calculateTDEE,
  calculateCalorieTarget,
  calculateMacros,
  calculateWaterIntake,
} from '@/lib/fitness-calculations';

describe('Fitness Calculations', () => {
  describe('calculateBMI', () => {
    it('should calculate BMI correctly for normal weight', () => {
      // 70kg, 175cm => BMI = 22.9
      expect(calculateBMI(70, 175)).toBe(22.9);
    });

    it('should calculate BMI correctly for underweight', () => {
      // 50kg, 175cm => BMI = 16.3
      expect(calculateBMI(50, 175)).toBe(16.3);
    });

    it('should calculate BMI correctly for overweight', () => {
      // 90kg, 175cm => BMI = 29.4
      expect(calculateBMI(90, 175)).toBe(29.4);
    });

    it('should handle decimal weights', () => {
      // 70.5kg, 175cm => BMI = 23.0
      expect(calculateBMI(70.5, 175)).toBe(23.0);
    });

    it('should round to 1 decimal place', () => {
      // 65kg, 170cm => BMI = 22.5 (not 22.491349...)
      expect(calculateBMI(65, 170)).toBe(22.5);
    });
  });

  describe('calculateBMR', () => {
    it('should calculate BMR correctly for males using Mifflin-St Jeor', () => {
      // Male: 80kg, 180cm, 30 years
      // BMR = 10*80 + 6.25*180 - 5*30 + 5 = 800 + 1125 - 150 + 5 = 1780
      expect(calculateBMR(80, 180, 30, 'male')).toBe(1780);
    });

    it('should calculate BMR correctly for females using Mifflin-St Jeor', () => {
      // Female: 65kg, 165cm, 28 years
      // BMR = 10*65 + 6.25*165 - 5*28 - 161 = 650 + 1031.25 - 140 - 161 = 1380.25
      expect(calculateBMR(65, 165, 28, 'female')).toBe(1380.25);
    });

    it('should handle different ages correctly', () => {
      // Younger person should have higher BMR
      const youngBMR = calculateBMR(70, 170, 20, 'male');
      const olderBMR = calculateBMR(70, 170, 50, 'male');
      expect(youngBMR).toBeGreaterThan(olderBMR);
    });

    it('should handle different heights correctly', () => {
      // Taller person should have higher BMR
      const tallerBMR = calculateBMR(70, 190, 30, 'male');
      const shorterBMR = calculateBMR(70, 160, 30, 'male');
      expect(tallerBMR).toBeGreaterThan(shorterBMR);
    });

    it('should calculate higher BMR for males than females with same stats', () => {
      const maleBMR = calculateBMR(70, 170, 30, 'male');
      const femaleBMR = calculateBMR(70, 170, 30, 'female');
      expect(maleBMR).toBeGreaterThan(femaleBMR);
    });
  });

  describe('calculateTDEE', () => {
    const baseBMR = 1800;

    it('should calculate TDEE for sedentary activity level', () => {
      // 1800 * 1.2 = 2160
      expect(calculateTDEE(baseBMR, 'sedentary')).toBe(2160);
    });

    it('should calculate TDEE for light activity level', () => {
      // 1800 * 1.375 = 2475
      expect(calculateTDEE(baseBMR, 'light')).toBe(2475);
    });

    it('should calculate TDEE for moderate activity level', () => {
      // 1800 * 1.55 = 2790
      expect(calculateTDEE(baseBMR, 'moderate')).toBe(2790);
    });

    it('should calculate TDEE for active activity level', () => {
      // 1800 * 1.725 = 3105
      expect(calculateTDEE(baseBMR, 'active')).toBe(3105);
    });

    it('should calculate TDEE for very active activity level', () => {
      // 1800 * 1.9 = 3420
      expect(calculateTDEE(baseBMR, 'very_active')).toBe(3420);
    });

    it('should default to sedentary for unknown activity level', () => {
      // Unknown level should default to sedentary (1.2)
      expect(calculateTDEE(baseBMR, 'unknown')).toBe(2160);
    });

    it('should round result to nearest integer', () => {
      // No decimals in TDEE
      const tdee = calculateTDEE(1750, 'moderate');
      expect(tdee).toBe(Math.round(1750 * 1.55));
      expect(Number.isInteger(tdee)).toBe(true);
    });
  });

  describe('calculateCalorieTarget', () => {
    const baseTDEE = 2500;

    it('should add 300 calories for muscle gain', () => {
      expect(calculateCalorieTarget(baseTDEE, 'muscle_gain')).toBe(2800);
    });

    it('should subtract 500 calories for fat loss', () => {
      expect(calculateCalorieTarget(baseTDEE, 'fat_loss')).toBe(2000);
    });

    it('should maintain TDEE for maintenance goal', () => {
      expect(calculateCalorieTarget(baseTDEE, 'maintenance')).toBe(2500);
    });

    it('should maintain TDEE for unknown goal', () => {
      expect(calculateCalorieTarget(baseTDEE, 'unknown')).toBe(2500);
    });

    it('should round result to nearest integer', () => {
      const target = calculateCalorieTarget(2567, 'muscle_gain');
      expect(Number.isInteger(target)).toBe(true);
    });
  });

  describe('calculateMacros', () => {
    it('should calculate macros for maintenance goal', () => {
      // 2000 calories: 30% protein, 40% carbs, 30% fats
      const macros = calculateMacros(2000, 'maintenance');

      // Protein: (2000 * 0.3) / 4 = 150g
      expect(macros.protein).toBe(150);
      // Carbs: (2000 * 0.4) / 4 = 200g
      expect(macros.carbs).toBe(200);
      // Fats: (2000 * 0.3) / 9 = 67g
      expect(macros.fats).toBe(67);
    });

    it('should calculate macros for muscle gain goal', () => {
      // 2500 calories: 35% protein, 45% carbs, 20% fats
      const macros = calculateMacros(2500, 'muscle_gain');

      // Protein: (2500 * 0.35) / 4 = 219g
      expect(macros.protein).toBe(219);
      // Carbs: (2500 * 0.45) / 4 = 281g
      expect(macros.carbs).toBe(281);
      // Fats: (2500 * 0.2) / 9 = 56g
      expect(macros.fats).toBe(56);
    });

    it('should calculate macros for fat loss goal', () => {
      // 1800 calories: 40% protein, 30% carbs, 30% fats
      const macros = calculateMacros(1800, 'fat_loss');

      // Protein: (1800 * 0.4) / 4 = 180g
      expect(macros.protein).toBe(180);
      // Carbs: (1800 * 0.3) / 4 = 135g
      expect(macros.carbs).toBe(135);
      // Fats: (1800 * 0.3) / 9 = 60g
      expect(macros.fats).toBe(60);
    });

    it('should round all macro values to integers', () => {
      const macros = calculateMacros(2345, 'maintenance');

      expect(Number.isInteger(macros.protein)).toBe(true);
      expect(Number.isInteger(macros.carbs)).toBe(true);
      expect(Number.isInteger(macros.fats)).toBe(true);
    });

    it('should handle low calorie targets', () => {
      // Should still calculate reasonable macros for low calories
      const macros = calculateMacros(1200, 'fat_loss');

      expect(macros.protein).toBeGreaterThan(0);
      expect(macros.carbs).toBeGreaterThan(0);
      expect(macros.fats).toBeGreaterThan(0);
    });

    it('should handle high calorie targets', () => {
      // Should still calculate reasonable macros for high calories
      const macros = calculateMacros(3500, 'muscle_gain');

      expect(macros.protein).toBeGreaterThan(0);
      expect(macros.carbs).toBeGreaterThan(0);
      expect(macros.fats).toBeGreaterThan(0);
    });
  });

  describe('calculateWaterIntake', () => {
    it('should calculate water intake in 250ml glasses', () => {
      // 70kg * 35ml = 2450ml / 250ml = 9.8 => 10 glasses
      expect(calculateWaterIntake(70)).toBe(10);
    });

    it('should calculate water intake for lighter person', () => {
      // 50kg * 35ml = 1750ml / 250ml = 7 glasses
      expect(calculateWaterIntake(50)).toBe(7);
    });

    it('should calculate water intake for heavier person', () => {
      // 100kg * 35ml = 3500ml / 250ml = 14 glasses
      expect(calculateWaterIntake(100)).toBe(14);
    });

    it('should round to nearest glass', () => {
      // 60kg * 35ml = 2100ml / 250ml = 8.4 => 8 glasses
      expect(calculateWaterIntake(60)).toBe(8);
    });

    it('should handle decimal weights', () => {
      // 75.5kg * 35ml = 2642.5ml / 250ml = 10.57 => 11 glasses
      expect(calculateWaterIntake(75.5)).toBe(11);
    });

    it('should return integer number of glasses', () => {
      const glasses = calculateWaterIntake(85.7);
      expect(Number.isInteger(glasses)).toBe(true);
    });
  });

  describe('Integration Tests', () => {
    it('should calculate complete fitness metrics for a male user', () => {
      const weight = 80;
      const height = 180;
      const age = 30;
      const sex = 'male';
      const activityLevel = 'moderate';
      const goal = 'muscle_gain';

      // Calculate all metrics
      const bmi = calculateBMI(weight, height);
      const bmr = calculateBMR(weight, height, age, sex);
      const tdee = calculateTDEE(bmr, activityLevel);
      const calorieTarget = calculateCalorieTarget(tdee, goal);
      const macros = calculateMacros(calorieTarget, goal, weight);
      const waterGlasses = calculateWaterIntake(weight);

      // Verify all calculations are reasonable
      expect(bmi).toBeGreaterThan(20);
      expect(bmi).toBeLessThan(30);
      expect(bmr).toBeGreaterThan(1500);
      expect(tdee).toBeGreaterThan(bmr);
      expect(calorieTarget).toBeGreaterThan(tdee); // Surplus for muscle gain
      expect(macros.protein + macros.carbs + macros.fats).toBeGreaterThan(0);
      expect(waterGlasses).toBeGreaterThan(5);
    });

    it('should calculate complete fitness metrics for a female user', () => {
      const weight = 60;
      const height = 165;
      const age = 25;
      const sex = 'female';
      const activityLevel = 'light';
      const goal = 'fat_loss';

      // Calculate all metrics
      const bmi = calculateBMI(weight, height);
      const bmr = calculateBMR(weight, height, age, sex);
      const tdee = calculateTDEE(bmr, activityLevel);
      const calorieTarget = calculateCalorieTarget(tdee, goal);
      const macros = calculateMacros(calorieTarget, goal, weight);
      const waterGlasses = calculateWaterIntake(weight);

      // Verify all calculations are reasonable
      expect(bmi).toBeGreaterThan(18);
      expect(bmi).toBeLessThan(25);
      expect(bmr).toBeGreaterThan(1200);
      expect(tdee).toBeGreaterThan(bmr);
      expect(calorieTarget).toBeLessThan(tdee); // Deficit for fat loss
      expect(macros.protein + macros.carbs + macros.fats).toBeGreaterThan(0);
      expect(waterGlasses).toBeGreaterThan(5);
    });
  });
});
