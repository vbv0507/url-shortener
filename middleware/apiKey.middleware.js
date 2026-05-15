const ApiKey=require('../model/apikey');

async function verifyApiKey(req,res,next){
  try{
    const apiKey=req.headers['x-api-key'];

    if(!apiKey){
      return res.status(401).json({
        error:'API key missing',
      });
    }

    const validKey=await ApiKey.findOne({
      key:apiKey,
    });

    if(!validKey){
      return res.status(403).json({
        error:'Invalid API key',
      });
    }

    req.user={
      _id:validKey.owner,
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
