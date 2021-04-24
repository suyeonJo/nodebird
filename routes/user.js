const express = require('express');

const {isLoggedIn} = require('./middlewares');
const User = require('../models/user');

const router = express.Router();

//post /user/1/follow  resapi 방식소프트 
router.post('/:id/follow', isLoggedIn, async (req, res, next)=>{
    try{
        const user = await User.findOne({ where: {id: req.user.id}});
        if(user){
            await user.addFollowings([parseInt(req.params.id, 10)]); //setFollwings , removeFollowings, getFollowings , 관계쿼리(6장 복습)
            res.send('success');
        } else{
            res.status(404).send('no user');
        }
    } catch(error){
        console.error(error);
        next(error);
    }
});

module.exports = router;