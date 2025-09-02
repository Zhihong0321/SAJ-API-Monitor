# SAJ Solar Monitor - Design System

A comprehensive, mobile-first design system based on TailAdmin patterns, optimized for dark theme and solar energy monitoring applications.

## 🎨 Design Principles

### 1. Mobile-First
- All components designed primarily for mobile devices
- Touch-friendly interface with minimum 44px touch targets
- Responsive breakpoints: Mobile → Tablet → Desktop

### 2. Dark Theme Only
- Carefully crafted dark color palette
- Optimal contrast ratios for readability
- Solar energy inspired accent colors

### 3. Solar Energy Focus
- Color coding for energy states (generation, consumption, storage)
- Status indicators for device monitoring
- Real-time data visualization optimized for mobile

## 🌈 Color System

### Primary Colors (Solar Orange)
```css
--color-primary-500: #f97316  /* Main brand color */
--color-primary-600: #ea580c  /* Hover state */
```

### Dark Theme Base
```css
--color-bg-primary: #0f172a    /* Main background */
--color-bg-secondary: #1e293b  /* Card backgrounds */
--color-bg-tertiary: #334155   /* Elevated elements */

--color-text-primary: #f8fafc  /* Main text */
--color-text-secondary: #cbd5e1 /* Secondary text */
--color-text-muted: #94a3b8    /* Muted text */
```

### Solar Specific Colors
```css
--color-solar-energy: #facc15  /* Energy generation */
--color-solar-online: #22c55e  /* Online devices */
--color-solar-offline: #6b7280 /* Offline devices */
--color-solar-alarm: #ef4444   /* Alarm states */
```

## 📝 Typography

### Font Stack
- **Primary**: Inter, system fonts
- **Monospace**: JetBrains Mono (for data display)

### Scale (Mobile-optimized)
```css
.text-h1    /* 30px - Page titles */
.text-h2    /* 24px - Section headers */
.text-h3    /* 20px - Subsections */
.text-body  /* 16px - Body text */
.text-small /* 14px - Secondary info */
.text-caption /* 12px - Labels */
```

## 📐 Spacing System

### Scale
- Uses rem-based spacing for scalability
- Touch-friendly minimum sizes
- Consistent vertical rhythm

### Semantic Tokens
```css
.screen-padding  /* 16px - Main screen margins */
.card-padding    /* 16px - Card internal padding */
.touch-target    /* 44px - Minimum touch size */
```

## 🧩 Component Library

### Navigation
- **Bottom Navigation**: Fixed mobile navigation bar
- **Header**: Sticky page headers with actions
- **Breadcrumbs**: Page hierarchy navigation

### Data Display
- **Energy Meters**: Solar generation/consumption displays
- **Device Cards**: Individual inverter status cards
- **Status Badges**: Online/offline/alarm indicators
- **Charts**: Mobile-optimized data visualization

### Forms
- **Input Fields**: Touch-friendly form inputs
- **Buttons**: Primary, secondary, ghost variants
- **Toggles**: Switch controls for settings

### Feedback
- **Loading States**: Spinners and skeleton screens
- **Alerts**: Status messages and notifications
- **Empty States**: No data placeholders

## 🚀 Usage Examples

### Basic Card Component
```html
<div class="card">
  <div class="card-header">
    <h3 class="text-h3">Device Status</h3>
    <span class="badge badge-online">Online</span>
  </div>
  <div class="card-content">
    <div class="energy-meter">
      <div class="energy-value">2.4 kW</div>
      <div class="energy-label">Current Generation</div>
    </div>
  </div>
</div>
```

### Button Variants
```html
<button class="btn btn-primary">Sync Devices</button>
<button class="btn btn-secondary">View Details</button>
<button class="btn btn-ghost">Cancel</button>
```

### Navigation Structure
```html
<nav class="bottom-nav">
  <a href="/dashboard" class="nav-item nav-item-active">
    <icon>dashboard</icon>
    <span>Dashboard</span>
  </a>
  <a href="/devices" class="nav-item">
    <icon>devices</icon>
    <span>Devices</span>
  </a>
</nav>
```

## 📱 Mobile Optimization

### Touch Targets
- Minimum 44px tap targets
- Adequate spacing between interactive elements
- Thumb-friendly navigation placement

### Performance
- Optimized for 3G networks
- Efficient CSS delivery
- Progressive enhancement

### Accessibility
- High contrast ratios (WCAG AA compliant)
- Screen reader friendly
- Keyboard navigation support

## 🎯 Solar Energy Specific Features

### Device Status Visualization
- Color-coded status indicators
- Real-time data updates
- Energy flow visualization

### Data Presentation
- Large, readable numbers for energy values
- Contextual units (kW, kWh, V, A)
- Historical data trends

### Alarm Management
- Priority-based color coding
- Clear visual hierarchy
- Quick action buttons

## 📦 File Structure

```
design-system/
├── colors.js          # Color tokens and CSS variables
├── typography.js      # Font scales and text styles
├── spacing.js         # Spacing scale and layout
├── components.js      # Component definitions
└── README.md         # This documentation
```

## 🔧 Implementation

1. **Import Design Tokens**
   ```javascript
   import { colors } from './design-system/colors.js';
   import { typography } from './design-system/typography.js';
   import { spacing } from './design-system/spacing.js';
   ```

2. **Apply CSS Variables**
   ```css
   :root {
     /* Colors */
     --color-primary-500: #f97316;
     /* Typography */
     --font-family-sans: Inter, system-ui, sans-serif;
     /* Spacing */
     --space-4: 1rem;
   }
   ```

3. **Use Component Classes**
   ```html
   <div class="card">
     <h2 class="text-h2">Solar Generation</h2>
     <div class="energy-meter">
       <span class="energy-value">5.2 kWh</span>
     </div>
   </div>
   ```

## 🌟 Best Practices

1. **Consistency**: Always use design tokens instead of hardcoded values
2. **Mobile-First**: Design for mobile, enhance for larger screens  
3. **Accessibility**: Maintain proper contrast and focus states
4. **Performance**: Optimize for slow networks and older devices
5. **Usability**: Prioritize clear information hierarchy and easy navigation

This design system provides the foundation for building a cohesive, accessible, and efficient solar monitoring application.