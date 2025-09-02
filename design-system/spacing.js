// SAJ Solar Monitor - Spacing System
// Mobile-first spacing based on TailAdmin patterns

export const spacing = {
  // Base spacing scale (rem units)
  scale: {
    '0': '0',
    'px': '1px',
    '0.5': '0.125rem',  // 2px
    '1': '0.25rem',     // 4px
    '1.5': '0.375rem',  // 6px
    '2': '0.5rem',      // 8px
    '2.5': '0.625rem',  // 10px
    '3': '0.75rem',     // 12px
    '3.5': '0.875rem',  // 14px
    '4': '1rem',        // 16px
    '5': '1.25rem',     // 20px
    '6': '1.5rem',      // 24px
    '7': '1.75rem',     // 28px
    '8': '2rem',        // 32px
    '9': '2.25rem',     // 36px
    '10': '2.5rem',     // 40px
    '11': '2.75rem',    // 44px
    '12': '3rem',       // 48px
    '14': '3.5rem',     // 56px
    '16': '4rem',       // 64px
    '20': '5rem',       // 80px
    '24': '6rem',       // 96px
  },

  // Semantic spacing tokens
  semantic: {
    // Component internal spacing
    component: {
      xs: '0.25rem',    // 4px - very tight
      sm: '0.5rem',     // 8px - tight
      base: '0.75rem',  // 12px - comfortable
      md: '1rem',       // 16px - spacious
      lg: '1.5rem',     // 24px - loose
      xl: '2rem',       // 32px - very loose
    },

    // Layout spacing
    layout: {
      xs: '0.5rem',     // 8px
      sm: '1rem',       // 16px
      base: '1.5rem',   // 24px
      md: '2rem',       // 32px
      lg: '3rem',       // 48px
      xl: '4rem',       // 64px
      '2xl': '6rem',    // 96px
    },

    // Mobile-specific spacing
    mobile: {
      screenPadding: '1rem',      // 16px - main screen padding
      cardPadding: '1rem',        // 16px - card internal padding
      sectionGap: '1.5rem',       // 24px - gap between sections
      itemGap: '0.75rem',         // 12px - gap between list items
      buttonPadding: '0.75rem 1rem', // 12px 16px - button padding
    },

    // Touch targets (minimum 44px for accessibility)
    touch: {
      minimum: '44px',            // Minimum touch target
      comfortable: '48px',        // Comfortable touch target
      spacious: '56px',           // Spacious touch target
    }
  }
};

// Container sizes for mobile-first design
export const containers = {
  mobile: {
    sm: '100%',           // Full width on small screens
    md: '100%',           // Full width on medium screens
    lg: '1024px',         // Max width on large screens
    xl: '1280px',         // Max width on extra large screens
  },
  
  padding: {
    mobile: '1rem',       // 16px padding on mobile
    tablet: '1.5rem',     // 24px padding on tablet
    desktop: '2rem',      // 32px padding on desktop
  }
};

// Grid system
export const grid = {
  columns: 12,
  gap: {
    mobile: '1rem',       // 16px gap on mobile
    tablet: '1.5rem',     // 24px gap on tablet
    desktop: '2rem',      // 32px gap on desktop
  },
  
  // Common grid patterns for mobile
  patterns: {
    single: '1fr',                    // Single column
    half: '1fr 1fr',                 // Two equal columns
    thirds: '1fr 1fr 1fr',           // Three equal columns
    autoFit: 'repeat(auto-fit, minmax(280px, 1fr))', // Responsive cards
  }
};

// CSS Classes for Spacing
export const spacingClasses = `
/* Margin Classes */
.m-0 { margin: ${spacing.scale['0']}; }
.m-1 { margin: ${spacing.scale['1']}; }
.m-2 { margin: ${spacing.scale['2']}; }
.m-3 { margin: ${spacing.scale['3']}; }
.m-4 { margin: ${spacing.scale['4']}; }
.m-5 { margin: ${spacing.scale['5']}; }
.m-6 { margin: ${spacing.scale['6']}; }
.m-8 { margin: ${spacing.scale['8']}; }

/* Margin Top */
.mt-0 { margin-top: ${spacing.scale['0']}; }
.mt-1 { margin-top: ${spacing.scale['1']}; }
.mt-2 { margin-top: ${spacing.scale['2']}; }
.mt-3 { margin-top: ${spacing.scale['3']}; }
.mt-4 { margin-top: ${spacing.scale['4']}; }
.mt-6 { margin-top: ${spacing.scale['6']}; }
.mt-8 { margin-top: ${spacing.scale['8']}; }

/* Margin Bottom */
.mb-0 { margin-bottom: ${spacing.scale['0']}; }
.mb-1 { margin-bottom: ${spacing.scale['1']}; }
.mb-2 { margin-bottom: ${spacing.scale['2']}; }
.mb-3 { margin-bottom: ${spacing.scale['3']}; }
.mb-4 { margin-bottom: ${spacing.scale['4']}; }
.mb-6 { margin-bottom: ${spacing.scale['6']}; }
.mb-8 { margin-bottom: ${spacing.scale['8']}; }

/* Padding Classes */
.p-0 { padding: ${spacing.scale['0']}; }
.p-1 { padding: ${spacing.scale['1']}; }
.p-2 { padding: ${spacing.scale['2']}; }
.p-3 { padding: ${spacing.scale['3']}; }
.p-4 { padding: ${spacing.scale['4']}; }
.p-5 { padding: ${spacing.scale['5']}; }
.p-6 { padding: ${spacing.scale['6']}; }
.p-8 { padding: ${spacing.scale['8']}; }

/* Padding X (horizontal) */
.px-0 { padding-left: ${spacing.scale['0']}; padding-right: ${spacing.scale['0']}; }
.px-1 { padding-left: ${spacing.scale['1']}; padding-right: ${spacing.scale['1']}; }
.px-2 { padding-left: ${spacing.scale['2']}; padding-right: ${spacing.scale['2']}; }
.px-3 { padding-left: ${spacing.scale['3']}; padding-right: ${spacing.scale['3']}; }
.px-4 { padding-left: ${spacing.scale['4']}; padding-right: ${spacing.scale['4']}; }
.px-6 { padding-left: ${spacing.scale['6']}; padding-right: ${spacing.scale['6']}; }

/* Padding Y (vertical) */
.py-0 { padding-top: ${spacing.scale['0']}; padding-bottom: ${spacing.scale['0']}; }
.py-1 { padding-top: ${spacing.scale['1']}; padding-bottom: ${spacing.scale['1']}; }
.py-2 { padding-top: ${spacing.scale['2']}; padding-bottom: ${spacing.scale['2']}; }
.py-3 { padding-top: ${spacing.scale['3']}; padding-bottom: ${spacing.scale['3']}; }
.py-4 { padding-top: ${spacing.scale['4']}; padding-bottom: ${spacing.scale['4']}; }
.py-6 { padding-top: ${spacing.scale['6']}; padding-bottom: ${spacing.scale['6']}; }

/* Gap Classes for Flexbox/Grid */
.gap-0 { gap: ${spacing.scale['0']}; }
.gap-1 { gap: ${spacing.scale['1']}; }
.gap-2 { gap: ${spacing.scale['2']}; }
.gap-3 { gap: ${spacing.scale['3']}; }
.gap-4 { gap: ${spacing.scale['4']}; }
.gap-6 { gap: ${spacing.scale['6']}; }
.gap-8 { gap: ${spacing.scale['8']}; }

/* Semantic Spacing Classes */
.space-component-xs { padding: ${spacing.semantic.component.xs}; }
.space-component-sm { padding: ${spacing.semantic.component.sm}; }
.space-component { padding: ${spacing.semantic.component.base}; }
.space-component-md { padding: ${spacing.semantic.component.md}; }
.space-component-lg { padding: ${spacing.semantic.component.lg}; }

.space-layout-xs { margin: ${spacing.semantic.layout.xs}; }
.space-layout-sm { margin: ${spacing.semantic.layout.sm}; }
.space-layout { margin: ${spacing.semantic.layout.base}; }
.space-layout-md { margin: ${spacing.semantic.layout.md}; }
.space-layout-lg { margin: ${spacing.semantic.layout.lg}; }

/* Mobile Screen Padding */
.screen-padding {
  padding-left: ${spacing.semantic.mobile.screenPadding};
  padding-right: ${spacing.semantic.mobile.screenPadding};
}

/* Card Padding */
.card-padding {
  padding: ${spacing.semantic.mobile.cardPadding};
}

/* Touch Target Classes */
.touch-target {
  min-height: ${spacing.semantic.touch.minimum};
  min-width: ${spacing.semantic.touch.minimum};
}

.touch-target-comfortable {
  min-height: ${spacing.semantic.touch.comfortable};
  min-width: ${spacing.semantic.touch.comfortable};
}
`;

export default spacing;