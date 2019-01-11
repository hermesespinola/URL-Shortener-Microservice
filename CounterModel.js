const mongoose = require('mongoose');
const { Schema } = mongoose;

// Only one document that holds the count of urls
const CounterSchema = new Schema({
  count: {
    type: Number,
    default: 1,
  },
});

const Counter = mongoose.model('Counter', CounterSchema);
module.exports = Counter;
