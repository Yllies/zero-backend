var express = require("express");
var router = express.Router();
require("../models/connection");
const User = require("../models/users");
const { checkBody } = require("../modules/checkBody");
const bcrypt = require("bcrypt");
const uid2 = require("uid2");

// INSCRIPTION
router.post("/signup", async (req, res) => {
  try {
    // Liste des champs requis pour l'inscription
    const requiredFields = [
      "email",
      "username",
      "password",
      "type",
      "name",
      "siret_siren",
      "address",
      "longitude",
      "latitude",
      "latitudeDelta",
      "longitudeDelta",
    ];
    // Vérification si tous les champs requis sont présents et non vides dans la requête
    if (!checkBody(req.body, requiredFields)) {
      return res
        .status(400)
        .json({ result: false, error: "Champs manquants ou vides" });
    }
    // Recherche si un utilisateur existe déjà avec le même numéro SIRET/SIREN
    const existingUser = await User.findOne({
      siret_siren: req.body.siret_siren,
    });
    if (existingUser) {
      return res
        .status(409)
        .json({ result: false, error: "L'utilisateur existe déjà" });
    }
    // Hashage du mot de passe avant de le stocker dans la base de données
    const hash = bcrypt.hashSync(req.body.password, 10);
    // Création d'un nouvel utilisateur avec les données fournies dans la requête
    const newUser = new User({
      email: req.body.email,
      password: hash,
      name: req.body.name,
      username: req.body.username,
      address: req.body.address,
      siret_siren: req.body.siret_siren,
      type: req.body.type,
      description: null,
      phone_number: null,
      url_site: null,
      logo: null,
      longitude: req.body.longitude,
      latitude: req.body.latitude,
      longitudeDelta: req.body.longitudeDelta,
      latitudeDelta: req.body.latitudeDelta,
      token: uid2(32),
    });
    // Sauvegarde du nouvel utilisateur dans la base de données
    const savedUser = await newUser.save();
    // Réponse indiquant le succès de l'inscription et renvoyant le token de l'utilisateur
    res.status(200).json({ result: true, token: savedUser.token });
  } catch (error) {
    // En cas d'erreur, affichage de l'erreur dans la console et envoi d'une réponse d'erreur au client
    console.error(error);
    res.status(500).json({ result: false, error: "Erreur interne du serveur" });
  }
});

// CONNEXION
router.post("/signin", (req, res) => {
  // Vérification si les champs 'email' et 'password' sont présents et non vides dans la requête
  if (!checkBody(req.body, ["email", "password"])) {
    res.json({ result: false, error: "Champs manquants ou vides" });
    return;
  }
  // Recherche de l'utilisateur correspondant à l'adresse email fournie (insensible à la casse)
  User.findOne({ email: { $regex: new RegExp(req.body.email, "i") } }).then(
    (data) => {
      // Vérification si le mot de passe fourni correspond au mot de passe hashé dans la base de données
      if (bcrypt.compareSync(req.body.password, data.password)) {
        // Réponse en cas de correspondance : succès de la connexion, renvoi des informations de l'utilisateur
        res.json({
          result: true,
          token: data.token,
          email: data.email,
          name: data.name,
          type: data.type,
        });
      } else {
        // Réponse en cas de non-correspondance : utilisateur introuvable ou mot de passe incorrect
        res.json({
          result: false,
          error: "Utilisateur non trouvé ou mot de passe incorrect",
        });
      }
    }
  );
});

// REINITIALISATION DE MOT DE PASSE
router.put("/resetPassword/:token", (req, res) => {
  // Vérification si les champs 'email' et 'username' sont présents et non vides dans la requête
  if (!checkBody(req.body, ["email", "username"])) {
    return res.json({ result: false, error: "Champs manquants ou vides" });
  }
  // Extraction de l'email et du nom d'utilisateur de la requête
  const { email, username } = req.body;
  // Recherche de l'utilisateur correspondant à l'email et au nom d'utilisateur fournis
  User.findOne({
    email: { $regex: new RegExp(email, "i") },
    username: username,
  })
    .then((user) => {
      // Vérification si l'utilisateur existe
      if (!user) {
        return res.json({ result: false, error: "Utilisateur introuvable" });
      }
      // Hashage du nouveau mot de passe et mise à jour du mot de passe dans l'objet utilisateur
      const hash = bcrypt.hashSync(req.body.password, 10);
      user.password = hash;
      // Sauvegarde des modifications de l'utilisateur dans la base de données
      return user.save();
    })
    .then(() => {
      // Réponse en cas de succès : le mot de passe a été réinitialisé avec succès
      res.json({
        result: true,
        message: "Mot de passe réinitialisé avec succès",
      });
    })
    .catch((error) => {
      // Gestion des erreurs : affichage de l'erreur dans la console et réponse d'erreur au client
      res.json({
        result: false,
        error:
          "Une erreur s'est produite lors de la réinitialisation du mot de passe",
      });
    });
});

// SUPPRESSION DE COMPTE
router.delete("/delete/:token", (req, res) => {
  // Récupération du token à partir des paramètres de la requête
  const token = req.params.token;
  // Recherche de l'utilisateur correspondant au token dans la base de données
  User.findOne({ token }).then((user) => {
    // Affichage de l'utilisateur trouvé dans la console à des fins de vérification
    console.log(user);
    // Vérification si l'utilisateur existe
    if (!user) {
      res.json({ result: false, error: "Utilisateur introuvable" });
      return;
    }
    // Suppression de l'utilisateur correspondant au token de la base de données
    User.deleteOne({ token }).then((data) => {
      // Affichage des informations de suppression dans la console à des fins de vérification
      console.log(data);
      // Vérification si l'utilisateur a été supprimé avec succès
      if (data.deletedCount >= 1) {
        res.json({ result: true, message: "Utilisateur supprimé" });
      } else {
        res.json({
          result: false,
          message: "Utilisateur introuvable ou déjà supprimé",
        });
      }
    });
  });
});

// INFOS USER
router.get("/:token", async (req, res) => {
  try {
    // Récupération du token à partir des paramètres de la requête
    const { token } = req.params;
    // Recherche de l'utilisateur correspondant au token dans la base de données
    const author = await User.findOne({ token });
    // Vérification si l'utilisateur existe
    if (!author) {
      // Réponse en cas d'absence d'utilisateur : erreur 404 (non trouvé)
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }
    // Réponse avec les informations de l'utilisateur
    res.json(author);
  } catch (error) {
    // Gestion des erreurs : réponse en cas d'erreur interne du serveur
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
});

module.exports = router;
