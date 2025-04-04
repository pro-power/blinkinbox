// routes/index.js - Route configuration
module.exports = (app) => {
    // Import route handlers
    const emailRoutes = require('./emailRoutes');
    const userRoutes = require('./userRoutes');
    const authRoutes = require('./authRoutes');
    
    // Register routes
    app.use('/api/emails', emailRoutes);
    app.use('/api/users', userRoutes);
    app.use('/api/auth', authRoutes);
    
    // Health check endpoint
    app.get('/api/health', (req, res) => {
      res.status(200).json({ status: 'ok' });
    });
    
    // 404 handler
    app.use((req, res) => {
      res.status(404).json({ error: 'Not found' });
    });
    
    // Error handler
    app.use((err, req, res, next) => {
      console.error(err.stack);
      res.status(500).json({ error: 'Server error' });
    });
  };