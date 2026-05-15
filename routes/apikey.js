const express=require('express');
const router=express.Router();
const {ApiKeyGenerator}=require('../controller/apikey');
const { restrictToLoggedinUserOnly } = require("../middleware/auth.middleware.js");

router.post('/generate',restrictToLoggedinUserOnly,ApiKeyGenerator);

module.exports=router;
