const crypto=require('crypto');
const Apikey=require('../model/apikey');

async function ApiKeyGenerator(req, res) {
    try {
        const user=req.user._id;
        const key=crypto.randomBytes(32).toString('hex');
        const apiKey=await Apikey.create({
            key,
            owner:user,
        });

        return res.status(201).json({
            apiKey:apiKey.key,
            createdAt:apiKey.createAt,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({error:'Failed to create a api key'});
    }
}

module.exports={ApiKeyGenerator};
