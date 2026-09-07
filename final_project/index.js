const express = require('express');
const session = require('express-session');

const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(
    '/customer',
    session({
        secret: 'fingerprint_customer',
        resave: false,
        saveUninitialized: false
    })
);

// Authentication middleware for protected routes
app.use('/customer/auth/*', function auth(req, res, next) {

    if (req.session && req.session.username) {
        req.username = req.session.username;
        return next();
    }

    return res.status(401).json({
        message: 'Authentication required. Please login first.'
    });
});

const PORT = process.env.PORT || 5000;

// Customer routes
app.use('/customer', customer_routes);

// Public routes
app.use('/', genl_routes);

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
