import express from 'express';

const router = express.Router();

router.get('/:id', (request, response) => {
    response.status(200).json({
        "message": "node js get user"
    });
    console.log("request user id : " + request.params.id);
});

// router.patch('/:id', (request, response) => {
//     response.status(200).json({
//         "message": "node js patch user"
//     });
// });

// router.delete('/:id', (request, response) => {
//     response.status(200).json({
//         "message": "node js delete user"
//     });
// });


export default router;
