// require and configure dotenv, will load vars in .env in PROCESS.ENV
require("dotenv").config();
var http = require("http"),
  path = require("path"),
  methods = require("methods"),
  express = require("express"),
  bodyParser = require("body-parser"),
  session = require("express-session"),
  cors = require("cors"),
  passport = require("passport"),
  errorhandler = require("errorhandler"),
  mongoose = require("mongoose");

var isProduction = process.env.NODE_ENV === "production";

// Create global app object
var app = express();
// 跨來源資源共享（Cross-Origin Resource Sharing (CORS)）
// 是一種使用額外 HTTP 標頭來讓目前瀏覽網站的 user agent 能獲得訪問不同來源（網域）伺服器特定資源之權限的機制。
// 當 user agent 請求一個不是目前文件來源——來自於不同網域（domain）、通訊協定（protocol）或通訊埠（port）的資源時，
// 會建立一個跨來源 HTTP 請求（cross-origin HTTP request）。
// 所以當你在不同網域利用 ajax 或 fetch 存取 API 時會發現存取失敗的訊息，就是你未在標頭設定跨網域存取權限，
// 所以這邊就要利用 cors 來快速建立讀取權限。
// Response Headers:
// access-control-allow-origin: *
app.use(cors());

// Normal express config defaults
// HTTP request logger middleware for node.js, show response and request to it
app.use(require("morgan")("dev"));

// HTTP request parser that parse format like JSON, Raw, text, XML, URL-encoded
// parse body params and attache them to req.body
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(require("method-override")());
app.use(express.static(__dirname + "/public"));

app.use(
  session({
    secret: "secret",
    cookie: { maxAge: 60000 },
    resave: false,
    saveUninitialized: false
  })
);

if (!isProduction) {
  app.use(errorhandler());
}

if (!process.env.MONGODB_URI) {
  console.warn("Missing MONGODB_URI in env, please add it to your .env file");
}

mongoose.connect(process.env.MONGODB_URI);
if (isProduction) {
} else {
  mongoose.set("debug", true);
}

require("./models/User");
require("./models/Item");
require("./models/Comment");
require("./config/passport");

app.use(require("./routes"));

/// catch 404 and forward to error handler
app.use(function (req, res, next) {
  if (req.url === "/favicon.ico") {
    res.writeHead(200, { "Content-Type": "image/x-icon" });
    res.end();
  } else {
    const err = new Error("Not Found");
    err.status = 404;
    next(err);
  }
});

/// error handler
app.use(function(err, req, res, next) {
  console.log(err.stack);
  if (isProduction) {
    res.sendStatus(err.status || 500)
  } else {
    res.status(err.status || 500);
    res.json({
      errors: {
        message: err.message,
        error: err
      }
    });
  }
});

// finally, let's start our server...
var server = app.listen(process.env.PORT || 3000, function() {
  console.log("Listening on port " + server.address().port);
});
