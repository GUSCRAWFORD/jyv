Object.defineProperty(exports, "__esModule", { value: true });
var express = require('express');
var router = express.Router();
const jyve = require("@guscrawford.com/jyve-mongo");
const jyve_mongo_1 = require("@guscrawford.com/jyve-mongo");
// Poop out the result of the export
router.get('/DEBUG', function (req, res, next) {
    res.json(JSON.stringify(jyve));
});
/* GET users listing. */
router.get('/', async function (req, res, next) {
    try {
        var result = await (new jyve_mongo_1.ODataV4MongoDbGenericRepo('users')).query();
        res.json(result);
    }
    catch (x) {
        //next(x);
        console.error(x);
        res.json(x);
    }
    return result;
});
module.exports = router;
//# sourceMappingURL=users.js.map