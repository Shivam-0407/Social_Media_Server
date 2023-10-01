const mongoose = require('mongoose');

const postSchema = mongoose.Schema({
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User', // ye jo owner hai
        required:true
    },
    image:{
        publicId:String,
        url:String
    },
    caption:{
        type:String,
        required:true
    },
    likes:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'User'
        }
    ]
},{
    timestamps:true
})

module.exports = mongoose.model('post', postSchema);