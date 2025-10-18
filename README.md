# 🌱 AI Environmental Impact Calculator

A full-stack web application that calculates the environmental impact of AI token usage, converting it into real-world equivalences like car miles driven, flights, and more.

## Features

- **Token Impact Calculation**: Convert AI token usage to CO₂ emissions and energy consumption
- **Real-World Equivalences**: See impact in terms of car miles, flights, beef burgers, tree years, etc.
- **Multiple AI Models**: Support for GPT-3, GPT-4, Claude, Gemini, and more
- **Regional Accuracy**: Different CO₂ emission factors based on geographic location
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
- Regional carbon intensity data (kg CO₂/kWh)
- Global average: 0.475 kg CO₂/kWh
- Regional variations from 0.020 (Quebec) to 0.737 (Iowa)

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

2. **Install all dependencies**
   ```bash
   npm run install-all
   ```

3. **Set up PostgreSQL database**
   ```bash
   # Create database
   createdb ai_impact_calculator
   
   # Copy environment file
   cp server/env.example server/.env
   # Edit server/.env with your database credentials
   ```

4. **Initialize the database**
   ```bash
   npm run init-db
   ```

5. **Start the development servers**
   ```bash
   npm run dev
   ```

   This will start:
   - Backend API on `http://localhost:5001`
   - Frontend on `http://localhost:3000`

### Manual Setup

If you prefer to set up each part separately:

1. **Install root dependencies**
   ```bash
   npm install
   ```

2. **Setup backend**
   ```bash
   cd server
   npm install
   npm run dev
   ```

3. **Setup frontend** (in a new terminal)
   ```bash
   cd client
   npm install
   npm start
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

### 🔮 Phase 3 (Future)
- [ ] Real-time carbon intensity APIs
- [ ] Carbon offset suggestions
- [ ] Organization dashboards
- [ ] Advanced analytics and reporting
- [ ] Public REST API for developers

### 🌟 Phase 4 (Advanced)
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
