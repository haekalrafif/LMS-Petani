const express = require('express');
const router = express.Router();
const db = require('../db');
const { protect, isTeacher } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { uploadToCloudinary } = require('../config/cloudinary');

// GET all modules
router.get('/', async (req, res) => {
    try {
        const [modules] = await db.query(`
            SELECT m.id, m.title, m.short_description, m.image_url, m.created_at, m.updated_at, u.username as author
            FROM modules m
            JOIN users u ON m.author_id = u.id
            ORDER BY m.created_at DESC
        `);
        // No need to map and create URLs, image_url from DB is the full Cloudinary URL
        res.json(modules);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET a single module by ID
router.get('/:id', async (req, res) => {
    try {
        const [modules] = await db.query(`
            SELECT m.id, m.title, m.short_description, m.full_content, m.image_url, m.created_at, m.updated_at, u.username as author
            FROM modules m
            JOIN users u ON m.author_id = u.id
            WHERE m.id = ?
        `, [req.params.id]);

        if (modules.length === 0) {
            return res.status(404).json({ message: 'Module not found' });
        }
        // No need to construct URL, image_url from DB is the full Cloudinary URL
        res.json(modules[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// POST a new module
router.post('/', protect, isTeacher, upload.single('image'), async (req, res) => {
    const { title, short_description, full_content } = req.body;
    const author_id = req.user.id;
    let image_url = null;

    if (!title || !short_description || !full_content) {
        return res.status(400).json({ message: 'Please provide title, short description, and full content.' });
    }
    
    if (!req.file) {
        return res.status(400).json({ message: 'An image is required.' });
    }

    try {
        // Upload image to Cloudinary
        const uploadResult = await uploadToCloudinary(req.file.buffer);
        image_url = uploadResult.secure_url;

        const [result] = await db.query(
            'INSERT INTO modules (title, short_description, full_content, image_url, author_id) VALUES (?, ?, ?, ?, ?)',
            [title, short_description, full_content, image_url, author_id]
        );
        res.status(201).json({ message: 'Module created successfully', moduleId: result.insertId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during module creation or image upload.' });
    }
});

// PUT (update) a module
router.put('/:id', protect, isTeacher, upload.single('image'), async (req, res) => {
    const { id } = req.params;
    const { title, short_description, full_content } = req.body;
    const author_id = req.user.id;

    if (!title || !short_description || !full_content) {
        return res.status(400).json({ message: 'Please provide title, short description, and full content.' });
    }

    try {
        const [modules] = await db.query('SELECT * FROM modules WHERE id = ?', [id]);
        if (modules.length === 0) {
            return res.status(404).json({ message: 'Module not found' });
        }

        if (modules[0].author_id !== author_id) {
            return res.status(403).json({ message: 'User not authorized to update this module' });
        }

        let image_url = modules[0].image_url; // Keep old image URL by default

        // If a new file is uploaded, upload it to Cloudinary and get the new URL
        if (req.file) {
            const uploadResult = await uploadToCloudinary(req.file.buffer);
            image_url = uploadResult.secure_url;
            // Here you might also want to delete the old image from Cloudinary
        }

        const queryParams = [title, short_description, full_content, image_url, id];
        await db.query(
            'UPDATE modules SET title = ?, short_description = ?, full_content = ?, image_url = ? WHERE id = ?',
            queryParams
        );
        
        res.json({ message: 'Module updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during module update.' });
    }
});


// DELETE a module
router.delete('/:id', protect, isTeacher, async (req, res) => {
    const moduleId = req.params.id;
    const author_id = req.user.id;

    try {
        const [modules] = await db.query('SELECT * FROM modules WHERE id = ?', [moduleId]);
        if (modules.length === 0) {
            return res.status(404).json({ message: 'Module not found' });
        }

        if (modules[0].author_id !== author_id) {
            return res.status(403).json({ message: 'User not authorized to delete this module' });
        }
        
        // Note: This doesn't delete the image from Cloudinary. 
        // For a complete solution, you would add a step here to delete the image
        // using the cloudinary.uploader.destroy() method.

        await db.query('DELETE FROM modules WHERE id = ?', [moduleId]);
        res.json({ message: 'Module deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
