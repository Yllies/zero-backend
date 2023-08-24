var express = require("express");
const router = express.Router();
require("../models/connection");
const User = require("../models/users");
const PostCompany = require("../models/posts_companies");
const PostAssociation = require("../models/posts_associations");
const uniqid = require("uniqid");
const { checkBody } = require("../modules/checkBody");

// TOUS LES POSTS DES ENTREPRISES
router.get("/company", (req, res) => {
  // Recherche de toutes les publications de sociétés dans la base de données
  PostCompany.find().then((data) => {
    // Vérification si des données ont été trouvées
    if (data) {
      // Réponse avec les données de publications de sociétés
      res.json({ posts: data });
    } else {
      // Réponse en cas d'erreur inconnue
      res.json({ error: "Erreur inconnue !" });
    }
  });
});

// TOUS LES POSTS DES ASSOCIATIONS
router.get("/charity", (req, res) => {
  // Recherche de toutes les publications d'associations caritatives dans la base de données
  PostAssociation.find().then((data) => {
    // Vérification si des données ont été trouvées
    if (data) {
      // Réponse avec les données de publications d'associations caritatives
      res.json({ posts: data });
    } else {
      // Réponse en cas d'erreur inconnue
      res.json({ error: "Erreur inconnue !" });
    }
  });
});

// NOUVEAU DON
router.post("/company/publish/:token", (req, res) => {
  // Récupération du token d'authentification à partir des paramètres de la requête
  const { token } = req.params;
  // Récupération des champs nécessaires à partir du corps de la requête
  const { title, description, category, photo, quantity, availability_date } =
    req.body;
  // Vérification si tous les champs requis sont présents et non vides dans la requête
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
    res.json({ result: false, error: "Champs manquants ou vides" });
  } else {
    // Recherche de l'utilisateur correspondant au token dans la base de données
    User.findOne({ token }).then((data) => {
      // Si il existe bien dans la BDD, on créer
      if (data) {
        // Création d'une nouvelle publication de société avec les données fournies
        const newPostCompany = new PostCompany({
          idPost: uniqid(), // Génération d'un identifiant unique aléatoire pour plus de sécurité.
          //                 Nous voulons transmettre cet identifiant unique dans l'URL,
          //                 et nous ne le faisons jamais avec l'identifiant généré par mongoose
          title,
          description,
          category,
          author: data,
          photo,
          quantity,
          availability_date,
          creation_date: new Date(),
          isBooked: "Non", // Si non réservé = Non
          // Si en attente = En attente
          // Si réservé = Oui
        });
        // Sauvegarde de la nouvelle publication de société dans la base de données
        newPostCompany.save().then((newDoc) => {
          res.json({ result: true, data: newDoc });
        });
      }
    });
  }
});

// NOUVEAU BESOIN
router.post("/charity/publish/:token", (req, res) => {
  // Récupération du token d'authentification à partir des paramètres de la requête
  const { token } = req.params;
  // Récupération des champs nécessaires à partir du corps de la requête
  const { title, description, category } = req.body;
  // Vérification si tous les champs requis sont présents et non vides dans la requête
  if (!checkBody(req.body, ["title", "description", "category"])) {
    res.json({ result: false, error: "Champs manquants ou vides" });
  } else {
    // Recherche de l'utilisateur correspondant au token dans la base de données
    User.findOne({ token }).then((data) => {
      // Affichage de l'utilisateur trouvé dans la console à des fins de vérification
      if (data) {
        // Création d'une nouvelle publication d'association caritative avec les données fournies
        const newPostAssociation = new PostAssociation({
          idPost: uniqid(), // Génération d'un identifiant unique aléatoire pour plus de sécurité.
          //                 Nous voulons transmettre cet identifiant unique dans l'URL,
          //                 et nous ne le faisons jamais avec l'identifiant généré par mongoose
          title,
          description,
          category,
          author: data,
          creation_date: new Date(),
        });
        // Sauvegarde de la nouvelle publication d'association caritative dans la base de données
        newPostAssociation.save().then((newDoc) => {
          // Réponse avec les informations de la nouvelle publication
          res.json({ result: true, data: newDoc });
        });
      }
    });
  }
});

// MAJ DON
router.put("/company/update/:token/:idPost", (req, res) => {
  // Récupération de l'id de la publication à partir des paramètres de la requête
  const { idPost } = req.params;
  // Récupération des champs nécessaires à partir du corps de la requête
  const { title, description, category, photo, quantity, availability_date } =
    req.body;
  // Recherche de la publication d'offre de société correspondant à l'id dans la base de données
  PostCompany.findOne({ idPost }, {})
    .populate("author") // Remplissage de la référence d'auteur pour obtenir les informations de l'auteur
    .then((data) => {
      // Si le post est trouvé, on modifie donc les champs modifiés via on ID
      if (data) {
        // Mise à jour de la publication d'offre de société avec les nouvelles données
        PostCompany.updateOne(
          { idPost },
          { title, description, category, photo, quantity, availability_date }
        ).then((data) => {
          // Si c'est modifié, on renvoit un message "Post updated"
          if (data) {
            // Réponse en cas de succès de la mise à jour
            res.json({ result: true, message: "Publication mise à jour" });
          } else {
            // Réponse en cas d'échec de la mise à jour
            res.json({ result: false, message: "Mise à jour échouée" });
          }
        });
      } else {
        // Réponse en cas d'absence de la publication à mettre à jour
        res.json({ result: false, message: "Mise à jour échouée" });
      }
    });
});

// MAJ BESOIN
router.put("/charity/update/:token/:idPost", (req, res) => {
  // Récupération de l'id de la publication à partir des paramètres de la requête
  const { idPost } = req.params;
  // Récupération des champs nécessaires à partir du corps de la requête
  const { title, description, category } = req.body;
  // Recherche de la publication d'offre d'association caritative correspondant à l'id dans la base de données
  PostAssociation.findOne({ idPost })
    .populate("author") // Remplissage de la référence d'auteur pour obtenir les informations de l'auteur
    .then((data) => {
      if (data) {
        // Mise à jour de la publication d'offre d'association caritative avec les nouvelles données
        PostAssociation.updateOne(
          { idPost },
          { title, description, category }
        ).then((data) => {
          if (data) {
            // Réponse en cas de succès de la mise à jour
            res.json({ result: true, message: "Publication mise à jour" });
          } else {
            // Réponse en cas d'échec de la mise à jour
            res.json({ result: false, message: "Mise à jour échouée" });
          }
        });
      } else {
        // Réponse en cas d'absence de la publication à mettre à jour
        res.json({ result: false, message: "Mise à jour échouée" });
      }
    });
});

// SUPPRESSION DON
router.delete("/company/delete/:token/:idPost", (req, res) => {
  // Récupération de l'id de la publication à partir des paramètres de la requête
  const { idPost } = req.params;
  // Recherche de la publication d'offre de société correspondant à l'id dans la base de données
  PostCompany.findOne({ idPost })
    .populate("author") // Remplissage de la référence d'auteur pour obtenir les informations de l'auteur
    .then((data) => {
      // Si c'est trouvé, on va delete le post via son ID
      if (data) {
        // Suppression de la publication d'offre de société correspondant à l'id de la base de données
        PostCompany.deleteOne({ idPost }).then((data) => {
          if (data.deletedCount === 0) {
            // Réponse en cas d'échec de la suppression
            res.json({ result: false, message: "Suppression échouée" });
          } else {
            // Réponse en cas de succès de la suppression
            res.json({ result: true, message: "Publication supprimée" });
          }
        });
      } else {
        // Réponse en cas d'absence de la publication à supprimer
        res.json({ result: false, message: "Suppression échouée" });
      }
    });
});

// SUPPRESSION BESOIN
router.delete("/charity/delete/:token/:idPost", (req, res) => {
  // Récupération de l'id de la publication à partir des paramètres de la requête
  const { idPost } = req.params;
  // Recherche de la publication d'offre d'association caritative correspondant à l'id dans la base de données
  PostAssociation.findOne({ idPost })
    .populate("author") // Remplissage de la référence d'auteur pour obtenir les informations de l'auteur
    .then((data) => {
      if (data) {
        // Suppression de la publication d'offre d'association caritative correspondant à l'id de la base de données
        PostAssociation.deleteOne({ idPost }).then((data) => {
          if (data.deletedCount === 0) {
            // Réponse en cas d'échec de la suppression
            res.json({ result: false, message: "Suppression échouée" });
          } else {
            // Réponse en cas de succès de la suppression
            res.json({ result: true, message: "Publication supprimée" });
          }
        });
      } else {
        // Réponse en cas d'absence de la publication à supprimer
        res.json({ result: false, message: "Suppression échouée" });
      }
    });
});

// RESERVATION DE DONS
router.put("/charity/book/:token/:idPost", (req, res) => {
  // Récupération de l'id de la publication et du token d'authentification à partir des paramètres de la requête
  const { idPost, token } = req.params;
  // Recherche de la publication d'offre de société correspondant à l'id dans la base de données
  PostCompany.findOne({ idPost })
    .populate("isBookedBy") // Remplissage de la référence de réservation pour obtenir les informations de la réservation
    .then((data) => {
      if (data.isBookedBy === null) {
        // Si la publication n'est pas encore réservée
        User.findOne({ token }).then((data) => {
          // Si le post est trouvé est qu'il n'est reservé par personne, on reherche ensuite les infos de l'utilisateur connecté
          if (data) {
            // Mise à jour de la publication d'offre de société avec les nouvelles données de réservation
            PostCompany.updateOne(
              { idPost },
              { isBookedBy: data, isBooked: "En attente" }
            ).then((data) => {
              if (data) {
                // Réponse en cas de succès de la réservation
                // Si pas réservé = Non
                // Si en attente de réservation = En attente
                // Si réservé = Réservé
                res.json({ result: true, message: "Réservation effectuée" });
              } else {
                // Réponse en cas d'échec de la réservation
                res.json({ result: false, message: "Réservation échouée" });
              }
            });
          }
        });
      } else {
        // Réponse en cas de déjà réservé
        res.json({ result: false, message: "Déjà réservé" });
      }
    });
});

// ANNULATION DE LA RESERVATION
router.put("/charity/book/cancel/:token/:idPost", (req, res) => {
  // Récupération de l'id de la publication à partir des paramètres de la requête
  const { idPost } = req.params;
  // Mise à jour de la publication d'offre de société pour annuler la réservation
  PostCompany.updateOne({ idPost }, { isBookedBy: null, isBooked: "Non" }).then(
    () => {
      // Réponse en cas d'annulation de la réservation
      res.json({ result: true, message: "Annulation de la réservation" });
    }
  );
});

// REFUS DE LA RESERVATION
router.put("/company/book/refuse/:token/:idPost", (req, res) => {
  // Récupération de l'id de la publication à partir des paramètres de la requête
  const { idPost } = req.params;
  // Recherche de la publication d'offre de société correspondant à l'id dans la base de données
  PostCompany.findOne({ idPost })
    .populate("isBookedBy") // Remplissage de la référence de réservation pour obtenir les informations de la réservation
    .then((data) => {
      if (data.isBooked === "En attente") {
        // Si la publication est en attente de réservation
        PostCompany.updateOne(
          { idPost },
          { isBookedBy: null, isBooked: "Non" }
        ).then((data) => {
          if (data) {
            // Réponse en cas de succès de refus de la réservation
            res.json({ result: true, message: "Réservation refusée" });
          } else {
            // Réponse en cas d'échec d'annulation de la réservation
            res.json({ result: false, message: "Annulation échouée" });
          }
        });
      }
    });
});

// ACCEPTATION DE LA RESERVATION
router.put("/company/book/accept/:token/:idPost", (req, res) => {
  // Récupération de l'id de la publication à partir des paramètres de la requête
  const { idPost } = req.params;
  // Recherche de la publication d'offre de société correspondant à l'id dans la base de données
  PostCompany.findOne({ idPost })
    .populate("isBookedBy") // Remplissage de la référence de réservation pour obtenir les informations de la réservation
    .then((dataPopulate) => {
      if (dataPopulate.isBooked === "En attente") {
        // Si la publication est en attente de réservation
        PostCompany.updateOne({ idPost }, { isBooked: "Oui" }).then((data) => {
          if (data) {
            // Réponse en cas de succès de la confirmation de la réservation
            res.json({
              result: true,
              message: "Réservation confirmée",
              dataPopulate,
            });
          } else {
            // Réponse en cas d'échec de la confirmation de la réservation
            res.json({ result: false, message: "Confirmation échouée" });
          }
        });
      }
    });
});

// DETAILS DON
router.get("/charity/details/:token/:idPost", (req, res) => {
  // Récupération de l'id de la publication à partir des paramètres de la requête
  const { idPost } = req.params;
  // Recherche de la publication d'offre de société correspondant à l'id dans la base de données
  PostCompany.findOne({ idPost })
    .populate("author") // Remplissage de la référence d'auteur pour obtenir les informations de l'auteur
    .then((data) => {
      if (data) {
        // Réponse en cas de succès avec les détails de la publication
        res.json({ result: true, data });
      } else {
        // Réponse en cas d'absence de la publication
        res.json({ result: false, message: "Publication non trouvée" });
      }
    });
});

// DETAILS BESOIN
router.get("/company/details/:token/:idPost", (req, res) => {
  // Récupération de l'id de la publication à partir des paramètres de la requête
  const { idPost } = req.params;
  // Recherche de la publication d'offre d'association caritative correspondant à l'id dans la base de données
  PostAssociation.findOne({ idPost })
    .populate("author") // Remplissage de la référence d'auteur pour obtenir les informations de l'auteur
    .then((data) => {
      if (data) {
        // Réponse en cas de succès avec les détails de la publication
        res.json({ result: true, data });
      } else {
        // Réponse en cas d'absence de la publication
        res.json({ result: false, message: "Publication non trouvée" });
      }
    });
});

// LISTE DONS PUBLIES
router.get("/company/published/:token", (req, res) => {
  // Recherche de toutes les publications d'offres de société dans la base de données
  PostCompany.find()
    .populate("author") // Remplissage de la référence d'auteur pour obtenir les informations de l'auteur
    .then((data) => {
      // Filtrer les publications pour n'afficher que celles de l'entreprise associée au token
      const result = data.filter(
        (post) => post.author.token === req.params.token
      );
      // Réponse en cas de succès avec les publications filtrées
      res.json({ result: true, data: result });
    });
});

// LISTE BESOINS PUBLIES
router.get("/charity/published/:token", (req, res) => {
  // Recherche de toutes les publications d'offres d'association caritative dans la base de données
  PostAssociation.find()
    .populate("author") // Remplissage de la référence d'auteur pour obtenir les informations de l'auteur
    .then((data) => {
      // Filtrer les publications pour n'afficher que celles de l'association caritative associée au token
      const result = data.filter(
        (post) => post.author.token === req.params.token
      );
      // Réponse en cas de succès avec les publications filtrées
      res.json({ result: true, data: result });
    });
});

// DETAILS DON PUBLIE
router.get("/company/:idPost", async (req, res) => {
  try {
    // Récupération de l'id de la publication à partir des paramètres de la requête
    const { idPost } = req.params;
    // Recherche de la publication d'offre de société correspondant à l'id dans la base de données
    const post = await PostCompany.findOne({ idPost })
      .populate("author") // Remplissage de la référence d'auteur pour obtenir les informations de l'auteur
      .populate("isBookedBy"); // Remplissage de la référence de réservation pour obtenir les informations de la réservation
    // Vérification de l'existence de la publication
    if (!post) {
      return res.status(404).json({ error: "Publication non trouvée" });
    }
    // Réponse en cas de succès avec les détails de la publication
    res.json({ post });
  } catch (error) {
    // Réponse en cas d'erreur interne du serveur
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
});

// DETAILS BESOIN PUBLIE
router.get("/charity/:idPost", async (req, res) => {
  try {
    // Récupération de l'id de la publication à partir des paramètres de la requête
    const { idPost } = req.params;
    // Recherche de la publication d'offre d'association caritative correspondant à l'id dans la base de données
    const post = await PostAssociation.findOne({ idPost }).populate("author");
    // Vérification de l'existence de la publication
    if (!post) {
      return res.status(404).json({ error: "Publication non trouvée" });
    }
    // Réponse en cas de succès avec les détails de la publication
    res.json({ post });
  } catch (error) {
    // Réponse en cas d'erreur interne du serveur
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
});

module.exports = router;
