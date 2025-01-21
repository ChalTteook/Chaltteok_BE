import express from 'express';
import UserModel from '../models/userModel.js';
import userService from '../services/userService.js';

const router = express.Router();


router.post('/register', (request, response) => {
    const userModel = UserModel.from(request.body);
    userService.createUser(userModel);
    response.status(200).json({
        "message": "node js post test"
    });

    console.log(userModel);
});

router.post('/login', (request, response) => {
    response.status(200).json({
        "message": "node js post test"
    });
});


export default router;