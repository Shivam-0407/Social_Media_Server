// it'll check whether we've authorization headers or not
// i.e. access_token hai bhee yaa nahee hai ?

const {error} = require('../utils/responseWrapper')
const User = require("../models/User");
const jwt = require('jsonwebtoken');

 module.exports = async(req,res,next)=>{
    if(!req.headers || !req.headers.authorization || !req.headers.authorization.startsWith("Bearer")){
        //return res.status(401).send("Authorization header required")
        return res.send(error(401,"Authorization header required"));
    }

    const accessToken = req.headers.authorization.split(" ")[1]; // array k do part honge usme se humne token wala part access kar liya
    console.log("accessToken checking: " + accessToken);

    try{
        const decode = jwt.verify(accessToken,process.env.ACCESS_TOKEN_PRIVATE_KEY);
        req._id = decode._id // request field me id wala part bhee daal diya hai jo ise decode karne k baad mila hai
        
        const user = await User.findById(req._id);
        if(!user){
            return res.send(error(404,'user not found'));
        }
        
        next();                    // _.id hame object_id deta hai jo mongo DB generate karta hai
    }catch(e){
        console.log(e);
        //return res.status(401).send("Invalid access key")
         return res.send(error(401,"Invalid access key"))
    }

    // next();
}