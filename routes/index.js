var express = require('express');
var router = express.Router();
var title = 'Express'
/* GET home page. */
router.get('/', function(req, res, next) {
  res.redirect('/catalog');
  //res.render('index', {title})
});

module.exports = router;
