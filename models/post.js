const Sequelize = require('sequelize');

module.exports = class Post extends Sequelize.Model {
    static init(sequelize) {
        return super.init({
            content: {
                type: Sequelize.STRING(140),
                allowNull: false
            },
            img: { //한개만 올릴수 있도록 함 (이미지도 테이블로 만들어야함. 1:다 관계)
                type: Sequelize.STRING(200),
                allowNull: true
            }
        }, {
            sequelize,
            timestamps: true,
            underscored: false,
            modelName:'Post',
            tableName: 'posts',
            paranoid: false,
            charset: 'utf8mb4', //이모티콘 저장
            collate: 'utf8mb4_general_ci'
        });
    }
    static associate(db){
        db.Post.belongsTo(db.User); //db포스트는 user에 속한다.
        db.Post.belongsToMany(db.Hashtag, {through: 'PostHashtag'}); // 다대다 관계 중간테이블 
    }
};