var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");
var Memo = require("../models/memo");
var Notification = require("../models/notification");
var { isLoggedIn } = require("../middleware");
var async = require("async");
var nodemailer = require("nodemailer");
var crypto = require("crypto");

router.get("/", function(req, res) {
  res.render("landing");
});

// =====================
// AUTH ROUTES
// =====================

// REGISTER ROUTE
// REGISTER FORM
router.get("/register", function(req, res) {
  res.render("register");
});

// HANDLE REGISTER LOGIC
router.post("/register", function(req, res) {
  var newUser = new User({
    username: req.body.username,
    email: req.body.email,
    avatar: req.body.avatar,
    company: req.body.company,
    industry: req.body.industry
  });
  User.register(newUser, req.body.password, function(err, user) {
    if (err) {
      req.flash("error", err.message);
      return res.redirect("/register");
    }
    passport.authenticate("local")(req, res, function() {
      req.flash("success", "Welcome to GPP, " + user.username);
      res.redirect("/memos");
    });
  });
});

// SHOW LOGIN FORM
router.get("/login", function(req, res) {
  res.render("login");
});

// HANDLE LOGIN LOGIC
router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/memos",
    failureRedirect: "/login"
  }),
  function(req, res) {}
);

// LOGOUT ROUTE
router.get("/logout", function(req, res) {
  req.logout();
  req.flash("success", "Logged you out!");
  res.redirect("/memos");
});

// FORGOT PASSWORD
router.get("/forgot", function(req, res) {
  res.render("forgot");
});

router.post("/forgot", function(req, res, next) {
  //waterfall(tasks, callbackopt)
  async.waterfall(
    [
      function(done) {
        crypto.randomBytes(20, function(err, buf) {
          var token = buf.toString("hex");
          done(err, token);
        });
      },
      function(token, done) {
        User.findOne({ email: req.body.email }, function(err, user) {
          if (!user) {
            req.flash("error", "No account with that email address exists.");
            return res.redirect("/forgot");
          }

          user.resetPasswordToken = token;
          user.resetPasswordExpires = Date.now() + 3600000;

          user.save(function(err) {
            done(err, token, user);
          });
        });
      },
      function(token, user, done) {
        var smtpTransport = nodemailer.createTransport({
          service: "Gmail",
          auth: {
            user: "ikeikeike1024@gmail.com",
            pass: process.env.GMAILPW
          }
        });
        var mailOptions = {
          to: user.email,
          from: "ikeikeike1024@gmail.com",
          subject: "GPP Password Reset",
          text:
            "Hi " +
            user.username +
            ",\n\n" +
            "You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n" +
            "Please click on the following link, or paste this into your browser to complete the process:\n\n" +
            "http://" +
            req.headers.host +
            "/reset/" +
            token +
            "\n\n" +
            "If you did not request this, please ignore this email and your password will remain unchanged.\n"
        };
        smtpTransport.sendMail(mailOptions, function(err) {
          console.log("mail sent");
          req.flash(
            "success",
            "An email has been sent to " +
              user.email +
              " with further instructions."
          );
          done(err, "done");
        });
      }
    ],
    function(err) {
      if (err) return next(err);
      res.redirect("/forgot");
    }
  );
});

// RESET PASSWORD
router.get("/reset/:token", function(req, res) {
  User.findOne(
    {
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() }
    },
    function(err, user) {
      if (!user) {
        req.flash("error", "Password reset token is invalid or has expired.");
        return res.redirect("/forgot");
      }
      res.render("reset", { token: req.params.token });
    }
  );
});

router.post("/reset/:token", function(req, res) {
  async.waterfall(
    [
      function(done) {
        User.findOne(
          {
            resetPasswordToken: req.params.token,
            resetPasswordExpires: { $gt: Date.now() }
          },
          function(err, user) {
            if (!user) {
              req.flash(
                "error",
                "Password reset token is invalid or has expired."
              );
              return res.redirect("back");
            }
            if (req.body.password === req.body.confirm) {
              user.setPassword(req.body.password, function(err) {
                user.resetPasswordToken = undefined;
                user.resetPasswordExpires = undefined;

                user.save(function(err) {
                  req.logIn(user, function(err) {
                    done(err, user);
                  });
                });
              });
            } else {
              req.flash("error", "Passwords do not match.");
              return res.redirect("back");
            }
          }
        );
      },
      function(user, done) {
        var smtpTransport = nodemailer.createTransport({
          service: "Gmail",
          auth: {
            user: "ikeikeike1024@gmail.com",
            pass: process.env.GMAILPW
          }
        });
        var mailOptions = {
          to: user.email,
          from: "ikeikeike1024@mail.com",
          subject: "Your password has been changed",
          text:
            "Hello " +
            user.username +
            ",\n\n" +
            "This is a confirmation that the password for your account " +
            user.email +
            " has just been changed.\n"
        };
        smtpTransport.sendMail(mailOptions, function(err) {
          req.flash("success", "Success! Your password has been changed.");
          done(err);
        });
      }
    ],
    function(err) {
      res.redirect("/memos");
    }
  );
});

// USER PROFILE
router.get("/users/:id", async function(req, res) {
  try {
    let user = await User.findById(req.params.id)
      .populate("followers")
      .exec();
    let memos = await Memo.find()
      .where("author.id")
      .equals(user._id)
      .exec(function(err, memos) {
        if (err) {
          req.flash("error", "Something went wrong.");
          res.redirect("/");
        }
        res.render("users/show", { user, memos });
      });
  } catch (err) {
    req.flash("error", err.message);
    return res.redirect("back");
  }

  // old version profile
  // User.findById(req.params.id, function(err, foundUser) {
  //   if (err) {
  //     req.flash("error", "Something went wrong.");
  //     return res.redirect("/memos");
  //   }
  //   Memo.find()
  //     .where("author.id")
  //     .equals(foundUser._id)
  //     .exec(function(err, memos) {
  //       if (err) {
  //         req.flash("error", "Something went wrong.");
  //         return res.redirect("/memos");
  //       }
  //       res.render("users/show", { user: foundUser, memos: memos });
  //     });
  // });
  //end
});

// FOLLOW USER
router.get("/follow/:id", isLoggedIn, async function(req, res) {
  try {
    let user = await User.findById(req.params.id);
    user.followers.push(req.user._id);
    user.save();
    req.flash("success", "Successfully followed " + user.username + "!");
    res.redirect("/users/" + req.params.id);
  } catch (err) {
    req.flash("error", err.message);
    res.redirect("back");
  }
});

// View all notifications
router.get("/notifications", isLoggedIn, async function(req, res) {
  try {
    let user = await User.findById(req.user._id)
      .populate({
        path: "notifications",
        options: { sort: { _id: -1 } }
      })
      .exec();
    let allNotifications = user.notifications;
    res.render("notifications/index", { allNotifications });
  } catch (err) {
    req.flash("error", err.message);
    res.redirect("back");
  }
});

// handle notification
router.get("/notifications/:id", isLoggedIn, async function(req, res) {
  try {
    let notification = await Notification.findById(req.params.id);
    notification.isRead = true;
    notification.save();
    res.redirect(`/memos/${notification.memoId}`);
  } catch (err) {
    req.flash("error", err.message);
    res.redirect("back");
  }
});

module.exports = router;
