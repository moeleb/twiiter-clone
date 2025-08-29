import express from 'express';
import protectRoute from '../middlewares/protectRoute.js';
import { getUserProfile ,followOrUnfollowUser, getSuggestedUsers, updateUser} from '../controllers/user.controller.js';
const router = express.Router();

router.get('/profile/:username', protectRoute, getUserProfile );
router.get('/suggusted', protectRoute, getSuggestedUsers);
router.post('/follow/:id',  protectRoute, followOrUnfollowUser);
router.post('/update',  protectRoute, updateUser);

export default router;
