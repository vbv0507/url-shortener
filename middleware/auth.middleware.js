const {getUser}=require('../services/auth.js');


async function restrictToLoggedinUserOnly(req,res,next){
    const userUid=req.cookies.uid;
    if(!userUid)return res.redirect("/");
    const user=getUser(userUid);
    if(!user)return res.redirect("/");
    req.user=user;
    next();
}

module.exports={restrictToLoggedinUserOnly};
