const Sequelize = require('sequelize'); 
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env]; // 설정파일 config development 객체 가져옴

const User = require('./user'); //모델들 3개
const Post = require('./post');
const Hashtag = require('./hashtag');

const db= {};
const sequelize = new Sequelize( // 7장 새로운 sequelize 객체 생성
  config.database, config.username, config.password, config,
);

db.sequelize = sequelize;
db.User = User;
db.Post = Post;
db.Hashtag = Hashtag;

User.init(sequelize);
Post.init(sequelize);
Hashtag.init(sequelize);

User.associate(db);
Post.associate(db);
Hashtag.associate(db);

module.exports = db;