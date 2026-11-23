require('dotenv').config()
const express=require("express");
const app=express();
const cors=require("cors");
const cookieParser=require("cookie-parser")
const connectDB=require('./config/db')
const port=process.env.PORT||3001


app.use(cors({
    origin:process.env.CLIENT_URL,
     credentials: true
    }))
app.use(express.json())
app.use(cookieParser())
app.use('/api/users',require("./routes/authRoutes"))

app.get('/api/users',(req,res)=>{
    res.send("Mern Authentication API running")
})

const startServer=async()=>
{
    try
    {
       await connectDB();
       app.listen(process.env.PORT,()=>
{
    console.log(`port running at the ${process.env.PORT}`)
})
    }
    catch(error)
    {
      console.log(error.message)
    }
}
startServer()