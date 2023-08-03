var express = require("express");
const router = express.Router();
require('../models/connection');
const User = require('../models/users');
const PostCompany = require("../models/posts_companies")
const PostAssociation = require("../models/posts_associations")
const uniqid = require('uniqid');

const { checkBody } = require("../modules/checkBody");

// Publish post by the company
router.post("/company/publish/:token", (req, res) => {
    const {token} = req.params
    const {title, description, category, photo, quantity, availability_date} = req.body
if(!checkBody(req.body, ["title", "description", "category", "photo", "quantity", "availability_date" ])){
res.json({result: false, error: 'Missing or empty fields'})
}else{

    User.findOne({token}).then(data=>{
      
        if(data){
            const newPostCompany = new PostCompany({
                idPost: uniqid(),// Generating random uniq id to be more secure.
                //                 We want to transit the uniq id in the URL, 
                //                  and we never do that with the id generating by mongoose
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
}
});

// Publish post by the association
router.post("/association/publish/:token", (req, res) => {
    const {token} = req.params
    const {title, description, category} = req.body
if(!checkBody(req.body, ["title", "description", "category"])){
res.json({result: false, error: 'Missing or empty fields'})
}
User.findOne({token}).then(data=>{
    if(data){
        const newPostAssociation = new PostAssociation({
            idPost: uniqid(), // Generating random uniq id to be more secure.
            //                 We want to transit the uniq id in the URL, 
            //                  and we never do that with the id generating by mongoose
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

// Update post by the company
router.put("/company/update/:token/:idPost", (req, res)=>{
    const {idPost} = req.params;
    const {title, description, category, photo, quantity, availability_date} = req.body
    PostCompany.findOne({idPost}, {}).populate("author").then(data=>{
        if(data){
            PostCompany.updateOne({idPost}, {title, description, category, photo, quantity, availability_date}).then(data=>{
                if(data){
                    res.json({result: true, message: "Post updated"})
                }else{
                    res.json({result: false, message: "Update failed"})
                }
            })
        }else{
            res.json({result: false, message: "Update failed"})
        }
    })
})

// Update post by the association
router.put("/association/update/:token/:idPost", (req, res)=>{
    const {idPost} = req.params;
    const {title, description, category} = req.body
    PostAssociation.findOne({idPost}, {}).populate("author").then(data=>{
        if(data){
            PostAssociation.updateOne({idPost}, {title, description, category}).then(data=>{
                if(data){
                    res.json({result: true, message: "Post updated"})
                }else{
                    res.json({result: false, message: "Update failed"})
                }
            })
        }else{
            res.json({result: false, message: "Update failed"})
        }
    })
})

// Delete post by the company
router.delete("/company/delete/:token/:idPost", (req, res) => {
    const { idPost } = req.params

    PostCompany.findOne({idPost}).populate("author").then(data=>{
        if(data){
            PostCompany.deleteOne({ idPost }).then((data) => {
                
                if (data.deletedCount === 0) {
                  res.json({ result: false, message: "Delete failed" });
                } else {
                  res.json({ result: true, message: "Post deleted" });
                }
              });
         }else{
            res.json({result: false, message: "Delete failed"})
        }
    })

  });

  // Delete post by the association
router.delete("/association/delete/:token/:idPost", (req, res) => {
    const { idPost } = req.params;

    PostAssociation.findOne({idPost}).populate("author").then(data=>{
    

        if(data){
            PostAssociation.deleteOne({ idPost }).then((data) => {
                if (data.deletedCount === 0) {
                  res.json({ result: false, message: "Delete failed" });
                } else {
                  res.json({ result: true, message: "Post deleted" });
                }
              });
        }else{
            res.json({result: false, message: "Delete failed"})
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