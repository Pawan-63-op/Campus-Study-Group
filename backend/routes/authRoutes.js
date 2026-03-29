import express from 'express';
import { loginHandler, registerHandler } from '../controller/authController.js';
import { identify } from '../middleware/identify.js';
const router = express.Router();

router.post('/login',loginHandler );

router.post('/register',registerHandler );


// you may use `identify` middleware to protect any route you want ... thats a util . 
router.get('/me',identify,(req,res)=>{
    res.status(200).json({
        status: 'success',
        message: 'user authenticated',
        Uid: req.user.userID
    })
})
export default router;