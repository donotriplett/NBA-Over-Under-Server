module.exports = (sequelize, DataTypes) => {
    const Picks = sequelize.define('picks', {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false
        },
        user_id: {
            type: DataTypes.UUID,
            allowNull: false
        },
        team: {
            type: DataTypes.STRING,
            allowNull: false
        },
        over_under: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        }
    }, {
        underscored: true
    })
};
return Picks;