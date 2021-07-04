'use strict'

var express = require('express');
var ligaController = require('../controllers/liga.controller')
var mdAuth = require('../middlewares/authenticated');
var connectMultiparty = require('connect-multiparty');
const upload = connectMultiparty({uploadDir: './uploads/user'})

var api = express.Router();

api.post('/createLiga/:idU', [mdAuth.ensureAuth], ligaController.createLiga)
api.get('/getTeams/:id', [mdAuth.ensureAuth, mdAuth.ensureAuthAdmin],ligaController.getTeams)

module.exports = api;