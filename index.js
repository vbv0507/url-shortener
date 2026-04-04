const express=require('express');
const app=express();
const port=5001;
const urlRoute=require('./routes/url.js')
const connectdb=require('./connection.js');
const URL=require('./model/url.js');
const path=require('path');
connectdb('mongodb://127.0.0.1:27017/short-url').then(()=>console.log("db connectd")
)
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
