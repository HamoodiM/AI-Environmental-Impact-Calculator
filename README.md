# 🌱 AI Environmental Impact Calculator

A full-stack web application that calculates the environmental impact of AI token usage, converting it into real-world equivalences like car miles driven, flights, and more.

## Features

- **Token Impact Calculation**: Convert AI token usage to CO₂ emissions and energy consumption
- **Real-World Equivalences**: See impact in terms of car miles, flights, beef burgers, tree years, etc.
- **Multiple AI Models**: Support for GPT-3, GPT-4, Claude, Gemini, and more
- **🌍 Real-time Carbon Intensity**: Live electricity grid data from CO2Signal API (Phase 3)
- **Regional Accuracy**: Different CO₂ emission factors based on geographic location
- **187+ Regions**: Comprehensive coverage including real-time data for 50+ countries
- **Intelligent Caching**: 5-minute cache system for optimal performance
- **📊 Advanced Analytics**: Historical trends, model comparisons, and predictive insights (Phase 4)
- **🏢 Organization Dashboards**: Team collaboration and organization-wide impact tracking (Phase 4)
- **🌱 Carbon Offset Suggestions**: Cost calculations and verified offset project recommendations (Phase 4)
- **User Authentication**: Secure login with Firebase Auth (Google, GitHub, Email)
- **Personal Dashboard**: Track your usage history and environmental impact over time
- **Data Visualization**: Interactive charts showing your carbon footprint trends
- **Modern UI**: Clean, responsive design with TailwindCSS
- **Research-Based**: Calculations based on peer-reviewed research and industry data

## Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **React Router** - Client-side routing
- **TailwindCSS** - Utility-first CSS framework
- **Chart.js** - Data visualization
- **Lucide React** - Beautiful icons
- **Firebase Auth** - User authentication
- **React Hot Toast** - Notifications
- **Axios** - HTTP client

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **Sequelize** - SQL ORM for database management
- **SQLite/PostgreSQL** - Database for data persistence
- **Firebase Admin** - Authentication and user management
- **JWT** - Token-based authentication
- **CORS** - Cross-origin resource sharing
- **Helmet** - Security middleware

## Calculation Methodology

### Energy Consumption
- Based on research data from GPT-3 training (1,287 MWh for ~300B tokens)
- Inference estimates: 10-100x more efficient than training
- Conservative per-token energy estimates

### CO₂ Emission Factors
- **Real-time Data**: Live electricity grid carbon intensity from CO2Signal API
- **Fallback Data**: Comprehensive regional carbon intensity data (kg CO₂/kWh)
- **Global average**: 0.475 kg CO₂/kWh
- **Regional variations**: From 0.020 (Quebec) to 0.737 (Iowa)
- **187+ Regions**: Full global coverage with intelligent fallback system

### Environmental Equivalences
- Car miles: 0.411 kg CO₂/mile
- Flight miles: 0.255 kg CO₂/mile
- Beef burgers: 3.4 kg CO₂/burger
- Tree years: 22 kg CO₂/year absorption
- And more...

## Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn
- PostgreSQL 12+

### Installation

1. **Clone the repository**
   ```bash
   git clone git@github.com:HamoodiM/AI-Environmental-Impact-Calculator.git
   cd AIEnvironmentalImpactCalculator
   ```

2. **Start the application** (Everything is automated!)
   ```bash
   ./start.sh
   ```

   This will automatically:
   - Create environment files from templates
   - Install all dependencies
   - Initialize the database
   - Create required directories and files
   - Start both frontend and backend servers

   The application will be available at:
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:5001`

3. **Stop the application**
   ```bash
   ./stop.sh
   ```

### Manual Setup

If you prefer to set up each part separately:

1. **Install dependencies**
   ```bash
   npm run install-all
   ```

2. **Create environment files**
   ```bash
   cp client/.env.example client/.env
   cp server/env.example server/.env
   ```

3. **Initialize the database**
   ```bash
   npm run init-db
   ```

4. **Start the development servers**
   ```bash
   npm run dev
   ```

## 📁 Project Structure

```
AIEnvironmentalImpactCalculator/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── services/       # API services
│   │   └── App.js         # Main app component
│   ├── public/            # Static assets
│   └── package.json
├── server/                # Node.js backend
│   ├── calculations.js    # Core calculation logic
│   ├── index.js          # Express server
│   └── package.json
├── package.json          # Root package.json
└── README.md
```

## 🔧 API Endpoints

### GET `/api/health`
Health check endpoint

### GET `/api/models`
Get available AI models and their information

### GET `/api/regions`
Get available geographic regions and their CO₂ factors

### POST `/api/calculate`
Calculate environmental impact

**Request Body:**
```json
{
  "tokens": 10000,
  "model": "gpt4",
  "region": "global-average"
}
```

**Response:**
```json
{
  "tokens": 10000,
  "model": "gpt4",
  "region": "global-average",
  "energy": {
    "total": 0.086,
    "unit": "kWh"
  },
  "co2": {
    "total": 0.04085,
    "unit": "kg CO2e"
  },
  "equivalences": {
    "carMiles": 0.099,
    "flightMiles": 0.16,
    "beefBurgers": 0.012,
    "smartphoneCharges": 408,
    "householdElectricityDays": 0.002,
    "treeYears": 0.002,
    "laptopHours": 0.817,
    "lightbulbHours": 102
  }
}
```

## 🧪 Testing

### Backend Testing
```bash
cd server
npm test
```

### Frontend Testing
```bash
cd client
npm test
```

## 🚀 Development Roadmap

### ✅ Phase 1 (MVP) - COMPLETED
- [x] Basic token impact calculation
- [x] Real-world equivalences
- [x] Multiple AI models support
- [x] Regional CO₂ factors
- [x] Modern React UI with TailwindCSS
- [x] RESTful API with Express.js
- [x] Responsive design

### ✅ Phase 2 (COMPLETED)
- [x] **User Authentication**: Firebase Auth with Google/GitHub OAuth
- [x] **Data Persistence**: SQLite/PostgreSQL database with user history
- [ ] **OpenAI Integration**: Automatic token usage retrieval
- [x] **Advanced Visualizations**: Interactive charts with Chart.js
- [x] **User Dashboard**: Personal usage statistics and insights
- [x] **API Key Management**: Secure storage and validation
- [x] **Enhanced UI**: Notifications, data export, responsive design

**📋 Detailed Phase 2 Plan**: See [PHASE2_PLAN.md](./PHASE2_PLAN.md)  
**✅ Implementation Checklist**: See [PHASE2_CHECKLIST.md](./PHASE2_CHECKLIST.md)

### ✅ Phase 3 (COMPLETED)
- [x] **Real-time Carbon Intensity APIs**: CO2Signal API integration with live electricity grid data
- [x] **187+ Regions**: Comprehensive global coverage with intelligent fallback system
- [x] **Intelligent Caching**: 5-minute cache system for optimal performance
- [x] **Enhanced API Endpoints**: New carbon intensity endpoints with full documentation
- [x] **Comprehensive Testing**: 100% test coverage with integration tests
- [x] **Production Ready**: Full error handling, logging, and graceful degradation

**📋 Detailed Phase 3 Documentation**: See [PHASE3_DOCUMENTATION.md](./PHASE3_DOCUMENTATION.md)

### ✅ Phase 4 (COMPLETED)
- [x] **Advanced Analytics & Reporting**: Historical trends, model comparisons, and predictive insights
- [x] **Organization Dashboards**: Team collaboration and organization-wide environmental impact tracking
- [x] **Carbon Offset Suggestions**: Cost calculations and verified offset project recommendations
- [x] **Interactive Analytics Dashboard**: Comprehensive data visualization with Chart.js
- [x] **Role-based Organization Management**: Owner, admin, and member roles with permissions
- [x] **Educational Content**: Comprehensive information about carbon offsets and verification
- [x] **Free Offset Resources**: Curated list of free offset providers and calculators
- [x] **Full Integration Testing**: 100% test coverage across all Phase 4 features

**📋 Detailed Phase 4 Documentation**: See [PHASE4_DOCUMENTATION.md](./PHASE4_DOCUMENTATION.md)

### 🌟 Phase 5 (Future)
- [ ] AI Eco Advisor chatbot
- [ ] Browser extension for automatic tracking
- [ ] VS Code plugin for developers
- [ ] Mobile app (React Native)
- [ ] Machine learning for usage predictions

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request


## Acknowledgments

- Research data from various academic papers and industry reports
- OpenAI for model information
- Carbon intensity data from regional energy authorities
- Environmental equivalence data from EPA and other sources

## Support

If you have any questions or need help, please:
- Open an issue on GitHub
- Check the documentation
- Review the API endpoints

---

**Made with ❤️ for environmental awareness**
