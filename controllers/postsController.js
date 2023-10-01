const Post = require('../models/Post');
const User = require('../models/User');
const { mapPostOutput } = require('../utils/Utils');
const {success,error} = require('../utils/responseWrapper');
const cloudinary = require('cloudinary').v2;

const createPostController = async(req,res)=>{

    try{
        const {caption,postImg} = req.body;

        if(!caption || !postImg){
            return res.send(error(400,'Caption is required'));
        }
        
        

        const cloudImg = await cloudinary.uploader.upload(postImg,{
            folder:'postImg'
        })

        const owner = req._id; // ye hamarae middleware se aa raha hoga
        console.log("owner: " + owner);
        const user = await User.findById(req._id);

        const post = await Post.create({
            owner,
            caption,
            image:{
                publicId:cloudImg.public_id,
                url:cloudImg.url
            } 
        });

        user.posts.push(post._id);
        await user.save();

        return res.send(success(201,{post}));
    }catch(e){
       return  res.send(error(500,e.message));
    }
   
}

const likeAndUnlikePost = async (req, res, next) => {

    try {
        const {postId} = req.body;
        const currUserId = req._id; //

        const post = await Post.findById(postId).populate('owner');

        console.log("Post = " + post);
        console.log("currUserId = " + currUserId);

        if(!post){
            return res.send(error(404,'Post not found'));
        }

        if(post.likes.includes(currUserId)){
            const index = post.likes.indexOf(currUserId);
            post.likes.splice(index,1);

            //Updating in 2nd last video
            // await post.save();

            // return res.send(success(200,"Post Unliked"))
        }else{
            post.likes.push(currUserId);
            // await post.save();
            // return res.send(success(200,"Post Liked"))
        }
        await post.save();
        return res.send(success(200,{post: mapPostOutput(post,req._id)}));

    } catch (e) {
        return res.send(error(500,e.message));
    }

    
}


const updatePostController = async (req, res) => {
    try {
        const {postId,caption} = req.body;
        const currUserId = req._id;

        const post = await Post.findById(postId);
        if(!post) {
            return res.send(error(404, "Post Not Found"));
        }

        if(post.owner.toString()!== currUserId){
            return res.send(error(403,"Only users can update their posts"));
        }

        if(caption) {
            post.caption = caption;
        }

        await post.save();
        return res.send(success(200, {post}));
    } catch (error) {
        return res.send(error(500,e.message));
    }

    

}

const deletePost = async (req, res) => {
    try {
        const {postId} = req.body;
     const currUserId  = req._id;

        const post = await Post.findById(postId);
        const currUser = await User.findById(currUserId);
        if(!post) {
            return res.send(error(404, "Post Not Found"));
        }

        if(post.owner.toString()!== currUserId){
            return res.send(error(403,"Only users can delete their posts"));
        }

        const index = currUser.posts.indexOf(postId);
        currUser.posts.splice(index, 1);

        await currUser.save();
        //await post.remove();
        await post.remove();

        return res.send(success(200," Post deleted successfully"));
    } catch (e) {
        res.send(error(500,e.message));
    }
     
}

module.exports ={createPostController,likeAndUnlikePost,updatePostController,deletePost};