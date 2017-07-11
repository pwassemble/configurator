let express = require('express');
let router = new express.Router();
let images = require('../lib/images');

/* GET home page. */
router.get('/', function(req, res) {
  const id = req.query.id;
  if (!id) {
    return res.render('edit');
  }
  images
    .getConfigJson(id)
    .then(function(configObj) {
      configObj.bucketName = id;
      res.render('index', {configObj: configObj});
    })
    .catch(function(error) {
      res.render('error', {error: error});
    });
});

module.exports = router;
