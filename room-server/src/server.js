const denv = require("dotenv");
const express = require("express");
const cors = require("cors");
const path = require('path');
const serveIndex = require('serve-index');
const app = express();
denv.config();

// Development: Show directory listing
// if (process.env.NODE_ENV !== 'production') {
//   app.use('/files', 
//     express.static(path.join(__dirname, 'files')),
//     serveIndex(path.join(__dirname, 'files'), {
//       'icons': true,
//       'view': 'details'  // Shows file details like size and modified date
//     })
//   );
// } 
// Production: Only serve static files without directory listing
// else {
  app.use('/files', express.static(path.join(__dirname, 'files')));
// }

// Error handling for missing files
app.use('/files', (req, res, next) => {
  res.status(403).send(`<html><head><title>403 - Access Forbidden</title></head><body><div style="display:flex;justify-content:center;align-items:center"><h1>403 Access Forbidden</h1></div></body></html>`);
});

const PORT = process.env.PORT || 5000;
const connectDB = require("./config/dbConfig");
connectDB();
const cookieParser = require("cookie-parser");
app.use(cookieParser());
const CORS_OPTION =
{
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
}
app.use(express.json());
app.use(cors(CORS_OPTION));

const apiRoutes = require("./routes/apiRoutes");
app.get("/", (req, res) => {
    res.send("Hello World");
});
app.use("/api", apiRoutes);
app.listen(PORT, (svr) => {
    console.log(`Server is running on port ${PORT}`);
});