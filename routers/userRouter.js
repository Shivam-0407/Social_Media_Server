const router = require('express').Router();
const requireUser = require('../middlewares/requireUser');
const UserController = require('../controllers/userController');

router.post('/follow', requireUser,UserController.followOrUnfollowUserController)
router.post('/getFeedData', requireUser,UserController.getPostsOfFollowing)
router.get('/getMyPosts', requireUser,UserController.getMyPosts)
router.get('/getUserPosts', requireUser,UserController.getUserPosts)
router.delete('/', requireUser,UserController.deleteMyProfile)
router.get('/getMyInfo',requireUser,UserController.getMyInfo);
router.put('/',requireUser,UserController.updateUserProfile);
router.post('/getUserProfile',requireUser,UserController.getUserProfile);
// router.put('/',requireUser,UserController.updateUserProfile);


module.exports = router;