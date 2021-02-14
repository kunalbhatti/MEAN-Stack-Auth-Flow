const express = require('express');
const router = express.Router();

const ObjectId = require('mongodb').ObjectId;

const User = require('../models/user.model');
const BasicUtil = require('../util/basic.util');
const validateToken = require('../middlewares/validateToken');


router.get('/get-user', validateToken, (req, res) => {

    User.findUser({
        _id: new ObjectId(req.token.id)
    }).then(
        user => {
            console.log(user);
        }
    )

    return res.send(req.id)
})


module.exports = router;