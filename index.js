const express = require('express');
const dotenv = require('dotenv');
const dbConnect = require('./dbConnect');
const authRouter = require('./routers/authRouter');
const postRouter = require('./routers/postRouter');
const userRouter = require('./routers/userRouter');
const cloudinary = require('cloudinary').v2;
const cors = require('cors');


const morgan = require('morgan');
const cookieParser = require('cookie-parser');


dotenv.config('./.env');
//Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
  });

const app = express();

//middlewares
app.use(express.json({limit:'10mb'}));
app.use(morgan('common'))
app.use(cookieParser());

app.use(cors({
    credentials:true,
    origin:'http://localhost:3000'
}));

app.use('/auth',authRouter);
app.use('/posts',postRouter);
app.use('/user',userRouter);

app.use('/',(req,res,next) => {
    res.status(200).send('Ok from server');
})

const port = process.env.PORT || 4000;

dbConnect();

app.listen(port,()=>{
    console.log('listening on port '+port);
})