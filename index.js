const express=require('express');
const app=express();
const port = process.env.PORT || 5001;
const urlRoute=require('./routes/url.js')
const connectdb=require('./connection.js');
const URL=require('./model/url.js');
const path=require('path');
require("dotenv").config();
connectdb(process.env.MONGO_URL)
app.use(express.json());
app.set('view engine','ejs');
app.set('views',path.resolve('./views'));
async function renderHome(req,res){
    const allurls=await URL.find({}).sort({ createdAt: -1 }).lean();
    return res.render('home',{
        urls:allurls
    });
}
app.get('/',renderHome);
app.get('/test',renderHome);
app.use('/url',urlRoute);
app.listen(port,()=>{console.log(`server start at port ${port}\n`)})
