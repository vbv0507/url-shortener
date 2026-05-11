const express=require('express');
const router=express.Router();
const {generateNewshortUrl,getanalytics,getMyLinks,getQrCode,urlexpand}=require('../controller/url.js')
const { createUrlLimiter, analyticsLimiter } = require("../middleware/rateLimit.middleware.js");
const { restrictToLoggedinUserOnly } = require("../middleware/auth.middleware.js");


router.post('/', restrictToLoggedinUserOnly, createUrlLimiter, generateNewshortUrl);
router.get('/my-links', restrictToLoggedinUserOnly, getMyLinks);
router.get('/qr/:shortId',restrictToLoggedinUserOnly,getQrCode);
router.get('/analytics/:shortid',restrictToLoggedinUserOnly, analyticsLimiter, getanalytics);
router.post('/expand', analyticsLimiter, urlexpand);

module.exports = router;
