import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ClayCardProps extends HTMLMotionProps<"div"> {
  variant?: 'default' | 'inset' | 'hover';
  children: React.ReactNode;
}

export const ClayCard: React.FC<ClayCardProps> = ({
  variant = 'default',
  className,
  children,
  ...props
}) => {
  const baseStyles = "rounded-3xl p-5";
  
  const variants = {
    default: "clay-card",
    inset: "clay-inset",
    hover: "clay-card-hover cursor-pointer",
  };

  return (
    <motion.div
      className={cn(baseStyles, variants[variant], className)}
      whileHover={variant === 'hover' ? { y: -4, scale: 1.02 } : undefined}
      whileTap={variant === 'hover' ? { scale: 0.98 } : undefined}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const ClayButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
}> = ({ children, onClick, variant = 'primary', size = 'md', className, disabled }) => {
  const sizeStyles = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  const variantStyles = {
    primary: 'bg-primary text-primary-foreground',
    secondary: 'bg-secondary text-secondary-foreground',
    accent: 'bg-accent text-accent-foreground',
  };

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "clay-button font-semibold",
        sizeStyles[size],
        variantStyles[variant],
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      whileHover={!disabled ? { y: -2 } : undefined}
      whileTap={!disabled ? { scale: 0.95 } : undefined}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      {children}
    </motion.button>
  );
};

export const ClayIconButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
  className?: string;
}> = ({ children, onClick, active, className }) => {
  return (
    <motion.button
      onClick={onClick}
      className={cn(
        "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
        active ? "clay-inset text-primary" : "clay-card text-muted-foreground hover:text-foreground",
        className
      )}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      {children}
    </motion.button>
  );
};
