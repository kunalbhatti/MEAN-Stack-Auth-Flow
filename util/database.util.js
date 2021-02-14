const mongoDb = require('mongodb');
const MongoClient = mongoDb.MongoClient;
const config = require('./../config');

const uri = config.mongoDbUri;

const client = new MongoClient(uri);

let _db;

function mongoConnect(c) {
    client.connect().then(
        client => {
            if(!_db) {
                _db = client.db();
            }
            console.log('Database Connected');
            c();
        }
    );
}

const getDb = () => {
    if(_db) {
        return _db;
    }

    throw 'Database not connected';
}

module.exports = {
    mongoConnect,
    getDb
};