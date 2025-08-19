const express = require('express');
const router = express.Router();
const db = require('../db');
const { protect, isTeacher } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/', async (req, res) => {
    try {
        const [modules] = await db.query(`
            SELECT m.id, m.title, m.short_description, m.image_url, m.created_at, m.updated_at, u.username as author
            FROM modules m
            JOIN users u ON m.author_id = u.id
            ORDER BY m.created_at DESC
        `);
        const modulesWithImageUrls = modules.map(module => ({
            ...module,
            image_url: module.image_url ? `http://localhost:5000/uploads/${module.image_url}` : null 
        }));
        res.json(modulesWithImageUrls);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

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
        const moduleWithImageUrl = {
            ...modules[0],
            image_url: modules[0].image_url ? `http://localhost:5000/uploads/${modules[0].image_url}` : null 
        };
        res.json(moduleWithImageUrl);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/', protect, isTeacher, upload.single('image'), async (req, res) => {
    const { title, short_description, full_content } = req.body;
    const author_id = req.user.id;
    const image_url = req.file ? req.file.filename : null;

    if (!title || !short_description || !full_content || !image_url) {
        return res.status(400).json({ message: 'Please provide title, short description, full content, and an image.' });
    }

    try {
        const [result] = await db.query(
            'INSERT INTO modules (title, short_description, full_content, image_url, author_id) VALUES (?, ?, ?, ?, ?)',
            [title, short_description, full_content, image_url, author_id]
        );
        res.status(201).json({ message: 'Module created successfully', moduleId: result.insertId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.put('/:id', protect, isTeacher, upload.single('image'), async (req, res) => {
    const { id } = req.params;
    const { title, short_description, full_content } = req.body;
    const author_id = req.user.id;
    const new_image_filename = req.file ? req.file.filename : null;

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

        let updateQuery = 'UPDATE modules SET title = ?, short_description = ?, full_content = ?';
        let queryParams = [title, short_description, full_content];

        if (new_image_filename) {
            updateQuery += ', image_url = ?';
            queryParams.push(new_image_filename);
        }

        updateQuery += ' WHERE id = ?';
        queryParams.push(id);

        await db.query(updateQuery, queryParams);
        res.json({ message: 'Module updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

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

        await db.query('DELETE FROM modules WHERE id = ?', [moduleId]);
        res.json({ message: 'Module deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;