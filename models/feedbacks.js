
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
require('mongoose-currency').loadType(mongoose);
const Currency = mongoose.Types.Currency;

const feedbackSchema = new Schema({
    firstname: {
        type: String,
        default: ''
    },
    lastname: {
        type: String,
        default: ''
    },
    telnum: {
        type: Number
        },
    email: {
        type: String
        },
    agree :{
        type:Boolean,
        default:false
    },
    contactType: {
        type: String,
        default: ''
    },
    message: {  
        type:String,
        default:''   
    },
}, {
    timestamps: true
});

var Feedbacks = mongoose.model('Feedback', feedbackSchema);

 module.exports =  Feedbacks;

 