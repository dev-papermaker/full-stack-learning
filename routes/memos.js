var express = require("express");
var router = express.Router();
var Memo = require("../models/memo");
var User = require("../models/user");
var Notification = require("../models/notification");
var Comment = require("../models/comment");
var middleware = require("../middleware");
var NodeGeocoder = require("node-geocoder");

var options = {
  provider: "google",
  httpAdapter: "https",
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null
};

var geocoder = NodeGeocoder(options);
//INDEX - show all memos
router.get("/", function(req, res) {
  var noMatch = null;
  if (req.query.search) {
    const regex = new RegExp(escapeRegex(req.query.search), "gi");
    Memo.find({ memo_title: regex }, function(err, allMemos) {
      if (err) {
        console.log(err);
      } else {
        if (allMemos.length < 1) {
          noMatch = "No memos match, please try again. ";
        }
        res.render("memos/index", { memos: allMemos, noMatch: noMatch });
      }
    });
  } else {
    // Get all memos from DB
    Memo.find({}, function(err, allMemos) {
      if (err) {
        console.log(err);
      } else {
        res.render("memos/index", { memos: allMemos, noMatch: noMatch });
      }
    });
  }
});

//CREATE - add new memo to DB
router.post("/", middleware.isLoggedIn, function(req, res) {
  // get data from form and add to memos array
  var memo_title = req.body.memo_title;
  var memo_description = req.body.memo_description;
  var memo_image = req.body.memo_image;
  var memo_topic = req.body.memo_topic;
  var author = {
    id: req.user._id,
    username: req.user.username
  };
  // Create a new memo and save to DB
  // When the app is scaling up, we need to use backend tech or sockets to handle the notifications instead of handling in routes/ HTTP request
  try {
    geocoder.geocode(req.body.memo_location, async function(err, data) {
      if (err || !data.length) {
        req.flash("error", "Invalid address");
        // return res.redirect("back");
      }
      var map = {
        lat: data[0].latitude,
        lng: data[0].longitude
      };
      var memo_location = data[0].formattedAddress;
      var newMemo = {
        memo_title: memo_title,
        memo_description: memo_description,
        memo_image: memo_image,
        memo_location: memo_location,
        map: map,
        memo_topic: memo_topic,
        memo_likenum: 0,
        author: author
      };
      let memo = await Memo.create(newMemo);
      let user = await User.findById(req.user._id)
        .populate("followers")
        .exec();
      // console.log(user);
      let newNotification = {
        username: req.user.username,
        memoId: memo._id
      };
      for (const follower of user.followers) {
        let notification = await Notification.create(newNotification);
        follower.notifications.push(notification);
        follower.save();
      }
      //redirect back to memos page
      res.redirect(`/memos/${memo._id}`);
    });
  } catch (err) {
    req.flash("error", err.message);
    res.redirect("back");
  }
});

//NEW - show form to create new memo
router.get("/new", middleware.isLoggedIn, function(req, res) {
  res.render("memos/new");
});

// SHOW - shows more info about one memo
router.get("/:id", function(req, res) {
  //find the memo with provided ID
  Memo.findById(req.params.id)
    .populate("comments likes")
    .exec(function(err, foundMemo) {
      if (err) {
        console.log(err);
      } else {
        //render show template with that campground
        res.render("memos/show", { memo: foundMemo });
      }
    });
});

// EDIT MEMO ROUTE
router.get("/:id/edit", middleware.checkMemoOwnership, function(req, res) {
  Memo.findById(req.params.id, function(err, foundMemo) {
    res.render("memos/edit", { memo: foundMemo });
  });
});

// UPDATE MEMO ROUTE
// IT'S A PUT REQUEST
router.put("/:id", middleware.checkMemoOwnership, function(req, res) {
  geocoder.geocode(req.body.memo_location, function(err, data) {
    if (err || !data.length) {
      req.flash("error", "Invalid address");
      return res.redirect("back");
    }
    req.body.memo.map.lat = data[0].latitude;
    req.body.memo.map.lng = data[0].longitude;
    req.body.memo.memo_location = data[0].formattedAddress;
    // FIND AND UPDATE THE MEMO
    Memo.findByIdAndUpdate(req.params.id, req.body.memo, function(
      err,
      updatedMemo
    ) {
      if (err) {
        res.redirect("/memos");
      } else {
        res.redirect("/memos/" + req.params.id);
      }
    });
  });
});

// DESTROY MEMO ROUTE
router.delete("/:id", middleware.checkMemoOwnership, function(req, res) {
  Memo.findByIdAndRemove(req.params.id, function(err, memoRemoved) {
    if (err) {
      res.redirect("/memos");
    } else {
      res.redirect("/memos");
    }
  });
});
// Memo Like Route
router.post("/:id/like", middleware.isLoggedIn, function(req, res) {
  Memo.findById(req.params.id, function(err, foundMemo) {
    if (err) {
      console.log(err);
      return res.redirect("/memos");
    }
    // check if req.user._id exists in foundMemo.likes
    var foundUserLike = foundMemo.likes.some(function(like) {
      return like.equals(req.user._id);
    });

    if (foundUserLike) {
      // user already liked, removing like
      foundMemo.likes.pull(req.user._id);
    } else {
      // adding the new user like
      foundMemo.likes.push(req.user);
    }

    foundMemo.save(function(err) {
      if (err) {
        console.log(err);
        return res.redirect("/memos");
      }
      return res.redirect("/memos/" + foundMemo._id);
    });
  });
});

function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

module.exports = router;
