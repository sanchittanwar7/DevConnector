const express = require("express");
const router = express.Router();

router.get("/test", (req, res) => res.json({ msg: "Profile's working" }));

module.exports = router;
