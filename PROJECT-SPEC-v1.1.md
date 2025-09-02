# SAJ Solar API Monitor - Project Specification v1.1

## Project Overview

**Purpose**: Mobile application for monitoring SAJ solar inverter devices and energy data  
**Target Platform**: Mobile-only application  
**Architecture**: Node.js backend with PostgreSQL database, deployed on Railway  
**Design Framework**: Custom design system based on TailAdmin patterns  

## Core Requirements

### 1. Application Type
- **Platform**: Mobile-only application
- **UI Framework**: Custom design system (NOT Google Material Library)
- **Theme**: Dark theme only
- **Responsive**: Mobile-first responsive design

### 2. Design System Requirements
**MANDATORY**: Follow design system specifications located in `design-system/` folder
- **Documentation**: `design-system/README.md`
- **Color System**: `design-system/colors.js` 
- **Typography**: `design-system/typography.js`
- **Spacing**: `design-system/spacing.js`
- **Components**: `design-system/components.js`
- **CSS Framework**: `design-system/styles.css`

**Design Principles**:
- Mobile-first approach with 44px minimum touch targets
- Dark theme with solar orange primary color (#f97316)
- TailAdmin-inspired component library
- Accessibility compliant (WCAG AA)
- Performance optimized for mobile networks

### 3. Application Structure

#### 3.1 Landing Page - Dashboard
- **Primary View**: Welcome dashboard with energy overview
- **Navigation**: Expandable navigation system for future feature expansion
- **Content**: Real-time energy generation summary and device status overview

#### 3.2 Device Management
- **Sync Page**: Interface to synchronize device list from SAJ API
- **Device List**: Display all registered solar inverter devices
- **Device Status**: Real-time status monitoring (online/offline/alarm)
- **Device Details**: Individual device energy data and statistics

#### 3.3 Data Management
- **Real-time Data**: Current energy generation and consumption
- **Historical Data**: Energy trends and performance analytics
- **Device Health**: Monitor device performance and alerts

## Technical Requirements

### 4. API Integration
**Reference Documentation**: `SAJ-API-Documentation.md`  
**Data Schemas**: `SAJ-API-Schemas.json`

**API Endpoints Required**:
- Access token management
- Device list synchronization  
- Real-time device data retrieval

### 5. Access Token Management Strategy

**Critical Requirement**: Multi-user access token management

**Implementation**: Shared token with server-side management
- Single access token shared across all application users
- Server-side token generation and renewal
- Automatic token refresh 30 minutes before expiration
- Background token management transparent to users

**Database Tables**:
```sql
saj_tokens (
  id SERIAL PRIMARY KEY,
  access_token TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

saj_token_requests (
  id SERIAL PRIMARY KEY,
  request_time TIMESTAMP DEFAULT NOW(),
  user_id INTEGER,
  endpoint_called VARCHAR(255),
  success BOOLEAN,
  error_message TEXT,
  token_used VARCHAR(100)
);
```

**Token Behavior**:
- Token lifespan: 28800 seconds (8 hours)
- Token invalidation: New token generation invalidates previous tokens
- Multi-user impact: Single active token prevents user conflicts

### 6. Database Schema

#### 6.1 Device Storage
```sql
saj_devices (
  id SERIAL PRIMARY KEY,
  device_sn VARCHAR(50) UNIQUE NOT NULL,
  device_type VARCHAR(20) NOT NULL,
  plant_id VARCHAR(50) NOT NULL,
  plant_name VARCHAR(255) NOT NULL,
  country VARCHAR(100),
  is_online INTEGER DEFAULT 0,
  is_alarm INTEGER DEFAULT 0,
  client_sign VARCHAR(64),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 6.2 Real-time Data Storage
```sql
saj_realtime_data (
  id SERIAL PRIMARY KEY,
  device_sn VARCHAR(50) NOT NULL,
  data_timestamp TIMESTAMP NOT NULL,
  today_pv_energy DECIMAL(10,2),
  total_pv_energy DECIMAL(10,2),
  current_power DECIMAL(10,2),
  grid_voltage DECIMAL(10,2),
  grid_frequency DECIMAL(10,2),
  device_status INTEGER,
  raw_data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 7. Client Signature Management
- **Generation**: SHA256 hash of "appId=VH_3TmblTqb,deviceSN={device_serial}"
- **Storage**: Pre-calculate and store client signatures in database
- **Usage**: Retrieve stored signatures for API calls to avoid recalculation

### 8. Application Configuration
**Configuration File**: `config/app-config.js`
**Environment Variables**: `.env` file with Railway database connection

**Required Environment Variables**:
- SAJ_APP_ID
- SAJ_APP_SECRET  
- SAJ_BASE_URL
- DATABASE_URL
- NODE_ENV
- JWT_SECRET

## User Experience Requirements

### 9. Mobile Optimization
- Touch-friendly interface with minimum 44px touch targets
- Optimized for thumb navigation
- Fast loading on mobile networks
- Offline capability for cached data

### 10. Performance Requirements
- Initial page load: <3 seconds on 3G networks
- API response caching for improved performance  
- Progressive loading for large device lists
- Optimized images and assets

### 11. Accessibility Requirements
- WCAG 2.1 AA compliance
- Screen reader compatibility
- High contrast ratios for dark theme
- Keyboard navigation support

## Development References

### 12. Documentation Files
- **API Reference**: `SAJ-API-Documentation.md`
- **Data Schemas**: `SAJ-API-Schemas.json`  
- **Design System**: `design-system/README.md`
- **Project Configuration**: `config/app-config.js`

### 13. Design System Implementation
**Mandatory Requirements**:
- Use design system CSS framework (`design-system/styles.css`)
- Follow component patterns defined in `design-system/components.js`
- Implement color system from `design-system/colors.js`
- Apply typography scale from `design-system/typography.js`
- Use spacing system from `design-system/spacing.js`

### 14. Technology Stack
- **Backend**: Node.js with Express.js
- **Database**: PostgreSQL on Railway
- **Frontend**: HTML/CSS/JavaScript with custom design system
- **Authentication**: JWT tokens for user sessions
- **Deployment**: Railway platform
- **Version Control**: Git repository

## Success Criteria

### 15. Functional Requirements
- Successfully synchronize device list from SAJ API
- Display real-time energy data for all devices
- Provide device status monitoring (online/offline/alarm)
- Handle multiple concurrent users without token conflicts
- Maintain 99.5% uptime with automatic error recovery

### 16. Performance Metrics
- Page load time <3 seconds
- API response time <1 second
- Database query optimization
- Mobile-responsive across all screen sizes
- Zero token-related user interruptions

### 17. Quality Assurance
- Unit testing for token management
- Integration testing for API endpoints
- User acceptance testing on mobile devices
- Performance testing under load
- Security testing for API credentials

## Project Deliverables

### 18. Required Deliverables
- Functional mobile web application
- Complete database schema implementation
- Token management service
- API integration layer
- Design system implementation
- Documentation and deployment guide

### 19. Maintenance Requirements  
- Automated token renewal system
- Health monitoring and alerting
- Database backup procedures
- Security update procedures
- Performance monitoring dashboard

---

**Document Version**: 1.1  
**Last Updated**: 2025-01-02  
**Status**: Active Development Specification