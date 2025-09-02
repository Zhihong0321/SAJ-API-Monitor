// SAJ Solar Monitor - Dark Theme Color System
// Based on TailAdmin design patterns with solar energy focus

export const colors = {
  // Primary Solar Theme Colors
  primary: {
    50: '#fff7ed',
    100: '#ffedd5', 
    200: '#fed7aa',
    300: '#fdba74',
    400: '#fb923c',
    500: '#f97316', // Main solar orange
    600: '#ea580c',
    700: '#c2410c',
    800: '#9a3412',
    900: '#7c2d12',
  },

  // Dark Theme Base Colors
  dark: {
    // Background levels
    bg: {
      primary: '#0f172a',   // Main background (slate-900)
      secondary: '#1e293b', // Card background (slate-800)
      tertiary: '#334155',  // Elevated elements (slate-700)
    },
    
    // Text colors
    text: {
      primary: '#f8fafc',   // Main text (slate-50)
      secondary: '#cbd5e1', // Secondary text (slate-300)
      muted: '#94a3b8',     // Muted text (slate-400)
      disabled: '#64748b',  // Disabled text (slate-500)
    },

    // Border colors
    border: {
      primary: '#374151',   // Main borders (gray-700)
      secondary: '#4b5563', // Elevated borders (gray-600)
      accent: '#6b7280',    // Interactive borders (gray-500)
    }
  },

  // Status Colors (optimized for dark theme)
  status: {
    success: {
      bg: '#065f46',
      text: '#d1fae5',
      border: '#10b981',
    },
    warning: {
      bg: '#78350f',
      text: '#fef3c7',
      border: '#f59e0b',
    },
    error: {
      bg: '#7f1d1d',
      text: '#fecaca',
      border: '#ef4444',
    },
    info: {
      bg: '#1e3a8a',
      text: '#dbeafe',
      border: '#3b82f6',
    }
  },

  // Solar Energy Specific Colors
  solar: {
    energy: '#facc15',    // Yellow for energy generation
    online: '#22c55e',    // Green for online devices
    offline: '#6b7280',   // Gray for offline devices
    alarm: '#ef4444',     // Red for alarms
    grid: '#06b6d4',      // Cyan for grid connection
    battery: '#8b5cf6',   // Purple for battery
  },

  // Interactive Elements
  interactive: {
    hover: 'rgba(249, 115, 22, 0.1)',  // Primary color with 10% opacity
    active: 'rgba(249, 115, 22, 0.2)', // Primary color with 20% opacity
    focus: '#f97316',                   // Primary color for focus states
  }
};

// CSS Custom Properties for easy theme switching
export const cssVariables = `
:root {
  /* Primary Colors */
  --color-primary-50: ${colors.primary[50]};
  --color-primary-500: ${colors.primary[500]};
  --color-primary-600: ${colors.primary[600]};
  
  /* Dark Theme */
  --color-bg-primary: ${colors.dark.bg.primary};
  --color-bg-secondary: ${colors.dark.bg.secondary};
  --color-bg-tertiary: ${colors.dark.bg.tertiary};
  
  --color-text-primary: ${colors.dark.text.primary};
  --color-text-secondary: ${colors.dark.text.secondary};
  --color-text-muted: ${colors.dark.text.muted};
  
  --color-border-primary: ${colors.dark.border.primary};
  --color-border-secondary: ${colors.dark.border.secondary};
  
  /* Solar Specific */
  --color-solar-energy: ${colors.solar.energy};
  --color-solar-online: ${colors.solar.online};
  --color-solar-offline: ${colors.solar.offline};
  --color-solar-alarm: ${colors.solar.alarm};
}
`;

export default colors;