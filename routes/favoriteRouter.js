const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
var authenticate = require('../authenticate');
const cors = require('./cors');
const Favorites = require('../models/favorite');
const user = require('../models/user');
const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());
favoriteRouter.use(express.json());
favoriteRouter.use(express.urlencoded({
  extended: true
}));

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200) })
    .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
        Favorites.find({user:req.user._id})
            .populate('user')
            .populate('dishes')
            .exec((err,favorites)=>{
                if (err) return next(err);
                res.statusCode=200;
                res.setHeader('Content-Type' , 'application/json');
                res.json(favorites);
            });
           
     })

.post(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req, res, next) => {
     Favorites.findOne({user: req.user._id})
     .then((favorite) => {
      if(!favorite ) {
         Favorites.create({user: req.user._id})
        .then((favorite)=>{
            for ( i=0; i<req.body.length; i++) 
                if (favorite.dishes.indexOf(req.body[i]._id) < 0) 
                    favorite.dishes.push(req.body[i]);
                 favorite.save()
                .then((favorite) => {
                    Favorites.findById(favorite._id)
                    .populate('user')
                    .populate('dishes')
                    .then((favorite) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favorite);
                    })
                })
                .catch((err) => {
                    return next(err);
                });

      }).catch((err) => {
             return next(err);
     });
             
      }
      else {
         for (i = 0; i < req.body.length; i++ )
        if (favorite.dishes.indexOf(req.body[i]._id) < 0)                                  
            favorite.dishes.push(req.body[i]);
     favorite.save()
    .then((favorite) => {
        Favorites.findById(favorite._id)
        .populate('user')
        .populate('dishes')
        .then((favorite) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favorite);
        })
    })
    .catch((err) => {
        return next(err);
    });

      }

    }, (err) => next(err))
    .catch((err) => next(err));       
})

.delete(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req, res, next) => {
    Favorites.findOneAndRemove({user: req.user._id},(err,favorite)=>{
    if(err) return next(err);
     res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(favorite);
     })
});
 
favoriteRouter.route('/:dishId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user._id})
    .then((favorites) => {
        if (!favorites) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            return res.json({"exists": false, "favorites": favorites});
        }
        else {
            if (favorites.dishes.indexOf(req.params.dishId) < 0) {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                return res.json({"exists": false, "favorites": favorites});
            }
            else {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                return res.json({"exists": true, "favorites": favorites});
            }
        }
    }, (err) => next(err))
    .catch((err) => next(err))
})
  
 
.post(cors.corsWithOptions,authenticate.verifyUser,(req, res, next) => {
    Favorites.findOne({user: req.user._id},(err,favorite) =>{
        if (err) return next(err);
      if(favorite == null) {
          Favorites.create({user: req.user._id})
         .then((favorite)=> {
            favorite.dishes.push({"_id" :(req.params.dishId)});
            favorite.save()
            Favorites.findById(favorite._id)
            .populate('user')
            .populate('dishes')
            .then((favorite) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            })
        .catch((err) =>{
            return next(err);
        });
     })
     .catch((err) =>{
        return next(err);
     })
    }
    else {            
             if(favorite.dishes.indexOf(req.params.dishId)<0){
              favorite.dishes.push({"_id" :req.params.dishId});
              favorite.save()
              .then((favorite) => {
                Favorites.findById(favorite._id)
                .populate('user')
                .populate('dishes')
                .then((favorite) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
              })
             .catch((err) => {
                 return next(err);
             })          
              })
            }
            else {
                res.statusCode=403;
                res.setHeader('Content-Type', 'text/plain');
                res.end('Dish  ..'+ req.params.dishId +'alreday in list')
            }
        }
});
 
})
 
 
.delete(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req, res, next) => {
    Favorites.findOne({user: req.user._id},(err,favorite) =>{
        if (err) return next(err);
     
     var index =favorite.dishes.indexOf(req.params.dishId);
     console.log(index);
        if (index > -1){
            favorite.dishes.splice(index, 1); 
            favorite.save()
            .then((favorite) => {
                 Favorites.findById(favorite._id)
                 .populate('user')
                 .populate('dishes')
                .then((favorite) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                })
            })
                .catch ((err)=>{
                    return next(err);
                })
           }
            else {
                res.statusCode=404;
                res.setHeader('Contnet-Type', 'Text/plain');
                 res.end('Dish  ' +req.params._id + 'not in your list')
            }
    });

}); 

module.exports = favoriteRouter;