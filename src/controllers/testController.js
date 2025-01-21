import express from 'express';

const router = express.Router();

router.get('/', (request, response) => {
    response.status(200).json({
        "message": "node js get test"
    });
});

router.post('/', (request, response) => {
    response.status(200).json({
        "message": "node js post test"
    });
});


export default router;