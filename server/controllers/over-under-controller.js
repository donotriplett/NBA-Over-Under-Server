let express = require('express');
let router = express.Router();
let db = require('../db');
let ValidateSession = require("../middleware/validate-session")

router.post("/create", ValidateSession, (req, res) => {

    const pizza = req.body;

    db.pizzas.create({
        user_id: req.user.id,
        createdBy: req.user.username,
        crust: pizza.crust,
        sauce: pizza.sauce,
        cheese: pizza.cheese,
        toppings: pizza.toppings,
        timeToBake: pizza.timeToBake,
        bakeTemp: pizza.bakeTemp,
        createdAt: new Date()
    })
        .then(success => res.status(200).json({ "Successfully created pizza!": success }))
        .catch(err => res.status(500).json({ Error: err, message: "Could not create pizza!" }))
})

router.get("/fetch", (req, res) => {
    db.pizzas.findAll({
        include: [{
            model: db.users
        }]
    })
        .then(pizzas => {
            const resObj = pizzas.map(pizza => {
                return Object.assign(
                    {},
                    {
                        crust: pizza.crust,
                        sauce: pizza.sauce,
                        cheese: pizza.cheese,
                        toppings: pizza.toppings,
                        timeToBake: pizza.timeToBake,
                        bakeTemp: pizza.bakeTemp,
                        user: pizza.user
                    }
                )
            });
            res.json(resObj)
        })
})

router.get("/fetch/user", ValidateSession, (req, res) => {
    db.pizzas.findAll({
        where: {
            user_id: req.user.id
        }
    })
        .then(success => res.status(200).json(success))
        .catch(err => res.status(500).json(err))
})

router.delete("/delete/:id", ValidateSession, (req, res) => {
    let entryId = req.params.id

    db.pizzas.findOne({
        where: {
            id: entryId
        }
    })
        .then(
            function (entry) {
                if (entry === null) {
                    res.status(500).json(`the id ${entryId} does not match any of our records`)
                } else {
                    db.pizzas.destroy({
                        where: {
                            id: req.params.id
                        }
                    })
                        .then(success => res.status(200).json(`Successfully deleted entry ${entryId}`))
                        .catch(err => res.status(500).json({ message: `Unable to delete entry ${entryId}`, error: err }))
                }
            }
        )
        .catch(err => res.status(500).json("the id does not match any of our records"))
})

router.put("/update/:id", ValidateSession, (req, res) => {
    let entryId = req.params.id
    let pizza = req.body

    db.pizzas.update(pizza, {
        returning: true,
        where: {
            id: entryId
        }
    })
        .then(function ([rowsUpdate, [updatedPizza]]) {
            res.status(200).json(updatedPizza)
        })
        .catch(err => res.status(500).json({ message: `Unable to update entry ${entryId}`, error: err }))
})


module.exports = router