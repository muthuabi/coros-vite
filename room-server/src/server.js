const denv = require("dotenv");
const express = require("express");
const cors = require("cors");
const app = express();
denv.config();
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