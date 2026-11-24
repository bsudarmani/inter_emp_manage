const mongoose = require('mongoose');
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGOURI)
    console.log("Mongodb Connected")
  }
  catch (error) {
    console.log("MongoDB Connection Error:", error.message)
    throw error;
  }
}
// mongoose.connect(process.env.MONGOURI)
// .then(()=>{
//     console.log("MongoDB connected Successfully");
// })
// .catch((err)=>{
//     console.log("MongoDB connection Error:",err)
// })
module.exports = connectDB;
