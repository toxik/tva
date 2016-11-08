const fs = require('fs');
const datastore = require(`${__dirname}/datastore`); 

const handleFull = (data) => {
    datastore.full = data;
};
const handleDelta = (data) => {
    datastore.delta = data;
};

const FILES_PREFIX = `${__dirname}/../data/`;
const WATCHED_FILES = [
    {"name": "full.json", "handler": handleFull},
    {"name": "delta.json", "handler": handleDelta},
];
WATCHED_FILES.forEach(function(file){
    let handler = (file) => {
        fs.readFile(`${FILES_PREFIX}${file.name}`, 'utf8', function (err, data) {
            if (err) {
                console.log('ERROR WHILE READING ', err);
                return;
            }
            file.handler(JSON.parse(data));
        });
    };
    fs.watch(`${FILES_PREFIX}${file.name}`, (eventType, filename) => {
        console.log(eventType, filename);
        handler(file);
    });
    handler(file);
});

