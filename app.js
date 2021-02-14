const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const authController = require('./controllers/auth.controller');
const socialAuthController = require('./controllers/social-auth.controller');
const groceryController = require('./controllers/grocery.controller');

const mongoConnect = require('./util/database.util').mongoConnect;

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use('/auth', authController);
app.use('/social-auth', socialAuthController);
app.use('/grocery', groceryController);

mongoConnect(()=>{
    app.listen(port, ()=>{
        console.log('Server Running');
    })
})

