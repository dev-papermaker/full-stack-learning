var Memo = require("../models/memo");
var Comment = require("../models/comment");
var Review = require("../models/review");
var middleware = {};

middleware.checkMemoOwnership = function(req, res, next) {
  // IS UER LOGGED IN?
  if (req.isAuthenticated()) {
    Memo.findById(req.params.id, function(err, foundComment) {
      if (err) {
        req.flash("error", "Memo not found!");
        res.redirect("back");
      } else {
        if (foundComment.author.id.equals(req.user._id)) {
          next();
        } else {
          req.flash("error", "You do not have permission to do that!");
          res.redirect("back");
        }
      }
    });
  } else {
    req.flash("error", "You need to be logged in to do that!");
    res.redirect("back");
  }
};

middleware.checkCommentOwnership = function(req, res, next) {
  // IS UER LOGGED IN?
  if (req.isAuthenticated()) {
    Comment.findById(req.params.comment_id, function(err, foundComment) {
      if (err) {
        res.redirect("back");
      } else {
        // DOES USER OWN THE COMMENT?
        if (foundComment.author.id.equals(req.user._id)) {
          next();
        } else {
          req.flash("error", "You do not have permission to do that!");
          res.redirect("back");
        }
      }
    });
  } else {
    req.flash("error", "You need to be logged  in first!");
    res.redirect("back");
  }
};

middleware.isLoggedIn = function(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash("error", "You need to login to do that!");
  res.redirect("/login");
};

// review middleware
middleware.checkReviewOwnership = function(req, res, next) {
  if (req.isAuthenticated()) {
    Review.findById(req.params.review_id, function(err, foundReview) {
      if (err || !foundReview) {
        res.redirect("back");
      } else {
        // does user own the comment?
        if (foundReview.author.id.equals(req.user._id)) {
          next();
        } else {
          req.flash("error", "You don't have permission to do that");
          res.redirect("back");
        }
      }
    });
  } else {
    req.flash("error", "You need to be logged in to do that");
    res.redirect("back");
  }
};

middleware.checkReviewExistence = function(req, res, next) {
  if (req.isAuthenticated()) {
    Memo.findById(req.params.id)
      .populate("reviews")
      .exec(function(err, foundMemo) {
        if (err || !foundMemo) {
          req.flash("error", "Memo not found.");
          res.redirect("back");
        } else {
          // check if req.user._id exists in foundMemo.reviews
          var foundUserReview = foundMemo.reviews.some(function(review) {
            return review.author.id.equals(req.user._id);
          });
          if (foundUserReview) {
            req.flash("error", "You already wrote a review.");
            return res.redirect("/memos/" + foundMemo._id);
          }
          // if the review was not found, go to the next middleware
          next();
        }
      });
  } else {
    req.flash("error", "You need to login first.");
    res.redirect("back");
  }
};
module.exports = middleware;
