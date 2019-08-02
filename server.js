const express = require("express");
const path = require("path");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 3000;
require("dotenv").config();
app.use(express.static(path.join(__dirname, "client/build")));
// if (process.env.NODE_ENV === "production") {
//   app.use(express.static("client/build"));
// }

app.use(cors())

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// app.use(bodyParser.json())
// app.use(bodyParser.urlencoded({ extended: false }))

const routes = require("./api/routes/index");
app.use("/api", routes);
const image = require("./api/routes/image");
app.use("/api/image", image); 

app.use(function(req, res, next) {
  const err = new Error("Not Found");
  err.status = 404;
  next(err);
});

// error handler for catching unauthorized errors
app.use((err, req, res, next) => {
  if (err.name === "UnauthorizedError") {
    res.status(401);
    res.json({ message: err.name + ": " + err.message });
  }
});

// for hanlding development errors
if (app.get("env") === "development") {
  app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.render("error", {
      message: err.message,
      error: err
    });
  });
}
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname + "/client/build/index.html"));
});
// for productions errors
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.stack(err.status || 500).json({
    message: err.message,
    error: {}
  });
});

app.listen(port, () => {
  console.log(`virtualAssitant-OCR app listening on port ${port}`);
});
