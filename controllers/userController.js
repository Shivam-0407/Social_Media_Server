const User = require("../models/User");
const { error, success } = require("../utils/responseWrapper");
const Post = require("../models/Post");
const {mapPostOutput} = require("../utils/Utils");
const cloudinary = require('cloudinary').v2;

const followOrUnfollowUserController = async(req,res)=>{

    try {
        const {userIdToFollow} = req.body;

        const currUserId =req._id;

    const userToFollow = await User.findById(userIdToFollow);
    const currUser = await User.findById(currUserId);
    
    if(currUserId=== userIdToFollow) { // users khud ko follow nahee kar sakte hai
        return res.send(error(409, "User cannot follow themselves"));
    }
    if(!userToFollow) {
        return res.send(error(404, "User to follow not found"));
    }

    if(currUser.followings.includes(userIdToFollow)){
        //already followed
        const followingindex = currUser.followings.indexOf(userIdToFollow);
        currUser.followings.splice(followingindex, 1);

        const followerIndex = userToFollow.followers.indexOf(currUser);
        userToFollow.followers.splice(followerIndex, 1); 
    }else{
        userToFollow.followers.push(currUserId);
        currUser.followings.push(userIdToFollow);
    }
        await userToFollow.save();
        await currUser.save();
        return  res.send(success(200, {user:userIdToFollow}));
    } catch (e) {
        console.log(e);
        return res.send(error(500,e.message));
    }

    
}

const getPostsOfFollowing = async (req, res, next) => {

    try {
        const currUserId = req._id;

        const currUser = await User.findById(currUserId).populate('followings');
    
        const fullPosts   = await Post.find({
            'owner':{
                '$in':currUser.followings // using 'in operator' - jis jis post k user hamare currUser kee followings me aa rahe hai vo post mujhe laake dedo
            }
        }).populate('owner')
        const posts = fullPosts.map(item=>mapPostOutput(item,req._id)).reverse();

        currUser.posts = posts;
        const followingsIds = currUser.followings.map(item=>item._id);
        followingsIds.push(req._id);

        
        const suggestions = await User.find({
            _id:{
                '$nin':followingsIds,
            },
            
        });

        return res.send(success(200,{...currUser._doc,suggestions,posts}));
    } catch (e) {
        console.log(e);
        res.send(error(500,e.message));
    }

   
}

const getMyPosts = async(req, res, next) => {
    try {
        const currUserId = req._id;

      

        // *********** NOOB WAY TO GET POSTS ****************

        // const currUser = await User.findById(currUserId);
        //const posts = currUser.posts;

        // const result=[];
        // for(let i = 0; i < posts.length; i++) {
        //    const currPost = await Post.findById(posts[i]);
        //    result.push(await Post.findById(posts[i])); // directly access the post
        //    result.push(currPost.caption);
        // }


        // ******* SMART WAYs TO GET POSTS *****************

        // const postsofUser = await Post.find({
        //     'owner':{
        //         '$in':currUserId
        //     }
        // }).select('caption -_id');

        //console.log("currUser =  " + currUser+" posts = "+postsofUser);
        //return res.send(success(200,postsofUser));

        const allUserPosts = await Post.find({
            owner:currUserId
        }).populate('likes');

        return res.send(success(200,{allUserPosts}));
    } catch (e) {
        return res.send(error(500,e.message))
    }
}

const deleteMyProfile = async (req, res) => {
    try {
        //1. get the user from the database
        //2. delte the user from the followers list of followings
        //3. Remove the likes of the user as well i.e. jitne bhee post like kare the vhaa se vo delete hoga
        
        const currUserId = req._id;

        const currUser = await User.findById(currUserId);

        console.log("currUser: " + currUser);

        //delete all posts
        await Post.deleteMany({
            owner: currUserId
        });

        // removed myself from the followers' followings
        currUser.followers.forEach(async (followerId) => {
            const follower = await User.findById(followerId);
            const index = follower.followings.indexOf(currUserId);
            follower.followings.splice(index, 1);
            await follower.save();
        });

        // remove myself from my followings' followers
        currUser.followings.forEach(async (followingId) => {
            const following = await User.findById(followingId);
            const index = following.followers.indexOf(currUserId);
            following.followers.splice(index, 1);
            await following.save();
        });

        //remove myself from all likes
        const allPosts = await Post.find();
        allPosts.forEach(async (post) =>{
            const index = post.likes.indexOf(currUserId);
            post.likes.splice(index,1);
            await post.save();
        })

        // delete the user account
        await currUser.delete();

        res.clearCookie('jwt',{
            httpOnly:true,
            secure:true,
        })

        return res.send(success(200,'User deleted successfully'));
    } catch (e) {
        return res.send(error(500,e.message));
    }
}

const getUserPosts = async (req,res)=>{
    try {
        const userId = req.body.userId;

        if(!userId){
            return res.send(error(400,'User ID is required'));
        }

        const allUserPosts = await Post.find({
            owner:userId
        }).populate('likes');

        return res.send(success(200,{allUserPosts}));
    } catch (error) {
        
    }
}

const getMyInfo = async (req,res)=>{
    try {
        const user = await User.findById(req._id);
        return res.send(success(200,{user}));
    } catch (e) {
        return res.send(error(500,e.message))
    }
   
}

const updateUserProfile = async (req,res)=>{
    try {
         const {name,bio,userImg} = req.body;

         const user = await User.findById(req._id);

         if(name){
            user.name = name;
         }
         if(bio){
            user.bio = bio;
         }
         if(userImg){
            const cloudImg = await cloudinary.uploader.upload(userImg,{
                folder:'profileImg',
            })
            user.avatar = {
                url:cloudImg.secure_url,
                publicId:cloudImg.public_id
            }
        }

        await user.save();
        return res.send(success(200,{user}));
    } catch (e) {
        return res.send(error(500,e.message))
    }
}

const getUserProfile = async (req, res) => {
    try {
        const userId = req.body.userId;
        const user = await User.findById(userId).populate({
            path:'posts',
            populate:{
                path:'owner'
            }
        });
        const fullPosts =  user.posts;
        const posts = fullPosts.map(item=>mapPostOutput(item,req._id)).reverse();


        return res.send(success(200,{...user._doc,posts}));
    } catch (e) {
        return res.send(error  (500,e.message))
    }
}

module.exports ={followOrUnfollowUserController,getPostsOfFollowing,getMyPosts,deleteMyProfile,getUserPosts,getMyInfo,updateUserProfile,getUserProfile}
