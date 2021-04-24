const passport = require('passport');
const kakaoStrategy = require('passport-kakao').Strategy;

const User = require('../models/user');

module.exports = () => {
    passport.use(new kakaoStrategy({
        clientID: process.env.KAKAO_ID, //카카오 서비스로 구현 (developer.kakao.com)
        callbackURL: '/auth/kakao/callback'
    }, async (accessToken, refreshToken, profile, done) => { //OAUTH2
        console.log('kakao profile', profile); //카카오 프로필만 받아옴
        try {
            const exUser = await User.findOne({ //카카오로 가입한 것이 있나 확인
                where: {
                    snsId: profile.id,
                    provider: 'kakao'
                }
            });
            if (exUser) {
                done(null, exUser);
            } else { //회원가입이 안되어있으면, 회원가입 시키고 로그인
                const newUser = await User.create({
                    email: profile._json && profile._json.kakao_account_email,
                    nick: profile.displayName,
                    snsId: profile.id,
                    provider: 'kakao'
                });
                done(null, newUser);
            }
        } catch (error) {
            console.error(error);;
            done(error);
        }
    }));
};