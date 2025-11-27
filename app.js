const express = require('express')
const authRouter = require('./routes/authRouter')
const dotenv = require("dotenv")
const connectDB = require("./db/db")

//middleware
dotenv.config()
const app = express();


//Routes
app.use(express.json())
app.use("/auth", authRouter)

//connect to mongoDB
connectDB();


const PORT = process.env.PORT || 8000
app.listen(PORT, (error) => {

    if (error) {
        throw error
    }

    console.log(`Express app running - Listening at port ${PORT}`)

})