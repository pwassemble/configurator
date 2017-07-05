let express = require('express');
let router = new express.Router();
let images = require('../lib/images');

let parseFileNames = function(obj) {
  let fileKeys = ['companyLogo', 'homescreenIcon', 'heroImage'];
  if (obj) {
    fileKeys.forEach(function(key) {
      let url = obj[key + 'Url'];
      if (!url) {
        obj[key] = '';
        return;
      }
      let parts = url.split('/');
      let index = parts.length - 1;
      obj[key] = parts[index];
    });
  }
};

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
      parseFileNames(configObj);
      res.render('index', {configObj: configObj});
    })
    .catch(function(error) {
      res.render('error', {error: error});
    });
});

module.exports = router;
