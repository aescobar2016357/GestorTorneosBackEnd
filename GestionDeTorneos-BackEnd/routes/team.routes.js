'use strict'

var express = require('express');
var teamController = require('../controllers/team.controller');
var mdAuth = require('../middlewares/authenticated');
var connectMultiparty = require('connect-multiparty');
const upload = connectMultiparty({uploadDir: './uploads/team'})

var api = express.Router();

api.post('/:idL/saveTeam/:idU', [mdAuth.ensureAuth], teamController.createTeam);
api.get('/getTeams', teamController.getTeams);


module.exports = api;