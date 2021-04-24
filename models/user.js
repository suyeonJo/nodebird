const Sequelize = require('sequelize');

module.exports = class User extends Sequelize.Model { //시퀄라이즈로부터 모델확장 , mysql 테이블과 매칭
    static init(sequelize) { // static으로 init메서드 실현
        return super.init(
            { //super.init 부모인 모델을 가르킴. model.init과 같음 , 아이디 프라이머리키 기본적으로 생략
                email: {
                    type: Sequelize.STRING(40),
                    allowNull: true,
                    unique: true
                },
                nick: {
                    type: Sequelize.STRING(15),
                    allowNull: false
                },
                password: {
                    type: Sequelize.STRING(100), // 해시화 과정에서 늘어남에 따라 여유롭게 지정
                    allowNull: true, //null 가능, sns로 로그인할 시
                },
                provider: { // 로그인 제공자
                    type: Sequelize.STRING(10),
                    allowNull: false,
                    defaultValue: 'local'
                },
                snsId: {
                    type: Sequelize.STRING(30),
                    allowNull: true
                }
            },
            {
                sequelize,
                timestamps: true,
                underscored: false,
                modelName: 'User',
                tableName: 'users',
                paranoid: true, //삭제를 한 척 하는것
                charset: 'utf8', //한글지원
                collate: 'utf8_general_ci', //한글지원
            }
        );
    }

    static associate(db){
        db.User.hasMany(db.Post); // user는 post를 많이 가지고 있다 1:n 관계
        db.User.belongsToMany(db.User,{ // user는 user 끼리 다대다 관계
            foreignKey: 'followingId',  // 팔로잉아이디
            as: 'Followers', // 팔로잉 (연예인) 의 팔로워들을 찾고 싶을 때, 팔로잉 아이디를 가져와야한다.
            through: 'Follow',
        });
        db.User.belongsToMany(db.User, {
            foreignKey: 'followerId', //팔로워 아이디
            as: 'Followings',// 내가 팔로잉하는 하는 사람을 알기위해 팔로워(나)를 찾아야한다.
            through: 'Follow',
        });
    }
};