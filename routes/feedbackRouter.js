const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Feedbacks = require('../models/feedbacks');
const feedbackRouter = express.Router();
var authenticate = require('../authenticate');
const cors = require('./cors');

feedbackRouter.use(bodyParser.json());
feedbackRouter.use(express.json());
feedbackRouter.use(express.urlencoded({
  extended: true
}));

feedbackRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    //  Leaders.find({})
    Feedbacks.find(req.query)
    .then((feedbacks) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(feedbacks);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, (req, res, next) => {
    Feedbacks.create(req.body)
    .then((feedback) => {
        console.log('Feedback Created', feedback);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(feedback);
    }, (err) => next(err))
    .catch((err) => next(err));
})
module.exports = feedbackRouter;