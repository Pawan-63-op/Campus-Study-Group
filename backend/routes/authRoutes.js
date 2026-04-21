import express from 'express';
import { loginHandler, registerHandler } from '../controller/authController.js';
import { identify } from '../middleware/identify.js';
const router = express.Router();

router.post('/login', loginHandler);

router.post('/register', registerHandler);


// you may use `identify` middleware to protect any route you want ... thats a util . 
router.get('/me', identify, (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'user authenticated',
        Uid: req.user.userID,
        user: req.user
    })
})
// :5000/api/auth/logout:1 
router.post('/logout',(req, res) => {
    res.clearCookie('jwt').status(200).json({
        status: 'success',
        message: 'logout successful'
    });
});
export default router;