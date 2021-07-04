'use strict'

var express = require('express');
var teamController = require('../controllers/team.controller');
var mdAuth = require('../middlewares/authenticated');
var connectMultiparty = require('connect-multiparty');
const upload = connectMultiparty({uploadDir: './uploads/team'})

var api = express.Router();

api.post('/:idL/saveTeam/:idU', [mdAuth.ensureAuth], teamController.createTeam);
api.put('/:idE/setPlayer/:idU', [mdAuth.ensureAuth, mdAuth.ensureAuthCaptain], teamController.setPlayer);
api.get('/getTeams', teamController.getTeams);

//Image
api.put('/:id/teamImage/:idT', [mdAuth.ensureAuth,mdAuth.ensureAuthCaptain,upload], teamController.uploadTeamImage)
api.get('/getImageT/:fileName', [upload], teamController.getImage);

module.exports = api;