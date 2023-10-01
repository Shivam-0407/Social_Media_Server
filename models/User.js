const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true
    },
    password:{
        type:String,
        required:true,
        select: false // find wali api k andar hum password nahee bhej rahe honge
    },
    name:{
        type:String,
        required:true
    },
    bio:{
        type:String,
    },
    avatar:{
        publicId:String, // will help us set the user's avatar/image
        url:String
    },
    followers:[ //array of objectIds representing users
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'User' // mongoose me jab 2 schemas ko relate karana hai to that's how we do it
        }
       
    ],
    followings:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'User'
        }
    ],
    posts:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'post'
        }
    ]
},{
    timestamps:true
})

module.exports = mongoose.model('User',userSchema);