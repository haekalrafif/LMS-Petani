const express = require('express');
const router = express.Router();
const db = require('../db');
const { protect, isTeacher } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { uploadToCloudinary } = require('../config/cloudinary');

router.post('/:moduleId/materials', protect, isTeacher, upload.single('image'), async (req, res) => {
    const { moduleId } = req.params;
    const { title, content } = req.body;
    const author_id = req.user.id;
    let image_url = null;

    if (!title || !content) {
        return res.status(400).json({ message: 'Please provide a title and content for the material.' });
    }

    try {
        const [modules] = await db.query('SELECT author_id FROM modules WHERE id = ?', [moduleId]);
        if (modules.length === 0) {
            return res.status(404).json({ message: 'Module not found.' });
        }
        if (modules[0].author_id !== author_id) {
            return res.status(403).json({ message: 'User not authorized to add material to this module.' });
        }

        if (req.file) {
            const uploadResult = await uploadToCloudinary(req.file.buffer);
            image_url = uploadResult.secure_url;
        }

        const [result] = await db.query(
            'INSERT INTO materials (module_id, title, content, image_url) VALUES (?, ?, ?, ?)',
            [moduleId, title, content, image_url]
        );

        res.status(201).json({ message: 'Material added successfully', materialId: result.insertId });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error while adding material.' });
    }
});

module.exports = router;
