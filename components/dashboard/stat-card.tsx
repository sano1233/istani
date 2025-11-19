'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  icon: string;
  label: string;
  value: string | number;
  trend?: {
    value: string;
    direction: 'up' | 'down' | 'neutral';
  };
  delay?: number;
  className?: string;
}

export function StatCard({ icon, label, value, trend, delay = 0, className }: StatCardProps) {
  const trendColors = {
    up: 'text-green-500',
    down: 'text-red-500',
    neutral: 'text-white/60',
  };

  const trendIcons = {
    up: 'trending_up',
    down: 'trending_down',
    neutral: 'remove',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay,
        ease: [0.4, 0, 0.2, 1],
      }}
      whileHover={{ scale: 1.02 }}
      className={className}
    >
      <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-primary/50">
        {/* Background gradient on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Content */}
        <div className="relative flex items-center gap-4 p-6">
          {/* Animated icon */}
          <motion.div
            className="p-3 rounded-lg bg-primary/20 transition-all duration-300 group-hover:bg-primary/30"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          >
            <span className="material-symbols-outlined text-primary text-3xl">{icon}</span>
          </motion.div>

          {/* Data */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-white/60 text-sm truncate">{label}</p>

              {/* Trend indicator */}
              {trend && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: delay + 0.3, type: 'spring' }}
                  className={cn('text-xs flex items-center gap-0.5', trendColors[trend.direction])}
                >
                  <span className="material-symbols-outlined text-xs">
                    {trendIcons[trend.direction]}
                  </span>
                  {trend.value}
                </motion.span>
              )}
            </div>

            {/* Animated value */}
            <motion.p
              className="text-2xl font-bold text-white"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: delay + 0.2 }}
            >
              {value}
            </motion.p>
          </div>

          {/* Quick action button */}
          <motion.button
            className="p-2 rounded-lg hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100"
            whileTap={{ scale: 0.9 }}
            aria-label={`View details for ${label}`}
          >
            <span className="material-symbols-outlined text-white/60">arrow_forward</span>
          </motion.button>
        </div>

        {/* Bottom shine effect */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </Card>
    </motion.div>
  );
}
