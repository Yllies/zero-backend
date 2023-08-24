var express = require('express');
var router = express.Router();
require('../models/connection');
const PostCompany = require('../models/posts_companies');
// const User = require('../models/users');

const uniqid = require('uniqid');

// Route pour obtenir des articles basés sur des filtres
router.get('/company/posts', (req, res) => {
  console.log("route", req.query)
  
    // Paramètres de filtre doivent être extraits de req.query, car ils sont passés dans l'URL en tant que paramètres de requête

    const { quantity, date } = req.query;


    let filter = {};

    if (quantity) {
      filter.quantity = quantity;
      
      if (quantity !== "1") {
          const rangeArray = quantity.split(",");
          const minValue = parseInt(rangeArray[0]);
          const maxValue = parseInt(rangeArray[1]);
  
          if (!isNaN(minValue) && !isNaN(maxValue)) {
              filter.quantity = { $gte: minValue, $lte: maxValue };
          }
      } else {
          filter.quantity = 1;
      }
  }

    // si la date est pas nulle, sinon ça sorte undefined
    if (date != 'null') {
        // $gte (greater than or equal to) méthode de MongoDB
        filter.availability_date = { $gte: new Date(date)};
    }


    // Utiliser la méthode find directement sur le modèle PostCompany pour effectuer la recherche
    // populate sur pour récupérer l'adresse de l'auteur pour filter en fonction de sa position

    PostCompany.find(filter)
  //  Date : { $gte: new Date(availability_date) };

        .then((data) => {
          if(data.length > 0){
            res.json({ result: true, data });
          } else {
            res.json({ result: "No matching posts found" });
          }
        })
        .catch((error) => {
            res.json({ result: false, error: "Failed to fetch " + error });
        });
});

module.exports = router;