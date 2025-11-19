import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { format = 'csv', timeframe = '30d', includeCharts = false } = body;

    // Calculate date range
    const days = timeframe === '7d' ? 7 : timeframe === '90d' ? 90 : timeframe === '1y' ? 365 : 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Fetch all data
    const [workouts, meals, measurements, profile] = await Promise.all([
      supabase
        .from('workout_sessions')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', startDate.toISOString())
        .order('date', { ascending: true }),

      supabase
        .from('meals')
        .select('*')
        .eq('user_id', user.id)
        .gte('logged_at', startDate.toISOString())
        .order('logged_at', { ascending: true }),

      supabase
        .from('body_measurements')
        .select('*')
        .eq('user_id', user.id)
        .gte('measured_at', startDate.toISOString())
        .order('measured_at', { ascending: true }),

      supabase.from('profiles').select('*').eq('id', user.id).single(),
    ]);

    if (format === 'csv') {
      const csv = generateCSV({
        workouts: workouts.data || [],
        meals: meals.data || [],
        measurements: measurements.data || [],
        profile: profile.data,
      });

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="istani-progress-${timeframe}.csv"`,
        },
      });
    }

    if (format === 'json') {
      const data = {
        profile: profile.data,
        timeframe,
        exportDate: new Date().toISOString(),
        workouts: workouts.data || [],
        meals: meals.data || [],
        measurements: measurements.data || [],
        summary: {
          totalWorkouts: workouts.data?.length || 0,
          totalMeals: meals.data?.length || 0,
          totalMeasurements: measurements.data?.length || 0,
          weightChange:
            measurements.data && measurements.data.length > 1
              ? (measurements.data[measurements.data.length - 1].weight_kg || 0) -
                (measurements.data[0].weight_kg || 0)
              : 0,
        },
      };

      return new NextResponse(JSON.stringify(data, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="istani-progress-${timeframe}.json"`,
        },
      });
    }

    if (format === 'pdf') {
      // For PDF, we'll generate HTML and convert it
      const html = generateHTML({
        workouts: workouts.data || [],
        meals: meals.data || [],
        measurements: measurements.data || [],
        profile: profile.data,
        timeframe,
      });

      // In production, you'd use a library like puppeteer or a service like PDFShift
      // For now, return HTML that can be printed to PDF
      return new NextResponse(html, {
        headers: {
          'Content-Type': 'text/html',
          'Content-Disposition': `inline; filename="istani-progress-${timeframe}.html"`,
        },
      });
    }

    return NextResponse.json({ error: 'Invalid format' }, { status: 400 });
  } catch (error: any) {
    console.error('Export error:', error);
    return NextResponse.json(
      {
        error: 'Failed to export data',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

function generateCSV(data: any): string {
  let csv = '';

  // Profile Section
  csv += '# ISTANI Fitness Progress Report\n';
  csv += `Export Date,${new Date().toISOString()}\n`;
  csv += `User,${data.profile?.full_name || 'Unknown'}\n`;
  csv += `Goal,${data.profile?.primary_goal || 'Not specified'}\n`;
  csv += '\n';

  // Body Measurements
  csv += '# Body Measurements\n';
  csv += 'Date,Weight (kg),Body Fat %,BMI,Notes\n';
  data.measurements.forEach((m: any) => {
    csv += `${m.measured_at},${m.weight_kg || ''},${m.body_fat_percentage || ''},${m.bmi || ''},${m.notes || ''}\n`;
  });
  csv += '\n';

  // Workouts
  csv += '# Workouts\n';
  csv += 'Date,Type,Duration (min),Calories,Notes\n';
  data.workouts.forEach((w: any) => {
    csv += `${w.date},${w.workout_type || ''},${w.duration_minutes || ''},${w.calories_burned || ''},${w.notes || ''}\n`;
  });
  csv += '\n';

  // Meals
  csv += '# Nutrition\n';
  csv += 'Date,Meal Type,Food,Calories,Protein (g),Carbs (g),Fats (g)\n';
  data.meals.forEach((m: any) => {
    csv += `${m.logged_at},${m.meal_type || ''},${m.food_name || ''},${m.calories || ''},${m.protein || ''},${m.carbs || ''},${m.fats || ''}\n`;
  });

  return csv;
}

function generateHTML(data: any): string {
  const workoutStats = {
    total: data.workouts.length,
    avgDuration:
      data.workouts.reduce((sum: number, w: any) => sum + (w.duration_minutes || 0), 0) /
      (data.workouts.length || 1),
  };

  const nutritionStats = {
    total: data.meals.length,
    avgCalories:
      data.meals.reduce((sum: number, m: any) => sum + (m.calories || 0), 0) /
      (data.meals.length || 1),
  };

  const weightChange =
    data.measurements.length > 1
      ? (data.measurements[data.measurements.length - 1].weight_kg || 0) -
        (data.measurements[0].weight_kg || 0)
      : 0;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>ISTANI Progress Report</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      max-width: 1200px;
      margin: 0 auto;
      padding: 40px 20px;
      color: #333;
    }
    h1 {
      color: #10b981;
      border-bottom: 3px solid #10b981;
      padding-bottom: 10px;
    }
    h2 {
      color: #059669;
      margin-top: 30px;
    }
    .header {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      padding: 30px;
      border-radius: 12px;
      margin-bottom: 30px;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin: 20px 0;
    }
    .stat-card {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 20px;
    }
    .stat-value {
      font-size: 32px;
      font-weight: bold;
      color: #10b981;
    }
    .stat-label {
      color: #6b7280;
      font-size: 14px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    th, td {
      text-align: left;
      padding: 12px;
      border-bottom: 1px solid #e5e7eb;
    }
    th {
      background: #f9fafb;
      font-weight: 600;
      color: #374151;
    }
    .footer {
      margin-top: 50px;
      padding-top: 20px;
      border-top: 2px solid #e5e7eb;
      text-align: center;
      color: #6b7280;
    }
    @media print {
      body {
        padding: 20px;
      }
      .no-print {
        display: none;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🏋️ ISTANI Fitness Progress Report</h1>
    <p><strong>User:</strong> ${data.profile?.full_name || 'Unknown'}</p>
    <p><strong>Goal:</strong> ${data.profile?.primary_goal || 'Not specified'}</p>
    <p><strong>Report Period:</strong> ${data.timeframe}</p>
    <p><strong>Generated:</strong> ${new Date().toLocaleDateString()}</p>
  </div>

  <h2>📊 Summary Statistics</h2>
  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-value">${workoutStats.total}</div>
      <div class="stat-label">Total Workouts</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${workoutStats.avgDuration.toFixed(0)} min</div>
      <div class="stat-label">Avg Workout Duration</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${nutritionStats.total}</div>
      <div class="stat-label">Meals Logged</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${weightChange >= 0 ? '+' : ''}${weightChange.toFixed(1)} kg</div>
      <div class="stat-label">Weight Change</div>
    </div>
  </div>

  <h2>📏 Body Measurements</h2>
  <table>
    <thead>
      <tr>
        <th>Date</th>
        <th>Weight (kg)</th>
        <th>Body Fat %</th>
        <th>BMI</th>
      </tr>
    </thead>
    <tbody>
      ${data.measurements
        .map(
          (m: any) => `
        <tr>
          <td>${new Date(m.measured_at).toLocaleDateString()}</td>
          <td>${m.weight_kg?.toFixed(1) || '-'}</td>
          <td>${m.body_fat_percentage?.toFixed(1) || '-'}</td>
          <td>${m.bmi?.toFixed(1) || '-'}</td>
        </tr>
      `
        )
        .join('')}
    </tbody>
  </table>

  <h2>💪 Recent Workouts</h2>
  <table>
    <thead>
      <tr>
        <th>Date</th>
        <th>Type</th>
        <th>Duration</th>
        <th>Calories</th>
      </tr>
    </thead>
    <tbody>
      ${data.workouts
        .slice(-10)
        .map(
          (w: any) => `
        <tr>
          <td>${new Date(w.date).toLocaleDateString()}</td>
          <td>${w.workout_type || '-'}</td>
          <td>${w.duration_minutes || '-'} min</td>
          <td>${w.calories_burned || '-'} cal</td>
        </tr>
      `
        )
        .join('')}
    </tbody>
  </table>

  <h2>🍽️ Recent Meals</h2>
  <table>
    <thead>
      <tr>
        <th>Date</th>
        <th>Meal</th>
        <th>Food</th>
        <th>Calories</th>
        <th>Protein</th>
      </tr>
    </thead>
    <tbody>
      ${data.meals
        .slice(-10)
        .map(
          (m: any) => `
        <tr>
          <td>${new Date(m.logged_at).toLocaleDateString()}</td>
          <td>${m.meal_type || '-'}</td>
          <td>${m.food_name || '-'}</td>
          <td>${m.calories || '-'} cal</td>
          <td>${m.protein || '-'}g</td>
        </tr>
      `
        )
        .join('')}
    </tbody>
  </table>

  <div class="footer">
    <p>Generated by <strong>ISTANI</strong> - Your Intelligent Fitness Tracker</p>
    <p>istani.org | ${new Date().getFullYear()}</p>
    <p class="no-print"><button onclick="window.print()">Print to PDF</button></p>
  </div>
</body>
</html>
  `;
}
