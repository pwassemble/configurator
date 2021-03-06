let express = require('express');
let router = new express.Router();
let images = require('../lib/images');

let fieldsArray = [
  {name: 'bucketName', maxCount: 1},
  {name: 'companyName', maxCount: 1},
  {name: 'companyLogo', maxCount: 1},
  {name: 'homescreenIcon', maxCount: 1},
  {name: 'heroText', maxCount: 1},
  {name: 'heroImage', maxCount: 1},
  {name: 'subText', maxCount: 1},
  {name: 'ctaText', maxCount: 1},
  {name: 'primaryFg', maxCount: 1},
  {name: 'primaryBg', maxCount: 1},
  {name: 'secondaryFg', maxCount: 1},
  {name: 'secondaryBg', maxCount: 1},
  {name: 'productCategory', maxCount: 1},
  {name: 'productQuery', maxCount: 1},
  {name: 'rssFeed', maxCount: 1},
  {name: 'template', maxCount: 1},
];

router.get('/', function(req, res) {
  res.redirect('/');
});

router.post('/', images.multer.fields(fieldsArray), function(req, res, next) {
  images
    .uploadFile(req)
    .then(function(result) {
      res.render('ready', {result: {id: result}});
    })
    .catch(function(error) {
      console.error(error);
      res.render('error', {error: error});
    });
});

module.exports = router;
