let express = require('express');
let router = express.Router();
let images = require('../lib/images');


let parseFileNames = function(obj) {
  let fileKeys = ['companyLogo', 'homescreenIcon', 'heroImage'];
  if (obj) {
    fileKeys.forEach(function(key) {
      let url = obj[key+'Url'];
      let parts = url.split('/');
      let index = parts.length - 1;
      obj[key] = parts[index];
    });
  }
};


/* GET home page. */
router.get('/:bucketId', function(req, res) {
  images.getConfigJson(req.params.bucketId).then(function(configObj) {
    configObj.bucketName = req.params.bucketId;
console.log(configObj)
    parseFileNames(configObj);
    res.render('index', {configObj: configObj});
  }).catch(function(err) {
    console.log(err);
  });
});

module.exports = router;
