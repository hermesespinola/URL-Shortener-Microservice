const mongoose = require('mongoose');
const { Schema } = mongoose;

const URLSchema = new Schema({
  url: String,
  index: {
    type: Number,
    unique: true,
  },
});

const URL = mongoose.model('URL', URLSchema);
module.exports = URL;
