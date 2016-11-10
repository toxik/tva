let MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017/tva';

// Use connect method to connect to the server
MongoClient.connect(url, function (err, db) {
    if (err) { throw err; }

    let agents = db.collection('agents');
    agents.createIndex({ "cui": 1 });
    agents.createIndex({ "cui.history.update": -1 });

    // agents.deleteOne({ "cui" : "94" });    
    // let agent = {"cui":"94","name":"COMPIL PIPERA S.A.!!  123 13"};
    // agents.update({"cui": "94"}, agent, { upsert: true }, function(err, result) {
    //     if (err) throw err;
    //     console.log("Updated the document");
    // });

    agents.find({"cui": "5572496"}).toArray( (err, data) => {
        if (err) throw err;
        console.log('found', data[0].history);
        db.close(); 
    });
    
});