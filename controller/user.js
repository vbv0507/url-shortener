const User=require('../model/user')
const URL = require("../model/url");
const { setUser }=require('../services/auth.js')
const authCookieOptions = {
    httpOnly: true,
    secure:true,
    sameSite: 'lax',
    path: '/',
};
const bcrypt=require("bcrypt");
async function signup(req, res) {
    try {
        console.log("BODY:", req.body);

        const { name, email, password, user_id } = req.body || {};

        if (!name || !email || !password || !user_id) {
            return res.status(400).json({ message: "Missing required signup fields" });
        }
        const hashedPassword=await bcrypt.hash(password,10);
        await User.create({
            name,
            email,
            password:hashedPassword,
            user_id
        });

        return res.json({ message: "User created" }).redirect('/login');

    } catch (err) {
        console.error(err);
        return res.status(500).send(err.message);
    }
}


async function login(req, res) {
    try {
        console.log("BODY:", req.body);

        const { email, password, user_id } = req.body || {};

        if ((!email && !user_id) || !password) {
            return res.status(400).json({ message: "Missing login credentials" });
        }
        
        const user = await User.findOne({
            $or: [{ email }, { user_id }]
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const isMatch=await bcrypt.compare(password,user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Wrong password" });
        }

        const token=setUser(user);

       res.cookie("uid", token, authCookieOptions);

       return res.redirect("/home");

    } catch (err) {
        console.error(err);
        return res.status(500).send(err.message);
    }
}

async function logout(req, res) {
    res.clearCookie("uid", authCookieOptions);
    return res.redirect("/");
}
async function deleteUser(req,res){
    try {
        const { password } = req.body || {};

        if (!req.user?._id) {
            return res.status(401).json({ message: "Authentication required" });
        }

        if (!password) {
            return res.status(400).json({ message: "Password is required" });
        }

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: "Wrong password" });
        }

        await URL.deleteMany({ createdBy: user._id });
        await User.deleteOne({ _id: user._id });

        res.clearCookie("uid", authCookieOptions);
        return res.status(200).json({ message: "User deleted successfully" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Unable to delete user right now" });
    }
}
module.exports={signup,login,logout,deleteUser}
