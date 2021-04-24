
// 로그인을 한 상태인지 아닌지 체크해주는 미들웨어
exports.isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
        next(); //다음 미들웨어
    } else {
        res
            .status(403)
            .send('로그인 필요');
    }
};

exports.isNotLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        next();
    } else {
        const message = encodeURIComponent('로그인 한 상태입니다.');
        res.redirect(`/?error=${message}`);
    };
}