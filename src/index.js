// const watch = require(`${__dirname}/watch.js`);
const datastore = require(`${__dirname}/datastore`);
const update = require(`${__dirname}/update`);
const watch = require(`${__dirname}/watch`);
const express = require('express');
const app = express();

app.disable('x-powered-by');
app.set('etag', false);

// update('20161109');

app.use('/', express.static(`${__dirname}/../public`));

// app.get('/api/agents', function (req, res) {
//     res.json(datastore.agents);
// });
app.get('/api/agents/:id', function (req, res) {
    if (req.params.id && datastore.agents[req.params.id]) {
        res.json(datastore.agents[req.params.id]);
    } else {
        res.status(404).json({"error": "Not found."});
    }
});
// app.get('/api/history', function (req, res) {
//     res.json(datastore.history);
// });
app.get('/api/history/:id', function (req, res) {
    if (req.params.id && datastore.history[req.params.id]) {
        res.json({
            company: datastore.agents[req.params.id],
            entries: datastore.history[req.params.id]
        });
    } else {
        res.status(404).json({"error": "Not found."});
    }
});
app.listen(3088, 'localhost', function () {
    console.log('Server started on port 3088');
});