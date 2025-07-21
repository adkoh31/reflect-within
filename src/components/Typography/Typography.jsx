import React from 'react';
import { motion } from 'framer-motion';

// Typography variants
const variants = {
  display: 'text-display font-poppins',
  heading: 'text-heading font-poppins',
  title: 'text-title font-poppins',
  subtitle: 'text-subtitle font-poppins',
  body: 'text-body font-inter',
  caption: 'text-caption font-inter',
  small: 'text-small font-inter',
};

// Color variants
const colors = {
  primary: 'text-primary',
  secondary: 'text-secondary',
  muted: 'text-muted',
  accent: 'text-accent',
  white: 'text-white',
  black: 'text-black',
};

// Weight variants
const weights = {
  light: 'font-light',
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
};

export const Typography = ({ 
  variant = 'body',
  color = 'muted',
  weight = 'normal',
  children,
  className = '',
  as: Component = 'p',
  animate = false,
  ...props 
}) => {
  const baseClasses = variants[variant];
  const colorClasses = colors[color];
  const weightClasses = weights[weight];
  
  const combinedClasses = `${baseClasses} ${colorClasses} ${weightClasses} ${className}`.trim();

  if (animate) {
    return (
      <motion.div
        as={Component}
        className={combinedClasses}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <Component className={combinedClasses} {...props}>
      {children}
    </Component>
  );
};

// Specific typography components for common use cases
export const Display = (props) => <Typography variant="display" {...props} />;
export const Heading = (props) => <Typography variant="heading" {...props} />;
export const Title = (props) => <Typography variant="title" {...props} />;
export const Subtitle = (props) => <Typography variant="subtitle" {...props} />;
export const Body = (props) => <Typography variant="body" {...props} />;
export const Caption = (props) => <Typography variant="caption" {...props} />;
export const Small = (props) => <Typography variant="small" {...props} />;

// Specialized components
export const PageTitle = ({ children, ...props }) => (
  <Typography 
    variant="heading" 
    color="primary" 
    weight="bold" 
    as="h1" 
    className="mb-4"
    {...props}
  >
    {children}
  </Typography>
);

export const SectionTitle = ({ children, ...props }) => (
  <Typography 
    variant="title" 
    color="primary" 
    weight="semibold" 
    as="h2" 
    className="mb-3"
    {...props}
  >
    {children}
  </Typography>
);

export const CardTitle = ({ children, ...props }) => (
  <Typography 
    variant="subtitle" 
    color="primary" 
    weight="semibold" 
    as="h3" 
    className="mb-2"
    {...props}
  >
    {children}
  </Typography>
);

export const BodyText = ({ children, ...props }) => (
  <Typography 
    variant="body" 
    color="muted" 
    weight="normal" 
    className="leading-relaxed"
    {...props}
  >
    {children}
  </Typography>
);

export const CaptionText = ({ children, ...props }) => (
  <Typography 
    variant="caption" 
    color="muted" 
    weight="normal" 
    {...props}
  >
    {children}
  </Typography>
);

export default Typography; 