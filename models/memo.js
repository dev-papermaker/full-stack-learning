var mongoose = require("mongoose");
var Comment = require("./comment");
var Review = require("./review");

var memoSchema = new mongoose.Schema({
  memo_title: String,
  memo_description: String,
  memo_topic: String,
  memo_image: String,
  memo_location: String,
  map: {
    lat: Number,
    lng: Number
  },
  createdAt: { type: Date, default: Date.now },
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ],
  author: {
    // user reference setting?
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    username: String
  },
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment"
    }
  ],
  reviews: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Review"
    }
  ],
  rating: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model("Memo", memoSchema);
