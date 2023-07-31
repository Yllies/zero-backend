var express = require("express");
const router = express.Router();
require('../models/connection');
const User = require('../models/users');
const PostCompany = require("../models/posts_companies")
const PostAssociation = require("../models/posts_associations")

const { checkBody } = require("../modules/checkBody");

router.post("/company/publish/:token", (req, res) => {
    const {token} = req.params
    const {title, description, category, photo, quantity, availability_date} = req.body
if(!checkBody(req.body, ["title", "description", "category", "photo", "quantity", "availability_date" ])){
res.json({result: false, error: 'Missing or empty fields'})
}
User.findOne({token}).then(data=>{
    if(data){
        const newPostCompany = new PostCompany({
            title,
            description,
            category,
            photo,
            quantity,
            availability_date,
            author: data,
            creation_date: new Date()
        })
        newPostCompany.save().then(newDoc=>{
            res.json({result: true, data: newDoc})
            
           
        })
    }
})
});

router.post("/association/publish/:token", (req, res) => {
    const {token} = req.params
    const {title, description, category} = req.body
if(!checkBody(req.body, ["title", "description", "category"])){
res.json({result: false, error: 'Missing or empty fields'})
}
User.findOne({token}).then(data=>{
    if(data){
        const newPostAssociation = new PostAssociation({
            title,
            description,
            category,
            author: data,
            creation_date: new Date()
        })
        newPostAssociation.save().then(newDoc=>{
            res.json({result: true, data: newDoc})
           
        })
    }
})
});


module.exports = router;
// {
//     title: String,
//     description: String,
//     category: String,
//     photo: String,
//     quantity: Number,
//     availability_date: Date,
//     author: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
//     creation_date: Date,
// }