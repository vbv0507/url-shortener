const sessionIdToUser=new Map();
const jwt=require('jsonwebtoken');
const secret='vaibhav'
function setUser(user){
    return jwt.sign({
        _id:user._id,
        email:user.email,
    },secret);
}

function getUser(token){
    return jwt.verify(token,secret)
}

module.exports={setUser,getUser}