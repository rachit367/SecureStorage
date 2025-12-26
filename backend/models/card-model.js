const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    cloudinaryPublicId: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);


const cardModel = mongoose.model('card', cardSchema);

module.exports = cardModel;
