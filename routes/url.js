const express=require('express');
const router=express.Router();
const {generateNewshortUrl,getanalytics,databaseclear}=require('../controller/url.js')
const { createUrlLimiter, analyticsLimiter } = require("../middleware/rateLimit.middleware.js");


router.post('/', createUrlLimiter, generateNewshortUrl);
router.get('/cleardata', databaseclear);
router.get('/analytics/:shortid', analyticsLimiter, getanalytics);
module.exports = router;


