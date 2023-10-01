const router = require('express').Router();
const postController = require('../controllers/postsController');
const requiredUser = require('../middlewares/requireUser');

router.post('/',requiredUser ,postController.createPostController);
router.post('/like',requiredUser ,postController.likeAndUnlikePost);
router.put('/',requiredUser ,postController.updatePostController);
router.delete('/',requiredUser ,postController.deletePost);

 
// pehle middleware par request aayi hai then API yaa controller k pass jaayega

module.exports = router;