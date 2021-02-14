const express = require('express');
const app = express();

const request = require("request");

const config = require('./../config');
const errorCode = require('./../responses/http.codes');

const validateRecaptcha = app.use((req, res, next) => {
    const recaptchaToken = req.body.recaptchaToken; // generated using the site key on the client side
    const secretKey = config.recaptcha_secretKey;

    const url = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${recaptchaToken}&remoteip=${req.connection.remoteAddress}`;

    if (recaptchaToken === null || recaptchaToken === undefined) {
        return res.status(201).send({
            valid: false,
            message: "Token is empty or invalid"
        });
    }

    request(url, (err, response, body) => {
        body = JSON.parse(body);

        if (err) {
            res.status(500).status({message: errorCode[500]});
        }

        if (body.success !== undefined && !body.success) {
            return res.send({
                valid: false,
                'message': "recaptcha failed"
            });
            
        }

        req.recaptcha = true;
        next();
    })

});

module.exports = validateRecaptcha;