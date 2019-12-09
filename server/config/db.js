const env = require('./env');

const Sequelize = require('sequelize');
const sequelize = new Sequelize(env.DATABASE_URL, {
    dialect: env.DATABASE_DIALECT
})

sequelize.authenticate()
    .then(() => console.log('postgres db is connected'))
    .catch(err => console.log(err));

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.users = require('../models/users')(sequelize, Sequelize);
db.picks = require('../models/pick')(sequelize, Sequelize);

db.picks.belongsTo(db.users);
db.users.hasMany(db.picks);

module.exports = db;