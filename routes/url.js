const express=require('express');
const router=express.Router();
const {generateNewshortUrl,redirecturl,getanalytics,databaseclear}=require('../controller/url.js')

router.post('/',generateNewshortUrl);
router.get('/cleardata',databaseclear);
router.get('/analytics/:shortid',getanalytics);
router.get('/:shortId',redirecturl);
module.exports=router;

