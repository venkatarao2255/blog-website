const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();

// Configure multer storage for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads');  // Save files to the 'public/uploads' folder
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Use timestamp as filename
    }
});

const upload = multer({ storage: storage });

// Show all blog posts
router.get('/', (req, res) => {
    const db = req.db;
    db.query('SELECT * FROM posts ORDER BY created_at DESC', (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).send('Database error');
        }
        res.render('index', { posts: results });
    });
});

// Show form to add a new blog post
router.get('/add', (req, res) => {
    res.render('add');
});

// Handle adding a new blog post (with media upload)
router.post('/add', upload.single('media'), (req, res) => {
    const { title, content } = req.body;
    const media = req.file ? '/uploads/' + req.file.filename : null; // Set file path or null

    const sql = 'INSERT INTO posts (title, content, media) VALUES (?, ?, ?)';
    req.db.query(sql, [title, content, media], (err, result) => {
        if (err) {
            console.error('Error adding post:', err);
            return res.status(500).send('Error adding post');
        }
        console.log('Post added:', result);
        res.redirect('/');
    });
});

// Show form to edit a blog post
router.get('/edit/:id', (req, res) => {
    const db = req.db;
    const postId = req.params.id;
    db.query('SELECT * FROM posts WHERE id = ?', [postId], (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).send('Database error');
        }
        res.render('edit', { post: result[0] });
    });
});

// Handle updating a blog post (with media upload)
router.post('/edit/:id', upload.single('media'), (req, res) => {
    const postId = req.params.id;
    const { title, content } = req.body;
    const media = req.file ? '/uploads/' + req.file.filename : null;

    const sql = 'UPDATE posts SET title = ?, content = ?, media = ? WHERE id = ?';
    req.db.query(sql, [title, content, media, postId], (err, result) => {
        if (err) {
            console.error('Error updating post:', err);
            return res.status(500).send('Error updating post');
        }
        console.log('Post updated:', result);
        res.redirect('/');
    });
});

// Handle deleting a blog post
router.get('/delete/:id', (req, res) => {
    const postId = req.params.id;
    const sql = 'DELETE FROM posts WHERE id = ?';
    req.db.query(sql, [postId], (err, result) => {
        if (err) {
            console.error('Error deleting post:', err);
            return res.status(500).send('Error deleting post');
        }
        console.log('Post deleted:', result);
        res.redirect('/');
    });
});

module.exports = router;
