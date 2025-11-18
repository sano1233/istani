'use client';

interface BarData {
  label: string;
  value: number;
  color?: string;
}

interface BarChartProps {
  data: BarData[];
  height?: number;
  horizontal?: boolean;
  showValues?: boolean;
}

export function BarChart({ data, height = 200, horizontal = false, showValues = true }: BarChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <p className="text-white/40">No data available</p>
      </div>
    );
  }

  const maxValue = Math.max(...data.map((d) => d.value));

  if (horizontal) {
    return (
      <div className="space-y-3" style={{ minHeight: height }}>
        {data.map((item, i) => {
          const widthPercent = maxValue > 0 ? (item.value / maxValue) * 100 : 0;

          return (
            <div key={i}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-white/80">{item.label}</span>
                {showValues && (
                  <span className="text-sm font-semibold text-white">{item.value}</span>
                )}
              </div>
              <div className="relative h-8 bg-white/5 rounded-lg overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 rounded-lg transition-all duration-500 ease-out"
                  style={{
                    width: `${widthPercent}%`,
                    backgroundColor: item.color || '#00ffff',
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20"></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Vertical bars
  return (
    <div className="flex items-end justify-around gap-2" style={{ height }}>
      {data.map((item, i) => {
        const heightPercent = maxValue > 0 ? (item.value / maxValue) * 100 : 0;

        return (
          <div key={i} className="flex-1 flex flex-col items-center">
            <div className="w-full flex-1 flex items-end">
              <div className="w-full relative group">
                {/* Bar */}
                <div
                  className="w-full rounded-t-lg transition-all duration-500 ease-out relative overflow-hidden"
                  style={{
                    height: `${heightPercent}%`,
                    backgroundColor: item.color || '#00ffff',
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/20"></div>
                </div>

                {/* Value tooltip */}
                {showValues && (
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                      {item.value}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Label */}
            <div className="mt-2 text-xs text-white/60 text-center truncate max-w-full">
              {item.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}
