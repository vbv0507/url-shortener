const User=require('../model/user')
const {v4:uuidv4}=require('uuid')
const { setUser }=require('../services/auth.js')
const authCookieOptions = {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
};

async function signup(req, res) {
    try {
        console.log("BODY:", req.body);

        const { name, email, password, user_id } = req.body || {};

        if (!name || !email || !password || !user_id) {
            return res.status(400).json({ message: "Missing required signup fields" });
        }

        await User.create({
            name,
            email,
            password,
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

        
        if (user.password !== password) {
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

module.exports={signup,login,logout}
