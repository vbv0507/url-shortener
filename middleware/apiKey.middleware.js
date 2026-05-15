const User=require('../model/user');

async function verifyApiKey(req,res,next){
  try{
    const apiKey=req.headers['x-api-key'];

    if(!apiKey){
      return res.status(401).json({
        error:'API key missing',
      });
    }

    const validUser=await User.findOne({
      apiKey,
    });

    if(!validUser){
      return res.status(403).json({
        error:'Invalid API key',
      });
    }

    req.user={
      _id:validUser._id,
    };

    next();

  }catch(err){
    console.log(err);

    return res.status(500).json({
      error:'API auth failed',
    });
  }
}

module.exports=verifyApiKey;
