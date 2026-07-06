const express=require('express');
const router=express.Router();
const {generateNewshortUrl,getanalytics,getMyLinks,getQrCode,urlexpand,deletelink}=require('../controller/url.js')
const { createUrlLimiter, analyticsLimiter } = require("../middleware/rateLimit.middleware.js");
const { restrictToLoggedinUserOnly } = require("../middleware/auth.middleware.js");
const verifyApiKey=require('../middleware/apiKey.middleware.js');
const { start } = require("../controller/client.js");

router.post('/start',start);
router.post('/', verifyApiKey, createUrlLimiter, generateNewshortUrl);
router.post('/api', verifyApiKey, createUrlLimiter, generateNewshortUrl);
router.get('/my-links', verifyApiKey, getMyLinks);
router.get('/qr/:shortId',verifyApiKey,getQrCode);
router.get('/analytics/:shortid',verifyApiKey, analyticsLimiter, getanalytics);
router.delete("/:shortId", verifyApiKey, deletelink);

router.post('/expand', analyticsLimiter, urlexpand);

module.exports = router;
