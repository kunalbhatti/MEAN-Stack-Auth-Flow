const express = require('express');
const router = express.Router();

const User = require('./../models/user.model');
const BasicUtil = require('./../util/basic.util');

const config = require('./../config');
const errorCode = require('./../responses/http.codes');

const OAuth2Client = require('google-auth-library').OAuth2Client;
const client = new OAuth2Client(config.google_client_id);

router.post('/google-login', async (req, res) => {
    
    const ticket = await client.verifyIdToken({
        idToken: req.headers['x-access-token'],
        audience: config.google_client_id
    });

    const payload = ticket.getPayload();

    // checking if the user is registerd
    let user = await User.findUser({
        email: payload.email
    });

    if (!user) {
        user = new User(payload.given_name + ' ' + payload.family_name, payload.email, null, true, null);
       
        user = await user.createUser();
        user._id = user.insertedId;
    }

    // storing the users google id. If the user has created and account the traditional way, 
    // and then he used google signin, we are storing the google id for that user. 
    if(!user.g_id) {
        User.updatedUser({email: payload.email}, {g_id: req.body.googleId});
    }

    BasicUtil.generateToken({
        id: user._id,
        type: 'login'
    }, 86400, (err, token) => {
        if (err) {
            console.log(err);
            return res.status(500).send(errorCode[500]);
        }
        if (token) {
            return res.status(200).send({
                auth: true,
                token,
                message: 'Logged In Successfully.'
            });
        }
    });

});

router.post('/facebook-login', async (req, res)=>{
    // we are searching for the user using the fb_id because facebook allows users to create account without email.
    let user = await User.findUser({
        fb_id: req.body.id
    });
    
    if (!user) {
        user = new User(req.body.name, req.body.email, null, true, req.body.id);
        user = await user.createUser();
        
        user._id = user.insertedId;
    }

    BasicUtil.generateToken({
        id: user._id,
        type: 'login'
    }, 86400, (err, token) => {
        if (err) {
            console.log(err);
            return res.status(500).send(errorCode[500]);
        }
        if (token) {
            return res.status(200).send({
                auth: true,
                token,
                message: 'Logged In Successfully.'
            });
        }
    });
})

module.exports = router;