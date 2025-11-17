'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card } from './ui/card';

interface MacroData {
  protein: number;
  carbs: number;
  fat: number;
}

interface MacroDistributionChartProps {
  current: MacroData;
  target?: MacroData;
  showTarget?: boolean;
}

const COLORS = {
  protein: '#3b82f6', // Blue
  carbs: '#10b981',   // Green
  fat: '#f59e0b',     // Orange
};

export function MacroDistributionChart({
  current,
  target,
  showTarget = false,
}: MacroDistributionChartProps) {
  const currentData = [
    { name: 'Protein', value: current.protein, color: COLORS.protein },
    { name: 'Carbs', value: current.carbs, color: COLORS.carbs },
    { name: 'Fat', value: current.fat, color: COLORS.fat },
  ];

  const targetData = target
    ? [
        { name: 'Protein', value: target.protein, color: COLORS.protein },
        { name: 'Carbs', value: target.carbs, color: COLORS.carbs },
        { name: 'Fat', value: target.fat, color: COLORS.fat },
      ]
    : [];

  const calculatePercentage = (value: number, total: number) => {
    return total > 0 ? ((value / total) * 100).toFixed(1) : '0';
  };

  const totalCurrent = current.protein + current.carbs + current.fat;
  const totalTarget = target ? target.protein + target.carbs + target.fat : 0;

  const calculateCalories = (macros: MacroData) => {
    // Protein: 4 cal/g, Carbs: 4 cal/g, Fat: 9 cal/g
    return macros.protein * 4 + macros.carbs * 4 + macros.fat * 9;
  };

  return (
    <Card className="p-6">
      <h3 className="text-xl font-bold text-white mb-6">Macro Distribution</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Current Distribution */}
        <div>
          <h4 className="text-sm font-medium text-white/80 mb-4 text-center">Today's Intake</h4>

          {totalCurrent > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={currentData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}g`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {currentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(0,0,0,0.9)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              <div className="space-y-2 mt-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.protein }} />
                    <span className="text-white/80">Protein</span>
                  </div>
                  <span className="text-white font-medium">
                    {current.protein}g ({calculatePercentage(current.protein, totalCurrent)}%)
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.carbs }} />
                    <span className="text-white/80">Carbs</span>
                  </div>
                  <span className="text-white font-medium">
                    {current.carbs}g ({calculatePercentage(current.carbs, totalCurrent)}%)
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.fat }} />
                    <span className="text-white/80">Fat</span>
                  </div>
                  <span className="text-white font-medium">
                    {current.fat}g ({calculatePercentage(current.fat, totalCurrent)}%)
                  </span>
                </div>

                <div className="pt-2 border-t border-white/10 flex items-center justify-between font-semibold">
                  <span className="text-white">Total Calories</span>
                  <span className="text-primary">{Math.round(calculateCalories(current))}</span>
                </div>
              </div>
            </>
          ) : (
            <div className="h-64 flex items-center justify-center text-white/60 text-sm">
              No meals logged today
            </div>
          )}
        </div>

        {/* Target Distribution */}
        {showTarget && target && (
          <div>
            <h4 className="text-sm font-medium text-white/80 mb-4 text-center">Target</h4>

            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={targetData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}g`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {targetData.map((entry, index) => (
                    <Cell key={`cell-target-${index}`} fill={entry.color} opacity={0.7} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(0,0,0,0.9)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            <div className="space-y-2 mt-4">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.protein }} />
                  <span className="text-white/80">Protein</span>
                </div>
                <span className="text-white font-medium">
                  {target.protein}g ({calculatePercentage(target.protein, totalTarget)}%)
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.carbs }} />
                  <span className="text-white/80">Carbs</span>
                </div>
                <span className="text-white font-medium">
                  {target.carbs}g ({calculatePercentage(target.carbs, totalTarget)}%)
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.fat }} />
                  <span className="text-white/80">Fat</span>
                </div>
                <span className="text-white font-medium">
                  {target.fat}g ({calculatePercentage(target.fat, totalTarget)}%)
                </span>
              </div>

              <div className="pt-2 border-t border-white/10 flex items-center justify-between font-semibold">
                <span className="text-white">Target Calories</span>
                <span className="text-primary">{Math.round(calculateCalories(target))}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Progress vs Target */}
      {showTarget && target && totalCurrent > 0 && (
        <div className="mt-6 pt-6 border-t border-white/10">
          <h4 className="text-sm font-medium text-white/80 mb-3">Progress vs Target</h4>

          <div className="space-y-3">
            {[
              { name: 'Protein', current: current.protein, target: target.protein, color: COLORS.protein },
              { name: 'Carbs', current: current.carbs, target: target.carbs, color: COLORS.carbs },
              { name: 'Fat', current: current.fat, target: target.fat, color: COLORS.fat },
            ].map(macro => {
              const percentage = (macro.current / macro.target) * 100;
              const isOver = percentage > 100;

              return (
                <div key={macro.name}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-white/80">{macro.name}</span>
                    <span className={`font-medium ${
                      isOver ? 'text-red-400' : percentage > 90 ? 'text-green-400' : 'text-white'
                    }`}>
                      {macro.current}g / {macro.target}g
                    </span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min(percentage, 100)}%`,
                        backgroundColor: macro.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Card>
  );
}
