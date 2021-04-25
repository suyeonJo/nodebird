const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const AWS = require('aws-sdk');
const multerS3 = require('multer-s3');

const {Post, Hashtag} = require('../models');
const {isLoggedIn} = require('./middlewares');

const router = express.Router();

try {
    fs.readdirSync('uploads');
} catch (error) {
    console.error('uploads 폴더가 없어 uploads 폴더를 생성합니다.');
    fs.mkdirSync('uploads');
}

AWS.config.update({
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    region: 'ap-northeast-2', //서울
});
// 6강 multer array single none fields
const upload = multer({
    storage: multerS3({
        s3: new AWS.S3(),
        bucket: 'suyeojo',
        key(req, file, cb){
            cb(null, `original/'${Date.now()}${path.basename(file.originalname)}`);
        },
    }),
    limits: {
        fileSize: 5 * 1024 * 1024 //파일 용량 제한 5mb
    }
});
//로그인 한사람(isLoggedin) 이 post 이미지 요청을 보내면 업로드 싱글 이미지.
router.post('/img', isLoggedIn, upload.single('img'), (req, res) => {
    console.log(req.file); // 업로드 이후 콜백
    res.json({url: req.file.location});
});

//게시글 작성, 이미지는 이미 업로드 되어있고, 더이상 업로드하지않는다.
router.post('/', isLoggedIn, upload.none(), async (req, res, next) => {
    try {
        const post = await Post.create(
            {content: req.body.content, img: req.body.url, UserId: req.user.id}
        );
        const hashtags = req
            .body
            .content
            .match(/#[^\s#]*/g); //정규 표현식을 활용한 해쉬태그 추출
        // [#노드, #익스프레스] [노드, 익스프레스] [findOrCreate(노드), findOrCreate(익스프레스)] [[해시태그,
        // false]. [해시태그, true]]
        if (hashtags) {
            const result = await Promise.all(hashtags.map(tag => {
                return Hashtag.findOrCreate({
                    where: {
                        title: tag
                            .slice(1)
                            .toLowerCase()
                    }
                })
            }),);
            console.log(result);
            await post.addHashtags(result.map(r => r[0]));
            // addFollowings[]
        }
        res.redirect('/');
    } catch (error) {
        console.error(error);
        next(error);
    }
});

// 실제 파일은 업로드에 있는데, 요청주소는 img 이것을 맞혀주기 위해 스태틱을 이용함
// =========================================================================================
const upload2 = multer();
router.post('/', isLoggedIn, upload2.none(), async (req, res, next) => {
    try {
        const post = await Post.create(
            {content: req.body.content, img: req.body.url, UserId: req.user.id}
        );
        const hashtags = req
            .body
            .content
            .matrch(/#[^\s#]*/g);
        if (hashtags) {
            const result = await Promise.all(hashtags.map(tag => {
                return Hashtag.findOrCreate({
                    where: {
                        title: tag
                            .slice(1)
                            .toLowerCase()
                    }
                })
            }),);
            console.log(result)
            await post.addHashtags(result.map(r => r[0]));
        }
        res.redirect('/');
    } catch (error) {
        console.error(error);
        next(error);
    }
});

module.exports = router;