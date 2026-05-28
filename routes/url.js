const express=require('express');
const router=express.Router();
const {generateNewshortUrl,getanalytics,getMyLinks,getQrCode,urlexpand,deletelink}=require('../controller/url.js')
const { createUrlLimiter, analyticsLimiter } = require("../middleware/rateLimit.middleware.js");
const { restrictToLoggedinUserOnly } = require("../middleware/auth.middleware.js");
const verifyApiKey=require('../middleware/apiKey.middleware.js');
const { start } = require("../controller/client.js");

router.post('/start',start);

router.post('/', restrictToLoggedinUserOnly, createUrlLimiter, generateNewshortUrl);
router.post('/api', verifyApiKey, createUrlLimiter, generateNewshortUrl);
router.get('/my-links', restrictToLoggedinUserOnly, getMyLinks);
router.get('/qr/:shortId',restrictToLoggedinUserOnly,getQrCode);
router.get('/analytics/:shortid',restrictToLoggedinUserOnly, analyticsLimiter, getanalytics);
router.delete("/:shortId", restrictToLoggedinUserOnly, deletelink);

router.post('/expand', analyticsLimiter, urlexpand);

module.exports = router;
