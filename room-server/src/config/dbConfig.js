const mongoose = require("mongoose");
// mongoose.connect(process.env.MONGO_CONN_STR, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
// })
// I removed the Options as it is not needed for the connection of this version
const connectDB = () => {
       return mongoose.connect(process.env.MONGO_CONN_STR)
        .then((info)=>{
            console.log("MongoDB Connected");
        })
        .catch((error)=>{
        console.error("MongoDB Connection Error:", error.message);
        process.exit(1);
        });
    };
// const connectDB=async()=>{
//     try{
//     await mongoose.connect(process.env.MONGO_CONN_STR, {
//         useNewUrlParser: true,
//         useUnifiedTopology: true,
//     });
//     console.log("MongoDB Connected");
//     }
//     catch(error){
//         console.log("MongoDB Connection Failed",error.message);
//         process.exit(1);
//     }
// }
module.exports = connectDB;
