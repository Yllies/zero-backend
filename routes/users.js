var express = require('express');
var router = express.Router();

require('../models/connection');
const User = require('../models/users');
const { checkBody } = require('../modules/checkBody');
const bcrypt = require('bcrypt');
const uid2 = require('uid2');

router.post('/signup', (req, res) => {
  if (!checkBody(req.body, ['email','username','password','type','name','siret_siren','address','longitude',"latitude","latitudeDelta","longitudeDelta"])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }

  // Check if the user has not already been registered
  //on check via leur siret/siret
  User.findOne({siret_siren: req.body.siret_siren}).then(data => {
    if (data === null) {
      const hash = bcrypt.hashSync(req.body.password, 10);
//pour les données qu'on a pas demandé lors de l'inscription, je les enregistre par defaut en null
//par la suite bien on pourras les modifié via une route PUT
      const newUser = new User({
        email: req.body.email,
        password: hash,
        name: req.body.name,
        username:req.body.username,
        address: req.body.address,
        siret_siren: req.body.siret_siren,
        type: req.body.type,
        description: null,
        phone_number: null,
        url_site: null,
        logo: null,
        longitude: req.body.longitude,
        latitude:req.body.latitude,
        longitudeDelta: req.body.longitudeDelta,
        latitudeDelta:req.body.latitudeDelta,
        token: uid2(32),
      });
      
      newUser.save().then(newDoc => {
        res.json({ result: true, token: newDoc.token });
      });
    } else {
      // User already exists in database
      res.json({ result: false, error: 'User already exists' });
    }
  });
});



router.post('/signin', (req, res) => {
  if (!checkBody(req.body, ['email', 'password'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }
//le find on le fait par rapport au mail
  User.findOne({ email: { $regex: new RegExp(req.body.email, 'i') } }).then(data => {
    if (bcrypt.compareSync(req.body.password, data.password)) {
      res.json({ result: true, token: data.token, email: data.email, name: data.name});
    } else {
      res.json({ result: false, error: 'User not found or wrong password' });
    }
  });
});



router.delete("/", (req, res) => {
  const token = req.body.token;

  User.findOne({ token })
    .then(user => {
      if (!user) {
        res.json({ result: false, error: 'User not found' });
        return;
      }
      User.deleteOne({ token })
        .then(data => {
          console.log(data);
          if (data.deletedCount >= 1) {
            res.json({ result: true, message: 'User deleted' });
          } else {
            res.json({ result: false, message: 'User not found or already deleted' });
          }
        })
    })
  
});
    
module.exports = router;
