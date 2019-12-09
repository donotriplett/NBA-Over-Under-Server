const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const Op = require('sequelize').Op;
const ValidateSession = require("../middleware/validate-session")

router.post('/signup', (req, res) => {
    let user = {
        username: req.body.username,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 10),
        role: req.body.role
    }
    db.users.create(user)
        .then(
            createSuccess = (user) => {
                let token = jwt.sign({ id: user.id, user: user }, process.env.JWT_SECRET, { expiresIn: 60 * 60 * 24 })
                res.status(200).json({
                    user: user,
                    message: 'user created',
                    sessionToken: token
                })
            },
            createError = err => res.send(500, err)
        )
})

router.post('/signin', (req, res) => {
    console.log(req.body)
    let email = req.body.email;
    let username = req.body.username;
    db.users.findOne({
        where: {
            [Op.or]: [{
                email: { [Op.eq]: email }
            },
            {
                username: { [Op.eq]: username }
            }]
        }
    })
        .then(user => {
            console.log(user)
            if (user) {
                bcrypt.compare(req.body.password, user.password, (err, matches) => {
                    if (matches) {
                        let token = jwt.sign({ id: user.id, user: user }, process.env.JWT_SECRET, { expiresIn: 60 * 60 * 24 })
                        res.json({
                            user: user,
                            message: 'successfully authenticated user',
                            sessionToken: token
                        })
                    } else {
                        res.status(502).send({ error: err })
                    }
                })
            } else {
                res.status(500).json({ error: 'failed to authenticate' })
            }
        })
        .catch(err => res.status(501).json({ message: 'failed to process', error: err }))
})

router.get('/profile', ValidateSession, (req, res) => {
    db.users.findOne({
        where: {
            id: req.user.id
        },
        include: {
            model: db.picks
        }
    })
        .then(user => res.status(200).json(user))
        .catch(err => res.status(500).json({ message: "something went wrong", error: err }))
})

router.get('/users', ValidateSession, (req, res) => {
    db.users.findAll({
        include: [{
            model: db.picks
        }]
    })
        .then(users => {
            const resObj = users.map(user => {
                return Object.assign(
                    {},
                    {
                        userId: user.id,
                        username: user.username,
                        email: user.email,
                        picks: user.picks.map(pick => {
                            return Object.assign(
                                {},
                                {
                                    pick: pick,
                                }
                            )
                        })
                    }
                )
            });
            res.json(resObj)
        })
})

router.delete('/delete', ValidateSession, (req, res) => {
    db.users.destroy({
        where: {
            id: req.user.id
        }
    })
        .then(success => res.status(200).json({ message: "succesfully deleted account!" }))
        .catch(err => res.status(500).json({ message: "unable to delete account", error: err }))
})

module.exports = router
