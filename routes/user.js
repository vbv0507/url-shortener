const express=require('express');
const router=express.Router();
const {signup,login,logout}=require('../controller/user.js')
const { authLimiter } = require("../middleware/rateLimit.middleware.js");


router.post('/',authLimiter,signup)
router.post('/login',authLimiter,login)
router.get('/logout',logout)
module.exports=router;
