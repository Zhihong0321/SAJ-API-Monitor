// SAJ Solar Monitor - Typography System
// Mobile-first typography based on TailAdmin patterns

export const typography = {
  // Font Families
  fonts: {
    sans: [
      'Inter',
      '-apple-system', 
      'BlinkMacSystemFont', 
      'Segoe UI', 
      'Roboto', 
      'sans-serif'
    ],
    mono: [
      'JetBrains Mono',
      'Menlo',
      'Monaco', 
      'Consolas',
      'monospace'
    ]
  },

  // Mobile-first Typography Scale
  fontSize: {
    // Mobile base sizes
    'xs': {
      mobile: '0.75rem',    // 12px
      desktop: '0.75rem',
      lineHeight: '1.5',
    },
    'sm': {
      mobile: '0.875rem',   // 14px
      desktop: '0.875rem',
      lineHeight: '1.5',
    },
    'base': {
      mobile: '1rem',       // 16px - mobile base
      desktop: '1rem',
      lineHeight: '1.5',
    },
    'lg': {
      mobile: '1.125rem',   // 18px
      desktop: '1.125rem', 
      lineHeight: '1.4',
    },
    'xl': {
      mobile: '1.25rem',    // 20px
      desktop: '1.25rem',
      lineHeight: '1.4',
    },
    '2xl': {
      mobile: '1.5rem',     // 24px
      desktop: '1.5rem',
      lineHeight: '1.3',
    },
    '3xl': {
      mobile: '1.875rem',   // 30px
      desktop: '1.875rem',
      lineHeight: '1.2',
    },
    '4xl': {
      mobile: '2.25rem',    // 36px
      desktop: '2.25rem',
      lineHeight: '1.1',
    }
  },

  // Font Weights
  fontWeight: {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },

  // Letter Spacing
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em', 
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },

  // Line Heights
  lineHeight: {
    none: '1',
    tight: '1.25',
    snug: '1.375', 
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  }
};

// Semantic Typography Tokens
export const semanticTypography = {
  // Headings - optimized for mobile
  heading: {
    h1: {
      fontSize: typography.fontSize['3xl'],
      fontWeight: typography.fontWeight.bold,
      letterSpacing: typography.letterSpacing.tight,
      color: 'var(--color-text-primary)',
    },
    h2: {
      fontSize: typography.fontSize['2xl'], 
      fontWeight: typography.fontWeight.semibold,
      letterSpacing: typography.letterSpacing.tight,
      color: 'var(--color-text-primary)',
    },
    h3: {
      fontSize: typography.fontSize['xl'],
      fontWeight: typography.fontWeight.semibold,
      color: 'var(--color-text-primary)',
    },
    h4: {
      fontSize: typography.fontSize['lg'],
      fontWeight: typography.fontWeight.medium,
      color: 'var(--color-text-primary)',
    }
  },

  // Body Text
  body: {
    large: {
      fontSize: typography.fontSize['lg'],
      fontWeight: typography.fontWeight.normal,
      lineHeight: typography.lineHeight.relaxed,
      color: 'var(--color-text-primary)',
    },
    base: {
      fontSize: typography.fontSize['base'],
      fontWeight: typography.fontWeight.normal,
      lineHeight: typography.lineHeight.normal,
      color: 'var(--color-text-primary)',
    },
    small: {
      fontSize: typography.fontSize['sm'],
      fontWeight: typography.fontWeight.normal,
      lineHeight: typography.lineHeight.normal,
      color: 'var(--color-text-secondary)',
    }
  },

  // Specialized Text
  label: {
    fontSize: typography.fontSize['sm'],
    fontWeight: typography.fontWeight.medium,
    letterSpacing: typography.letterSpacing.wide,
    color: 'var(--color-text-secondary)',
    textTransform: 'uppercase',
  },

  caption: {
    fontSize: typography.fontSize['xs'],
    fontWeight: typography.fontWeight.normal,
    color: 'var(--color-text-muted)',
  },

  code: {
    fontFamily: typography.fonts.mono.join(', '),
    fontSize: typography.fontSize['sm'],
    fontWeight: typography.fontWeight.medium,
    backgroundColor: 'var(--color-bg-tertiary)',
    color: 'var(--color-text-primary)',
    padding: '0.125rem 0.25rem',
    borderRadius: '0.25rem',
  }
};

// CSS Classes for Typography
export const typographyClasses = `
/* Font Families */
.font-sans { font-family: ${typography.fonts.sans.join(', ')}; }
.font-mono { font-family: ${typography.fonts.mono.join(', ')}; }

/* Headings */
.text-h1 {
  font-size: ${typography.fontSize['3xl'].mobile};
  font-weight: ${typography.fontWeight.bold};
  letter-spacing: ${typography.letterSpacing.tight};
  line-height: ${typography.fontSize['3xl'].lineHeight};
  color: var(--color-text-primary);
}

.text-h2 {
  font-size: ${typography.fontSize['2xl'].mobile};
  font-weight: ${typography.fontWeight.semibold};
  letter-spacing: ${typography.letterSpacing.tight};
  line-height: ${typography.fontSize['2xl'].lineHeight};
  color: var(--color-text-primary);
}

.text-h3 {
  font-size: ${typography.fontSize['xl'].mobile};
  font-weight: ${typography.fontWeight.semibold};
  line-height: ${typography.fontSize['xl'].lineHeight};
  color: var(--color-text-primary);
}

.text-h4 {
  font-size: ${typography.fontSize['lg'].mobile};
  font-weight: ${typography.fontWeight.medium};
  line-height: ${typography.fontSize['lg'].lineHeight};
  color: var(--color-text-primary);
}

/* Body Text */
.text-body {
  font-size: ${typography.fontSize['base'].mobile};
  font-weight: ${typography.fontWeight.normal};
  line-height: ${typography.lineHeight.normal};
  color: var(--color-text-primary);
}

.text-body-small {
  font-size: ${typography.fontSize['sm'].mobile};
  font-weight: ${typography.fontWeight.normal};
  line-height: ${typography.lineHeight.normal};
  color: var(--color-text-secondary);
}

/* Utility Classes */
.text-label {
  font-size: ${typography.fontSize['sm'].mobile};
  font-weight: ${typography.fontWeight.medium};
  letter-spacing: ${typography.letterSpacing.wide};
  color: var(--color-text-secondary);
  text-transform: uppercase;
}

.text-caption {
  font-size: ${typography.fontSize['xs'].mobile};
  font-weight: ${typography.fontWeight.normal};
  color: var(--color-text-muted);
}

/* Responsive Typography */
@media (min-width: 768px) {
  .text-h1 { font-size: ${typography.fontSize['4xl'].desktop}; }
  .text-h2 { font-size: ${typography.fontSize['3xl'].desktop}; }
  .text-h3 { font-size: ${typography.fontSize['2xl'].desktop}; }
}
`;

export default typography;