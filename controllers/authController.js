const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {error,success} = require('../utils/responseWrapper');

const signUpController = async (req,res,next)=>{
    try{
       const {name ,email,password} = req.body;

       if(!email || !password ||!name){
            //return res.status(400).send('All fields are required');
            return res.send(error(400,'All fields are required'));
        }

        const oldUser = await User.findOne({email});
        if(oldUser){
            //return res.status(409).send('User already exists');
            return res.send(error(409,'User already exists'));
        }

        const hashedPassword = await bcrypt.hash(password,10);
        
        const newUser = await User.create({
            name,
            email,
            password:hashedPassword
        });

        // return res.staus(201).json({
        //     newUser
        // });

        return res.send(success(201,'User created successfully'));
         

    }catch(e){
        return res.send(error(500,e.message));
    }
}

const loginController = async (req,res,next)=>{
    try{
        const {email,password} = req.body;

        if(!email || !password){
             //return res.status(40).send('All fields are required');
             return res.send(error(400,'All fields are required'));
         }
        
         // kyu

        const user = await User.findOne({email}).select('+password'); // select ka matlab kaun kaun se field aap select karna chahte ho & if we use +(plus) to hume vo dikhega & if we do - (minus) karne par nahee dikhega
        console.log("user's data "+user);
         if(!user){
            // return res.status(404).send('User not found');
             return res.send(error(404,'User not found'));
         }

         const matched = await bcrypt.compare(password,user.password);

         if(!matched) {
           // return res.status(403).send('Incorrect password');
            return res.send(error(403,'Incorrect password'));
         }
         const accessToken = generateAccessToken({_id:user._id,});
         const refreshToken = generateRefreshToken({_id:user._id,});
         
         res.cookie('jwt_cookie_string',refreshToken,{
            httpOnly:true, // now this cookie can't be accessed by the frontend
            secure:true, // yaha hum http se https bana rahe honge hamare server se basically ek ssl ka certificate attach karte hai hum hamare frontend  me
         })
         
        //  return res.json({
        //     accessToken,
           
        //  })
        console.log("refresh token = ",refreshToken);
         return res.send(success(200,{accessToken}));
         
    }catch(e){
        return res.send(error(500,e.message));
    }
}

// internal functions to generate access token
const generateAccessToken = (data)=>{
    try{
        const token = jwt.sign(data,process.env.ACCESS_TOKEN_PRIVATE_KEY,{
            expiresIn:'1d'
        });
        console.log(token);
        return token;
    }catch(e){
        return res.send(error(500,e.message));
    }
    
}

// this api will check the refresh token validity & genreate a new access token 
const refreshAcessTokenController = async(req,res)=>{
    
    const cookies = req.cookies

    if(!cookies.jwt_cookie_string){
        //return res.status(401).send("Refresh token in cookie is required");
        return res.send(error(401,"Refresh token in cookie is required"));
    }

    const refreshToken = cookies.jwt_cookie_string;

    try{
        const decode = jwt.verify(refreshToken,process.env.REFRESH_TOKEN_PRIVATE_KEY);
        const _id = decode._id;
        console.log("decoded data "+decode);
        const accessToken = generateAccessToken({_id});

        // return res.status(201).json({accessToken})

        return res.send(success(201,{accessToken}));
    }catch(e){
        console.log(e);
        //return res.status(401).send("Invalid refresh token")
        return res.send(error(401,"Invalid refresh token"));
    }
}

const generateRefreshToken = (data)=>{
    try{
        const token = jwt.sign(data,process.env.REFRESH_TOKEN_PRIVATE_KEY,{
            expiresIn:'1y'
        });
        console.log(token);
        return token;
    }catch(e){
        console.log(e);
    }
    
}

const logoutController = async (req, res)=>{
    try {
        res.clearCookie('jwt_cookie_string',{
            httpOnly:true, // now this cookie can't be accessed by the frontend
            secure:true, // yaha hum http se https bana rahe honge hamare server se basically ek ssl ka certificate attach karte hai hum hamare frontend  me
         })

         return res.send(success(200,'user logged out successfully'));
    } catch (error) {
        return res.send(error(500,e.message));
    }
}

module.exports = {loginController,signUpController,refreshAcessTokenController,logoutController}