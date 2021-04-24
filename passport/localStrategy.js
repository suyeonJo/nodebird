const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

const User = require('../models/user');

module.exports = () => {
    passport.use(new LocalStrategy({
        usernameField: 'email', //req.body.email
        passwordField: 'password' // req.body.password
    }, async (email, password, done) => {
        try {
            const exUser = await User.findOne({where: {
                    email
                }});
            if (exUser) {
                const result = await bcrypt.compare(password, exUser.password); //요청에서 온 비밀번호와 db에 존재하는해사화 된 password비교를 한다. 
                if (result) { //일치 했을때, 일치하지 않을 때 true or false로 값이 나뉨 
                    done(null, exUser); // 패스워드와 일치해서 true 값을 받았을 때, exUser를 인자로 넣어준다.
                } else {
                    done(null, false, {message: '비밀번호가 일치하지 않습니다.'}); // 로그인 실패했을 때 메시지
                }
            } else {
                done(null, false, {message: '가입되지 않은 회원입니다.'}); //exUser 두번째 인자에 
            }
        } catch (error) {
            console.error(error);
            done(error);
        }
    }));
};