const express = require("express");
const router = express.Router();
const gravatar = require("gravatar");
const User = require("../../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");
const password = require("passport");
const validateRegistrationData = require("../../validations/register");
const validateLoginData = require("../../validations/login");

router.get("/test", (req, res) => res.json({ msg: "User's working" }));

router.post("/register", (req, res) => {
  const { errors, isValid } = validateRegistrationData(req.body);
  if (!isValid) {
    return res.status(400).json({ errors });
  }

  User.findOne({ email: req.body.email }).then(user => {
    if (user) {
      errors.errors.email = "Email already exists";
      return res.status(400).json(errors.errors);
    }
    const avatar = gravatar.url(req.body.email, {
      s: "200",
      r: "pg",
      d: "mm"
    });
    const newUser = new User({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      avatar
    });
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(newUser.password, salt, (err, hash) => {
        if (err) throw err;
        newUser.password = hash;
        newUser
          .save()
          .then(user => res.json(user))
          .catch(err => console.log(err));
      });
    });
  });
});

router.post("/login", (req, res) => {
  const errors = validateLoginData(req.body);
  if (!errors.isValid) {
    return res.status(400).json(errors.errors);
  }

  const email = req.body.email;
  const password = req.body.password;
  User.findOne({ email }).then(user => {
    if (!user) {
      errors.errors.email = "User not found";
      return res.status(404).json(errors.errors);
    }

    bcrypt.compare(password, user.password).then(isMatch => {
      if (!isMatch) {
        errors.errors.password = "Password invalid";
        return res.status(400).json(errors.errors);
      }
      const payload = {
        name: user.name,
        id: user.id,
        avatar: user.avatar
      };
      jwt.sign(payload, keys.secretOrKey, { expiresIn: 3600 }, (err, token) => {
        res.json({
          success: true,
          token: "Bearer " + token
        });
      });
    });
  });
});

router.get(
  "/current",
  password.authenticate("jwt", { session: false }),
  (req, res) => {
    res.json({
      name: req.user.name,
      id: req.user.id,
      avatar: req.user.avatar
    });
  }
);

module.exports = router;
