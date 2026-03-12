import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import User from "../models/User.model.js";
export const register = async (req,res) => {
    try {
        const {username,name,email,password} = req.body;
        if(!username || !name || !email || !password){
            return res.status(400).json({
                message : "Please fill all the credentials",
                success : false
            })
        }
        // check if email already exists
        const user = await User.findOne({email});
        const temp_user = await User.findOne({username});
        if(user){
            return res.status(409).json({
                message : "Email already exists",
                success : false
            })
        }
        if(temp_user){
            return res.status(409).json({
                message : "Username already exists",
                success : false
            }) 
        }
        const hash_password = await bcrypt.hash(password,10);
        await User.create({
            username,name,email,password:hash_password
        })
        res.status(201).json({
            message : "Account Created",
            success : true
        })
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({
            message : "Server Error",
            success : false
        })
    }
}

export const login = async (req,res) => {
    try {
        const {email , password} = req.body;
        if(!email || !password){
            return res.status(400).json({
                message : "Both Email and password are required",
                success : false
            })
        }
        let user = await User.findOne({email}).select("+password");
        if(!user) {
            return res.status(404).json({
                message : "User not found",
                success : false
            })
        }
        const match_password = await bcrypt.compare(password , user.password)
        if(!match_password){
            return res.status(401).json({
                message : "Username or Password is Incorrect",
                success : false
            })
        }
        const token = jwt.sign(
            {userId : user._id},
            process.env.JWT_SECRET,
            {expiresIn:'1d'}
        )
        user = {
            userId : user._id,
            name : user.name,
            username : user.username,
            email : user.email
        }
        return res.status(200).cookie("token",token,{maxAge : 1*24*60*60*1000,httpOnly:true, sameSite:'strict', secure:true}).json({
            message : `Welcome back ${user.name}`,
            success : true,
            user : user
        })
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({
            message : "Server Error",
            success : false
        })
    }
}

export const logout = async(req,res) => {
    try {
        const token = req.cookies.token;
        if(!token){
            return res.status(401).json({
                message : "Already Logged Out",
                success : false
            })
        }
        return res.status(200).cookie("token","",{maxAge : 0, httpOnly : true, sameSite : "strict", secure : true}).json({
            message : "Logout Successfull",
            success : true
        })
    } catch (error) {
        return res.status(404).json({
            message : "Logout failed ! Try Again",
            success : true
        })
    }
}

export const updateProfile = async(req,res) => {
    try {
        const {username,email,password} = req.body;
        if(!username && !email && !password){
            return res.status(400).json({
                message : "Nothing to Update",
                success : false
            })
        }
        const userId = req.userId; //middleware se aaega
        let user = await User.findById(userId);
        if(!user){
            return res.status(400).json({
                message : "User not found",
                success : false
            })
        }
        if(username){
            const check_username = await User.findOne({username});
            if(check_username){
                return res.status(400).json({
                    message : "Username already Exists",
                    status : false
                })
            }
            user.username = username;
        }
        if(email){
            const check_email = await User.findOne({email});
            if(check_email){
                return res.status(400).json({
                    message : "Email already Exists",
                    status : false
                })
            }
            user.email = email;
        }
        if(password){
            const new_password = await bcrypt.hash(password,10);
            user.password = new_password;
        }
        await user.save();
        return res.status(200).json({
            message : "Information Updated",
            success : true
        })
    } catch(error){
        console.log(error);
        return res.status(500).json({
            message:"Server Error",
            success:false
        })
    }
}

export const getUser = async (req,res) => {
    const userId = req.userId;
    let user = await User.findById(userId).select("-password");
    if(!user){
        return res.status(404).json({
            message : "User Not Found",
            success : false
        })
    }
    user = {
        username : user.username,
        name : user.name,
        email : user.email,
        rating : user.rating ,
        contestHistory : user.contestHistory,
        friends : user.friends
    }
    return res.status(200).json({
        message : "User Info Fetched",
        user : user,
        success : true
    })
}

export const findUserByUsername = async (req, res) => {
  try {
    const { username } = req.query
    const user = await User.findOne({ username })
    if (!user) {
      return res.status(404).json({ message: "User not found", success: false })
    }
    return res.status(200).json({ 
      success: true, 
      user: { _id: user._id, username: user.username } 
    })
  } catch (error) {
    res.status(500).json({ message: "Server error" })
  }
}