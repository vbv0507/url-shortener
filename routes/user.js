const express=require('express');
const router=express.Router();
const {signup,login,logout}=require('../controller/user.js')



router.post('/',signup)
router.post('/login',login)
router.get('/logout',logout)
module.exports=router;
