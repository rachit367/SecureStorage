const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const cardModel = require('../models/card-model');
const { v4: uuidv4 } = require('uuid');
const os = require('os');
const path = require('path');
const fs = require('fs');

// Disk storage — writes temp file to OS temp dir instead of RAM
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, os.tmpdir()),
  filename: (req, file, cb) => cb(null, `${uuidv4()}${path.extname(file.originalname)}`)
});

// No fileSize limit — accepts any file size and type
const upload = multer({ storage });

router.post('/', upload.single('file'), async function (req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const userId = req.user.userId;
    const file = req.file;

    let uploadResult;
    try {
      // upload_large handles chunked uploads automatically for large files
      uploadResult = await cloudinary.uploader.upload_large(file.path, {
        resource_type: 'raw',
        public_id: `securestorage/${userId}/${uuidv4()}`,
        chunk_size: 100 * 1024 * 1024, // 100 MB chunks
        use_filename: false,
        overwrite: false
      });
    } finally {
      // Always clean up temp file regardless of upload success/failure
      fs.unlink(file.path, () => {});
    }

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
