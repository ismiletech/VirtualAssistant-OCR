const express = require("express");
const routes = require("./api/routes/index");


const port = 3000;

const logger = require("morgan");
const bodyParser = require("body-parser");
const path = require("path");
const app = express();
const cors = require("cors");

const corsOptions = {
  origin: "*",
  optionSuccessStatus: 200
};


app.set("port", process.env.PORT || 3000);

app.use(logger("dev")); //setting dev env

const distDir = __dirname + "/client/public";
app.use(express.static(distDir));

if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));
}

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.get("/", (req, res) => {
  res.send("Hello World!");
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use("/api", routes);
const image = require("./api/routes/image");
app.use("/api/image", image);
//catch 404 and forward it to the global error hanlder
app.use(function(req, res, next) {
  const err = new Error("Not Found");
  err.status = 404;
  next(err);
});

//error handler for catching unauthorized errors
app.use((err, req, res, next) => {
  if (err.name === "UnauthorizedError") {
    res.status(401);
    res.json({ message: err.name + ": " + err.message });
  }
});

//for hanlding development errors
if (app.get("env") === "development") {
  app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.render("error", {
      message: err.message,
      error: err
    });
  });
}

//for productions errors
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.stack(err.status || 500).json({
    message: err.message,
    error: {}
  });
});

app.listen(port, () =>
  console.log(`virtualAssitant-OCR app listening on port ${port}`)
);
