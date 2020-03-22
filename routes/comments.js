var express = require("express");
var router = express.Router({ mergeParams: true });
var Memo = require("../models/memo");
var Comment = require("../models/comment");
var middleware = require("../middleware");


// ======================
// COMMENTS ROUTES
// ======================

// NEW COMMENTS FORM
router.get("/new", middleware.isLoggedIn, function (req, res) {
    Memo.findById(req.params.id, function (err, memo) {
        if (err) {
            console.log(err);
        }
        else {
            res.render("comments/new", { memo: memo });
        }
    });

});

// CREATE COMMENTS
router.post("/", middleware.isLoggedIn, function (req, res) {
    // lookup memo using ID
    Memo.findById(req.params.id, function (err, memo) {
        if (err) {
            console.log(err);
            res.redirect("/memos");
        }
        else {
            // create new comment
            Comment.create(req.body.comment, function (err, comment) {
                if (err) {
                    req.flash("error", "Something went wrong!");
                    console.log(err);
                    res.redirect("/memos");
                }
                else {
                    // add username and id to comment
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    // save comment
                    comment.save();
                    // connect new comment to memo
                    // redirect memo show page
                    memo.comments.push(comment);
                    memo.save();
                    req.flash("success", "Successfully added comment!");
                    res.redirect("/memos/" + memo._id);
                }
            });
        }
    });
});


// EDIT COMMENTS
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function (req, res) {
    Comment.findById(req.params.comment_id, function (err, foundComment) {
        if (err) {
            res.redirect("back");
        }
        else {
            res.render("comments/edit", { memo_id: req.params.id, comment: foundComment });
        }
    });

});


// UPDATE COMMENTS
router.put("/:comment_id", middleware.checkCommentOwnership, function (req, res) {
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function (err, updatedCommnet) {
        if (err) {
            res.redirect("back");
        }
        else {
            res.redirect("/memos/" + req.params.id);
        }
    });
});

// DELETE COMMENTS
router.delete("/:comment_id", middleware.checkCommentOwnership, function (req, res) {
    Comment.findByIdAndRemove(req.params.comment_id, function (err) {
        if (err) {
            res.redirect("back");
        }
        else {
            req.flash("success", "Comment deleted!");
            res.redirect("/memos/" + req.params.id);
        }
    });
});



module.exports = router;
