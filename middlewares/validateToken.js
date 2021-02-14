const express = require('express');
const app = express();

const jwt = require('jsonwebtoken');
const config = require('./../config');
const errorCode = require('./../responses/http.codes');

const validateToken = app.use((req, res, next) => {
    
    const token = req.headers['x-access-token'];

    if(token){
        jwt.verify(token, config.secretKey, (err, decoded) => {
            
            if (err) {
                console.log(err)
                return res.status(500).send({auth: false, message: errorCode[500]});
            }
            
            req.token = decoded;
            req.token.token = token;
            next();
        })
    } else {
        return res.status(401).send({auth: false, message: 'Please login to continue.'})
    }
        
});

module.exports = validateToken;