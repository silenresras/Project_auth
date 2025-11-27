const User = require("../models/user")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const sendEmail = require("../emails/sendEmails")

const register = async (req, res) => {
    try {
        const {name, email, password} = req.body;

        //check the required fields
        if (!name || !email || !password) {
            return res.status(400).json({message: "All fields are required"})
        }

        //check if the user exists
        const existingUser = await User.findOne({email})
        if (existingUser) {
            return res.status(400).json({message: "Email already in use"})
        }

        //Hash Password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        //create new user
        const newUser = await User.create({
            name,
            email,
            password: hashedPassword
        })

          // SEND WELCOME EMAIL
          await sendEmail({
            email: newUser.email,
            subject: "Welcome to our App!",
            message: `
                <h2>Hello ${newUser.name},</h2>
                <p>Welcome to our platform! 🎉</p>
                <p>Your account has been created successfully.</p>
                <br/>
                <p>Best Regards,<br/>Team Support</p>
            `
        });

        res.status(201).json({
            message: "User created successfully",
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
            }
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({message: "Server Error"})
    }
}

const login = async (req, res) => {
    try {
      const {email, password} = req.body
      
      //validation
      if (!email || !password) {
        res.status(201).json({message: "All fields required"})
      }

      const user = await User.findOne({email})
      if (!user) {
        res.status(400).json({message: "Invalid Credentials"})
      }

      //match password
      const isPasswordCorrect = await bcrypt.compare(password, user.password)
      if (!isPasswordCorrect) {
        res.status(400).json({message: "Incorrect Password"})
      }

      //Generate jwt
      const token = jwt.sign(
        {id: user._id},
        process.env.JWT_SECRET,
        {expiresIn: "7d"}
      )

      res.json({
        message: "Login Successful",
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email
        }
      })
    } catch (error) {
        console.error(error)
        res.status(500).json({message: "Server Error"})
    }
}



module.exports = { register, login };