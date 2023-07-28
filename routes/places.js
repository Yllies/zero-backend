var express = require("express");
const router = express.Router();
const User = require("../models/users");
router.post("/", (req, res) => {
  const { nickname, name, latitude, longitude } = req.body;

  const newUser = new User({
    nickname,
    name,
    latitude,
    longitude,
  });
  newUser.save().then((data) => {
    res.status(200).json({ result: true });
  });
});

module.exports = router;
