const watch = require(`${__dirname}/watch.js`);
const datastore = require(`${__dirname}/datastore`);
const express = require('express');
const app = express();

app.use('/', express.static(`${__dirname}/../public`));

app.get('/api/full', function (req, res) {
    res.json(datastore.full);
});
app.get('/api/delta', function (req, res) {
    res.json(datastore.delta);
});
app.get('/api/merc/:id', function (req, res) {
    if (req.params.id && datastore.full.Merchants.list[req.params.id]) {
        res.json(datastore.full.Merchants.list[req.params.id]);
    } else {
        res.status(404).send('Not found.');
    }
});
app.listen(3088, 'localhost', function () {
    console.log('Server started on port 3088');
});