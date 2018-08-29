var express = require('express');
var router = express.Router();
var jyve = require('@guscrawford.com/jyve-mongo');
// Poop out the result of the export
router.get('/DEBUG', function(req, res, next) {
  res.json(JSON.stringify(jyve));
});
/* GET users listing. */
router.get('/', async function(req, res, next) {
  try {
    var result = await (new jyve.ODataV4MongoDbGenericRepo('users')).query(req.query);
    res.json(result);
  } catch (x) {
    next(x);
  }
  return result;
});

module.exports = router;
