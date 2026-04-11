import express from 'express';
import { identify } from '../middleware/identify.js';
import { acceptFriendRequest, getFriendRequests, getFriendsList, getMutualFriends, getSuggestions, getUsersbyUsername, rejectFriendRequest, sendFriendRequest } from '../controller/friendController.js';

const router = express.Router();

router.use(identify);

router.get('/friendlist',getFriendsList);

router.get('/friendrequests',getFriendRequests);

router.get('/suggestions',getSuggestions);

router.post('/sendrequest',sendFriendRequest);

router.post('/acceptrequest',acceptFriendRequest);

router.post('/rejectrequest',rejectFriendRequest);

router.get('/getMutualfriends',getMutualFriends);

router.get('/search',getUsersbyUsername);

export default router;