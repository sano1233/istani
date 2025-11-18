/**
 * Data Export Utilities
 * Export user data to CSV, JSON, and PDF formats
 */

export class DataExporter {
  /**
   * Convert data to CSV format
   */
  static toCSV(data: any[], columns?: string[]): string {
    if (data.length === 0) return '';

    const headers = columns || Object.keys(data[0]);
    const csvRows = [headers.join(',')];

    for (const row of data) {
      const values = headers.map((header) => {
        const value = row[header];
        // Handle values that contain commas or quotes
        const escaped = String(value).replace(/"/g, '""');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
  }

  /**
   * Download CSV file
   */
  static downloadCSV(data: any[], filename: string, columns?: string[]): void {
    const csv = this.toCSV(data, columns);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    this.downloadFile(blob, `${filename}.csv`);
  }

  /**
   * Download JSON file
   */
  static downloadJSON(data: any, filename: string): void {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    this.downloadFile(blob, `${filename}.json`);
  }

  /**
   * Generate PDF (requires jsPDF library - placeholder)
   */
  static async downloadPDF(
    content: string,
    filename: string,
    options?: {
      title?: string;
      author?: string;
    }
  ): Promise<void> {
    // This is a placeholder - in production, you'd use jsPDF
    const blob = new Blob([content], { type: 'application/pdf' });
    this.downloadFile(blob, `${filename}.pdf`);
  }

  /**
   * Export workout history
   */
  static exportWorkouts(workouts: any[]): void {
    const formattedWorkouts = workouts.map((workout) => ({
      Date: new Date(workout.created_at).toLocaleDateString(),
      Type: workout.type,
      Duration: `${workout.duration} min`,
      Calories: workout.calories_burned,
      Exercises: workout.exercises?.length || 0,
      Notes: workout.notes || '',
    }));

    this.downloadCSV(formattedWorkouts, `workouts-${Date.now()}`);
  }

  /**
   * Export meal history
   */
  static exportMeals(meals: any[]): void {
    const formattedMeals = meals.map((meal) => ({
      Date: new Date(meal.created_at).toLocaleDateString(),
      'Meal Type': meal.meal_type,
      Food: meal.food_name,
      Calories: meal.calories,
      Protein: meal.protein,
      Carbs: meal.carbs,
      Fat: meal.fat,
    }));

    this.downloadCSV(formattedMeals, `meals-${Date.now()}`);
  }

  /**
   * Export body measurements
   */
  static exportMeasurements(measurements: any[]): void {
    const formattedMeasurements = measurements.map((m) => ({
      Date: new Date(m.created_at).toLocaleDateString(),
      Weight: m.weight,
      'Body Fat %': m.body_fat_percentage,
      'Muscle Mass': m.muscle_mass,
      BMI: m.bmi,
      Notes: m.notes || '',
    }));

    this.downloadCSV(formattedMeasurements, `measurements-${Date.now()}`);
  }

  /**
   * Export complete user data (GDPR compliance)
   */
  static exportAllUserData(userData: {
    profile: any;
    workouts: any[];
    meals: any[];
    measurements: any[];
    achievements: any[];
    friends: any[];
  }): void {
    this.downloadJSON(userData, `user-data-${Date.now()}`);
  }

  /**
   * Helper: Trigger file download
   */
  private static downloadFile(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Create backup of all user data
   */
  static async createBackup(userId: string): Promise<Blob> {
    try {
      const response = await fetch(`/api/export/backup?user_id=${userId}`);
      const data = await response.json();

      const backup = {
        version: '1.0',
        timestamp: new Date().toISOString(),
        user_id: userId,
        data,
      };

      return new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    } catch (error) {
      console.error('Failed to create backup:', error);
      throw error;
    }
  }

  /**
   * Restore from backup
   */
  static async restoreBackup(file: File): Promise<void> {
    try {
      const text = await file.text();
      const backup = JSON.parse(text);

      const response = await fetch('/api/export/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(backup),
      });

      if (!response.ok) {
        throw new Error('Failed to restore backup');
      }
    } catch (error) {
      console.error('Failed to restore backup:', error);
      throw error;
    }
  }
}

export default DataExporter;
