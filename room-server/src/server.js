const express=require("express");
const app=express();
const denv=require("dotenv");
const cors=require("cors");
const authtRoutes=require("./routes/authRoutes");
denv.config();
const PORT=process.env.PORT || 5000;
app.use(express.json());
app.use(cors());
app.get("/",(req,res)=>{
    res.send("Hello World");
});
app.use("/api",authtRoutes);
app.listen(PORT,(svr)=>{
    console.log(`Server is running on port ${PORT}`);
});