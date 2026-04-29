const {getUser}=require('../services/auth.js');


async function restrictToLoggedinUserOnly(req,res,next){
    const userUid=req.cookies?.uid;
    if(!userUid)return res.redirect("/");
    try {
        const user=getUser(userUid);
        if(!user)return res.redirect("/");
        req.user=user;
        next();
    } catch (error) {
        res.clearCookie("uid", {
            httpOnly: true,
            sameSite: "lax",
            path: "/",
        });
        return res.redirect("/");
    }
}

module.exports={restrictToLoggedinUserOnly};
