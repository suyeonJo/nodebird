const express = require('express');
const { Post, User, Hashtag } = require('../models');
const router = express.Router();

//미들웨어의 특성 use를하면 모든라우터에 공통변수로 적용
router.use((req, res, next) => {
    res.locals.user = req.user;
    res.locals.followerCount = req.user ? req.user.Followers.length :0; //로그인 한경우  팔로워의 수를 알려주고,
    res.locals.followingCount = req.user ? req.user.Followings.length: 0;
    res.locals.followingIdList = req.user ? req.user.Followings.map(f => f.id) : [];
    next();
});

// html은 views 폴더로 분기
router.get('/profile', (req, res) => { //프로필페이지로 이동
    res.render('profile', {title: '내 정보 - NodeBird'});
});

router.get('/join', (req, res) => { //조인페이지로 이동
    res.render('join', {title: '회원가입 - NodBird'});
});

router.get('/', async (req, res, next) => { //메인페이지로 이동
    try{
        const posts = await Post.findAll({
            include:{
                model: User,
                attributes: ['id', 'nick'],
            },
            order: [['createdAt', 'DESC']],
        });
        res.render('main', {
            title: 'NodeBird',
            twits: posts,
        });
    } catch (err){
        console.error(err);
        next(err);
    }
});
    // const twits = []; //메인 게시물  , 빈배열로 확인
    // GET /hahstag?hashtag=노드
    router.get('/hashtag', async (req, res, next)=>{
        const query = decodeURIComponent(req.query.hashtag);
        if(!query){
            return res.redirect('/'); //해시태그 검색창이 비어있으면 메인페이지로 보내줌
        }
        try{ //검색을 해쓸 때,
            const hashtag = await Hashtag.findOne({ where: {title: query}}); // 해시태그가 존재하는지 찾음
            let posts = [];
            if(hashtag){ // 있으면
                posts = await hashtag.getPosts({ include: [{model: User, attributes: ['id','nick']}]}); //프론트로 보낼때 패스워드는 뺌.
            }
            return res.render('main', {
                title: `#${query} 검색 결과| NodeBird`,//타이틀
                twits: posts,
            });
        } catch (error){
            console.error(error);
            return next(error);
        }
    });
module.exports = router;