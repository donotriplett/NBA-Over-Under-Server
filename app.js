const express = require('express');
const app = express();
const env = require('./server/config/env');
const db = require('./server/config/db'); 
const users = require('./server/controllers/user-controller');
const overUnders = require('./server/controllers/over-under-controller');
const validateSession = require('./server/middleware/validate-session');
const headers = require('./server/middleware/headers');
const PORT = env.PORT;

app.use(express.json());
app.use(headers);

app.use('/auth', users);
app.use('/picks', overUnders);

db.sequelize.sync().then(() => {
    app.listen(PORT, () => {
        console.log('Express listening on port:', PORT)
    })
})
