const express=require('express');
const router=express.Router();
const {signup,login}=require('../controller/user.js')



router.post('/',signup)
router.post('/login',login)
module.exports=router;