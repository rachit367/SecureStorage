const express = require('express');
const router = express.Router();
const cardModel = require("../models/card-model");
const cloudinary = require('../config/cloudinary');

router.delete("/:id", async function (req, res) {
  try {
    const userId = req.user.userId;
    const cardId = req.params.id;

    // Find the card and verify it belongs to the user
    const deletedCard = await cardModel.findOne({ _id: cardId, userId: userId });

    if (!deletedCard) {
      return res.status(404).json({ message: 'Card not found or unauthorized' });
    }

    // Delete from Cloudinary if cloudinaryPublicId exists
    if (deletedCard.cloudinaryPublicId) {
      try {
        const result = await cloudinary.uploader.destroy(deletedCard.cloudinaryPublicId);
        if (result.result === 'ok') {
          console.log(`File ${deletedCard.cloudinaryPublicId} deleted from Cloudinary`);
        } else {
          console.log(`File ${deletedCard.cloudinaryPublicId} not found in Cloudinary`);
        }
      } catch (cloudinaryError) {
        console.error("Cloudinary deletion error:", cloudinaryError);
        // Continue with DB deletion even if Cloudinary deletion fails
      }
    }

    // Delete from database
    await cardModel.findByIdAndDelete(cardId);

    res.status(200).json({ 
      message: 'Deleted successfully', 
      id: cardId 
    });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
