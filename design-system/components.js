// SAJ Solar Monitor - Component System
// Mobile-first components based on TailAdmin patterns

export const components = {
  // Button Components
  button: {
    // Base button styles
    base: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: '500',
      borderRadius: '0.5rem',
      transition: 'all 0.15s ease-in-out',
      cursor: 'pointer',
      textDecoration: 'none',
      border: 'none',
      minHeight: '44px', // Touch target
      gap: '0.5rem',
    },

    // Size variants
    sizes: {
      sm: {
        padding: '0.5rem 0.75rem',
        fontSize: '0.875rem',
        minHeight: '36px',
      },
      base: {
        padding: '0.75rem 1rem',
        fontSize: '0.875rem',
        minHeight: '44px',
      },
      lg: {
        padding: '0.875rem 1.25rem',
        fontSize: '1rem',
        minHeight: '48px',
      }
    },

    // Color variants
    variants: {
      primary: {
        backgroundColor: 'var(--color-primary-500)',
        color: '#ffffff',
        ':hover': {
          backgroundColor: 'var(--color-primary-600)',
          transform: 'translateY(-1px)',
          boxShadow: '0 4px 12px rgba(249, 115, 22, 0.3)',
        },
        ':active': {
          transform: 'translateY(0)',
        }
      },
      secondary: {
        backgroundColor: 'var(--color-bg-tertiary)',
        color: 'var(--color-text-primary)',
        border: '1px solid var(--color-border-primary)',
        ':hover': {
          backgroundColor: 'var(--color-border-secondary)',
        }
      },
      ghost: {
        backgroundColor: 'transparent',
        color: 'var(--color-text-secondary)',
        ':hover': {
          backgroundColor: 'var(--color-bg-secondary)',
          color: 'var(--color-text-primary)',
        }
      },
      danger: {
        backgroundColor: 'var(--color-solar-alarm)',
        color: '#ffffff',
        ':hover': {
          backgroundColor: '#dc2626',
        }
      }
    }
  },

  // Card Components
  card: {
    base: {
      backgroundColor: 'var(--color-bg-secondary)',
      borderRadius: '0.75rem',
      border: '1px solid var(--color-border-primary)',
      padding: '1rem',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    },
    
    variants: {
      default: {},
      elevated: {
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      },
      interactive: {
        cursor: 'pointer',
        transition: 'all 0.15s ease-in-out',
        ':hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
          borderColor: 'var(--color-border-secondary)',
        }
      }
    }
  },

  // Navigation Components
  navigation: {
    // Mobile bottom navigation
    bottomNav: {
      base: {
        position: 'fixed',
        bottom: '0',
        left: '0',
        right: '0',
        backgroundColor: 'var(--color-bg-secondary)',
        borderTop: '1px solid var(--color-border-primary)',
        padding: '0.75rem 0',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        zIndex: '50',
      },
      
      item: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.25rem',
        padding: '0.5rem',
        minWidth: '44px',
        color: 'var(--color-text-muted)',
        textDecoration: 'none',
        fontSize: '0.75rem',
        transition: 'color 0.15s ease-in-out',
      },

      itemActive: {
        color: 'var(--color-primary-500)',
      }
    },

    // Mobile header
    header: {
      base: {
        position: 'sticky',
        top: '0',
        backgroundColor: 'var(--color-bg-primary)',
        borderBottom: '1px solid var(--color-border-primary)',
        padding: '1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: '40',
      },
      
      title: {
        fontSize: '1.125rem',
        fontWeight: '600',
        color: 'var(--color-text-primary)',
      }
    }
  },

  // Form Components
  form: {
    // Input field
    input: {
      base: {
        width: '100%',
        padding: '0.75rem 1rem',
        backgroundColor: 'var(--color-bg-tertiary)',
        border: '1px solid var(--color-border-primary)',
        borderRadius: '0.5rem',
        color: 'var(--color-text-primary)',
        fontSize: '1rem',
        minHeight: '44px',
        transition: 'border-color 0.15s ease-in-out',
        ':focus': {
          outline: 'none',
          borderColor: 'var(--color-primary-500)',
          boxShadow: '0 0 0 3px rgba(249, 115, 22, 0.1)',
        },
        '::placeholder': {
          color: 'var(--color-text-muted)',
        }
      }
    },

    // Label
    label: {
      base: {
        display: 'block',
        marginBottom: '0.5rem',
        fontSize: '0.875rem',
        fontWeight: '500',
        color: 'var(--color-text-secondary)',
      }
    },

    // Form group
    group: {
      base: {
        marginBottom: '1rem',
      }
    }
  },

  // Status Components
  badge: {
    base: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '0.25rem 0.75rem',
      borderRadius: '9999px',
      fontSize: '0.75rem',
      fontWeight: '500',
      textTransform: 'uppercase',
      letterSpacing: '0.025em',
    },

    variants: {
      online: {
        backgroundColor: '#065f46',
        color: '#d1fae5',
      },
      offline: {
        backgroundColor: '#374151',
        color: '#9ca3af',
      },
      alarm: {
        backgroundColor: '#7f1d1d',
        color: '#fecaca',
      },
      warning: {
        backgroundColor: '#78350f',
        color: '#fef3c7',
      }
    }
  },

  // Loading Components
  loading: {
    spinner: {
      base: {
        width: '1rem',
        height: '1rem',
        border: '2px solid var(--color-border-primary)',
        borderTopColor: 'var(--color-primary-500)',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
      }
    }
  },

  // Solar Specific Components
  solar: {
    // Energy meter component
    energyMeter: {
      base: {
        backgroundColor: 'var(--color-bg-secondary)',
        borderRadius: '0.75rem',
        padding: '1.5rem',
        textAlign: 'center',
        border: '1px solid var(--color-border-primary)',
      },
      
      value: {
        fontSize: '2rem',
        fontWeight: '700',
        color: 'var(--color-solar-energy)',
        marginBottom: '0.5rem',
      },
      
      label: {
        fontSize: '0.875rem',
        color: 'var(--color-text-muted)',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
      }
    },

    // Device status card
    deviceCard: {
      base: {
        backgroundColor: 'var(--color-bg-secondary)',
        borderRadius: '0.75rem',
        padding: '1rem',
        border: '1px solid var(--color-border-primary)',
      },
      
      header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '0.75rem',
      },
      
      title: {
        fontSize: '1rem',
        fontWeight: '600',
        color: 'var(--color-text-primary)',
      }
    }
  }
};

// CSS Animation Keyframes
export const animations = `
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes fadeIn {
  0% { opacity: 0; transform: translateY(10px); }
  100% { opacity: 1; transform: translateY(0); }
}

@keyframes slideUp {
  0% { transform: translateY(100%); }
  100% { transform: translateY(0); }
}

/* Utility animations */
.animate-spin {
  animation: spin 1s linear infinite;
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}

.animate-slide-up {
  animation: slideUp 0.3s ease-out;
}
`;

export default components;