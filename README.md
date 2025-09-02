# 🌞 SAJ Solar API Monitor

A mobile-first web application for monitoring SAJ solar inverter devices and energy data in real-time.

## 📱 Features

- **Mobile-First Design**: Optimized for mobile devices with dark theme
- **Real-Time Monitoring**: Live energy generation and device status tracking
- **Device Management**: Sync and manage SAJ solar inverter devices
- **Smart Synchronization**: Intelligent device sync that adds only new devices
- **Multi-User Support**: Shared access token management for seamless experience
- **Professional UI**: Custom design system based on TailAdmin patterns

## 🎯 Key Capabilities

### Dashboard
- Energy overview with today's and total generation
- Device status summary (total, online, alarms)
- Quick device actions and navigation
- Real-time data visualization

### Device Sync
- Automatic device discovery from SAJ API
- Intelligent sync: adds only new devices, updates existing status
- Progress tracking with real-time feedback
- Sync history and audit trail
- Pre-calculated API signatures for performance

### Design System
- Mobile-first responsive design
- Dark theme optimized for solar monitoring
- Touch-friendly interface (44px minimum touch targets)
- Solar energy color coding (online, offline, alarm states)
- Professional component library

## 🚀 Technology Stack

- **Backend**: Node.js + Express.js
- **Database**: PostgreSQL (Railway)
- **Frontend**: Vanilla HTML/CSS/JavaScript with custom design system
- **API Integration**: SAJ Solar API
- **Deployment**: Railway platform

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL database
- SAJ Solar API credentials
- Railway account (for deployment)

## ⚙️ Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/SAJ-API-Monitor.git
   cd SAJ-API-Monitor
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file:
   ```env
   # Database
   DATABASE_URL=postgresql://user:password@host:port/database
   
   # SAJ API Configuration
   SAJ_APP_ID=your_saj_app_id
   SAJ_APP_SECRET=your_saj_app_secret
   SAJ_BASE_URL=https://intl-developer.saj-electric.com/prod-api/open/api
   
   # Application
   NODE_ENV=production
   PORT=3000
   JWT_SECRET=your_jwt_secret
   ```

4. **Run database migrations**
   ```bash
   npm run migrate
   ```

5. **Start the application**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## 📊 Database Schema

The application uses PostgreSQL with the following main tables:

- **`saj_devices`**: Device information synced from SAJ API
- **`saj_tokens`**: Access token management for multi-user support
- **`saj_sync_history`**: Sync operation tracking and audit trail
- **`saj_token_requests`**: API request monitoring

## 🔗 API Endpoints

### Device Management
- `GET /api/devices` - Get devices from local database
- `GET /api/devices/summary` - Device statistics
- `POST /api/devices/sync` - Sync devices from SAJ API
- `POST /api/devices/generate-signatures` - Generate client signatures

### SAJ API Integration
- `POST /api/saj/token` - Get/refresh access token
- `GET /api/saj/devices` - Fetch devices from SAJ API

### Sync Management
- `GET /api/sync/history` - Get synchronization history

## 🎨 Design System

The application uses a custom design system located in `design-system/`:

- **Colors**: Solar-themed dark color palette
- **Typography**: Mobile-optimized type scale
- **Components**: Reusable UI components
- **Spacing**: Consistent spacing system
- **Styles**: Complete CSS framework

## 🔄 Device Synchronization

The smart sync process:

1. **Access Token**: Obtain/refresh SAJ API token
2. **Fetch Devices**: Retrieve all devices across paginated API
3. **Database Update**: Add only new devices, update existing status
4. **Signatures**: Pre-calculate client signatures for API efficiency

## 🚀 Deployment

### Railway Deployment

1. **Connect GitHub**: Link your Railway project to this GitHub repository
2. **Set Environment Variables**: Configure all required environment variables
3. **Deploy**: Railway will automatically deploy on git push

### Manual Deployment

1. **Build**: `npm install`
2. **Migrate**: `npm run migrate`
3. **Start**: `npm start`

## 📖 Documentation

- **Project Specification**: `PROJECT-SPEC-v1.1.md`
- **API Documentation**: `SAJ-API-Documentation.md`  
- **API Schemas**: `SAJ-API-Schemas.json`
- **Design System**: `design-system/README.md`

## 🔐 Security Features

- Rate limiting for API endpoints
- Secure environment variable handling
- SQL injection prevention
- CORS and helmet security middleware
- Access token encryption in database

## 🏗️ Project Structure

```
SAJ-API-Monitor/
├── config/                 # Application configuration
├── database/              # Database migrations and utilities
├── design-system/         # Custom design system
├── public/               # Frontend HTML/CSS/JS files
├── routes/               # API route handlers
├── app.js               # Main application server
├── package.json         # Dependencies and scripts
└── README.md           # This file
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙋‍♂️ Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation files
- Review the project specification

## 🌟 Acknowledgments

- SAJ Electric for API access
- TailAdmin for design inspiration
- Railway for hosting platform

---

**Built with ❤️ for solar energy monitoring**