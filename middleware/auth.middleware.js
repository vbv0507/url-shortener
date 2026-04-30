const {getUser}=require('../services/auth.js');

function sendUnauthenticated(req, res) {
    if (req.originalUrl.startsWith("/api/")) {
        return res.status(401).json({ error: "Authentication required" });
    }

    return res.redirect("/");
}

async function restrictToLoggedinUserOnly(req,res,next){
    const userUid=req.cookies?.uid;
    if(!userUid)return sendUnauthenticated(req, res);
    try {
        const user=getUser(userUid);
        if(!user)return sendUnauthenticated(req, res);
        req.user=user;
        next();
    } catch (error) {
        res.clearCookie("uid", {
            httpOnly: true,
            sameSite: "lax",
            path: "/",
        });
        return sendUnauthenticated(req, res);
    }
}

module.exports={restrictToLoggedinUserOnly};
