'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  primaryAction?: {
    label: string;
    onClick: () => void;
    icon?: string;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
    icon?: string;
  };
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  primaryAction,
  secondaryAction,
  className,
}: EmptyStateProps) {
  return (
    <Card className={className}>
      <motion.div
        className="text-center py-16 px-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Animated icon */}
        <motion.div
          className="relative inline-block mb-6"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: 'spring',
            stiffness: 200,
            damping: 15,
            delay: 0.2,
          }}
        >
          <motion.span
            className="material-symbols-outlined text-primary text-8xl block"
            animate={{
              y: [0, -10, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            {icon}
          </motion.span>

          {/* Pulsing ring */}
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-primary/30"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
          <p className="text-white/60 mb-8 max-w-md mx-auto">{description}</p>
        </motion.div>

        {/* Actions */}
        {(primaryAction || secondaryAction) && (
          <motion.div
            className="flex flex-col sm:flex-row gap-3 justify-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            {primaryAction && (
              <Button
                size="lg"
                className="gap-2"
                onClick={primaryAction.onClick}
                asChild={false}
              >
                {primaryAction.icon && (
                  <span className="material-symbols-outlined">{primaryAction.icon}</span>
                )}
                {primaryAction.label}
              </Button>
            )}

            {secondaryAction && (
              <Button
                size="lg"
                variant="outline"
                className="gap-2"
                onClick={secondaryAction.onClick}
                asChild={false}
              >
                {secondaryAction.icon && (
                  <span className="material-symbols-outlined">{secondaryAction.icon}</span>
                )}
                {secondaryAction.label}
              </Button>
            )}
          </motion.div>
        )}
      </motion.div>
    </Card>
  );
}
