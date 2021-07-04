'use strict'

var Team = require('../models/team.model');
var User = require('../models/user.model')
var Liga = require('../models/liga.model')
var bcrypt = require('bcrypt-nodejs');
var jwt = require('../services/jwt');
var fs = require('fs');
var path = require('path');

function createTeam(req,res){
    var team = new Team();
    var ligaId = req.params.idL;
    var params = req.body;
    var userId = req.params.idU;

    if (userId != req.user.sub){
        res.status(500).send({message: 'No tienes permiso para agregar a un equipo'})
    }else{
        Liga.findById(ligaId, (err, ligaFind)=>{
            if(err){
                return res.status(500).send({message: 'Error general'})
            }else if(ligaFind){
                if(ligaFind.teamCount > 10){
                    res.send({message: 'No puedes agregar más de 10 equipos a una liga'})
                }else{
                    if(params.name && params.country){
                        Team.findOne({name: params.name}, (err,teamFind)=>{
                            if(err){
                                res.status(500).send({message: 'Error general'})
                                console.log(err)
                            }else if(teamFind){
                                res.send({message: 'Nombre de equipo ya en uso'})
                            }else{
                                team.name = params.name;
                                team.country = params.country;
                                team.golesFavor = 0;
                                team.golesContra = 0;
                                team.golesDiferencia = 0;
                                team.partidos = 0;
                                team.playerCount = 0;
                                team.puntos = 0;
                                team.save((err, teamSaved)=>{
                                    if(err){
                                        res.status(500).send({message: 'Error general al salvar el equipo'});
                                        console.log(err);
                                    }else if(teamSaved){
                                        Liga.findByIdAndUpdate(ligaId, {$push:{teams: teamSaved._id}}, {new: true}, (err, teamPush)=>{
                                            if(err){
                                                return res.status(500).send({message: 'Error general'})
                                            }else if(teamPush){
                                                Liga.findByIdAndUpdate(ligaId, {$inc:{teamCount: +1}}, {new:true}, (err, aumento)=>{
                                                    if(err){
                                                        res.send({message: 'Error al incrementar'})
                                                    }else if(aumento){
                                                        res.send({message: 'Equipo agregado', aumento})
                                                    }else{
                                                        res.send({message:'No se incremento'})
                                                    }
                                                })
                                            }else{
                                                return res.send({message: 'No se agregó el equipo'})
                                            }
                                        })
                                    }else{
                                        res.send({message: 'No se guado el equipo'});
                                    }
                                })
                            }
                        })
                    }else{
                        res.send({message: 'Porfavor ingresa nombre y pais del equipo'})
                    }
                }
            }else{
                return res.status(404).send({message: 'La liga a la que intentas agregar un equipo no existe'})
            }
        })
    }
}

function setPlayer(req,res){
    var userId = req.params.idU;
    var teamId = req.params.idE
    var params = req.body;
    var team = new Team();

    if (userId != req.user.sub){
        res.status(500).send({message: 'No tienes permiso para agregar jugadores a un equipo'})
    }else{
        let player = params._id
        User.findById(player, (err,userFind)=>{
            if(err){
                res.status(500).send({message: 'Error general al buscar el usuario'})
                console.log(err)
            }else if(userFind){
                Team.findById(teamId, (err,teamFind)=>{
                    if(err){
                        res.status(500).send({message: 'Error general al buscar el equipo'});
                        console.log(err);
                    }else if(teamFind){
                        if(teamFind.playerCount >= 10){
                            res.send({message:'No se pueden tener mas de diez jugadores'})
                        }else{  
                        var team = teamFind.playerCount ++;
                        let jugador = userFind;
                        
                        Team.findOneAndUpdate({_id: teamId}, {$push:{players: jugador._id}, team}, {new:true}, (err, playerSaved)=>{
                            if(err){
                                res.status(500).send({message: 'Error general al guardar el jugador'})
                                console.log(err)
                            }else if(playerSaved){
                                Team.findByIdAndUpdate(teamId, {$inc: {playerCount:+1}},{new:true}, (err, aumento)=>{
                                    if(err){
                                        res.status(500).send({message: 'Error al incrementar'})
                                        console.log(err)
                                    }else if(aumento){
                                        res.send({message: 'Jugador guarado: ', aumento})
                                    }else{
                                        res.send({message:'No se incremento'})
                                    }
                                })
                            }else{
                                res.send({message:'No se salvo el jugador'})
                            }
                        })
                        }
                    }else{
                        res.status(404).send({message: 'El equipo que buscas no existe'})
                    }
                })
                //res.send({message: 'Usario encontrado: ', userFind})
            }else{
                res.send({message: 'El usuario que quieres agregar no existe'})
            }
        })
    }
}

function uploadTeamImage(req, res){
    var userId = req.params.id;
    var teamId = req.params.idT;
    var update = req.body;
    var fileName;

    if(userId != req.user.sub){
        res.status(403).send({message: 'No tienes permisos para cambiar la foto de equipo'});
    }else{
        if(req.files){
            var filePath = req.files.image.path;
        
            var fileSplit = filePath.split('\\');
            var fileName = fileSplit[2];

            var extension = fileName.split('\.');
            var fileExt = extension[1];
            if( fileExt == 'png' ||
                fileExt == 'jpg' ||
                fileExt == 'jpeg' ||
                fileExt == 'gif'){
                    Team.findByIdAndUpdate(teamId, {logo: fileName}, {new:true}, (err, teamUpdated)=>{
                        if(err){
                            res.status(500).send({message: 'Error general'});
                        }else if(teamUpdated){
                            res.send({team: teamUpdated, teamImage:teamUpdated.logo});
                        }else{
                            res.status(400).send({message: 'No se ha podido actualizar'});
                        }
                    })
                }else{
                    fs.unlink(filePath, (err)=>{
                        if(err){
                            res.status(500).send({message: 'Extensión no válida y error al eliminar archivo'});
                        }else{
                            res.send({message: 'Extensión no válida'})
                        }
                    })
                }
        }else{
            res.status(400).send({message: 'No has enviado imagen a subir'})
        }
    }
}

function getImage(req,res){
    var fileName = req.params.fileName;
    var pathFile = './uploads/team/' + fileName;

    fs.exists(pathFile, (exists)=>{
        if(exists){
            res.sendFile(path.resolve(pathFile));
        }else{
            res.status(404).send({message: 'Imagen inexistente'});
        }
    })
}

function getTeams(req,res){
    Team.find({$query: {}, $orderby: {puntos: 1}}).exec((err, users)=>{
        if(err){
            res.status(500).send({message: 'Error general al buscar usuarios'});
            console.log(err);
        }else if(users){
            res.send({message: 'Usuarios encontrados: ', users})
        }else{
            res.send({message: 'No existe ningun usuario'})
        }
    })
}

module.exports ={
    createTeam,
    setPlayer,
    uploadTeamImage,
    getImage,
    getTeams
}