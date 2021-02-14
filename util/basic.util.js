const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const sgMail = require('@sendgrid/mail');

const config = require('./../config');

class BasicUtil {
    static generateToken(payload, expiration, cb) {
        return jwt.sign(
            payload, config.secretKey, {
                expiresIn: expiration
            }, (err, token) => {
                cb(err, token);
            });
    }

    static decodeToken(token, cb) {
        return jwt.verify(token, config.secretKey, (err, decoded) => {
            cb(err, decoded);
        })
    }

    static generateHash(password, cb) {
        return bcrypt.hash(password, 8, (err, hash) => {
            cb(err, hash);
        });
    }

    static compareHashToPassword(hash, password, cb) {
        return bcrypt.compare(password, hash, (err, valid) => {
            cb(err, valid)
        });
    }

    static sendMail(to, subject, html) {

        sgMail.setApiKey(config.api_key);

        const msg = {
            to, // Change to your recipient
            from: config.from, // Change to your verified sender
            subject,
            html
        }

        return sgMail.send(msg);
    }
}

module.exports = BasicUtil;