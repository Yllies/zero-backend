var express = require("express");
const router = express.Router();
require("../models/connection");
const User = require("../models/users");
const PostCompany = require("../models/posts_companies");
const PostAssociation = require("../models/posts_associations");
const uniqid = require("uniqid");

const { checkBody } = require("../modules/checkBody");

// Get all company posts
router.get("/company", (req, res) => {
  PostCompany.find().then((data) => {
    if (data) {
      res.json({ posts: data });
    } else {
      res.json({ error: "Unknown error!" });
    }
  });
});

router.get("/charity", (req, res) => {
  PostAssociation.find().then((data) => {
    if (data) {
      res.json({ posts: data });
    } else {
      res.json({ error: "Unknown error!" });
    }
  });
});

// Publish post by the company
router.post("/company/publish/:token", (req, res) => {
  const { token } = req.params;
  const { title, description, category, photo, quantity, availability_date } =
    req.body;
  if (
    !checkBody(req.body, [
      "title",
      "description",
      "category",
      "photo",
      "quantity",
      "availability_date",
    ])
  ) {
    res.json({ result: false, error: "Missing or empty fields" });
  } else {
    User.findOne({ token }).then((data) => {
      if (data) {
        const newPostCompany = new PostCompany({
          idPost: uniqid(), // Generating random uniq id to be more secure.
          //                 We want to transit the uniq id in the URL,
          //                  and we never do that with the id generating by mongoose
          title,
          description,
          category,
          author: data,
          photo,
          quantity,
          availability_date,
          creation_date: new Date(),
          isBooked: "Non", // If not booked = Non
          // If is in waiting = En attente
          // If is booked = Oui
        });
        newPostCompany.save().then((newDoc) => {
          console.log("new doc saved", newDoc);
          res.json({ result: true, data: newDoc });
        });
      }
    });
  }
});

// Publish post by the association
router.post("/association/publish/:token", (req, res) => {
  const { token } = req.params;
  const { title, description, category } = req.body;
  if (!checkBody(req.body, ["title", "description", "category"])) {
    res.json({ result: false, error: "Missing or empty fields" });
  }
  User.findOne({ token }).then((data) => {
    console.log("user", data);
    if (data) {
      const newPostAssociation = new PostAssociation({
        idPost: uniqid(), // Generating random uniq id to be more secure.
        //                 We want to transit the uniq id in the URL,
        //                  and we never do that with the id generating by mongoose
        title,
        description,
        category,
        author: data,
        creation_date: new Date(),
      });
      newPostAssociation.save().then((newDoc) => {
        res.json({ result: true, data: newDoc });
      });
    }
  });
});

// Update post by the company
router.put("/company/update/:token/:idPost", (req, res) => {
  const { idPost } = req.params;
  const { title, description, category, photo, quantity, availability_date } =
    req.body;
  PostCompany.findOne({ idPost }, {})
    .populate("author")
    .then((data) => {
      if (data) {
        PostCompany.updateOne(
          { idPost },
          { title, description, category, photo, quantity, availability_date }
        ).then((data) => {
          if (data) {
            res.json({ result: true, message: "Post updated" });
          } else {
            res.json({ result: false, message: "Update failed" });
          }
        });
      } else {
        res.json({ result: false, message: "Update failed" });
      }
    });
});

// Update post by the association
router.put("/association/update/:token/:idPost", (req, res) => {
  const { idPost } = req.params;
  const { title, description, category } = req.body;
  PostAssociation.findOne({ idPost })
    .populate("author")
    .then((data) => {
      if (data) {
        PostAssociation.updateOne(
          { idPost },
          { title, description, category }
        ).then((data) => {
          if (data) {
            res.json({ result: true, message: "Post updated" });
          } else {
            res.json({ result: false, message: "Update failed" });
          }
        });
      } else {
        res.json({ result: false, message: "Update failed" });
      }
    });
});

// Delete post by the company
router.delete("/company/delete/:token/:idPost", (req, res) => {
  const { idPost } = req.params;

  PostCompany.findOne({ idPost })
    .populate("author")
    .then((data) => {
      if (data) {
        PostCompany.deleteOne({ idPost }).then((data) => {
          if (data.deletedCount === 0) {
            res.json({ result: false, message: "Delete failed" });
          } else {
            res.json({ result: true, message: "Post deleted" });
          }
        });
      } else {
        res.json({ result: false, message: "Delete failed" });
      }
    });
});

// Delete post by the association
router.delete("/association/delete/:token/:idPost", (req, res) => {
  const { idPost } = req.params;

  PostAssociation.findOne({ idPost })
    .populate("author")
    .then((data) => {
      if (data) {
        PostAssociation.deleteOne({ idPost }).then((data) => {
          if (data.deletedCount === 0) {
            res.json({ result: false, message: "Delete failed" });
          } else {
            res.json({ result: true, message: "Post deleted" });
          }
        });
      } else {
        res.json({ result: false, message: "Delete failed" });
      }
    });
});

// Send a request booking by the association
router.put("/association/book/:token/:idPost", (req, res) => {
  const { idPost } = req.params;
  const { token } = req.params;
  PostCompany.findOne({ idPost })
    .populate("isBookedBy")
    .then((data) => {
      if (data.isBookedBy === null) {
        User.findOne({ token }).then((data) => {
          if (data) {
            PostCompany.updateOne(
              { idPost },
              { isBookedBy: data, isBooked: "En attente" }
            ).then((data) => {
              if (data) {
                // Si pas réservé = Non
                // Si en attente de réservation = En attente
                // Si réservé = Réservé
                res.json({ result: true, message: "Réservation effectuée" });
              } else {
                res.json({ result: false, message: "Réservation échouée" });
              }
            });
          }
        });
      } else {
        res.json({ result: false, message: "Déjà réservé" });
      }
    });
});

// Refuse a request booking by the company
router.put("/company/book/refuse/:token/:idPost", (req, res) => {
  const { idPost } = req.params;

  PostCompany.findOne({ idPost })
    .populate("isBookedBy")
    .then((data) => {
      if (data.isBooked === "En attente") {
        PostCompany.updateOne(
          { idPost },
          { isBookedBy: null, isBooked: "Non" }
        ).then((data) => {
          if (data) {
            res.json({ result: true, message: "Réservation refusée" });
          } else {
            res.json({ result: false, message: "Annulation échouée" });
          }
        });
      }
    });
});

// Accept a request booking by the company

router.put("/company/book/accept/:token/:idPost", (req, res) => {
  const { idPost } = req.params;

  PostCompany.findOne({ idPost })
    .populate("isBookedBy")
    .then((dataPopulate) => {
      if (dataPopulate.isBooked === "En attente") {
        PostCompany.updateOne({ idPost }, { isBooked: "Oui" }).then((data) => {
          if (data) {
            res.json({
              result: true,
              message: "Réservation confirmée",
              dataPopulate,
            });
          } else {
            res.json({ result: false, message: "Confirmation échouée" });
          }
        });
      }
    });
});

// Find article by the idPost for the association
router.get("/association/details/:token/:idPost", (req, res) => {
  const { idPost } = req.params;
  PostCompany.findOne({ idPost })
    .populate("author")
    .then((data) => {
      if (data) {
        res.json({ result: true, data });
      } else {
        res.json({ result: false, message: "Post non trouvé" });
      }
    });
});

// Find article by the id for the association
router.get("/company/details/:token/:idPost", (req, res) => {
  const { idPost } = req.params;
  PostAssociation.findOne({ idPost })
    .populate("author")
    .then((data) => {
      if (data) {
        res.json({ result: true, data });
      } else {
        res.json({ result: false, message: "Post non trouvé" });
      }
    });
});

router.get("/company/published/:token", (req, res) => {
  PostCompany.find()
    .populate("author")
    .then((data) => {
      const result = data.filter(
        (post) => post.token === req.params.token
      );
      res.json({ result: true, data });
    });
});

//route pour recupéré les données à utiliser pour les screen annonce
router.get('/company/:idPost', async (req, res) => {
  try {
    const { idPost } = req.params;
    
    const post = await PostCompany.findOne({ idPost }).populate('author');

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json({ post });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

  router.get('/charity/:idPost', async (req,res) => {
    try {
      const { idPost } = req.params;
      
      const post = await PostAssociation.findOne({ idPost }).populate('author');
  
      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }
  
      res.json({ post });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });
    
module.exports = router;
