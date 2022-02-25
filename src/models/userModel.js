const mongoose = require("mongoose");
const { required } = require("nodemon/lib/config");

const bookSchema = new mongoose.Schema({
  bookName: String,
  authorName: String,
  category: String,
  year: Number,
  
},{ timestamps:true });

module.exports = mongoose.model('Books', bookSchema);