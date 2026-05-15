const express=require('express');
const router=express.Router();
const {signup,login,logout,deleteUser,getApiKey}=require('../controller/user.js')
const { authLimiter } = require("../middleware/rateLimit.middleware.js");
const { restrictToLoggedinUserOnly } = require("../middleware/auth.middleware.js");


router.post('/',authLimiter,signup)
router.post('/login',authLimiter,login)
router.get('/logout',logout)
router.get('/api-key',restrictToLoggedinUserOnly,getApiKey);
router.delete('/deleteUser',restrictToLoggedinUserOnly,authLimiter,deleteUser);
module.exports=router;
