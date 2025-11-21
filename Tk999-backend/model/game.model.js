const mongoose = require('mongoose');

const GameSchema = new mongoose.Schema({
  gameAPIID: { type: String, required: true },
  image: { type: String, required: true },
  subOptions: { type: mongoose.Schema.Types.ObjectId, ref: 'SubOption' },
  isHotGame: { type: Boolean, default: false }
});

const GameModel = mongoose.model('Game', GameSchema);

module.exports = GameModel;