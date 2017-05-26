let express = require('express');
let router = new express.Router();
let images = require('../lib/images');
let fs = require('fs');
let path = require('path');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {configObj: {}});
});

router.post('/', images.multer.single('theFile'), function(req, res) {
  let file = req.file;
  let newPath = path.join(__dirname, '/../public/uploads/', file.originalname);

  fs.writeFile(newPath, file.buffer, function(err, data) {
    res.send('/uploads/' + file.originalname);
  });
});

module.exports = router;
