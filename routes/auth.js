const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const { isLoggedIn, isNotLoggedIn} = require('./middlewares'); // 로그인 확인 객체 
const passport = require('passport');
const router = express.Router();

//회원 가입 라우터 사용 /auth/join
router.post('/join',isNotLoggedIn, async (req, res, next) => {
    const {email, nick, password} = req.body; //front에서 정보를 보내줌
    try {
        const exUser = await User.findOne({where: {
                email
            }});
        if (exUser) {
            return res.redirect('/join?error=exist'); // 이미 존재할 시 
        }
        const hash = await bcrypt.hash(password, 12); //숫자가 높을수록 보안이 높아짐(대신 에너지 소요가 큼) 해시화해서 저장 3장 복습
        await User.create({email, nick, password: hash}); //유저 생성
        return res.redirect('/'); // 메인페이지 리다이렉트
    } catch (error) {
        console.error(error);
        return next(error);
    }
});

router.post('/login',isNotLoggedIn, (req, res, next) =>{ //프로트에서 서버로 로그인 요청을 보낼때, 
    passport.authenticate('local', (authError, user, info) => { //미들웨어의 로컬 이벤트가 실핼 됨 로컬스트렛지가 실행됨, 로컬스트렛지에서 done()가 실행되고 다음 콜백함수가 실행됨
        if(authError){ //서버에러 null
            console.error(authError);
            return next(authError);
        }
        if(!user){
            return res.redirect(`/?loginError=${info.message}`); //로컬스트렛지의 로그인 실패 매시지를 프론트에 전송
        }
        // user에는 exUser가 담겨있음.
        return req.login(user, (loginError)=>{ //패스포트 인덱스로 넘어감
            if(loginError){ //에러 확인
                console.error(loginError);
                return next(loginError);
            }
            // 위과정을 통해 세션쿠키를 브라우저로 보내줌.
            return res.redirect('/'); //메인페이지로 복귀
        });
    })(req, res, next);  //미들웨어 확장패턴 6강 복습
});

//로그아웃
router.get('/logout', isLoggedIn, (req, res)=>{
    req.user; //사용자 정보
    req.logout(); //세션쿠키 삭제
    req.session.destroy(); //세션 삭제
    res.redirect('/');
});

router.get('/kakao', passport.authenticate('kakao')); //카카오 로그인하기 클릭시 카카오 스트렛지로 넘어감

router.get('/kakao/callback', passport.authenticate('kakao',{
    failureRedirect: '/',
}), (req, res)=>{
    res.redirect('/');
});

module.exports = router;