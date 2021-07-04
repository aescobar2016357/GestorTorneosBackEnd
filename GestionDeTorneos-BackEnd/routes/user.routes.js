'use strict'

var express = require('express');
var userController = require('../controllers/user.controller');
var mdAuth = require('../middlewares/authenticated');
var connectMultiparty = require('connect-multiparty');
const upload = connectMultiparty({uploadDir: './uploads/user'})

var api = express.Router();

api.post('/register', userController.register);
api.post('/login', userController.login);

//Middlewares
api.post('/saveUser/:idU', [mdAuth.ensureAuth, mdAuth.ensureAuthAdmin] ,userController.saveUser)
api.put('/updateUser/:idU', mdAuth.ensureAuth, userController.updateUser)
api.delete('/deleteUser/:idU', mdAuth.ensureAuth, userController.deleteUser)
api.get('/getUsers', [mdAuth.ensureAuth, mdAuth.ensureAuthAdmin], userController.getUsers)

//image
api.put('/:id/uploadImage', [mdAuth.ensureAuth, upload], userController.uploadImage);
api.get('/getImage/:fileName', [upload], userController.getImage);

module.exports = api;