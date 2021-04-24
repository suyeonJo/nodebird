const passport = require('passport');
const local = require('./localStrategy');
const kakao = require('./kakaoStrategy');
const User = require('../models/user');

module.exports = () =>{
    passport.serializeUser((user, done)=>{ //로그인 유저객체를 받아서
        done(null, user.id); //유저아이디뽑아서 세션에 유저의 아이디만 저장 4강 쿠키와 세션. 메모리에 저장 아이디만 저장해서 가볍게 감. 15강에서 따로 다시 리팩토링
    });

    //{ id: 3, 'connect.sid': s%231232133(=세션쿠키) }

    passport.deserializeUser((id, done)=>{ //유저파인드원을 통해서 아이디를 유저로 복구를 해줌(메모리 효율성을 위해 ) // req.user는 deserializeUser에서 생성된다.
        User.findOne({
        where: { id },
        include:[{
            model: User,
            attributes: ['id', 'nick'],
            as: 'Followers', //as를 통해 user를 구분해준다. 
        },{
            model: User,
            attributes: ['id', 'nick'],
            as: 'Followings',
        }],
    })
        .then(user=> done(null, user)) //req.user , req.isAuthenticated()
        .catch(err=> done(err));
    });

    local();
    kakao();
};