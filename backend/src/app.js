// app.js
const express = require("express");
const cors = require("cors");
const sessionMiddleware = require("./middleware/session");
const { enforceHttps } = require("./middleware/httpsMandate.js");
const { limiter } = require("./middleware/limiter");
const helmet = require("helmet");
require("dotenv").config();

const app = express();

app.use(express.json());
app.use(helmet());
// app.use(
//   helmet.contentSecurityPolicy({
//     directives: {
//       defaultSrc: ["'self'"],
//       scriptSrc: ["'self'"],
//       styleSrc: ["'self'"],
//       imgSrc: ["'self'"],
//       connectSrc: ["'self'"],
//       fontSrc: ["'self'"],
//       objectSrc: ["'none'"],
//     },
//   })
// );
app.set("trust proxy", 1);
// // app.use(enforceHttps);
// app.use(sessionMiddleware);

// const normalRoutes = require("./routes/route.js");
// app.use("/", normalRoutes);
// const path = require("path");
// app.use(express.static(path.join(__dirname, "..", "..", "frontend")));
// app.use(express.static(path.join(__dirname, "..", "..", "frontend")));
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on 0.0.0.0:${PORT}`);

  const scheduleNextPost = require("./utils/scheduler");

  scheduleNextPost(20000);
});
