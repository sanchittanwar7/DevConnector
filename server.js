const express = require("express");
const mongoose = require("mongoose");
const app = express();
const bodyParser = require("body-parser");
const passport = require("passport");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//DB Config
const db = require("./config/keys").mongoURI;

//Connect DB
mongoose
  .connect(db)
  .then(() => console.log("DB connected successfully"))
  .catch(err => console.log("error", err));

//Import routes
const users = require("./routes/api/users");
const profile = require("./routes/api/profile");
const posts = require("./routes/api/posts");

app.use("/api/users", users);
app.use("/api/profile", profile);
app.use("/api/posts", posts);
app.use(passport.initialize());
require("./config/passport")(passport);

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("Hello");
});

app.listen(PORT, () => console.log(`Server running at port ${PORT}`));
