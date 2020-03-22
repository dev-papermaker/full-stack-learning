var mongoose = require("mongoose");

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
  ]
});

module.exports = mongoose.model("Memo", memoSchema);
