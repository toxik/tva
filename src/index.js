const update = require(`${__dirname}/update`);
const express = require('express');
const app = express();

app.disable('x-powered-by');
app.set('etag', false);

let MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017/tva';
MongoClient.connect(url, (err, db) => {
    if (err) { throw err; }

    let agents = db.collection('agents');
    app.get('/api/agents/:id', function (req, res) {
        agents.find({"cui": req.params.id}).toArray( (err, data) => {
            if (err) { return res.status(500).json({"error": "Internal error."}); }
            let result = data[0];
            if (!result) { return res.status(404).json({"error": "Not found."}); }
            delete result._id;
            res.json(result);
        });
    });
});

app.use('/', express.static(`${__dirname}/../public`));

app.listen(3088, 'localhost', function () {
    console.log('Server started on port 3088');
});