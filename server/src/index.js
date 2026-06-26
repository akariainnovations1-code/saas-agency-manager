const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { sequelize, User } = require('./models');
const seed = require('./scripts/seed');

// Import Route Handlers
const authRoutes = require('./routes/authRoutes');
const crmRoutes = require('./routes/crmRoutes');
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');
const salesRoutes = require('./routes/salesRoutes');
const leadRoutes = require('./routes/leadRoutes');
const teamRoutes = require('./routes/teamRoutes');
const documentRoutes = require('./routes/documentRoutes');
const reportsRoutes = require('./routes/reportsRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const proposalRoutes = require('./routes/proposalRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const aiRoutes = require('./routes/aiRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const integrationRoutes = require('./routes/integrationRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const settingsRoutes = require('./routes/settingsRoutes');

const app = express();

// --- SECURITY AND HARDENING MIDDLEWARES ---

// 1. Enforce HTTPS Redirection in Production
const enforceHttps = (req, res, next) => {
  if (process.env.NODE_ENV === 'production' && req.headers['x-forwarded-proto'] !== 'https') {
    return res.redirect(`https://${req.headers.host}${req.url}`);
  }
  next();
};
app.use(enforceHttps);

// 2. Strict Security Headers (CSP, FrameGuard, HSTS, Referrer, Sniffing)
const securityHeaders = (req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://images.unsplash.com https://unsplash.com; connect-src 'self' https://* http://localhost:5000 http://localhost:5173"
  );
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
};
app.use(securityHeaders);

// 3. Recursive Input XSS escaping Sanitizer
const sanitizeString = (val) => {
  if (typeof val !== 'string') return val;
  // If it's a JSON array/object string, parse it, sanitize recursively, and stringify it back
  if (val.trim().startsWith('[') || val.trim().startsWith('{')) {
    try {
      const parsed = JSON.parse(val);
      const sanitized = sanitizeObject(parsed);
      return JSON.stringify(sanitized);
    } catch (e) {
      // Continue to default character replacement
    }
  }
  return val
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      if (typeof obj[key] === 'object') {
        sanitizeObject(obj[key]);
      } else if (typeof obj[key] === 'string') {
        obj[key] = sanitizeString(obj[key]);
      }
    }
  }
  return obj;
};

const xssSanitizer = (req, res, next) => {
  if (req.body) req.body = sanitizeObject(req.body);
  if (req.query) req.query = sanitizeObject(req.query);
  if (req.params) req.params = sanitizeObject(req.params);
  next();
};
app.use(xssSanitizer);

// 4. In-Memory Brute Force Rate Limiter & IP Blocklist
const loginAttemptsMap = new Map();
const blockedIPs = new Set();

const loginRateLimiter = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;

  // Bypass local development loopback addresses from rate limiting
  if (ip === '::1' || ip === '127.0.0.1' || ip === '::ffff:127.0.0.1') {
    return next();
  }

  if (blockedIPs.has(ip)) {
    return res.status(403).json({ message: 'Access denied due to suspicious activity. IP blocked.' });
  }

  // Only apply limiter to authentication login endpoint
  if (req.path === '/api/auth/login' || req.path === '/login') {
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute window
    const maxRequests = 10;

    if (!loginAttemptsMap.has(ip)) {
      loginAttemptsMap.set(ip, []);
    }

    const timestamps = loginAttemptsMap.get(ip).filter(t => now - t < windowMs);
    timestamps.push(now);
    loginAttemptsMap.set(ip, timestamps);

    if (timestamps.length > maxRequests) {
      blockedIPs.add(ip);
      console.warn(`🚨 Brute-Force Warning: IP ${ip} blocked for 30 minutes due to rate-limit violation.`);
      
      // Auto-unblock after 30 minutes
      setTimeout(() => {
        blockedIPs.delete(ip);
        loginAttemptsMap.delete(ip);
        console.log(`ℹ️ IP Block auto-released for: ${ip}`);
      }, 30 * 60 * 1000);

      return res.status(429).json({ 
        message: 'Too many login attempts from this IP. Blocked temporarily for 30 minutes.' 
      });
    }
  }

  next();
};
app.use(loginRateLimiter);

// --- BASE EXPRESS MIDDLEWARES ---
app.use(cors());
app.use(express.json());

// --- ROUTES MOUNTING ---
app.use('/api/auth', authRoutes);
app.use('/api/crm', crmRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/proposals', proposalRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/integrations', integrationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/settings', settingsRoutes);

// Health Check / Diagnostics
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date(),
    database: sequelize.options.dialect,
    node: process.version
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('💥 Server Error:', err.stack);
  res.status(500).json({
    message: 'An internal server error occurred.',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// --- SERVER STARTUP ---
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Authenticate and synchronize schemas
    await sequelize.authenticate();
    console.log('📡 Database connection established successfully.');

    // sync models
    await sequelize.sync();
    console.log('📁 Database schema synced successfully.');

    // Auto-seed database if no users exist
    const userCount = await User.count();
    if (userCount === 0) {
      console.log('🤖 Local database is empty. Auto-seeding agency datasets...');
      await seed();
    }

    app.listen(PORT, () => {
      console.log(`🚀 Premium SaaS Backend listening on http://localhost:${PORT}`);
      console.log(`🔌 Mode: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Failed to initialize SaaS server:', error);
    process.exit(1);
  }
};

startServer();

