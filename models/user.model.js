const getDb = require('./../util/database.util').getDb;

class User {
    constructor(name, email, password, activated, fb_id) {
        this.name = name;
        this.email = email;
        this.fb_id = fb_id ? fb_id : null;
        this.password = password;
        this.activated = activated ? true : false;
    }

    createUser() {
        const db = getDb();
        return db.collection('users').insertOne(this);
    }

    static findUser(options) {
        const db = getDb();
        return db.collection('users').findOne(options);
    }

    static updatedUser(filter, update) {
        const db = getDb();
        return db.collection('users').updateOne(filter, {
            $set: update
        });
    }

    static updateLoginAttemptCount(filter) {
        const db = getDb();
        return db.collection('users').updateOne(
            filter, {
                $inc: {
                    'loginAttempt': 1 // increment loginAttempt by 1
                }
            }
        );
    }
}

module.exports = User;