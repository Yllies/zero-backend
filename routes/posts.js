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
  // On find tous les posts avec la methode find
  PostCompany.find().then((data) => {
    if (data) {
      res.json({ posts: data });
    } else {
      res.json({ error: "Unknown error!" });
    }
  });
});

router.get("/charity", (req, res) => {
  // On find tous les posts avec la methode find
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

  // On check si tous les champs sont bien rempli
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
    // Si c'est pas tout rempli, on renvois un message d'erreur
    res.json({ result: false, error: "Missing or empty fields" });
  } else {
    // Sinon, on fait une verification si l'utilisateur qui veux publier est bien dans la BDD pour poster
    User.findOne({ token }).then((data) => {
      // Si il existe bien dans la BDD, on créer
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
        // On le save dans la bdd
        newPostCompany.save().then((newDoc) => {
          console.log("new doc saved", newDoc);
          res.json({ result: true, data: newDoc });
        });
      }
    });
  }
});

// Publish post by the association
router.post("/charity/publish/:token", (req, res) => {
  const { token } = req.params;
  const { title, description, category } = req.body;
  // Check si les champs sont rempli
  if (!checkBody(req.body, ["title", "description", "category"])) {
    // Renvoi erreur si c'est pas rempli
    res.json({ result: false, error: "Missing or empty fields" });
  }
  // On verifie que l'utilisateur qui veux publier est bien inscris dans la BDD
  User.findOne({ token }).then((data) => {
    console.log("user", data);
    // Si c'est le cas on créer le post
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
      // On save le post en BDD
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
  // Avec le findOne on vient chercher les détails du post via son ID récuperé en params
  PostCompany.findOne({ idPost })
    .populate("author") // Le populate permet de récuperer les infos de l'auteur du post
    .then((data) => {
      // Si le post est trouvé, on modifie donc les champs modifiés via on ID
      if (data) {
        PostCompany.updateOne(
          { idPost },
          { title, description, category, photo, quantity, availability_date }
        ).then((data) => {
          // Si c'est modifié, on renvoit un message "Post updated"
          if (data) {
            res.json({ result: true, message: "Post updated" });
          } else {
            // Sinon, on renvoit un message "Update failed"
            res.json({ result: false, message: "Update failed" });
          }
        });
      } else {
        // Si le post est pas trouvé, on renvoi "Post not found"
        res.json({ result: false, message: "Post not found" });
      }
    });
});

// Update post by the association
router.put("/charity/update/:token/:idPost", (req, res) => {
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
  // On cherche le post l'ID qu'on recupère en params
  PostCompany.findOne({ idPost })
    .populate("author") // On populate author pour récuperer les information de l'auteur du post afin de checker coté front si l'id de l'auteur correspond bien à l'id de l'utilisateur connecté
    .then((data) => {
      // Si c'est trouvé, on va delete le post via son ID
      if (data) {
        PostCompany.deleteOne({ idPost }).then((data) => {
          if (data.deletedCount === 0) {
            // Lorsqu'on supprime un post, on reçoit un objet avec une clef deletedCount, si c'est égale à 0, c'est que la suppression a échouée
            res.json({ result: false, message: "Delete failed" });
          } else {
            // Si c'est pas égale à 0, la suppression a été effectuée
            res.json({ result: true, message: "Post deleted" });
          }
        });
      } else {
        // Si le post est pas trouvée, on renvoi un message "Post not found"
        res.json({ result: false, message: "Post not found" });
      }
    });
});

// Delete post by the association
router.delete("/charity/delete/:token/:idPost", (req, res) => {
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
  const { idPost, token } = req.params;
  // On cherche le post via l'ID passé en params
  PostCompany.findOne({ idPost })
    .populate("isBookedBy") // On populate isBookedBy afin de récuperer les informations de celui qui a reservé ou non le post
    .then((data) => {
      if (data.isBookedBy === null) {
        User.findOne({ token }).then((data) => {
          // Si le post est trouvé est qu'il n'est reservé par personne, on reherche ensuite les infos de l'utilisateur connecté
          if (data) {
            // Lorsque les informations de l'utilisateur connecté son recupéré, on va modifier la clef etrangère du post isBookedBy en envoyant les informations de celui qui demande la réservation, puis on passe la clef Booked à "En attente"
            PostCompany.updateOne(
              { idPost },
              { isBookedBy: data, isBooked: "En attente" }
            ).then((data) => {
              if (data) {
                // Lorsque la modification de la clef etrangere et isBooked est effectué, on envoi un message "Réservation effectuée"

                // Si pas réservé = Non
                // Si en attente de réservation = En attente
                // Si réservé = Réservé
                res.json({ result: true, message: "Réservation effectuée" });
              } else {
                // Sinon on renvoi "Réservation échouée"
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

router.put("/association/book/cancel/:token/:idPost", (req, res) => {
  const { idPost } = req.params;
  // On cherche le post via son ID et on remet à null la clef etrangère isBookedby et isBooked à "Non" pour annuler une demande de réservation
  PostCompany.updateOne({ idPost }, { isBookedBy: null, isBooked: "Non" }).then(
    () => {
      // Lorsque c'est fait, on renvoi un message "Annulation de la réservation"
      res.json({ result: true, message: "Annulation de la réservation" });
    }
  );
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
    .populate("isBookedBy")
    .then((data) => {
      if (data) {
        res.json({ result: true, data });
      } else {
        res.json({ result: false, message: "Post non trouvé" });
      }
    });
});

// Find article by the id for the company
router.get("/company/details/:token/:idPost", (req, res) => {
  const { idPost } = req.params;
  PostAssociation.findOne({ idPost })
    .populate("author")
    .populate("isBookedBy")
    .then((data) => {
      if (data) {
        res.json({ result: true, data });
      } else {
        res.json({ result: false, message: "Post non trouvé" });
      }
    });
});
// Find all articles published by the company connected
router.get("/company/published/:token", (req, res) => {
  PostCompany.find()
    .populate("author")
    .then((data) => {
      const result = data.filter(
        (post) => post.author.token === req.params.token
      );
      res.json({ result: true, data: result });
    });
});
// Find all articles published by the association connected

router.get("/charity/published/:token", (req, res) => {
  PostAssociation.find()
    .populate("author")
    .then((data) => {
      const result = data.filter(
        (post) => post.author.token === req.params.token
      );
      res.json({ result: true, data: result });
    });
});

//route pour recupéré les données à utiliser pour les screen annonce
router.get("/company/:idPost", async (req, res) => {
  try {
    const { idPost } = req.params;
    console.log("idPost", idPost);
    const post = await PostCompany.findOne({ idPost })
      .populate("author")
      .populate("isBookedBy");
    console.log(post);

    console.log("route /company");
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    res.json({ post });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/charity/:idPost", async (req, res) => {
  try {
    const { idPost } = req.params;

    const post = await PostAssociation.findOne({ idPost }).populate("author");
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    res.json({ post });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
