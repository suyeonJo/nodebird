const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');
const session = require('express-session');
const nunjucks = require('nunjucks');
const dotenv = require('dotenv');
const passport = require('passport');
const helmet = require('helmet');
const hpp = require('hpp');
const redis = require('redis');
const RedisStore = require('connect-redis')(session);

dotenv.config(); //공통 관리키 

const redisClient = redis.createClient({
    url:`redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
    password: process.env.REDIS_PASSWORD,
})
const pageRouter = require('./routes/page');
const authRouter = require('./routes/auth');
const postRouter = require('./routes/post');
const userRouter = require('./routes/user');
const {sequelize} = require('./models');
const passportConfig = require('./passport');
const logger = require('./logger');

const app = express();
passportConfig(); //passport 폴더에 index.js 실행하는 함수
app.set('port', process.env.PORT || 8001); //process.env는 .env에서 포트 관리 .. 개발 시 8001 번 포트 사용 , 개발용 배포용 다름
app.set('view engine', 'html'); // 넌적스 설정
nunjucks.configure('views',{
    express: app,
    watch: true,
});

sequelize.sync({force: false}) //force : 테이블을 삭제(drop)하고 다시 생성(create) 시키는 것(데이터 리셋 = 개발용)  or alter (데이텀난 변경)
.then(()=>{
    console.log('데이터베이스 연결 성공');
})
.catch((err)=>{
    console.error(err);
});

if(process.env.NODE_ENV === 'production'){
    app.enable('trust proxy');
    app.use(morgan('combined'));
    app.use(helmet({ contentSecurityPolicy: false})); // 일단 꺼둠
    app.use(hpp());
} else{
    app.use(morgan('dev'));
}
//6장 복습
// app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public'))); //정적파일은 public 폴더안에 생성 css파일 생성
app.use('/img',express.static(path.join(__dirname, 'uploads'))); // imgurl로 요청을 하지만 실제로는 uploads 파일에 있는 것을 가져가도록 함.
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser(process.env.COOKIE_SECRET));

const sessionOption = {
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET,
    cookie: {
        httpOnly: true,
        secure: false
    },
    store: new RedisStore({client: redisClient})
};
if (process.env.NODE_ENV === 'production') {
    sessionOption.proxy = true;
    // sessionOption.proxy = true;
}
app.use(session(sessionOption));
// 라우터 가기전, express 세션보다 아래에 위치
app.use(passport.initialize());
app.use(passport.session());


app.use('/',pageRouter);  //url 라우터
app.use('/auth', authRouter);
app.use('/post', postRouter);
app.use('/user', userRouter);

//404 처리 미들웨어
app.use((req, res, next)=>{
    const error = new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
    error.status = 404;
    logger.info('hello');
    logger.error(error.message);
    next(error); //에러 미들웨어로 넘김
});

app.use((err, req, res, next)=>{ //인자 4개가 들어있고, next가 있어야함
    res.locals.message = err.message; //템플릿 엔진 메시지, 에러 변수 사용
    res.locals.error = process.env.NODE_ENV !== 'production'? err :{}; //error 스택 개발시에만 볼수 있도록
    res.status(err.status||500).render('error'); //메서드 체이닝
    });

    module.exports = app;