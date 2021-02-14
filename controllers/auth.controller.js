const express = require('express');
const router = express.Router();
var path = require('path');

const ObjectId = require('mongodb').ObjectId;

const User = require('./../models/user.model');
const BasicUtil = require('../util/basic.util');

const validateRecaptcha = require('./../middlewares/validateRecaptcha');
const validateToken = require('./../middlewares/validateToken');

const serverUrlPrefix = 'http://localhost:8080/';
const clientUrlPrefix = 'http://localhost:4200/';
const errorCode = require('./../responses/http.codes');

router.post('/register', (req, res) => {

    User.findUser({
        email: req.body.email
    }).then(

        user => {
            // If the email is not already registered
            if (!user) {
                // Generate hash using bcrypt
                BasicUtil.generateHash(req.body.password, (err, hash) => {
                    if (err) {
                        console.log(err)
                        return res.status(500).send({message: errorCode[500]});
                    }

                    const user = new User(req.body.name, req.body.email, hash);

                    user.createUser().then(
                        newUser => {
                            // send the activation code to the registered email
                            sendActivationCode(newUser.insertedId, req, res);
                        });
                });

            } else {
                // Email is already registered.
                res.status(409).send({message: errorCode[409]});
            }
        }
    )

});

router.post('/login', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    User.findUser({
        email
    }).then(
        user => {
            // user provided correct credentials
            if (user) {
                BasicUtil.compareHashToPassword(user.password, password, (err, valid) => {
                    if (err) {
                        console.log(err);
                        return res.status(500).send({message: errorCode[500]});
                    }
                    if (valid) {
                        // if the password is valid, set the loginAttempts count to 0
                        User.updatedUser({
                            email
                        }, {
                            'loginAttempt': 0
                        })
                        // generate a jwt token for the user.
                        BasicUtil.generateToken({
                            id: user._id,
                            type: 'login'
                        }, 86400, (err, token) => {
                            if (err) {
                                console.log(err);
                                return res.status(500).send({message: errorCode[500]});
                            }
                            if (token) {
                                return res.status(200).send({
                                    auth: true,
                                    token,
                                    message: 'Logged In Successfully.',
                                    name: user.name,
                                    photoUrl: user.photoUrl
                                });
                            }
                        });
                    }

                    if (!valid) {
                        // increment the loginAttempt each time the user provides a wrong password
                        if (user.loginAttempt < 2) {
                            User.updateLoginAttemptCount({
                                email
                            });
                            return res.status(401).send({
                                auth: false,
                                message: errorCode[401],
                                recaptcha: false
                            });
                        } else {
                            // if the user has provided wrong password three times, he will have to do recaptcha validation.
                            return res.status(401).send({
                                auth: false,
                                message: errorCode[401],
                                recaptcha: true
                            })
                        }
                    }
                })
            } else {
                // user provided incorrect credentials
                return res.status(401).send({
                    auth: false,
                    token: null,
                    message: errorCode[401]
                });
            }
        }
    ).catch(
        err => {
            console.log(err);
            return res.status(500).send({message: errorCode[500]});
        }
    )
})

router.post('/get-reset-link', (req, res) => {
    // First check if the email is registered
    User.findUser({
        email: req.body.email
    }).then(
        user => {
            if (user) {
                // we are setting type as reset here. Since we are using the same procedure to generate a login token,
                // we need to set type as reset to make sure the user has not provided login token to reset password
                BasicUtil.generateToken({
                    id: user._id,
                    time: Date.now(),
                    type: 'reset', 
                    expired: false
                }, 86400, (err, token) => {
                    if (err) {
                        return res.status(500).send({message: errorCode[500]});
                    }
                    // lastReset token is the token provided and we are making it valid.
                    // after a user resets his password, the token will be made invalid and cant be used again
                    User.updatedUser({email: req.body.email}, {lastResetToken: token, resetTokenValid: true}).then(
                        updated=>{
                            if(updated){
                                res.status(200).send({message: 'Reset link mailed to the email address. Please follow the link to reset your password.'});
                                BasicUtil.sendMail(req.body.email, 'Password Reset Link', `<a href="${clientUrlPrefix}auth/reset-password/update-password/${token}">Reset Password</a>`);
                            } 
                        }, error => {
                            console.log(error);
                            res.status(500).send({message: errorCode[500]});
                        }
                    )
                });
            } else {
                res.status(404).send({message: 'Email address not found.'});
            }
        }, error => {
            console.log(error)
            res.status(404).send({message: 'Email address not found.'});
        }
    )
});

router.post('/reset-password', validateToken, (req, res)=>{
    // allow reset only if the token is of the type reset
    if(req.token.type !== 'reset') {
       return res.status(400).send({message: 'Invalid token provided'});
    }
    
    User.findUser({_id: new ObjectId(req.token.id)}).then(
        user=>{
            BasicUtil.decodeToken(user.lastResetToken, (err, lastTokenDecoded) => {
                if(err) {
                    return res.status(500).send({message: errorCode[500]});
                }
                
                // The token provided should have timestamp equal to the lastToken sent.
                // If the the time is less, it means that a new token was issued after this provided token
                // which will make this token invalid.
                if(req.token.time < lastTokenDecoded.time){
                    return res.status(400).send({message: 'The password reset link has expired.', expired: true});
                }

                //If the user tries to use same link to reset password more than once, send link expired.
                if((req.token.token === user.lastResetToken) && !user.resetTokenValid) {
                    return res.status(400).send({message: 'The password reset link has expired.', expired: true});
                }

                BasicUtil.generateHash(req.body.password, (err, hash) => {
                    // set the token as invalid after the token has been used for password reset
                    User.updatedUser({email: user.email}, {password: hash, resetTokenValid: false}).then(
                        result=>{
                            res.status(200).send({message: 'Password reset successfully.'});
                        }
                    ).catch(err=>{
                        console.log(err);
                        res.status(500).send({message: errorCode[500]});
                    });
                })
            })
        }
    )
})

router.post('/activation/resend-mail', (req, res) => {
    const email = req.body.email;

    User.findUser({
        email
    }).then(
        user => {
            if (!user.activated) {
                sendActivationCode(user._id, req, res);
            } else {
                return res.status(200).send({
                    activated: true,
                    message: 'Your account is already active.'
                });
            }
        }
    ).catch(error => {
        console.log(error)
        return res.status(500).send({message: errorCode[500]});
    })

})


router.get('/activation/activate/:activation_token', (req, res) => {

    BasicUtil.decodeToken(req.params.activation_token, (err, decoded) => {
        if (err) {
            return res.status(500).send({message: errorCode[500]});
        }

        if (decoded.type === 'activation') {
            User.updatedUser({
                _id: new ObjectId(decoded.id)
            }, {
                activated: true
            }).then(
                user => {
                    return res.status(200).sendFile(path.join(__dirname, './../', 'responses', 'account.activated.html'));
                }
            ).catch(
                err => {
                    console.log(err);
                    res.status(500).send({message: errorCode[500]});
                })
        }
    })

});


router.post('/validate-captcha', validateRecaptcha, (req, res) => {
    res.status(200).send({
        valid: req.recaptcha
    });
})

// this link is used to validate if the user is logged in.
router.post('/validate-token', validateToken, (req, res) => {
    res.status(200).send({
        auth: true
    })
})

// helper functions

function sendActivationCode(id, req, res) {
    BasicUtil.generateToken({
        id,
        type: 'activation'
    }, 86400, (err, token) => {
        if (err) {
            console.log(error)
            return res.status(500).send({message: errorCode[500]});
        }
        if (token) {

            res.status(200).send({
                activated: false,
                created: true,
                token
            });

            BasicUtil.sendMail(req.body.email, `GroceryManager: Account Activation`, `<a href="${serverUrlPrefix}auth/activation/activate/${token}">Click to authenticate</a>`).then(
                () => {
                    console.log('Email sent successfully to: ' + req.body.email);
                }
            ).catch(err => {
                console.log(err);
                return res.status(500).send({
                    created: false,
                    message: errorCode[500]
                });
            });
        }
    });
}

module.exports = router;