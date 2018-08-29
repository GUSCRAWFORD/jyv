print(`🗑  Dropping the entire database...`);
var mongo = new Mongo('localhost:27017'), db = mongo.getDB('default');
var dropResult = db.dropDatabase();
var usernamePiecesA = ["smooth","big","lil","fat","skinny"],usernamePiecesB = ["garfield","john","yachty","joe","pete"];
var insertUsersResult = db.getCollection("users").insertMany([
    {
        "username": [usernamePiecesA[Math.floor((Math.random() * 3))],usernamePiecesB[Math.floor((Math.random() * 3))]].join("-"),
        "randomNumber":Math.floor((Math.random() * 9))
    },

    {
        "username": [usernamePiecesA[Math.floor((Math.random() * 3))],usernamePiecesB[Math.floor((Math.random() * 3))]].join("-"),
        "randomNumber":Math.floor((Math.random() * 9))
    },
    {
        "username": [usernamePiecesA[Math.floor((Math.random() * 3))],usernamePiecesB[Math.floor((Math.random() * 3))]].join("-"),
        "randomNumber":Math.floor((Math.random() * 9))
    },
    {
        "username": [usernamePiecesA[Math.floor((Math.random() * 3))],usernamePiecesB[Math.floor((Math.random() * 3))]].join("-"),
        "randomNumber":Math.floor((Math.random() * 9))
    }
]);
print(`🏁  Complete(${JSON.stringify(dropResult)}) (${JSON.stringify(insertUsersResult)})`);
