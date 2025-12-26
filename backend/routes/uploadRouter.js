const express = require('express');
const router = express.Router(); // ✅ THIS WAS MISSING
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const cardModel = require('../models/card-model');
const { v4: uuidv4 } = require('uuid');
const streamifier = require('streamifier');

// Configure multer to use memory storage (for Cloudinary)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

router.post('/', upload.single('file'), async function (req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const userId = req.user.userId;
    const file = req.file;

    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `securestorage/${userId}`,
          public_id: uuidv4(),
          resource_type: 'raw', // ✅ force download-safe upload
          overwrite: false
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });

    const downloadUrl = uploadResult.secure_url.replace(
      '/upload/',
      '/upload/fl_attachment/'
    );

    const savedCard = await cardModel.create({
      name: file.originalname,
      url: uploadResult.secure_url,
      downloadUrl,
      userId,
      cloudinaryPublicId: uploadResult.public_id
    });

    res.status(200).json({
      message: "File uploaded successfully",
      file: savedCard
    });

  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
