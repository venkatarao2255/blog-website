const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');

const multer = require('multer');
const path = require('path');
const blogRoutes = require('./routes/blogRoutes');

const app = express();

// Set up static file serving
app.use(express.static(path.join(__dirname, 'public')));

// Body Parser Middleware
app.use(bodyParser.urlencoded({ extended: true }));

// Set view engine
app.set('view engine', 'ejs');

// Set up MySQL connection
const db = mysql.createConnection({
    host: 'localhost',       // Change if using a remote DB
    user: 'root',            // Your DB username
    password: 'mysql143@',    // Your DB password
    database: 'blogDB'       // Your database name
});

// Connect to MySQL database
db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err.stack);
        return;
    }
    console.log('Connected to MySQL');
});

// Pass the DB connection to routes
app.use((req, res, next) => {
    req.db = db;
    next();
});

// Use routes for blog functionality
app.use('/', blogRoutes);

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
