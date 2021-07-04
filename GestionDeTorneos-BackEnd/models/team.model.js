'use strict'

var mongoose = require('mongoose')
var Schema = mongoose.Schema

var teamSchema = Schema({
    name:String,
    country:String,
    playerCount:Number,
    logo:String,
    golesFavor:Number,
    golesContra:Number,
    golesDiferencia:Number,
    partidos:Number,
    puntos:Number,
    players: [{type: Schema.ObjectId, ref:'user'}]
})

module.exports = mongoose.model('team', teamSchema);