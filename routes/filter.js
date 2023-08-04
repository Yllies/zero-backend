var express = require('express');
var router = express.Router();
require('../models/connection');
const PostCompany = require('../models/posts_companies');
const uniqid = require('uniqid');

// Route pour obtenir des articles basés sur des filtres
router.get('/company/posts', (req, res) => {
  
    // paramètres de filtre doivent être extraits de req.query, car ils sont passés dans l'URL en tant que paramètres de requête

    const { quantity, availability_date, latitude, longitude, radius } = req.query;


  // Filtrer les articles en fonction de la quantité, de la date dispo et de la localisation

  let filter = {};

    if (quantity) {
        filter.quantity = quantity;
      }

      if (availability_date) {

// $gte (greater than or equal to) méthode de MongoDB
        filter.availability_date = { $gte: new Date(availability_date) };
      }

   // Filtrer par localisation si tous les paramètres nécessaires sont fournis
  if (latitude && longitude && radius) {
    // Convertir les paramètres en nombres
    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);
    const rad = parseFloat(radius);

    // Ajouter le filtre pour rechercher les articles dans le rayon spécifié autour des coordonnées
    filter.location = {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [lon, lat],
        },
        $maxDistance: rad,
      },
    };
  }
     
      PostCompany.find(filter)
      .then((data) => {
        res.json({ result: true, data });
      })
      .catch((error) => {
        res.json({ result: false, error: "Failed to fetch posts" });
      });
  });


module.exports = router;
