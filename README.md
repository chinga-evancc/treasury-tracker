# Treasury Investment Tracker

A comprehensive web application for tracking treasury note and treasury bill investments in Malawi Kwacha (MWK), featuring user authentication, portfolio management, and automatic coupon payment calculations.

## Features

### 🔐 Authentication
- **User Registration**: Create new accounts with email and password
- **Secure Login**: Email/password authentication with demo account option
- **Password Reset**: Forgot password functionality with email verification
- **Session Management**: Persistent login sessions with secure logout

### 💰 Investment Management
- **Treasury Notes**: 2-10 year maturity with semi-annual coupon payments
- **Treasury Bills**: Short-term investments with single maturity payment
- **Portfolio Overview**: Real-time statistics and performance metrics
- **Investment CRUD**: Add, edit, delete, and view investment details

### 📊 Financial Tracking
- **Automatic Calculations**: Semi-annual coupon payment schedules
- **Portfolio Statistics**: Total investments, expected returns, yield calculations
- **Payment Schedules**: Detailed tables showing all future payments
- **Currency Support**: Full Malawi Kwacha (MWK) formatting and calculations

### 🎨 User Experience
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Modern UI**: Clean interface built with Tailwind CSS and shadcn/ui
- **Data Persistence**: User-specific data storage with localStorage
- **Real-time Updates**: Live portfolio calculations and status updates

## Technology Stack

- **Frontend**: React 19 with Vite
- **Routing**: React Router DOM
- **Styling**: Tailwind CSS 4.x
- **UI Components**: shadcn/ui with Radix UI primitives
- **Icons**: Lucide React
- **State Management**: React Hooks (useState, useEffect)
- **Data Storage**: Browser localStorage (user-specific)

## Quick Start

### Demo Account
Use these credentials to try the application:
- **Email**: demo@treasury.mw
- **Password**: demo123

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd treasury-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:5173
   ```

## Deployment on Railway.app

### Prerequisites
- Railway.app account
- Git repository with the source code

### Deployment Steps

1. **Connect Repository**
   - Go to [Railway.app](https://railway.app)
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your treasury-tracker repository

2. **Configure Environment**
   - Railway will automatically detect this as a Node.js project
   - The `railway.json` configuration file will be used automatically
   - No environment variables are required for basic functionality

3. **Deploy**
   - Railway will automatically:
     - Install dependencies with `npm install`
     - Build the project with `npm run build`
     - Start the preview server with `npm run preview`
   - Deployment typically takes 2-3 minutes

4. **Access Your App**
   - Railway will provide a public URL (e.g., `https://your-app.railway.app`)
   - The application will be accessible immediately after deployment

### Railway Configuration

The project includes a `railway.json` file with optimized settings:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm run preview",
    "healthcheckPath": "/",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### Custom Domain (Optional)
- In Railway dashboard, go to your project settings
- Add a custom domain under "Domains"
- Configure DNS records as instructed by Railway

## Project Structure

```
treasury-tracker/
├── src/
│   ├── components/
│   │   ├── Dashboard.jsx          # Main investment tracker interface
│   │   ├── Login.jsx              # User login form
│   │   ├── Register.jsx           # User registration form
│   │   ├── ForgotPassword.jsx     # Password reset functionality
│   │   └── ProtectedRoute.jsx     # Route protection component
│   ├── components/ui/             # shadcn/ui components
│   ├── App.jsx                    # Main application with routing
│   ├── main.jsx                   # React entry point
│   └── App.css                    # Global styles
├── public/                        # Static assets
├── railway.json                   # Railway deployment config
├── vite.config.js                 # Vite configuration
├── package.json                   # Dependencies and scripts
├── tailwind.config.js             # Tailwind CSS configuration
└── README.md                      # This file
```

## Usage Guide

### Getting Started
1. **Register**: Create a new account or use the demo account
2. **Login**: Access the dashboard with your credentials
3. **Add Investment**: Click "Add Investment" to record your first treasury investment
4. **View Portfolio**: Monitor your investments in the "My Investments" tab
5. **Check Payments**: View payment schedules in the "Payment Schedule" tab

### Investment Types

#### Treasury Notes
- **Maturity**: 2-10 years
- **Payments**: Semi-annual coupon payments + principal at maturity
- **Required Fields**: Face value, purchase price, coupon rate, issue date, purchase date, maturity date

#### Treasury Bills
- **Maturity**: Less than 1 year
- **Payments**: Single payment at maturity (no coupons)
- **Required Fields**: Face value, purchase price, purchase date, maturity date

### Data Management
- **User-Specific**: Each user's data is stored separately
- **Local Storage**: Data persists in browser localStorage
- **Privacy**: No data is sent to external servers
- **Backup**: Consider exporting important data manually

## Security Features

- **Client-Side Authentication**: Secure login with password validation
- **Data Isolation**: User data is completely separated and private
- **Session Management**: Automatic logout and session handling
- **Input Validation**: Form validation and error handling
- **XSS Protection**: React's built-in XSS protection

## Browser Compatibility

- **Chrome**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+

## Support

For issues or questions:
1. Check the demo account functionality
2. Verify browser compatibility
3. Clear browser cache and localStorage if needed
4. Ensure JavaScript is enabled

## License

This project is licensed under the MIT License.

---

**Live Demo**: [Treasury Investment Tracker](https://your-railway-url.railway.app)

Built with ❤️ for Malawi investors

