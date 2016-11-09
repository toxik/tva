const fs = require('fs');
const datastore = require(`${__dirname}/datastore`); 

const FILES_PREFIX = `${__dirname}/../data/`;
const WATCHED_FILES = [ 'agents', 'history' ];
WATCHED_FILES.forEach((fileName) => {
    let handler = (file) => {
        fs.readFile(`${FILES_PREFIX}${file}.json`, 'utf8', function (err, data) {
            if (err) {
                console.log('ERROR WHILE READING ', err);
                return;
            }
            try {
                datastore[file] = JSON.parse(data);
                console.log('updated ', file);
            } catch (e) {
                console.error(file, data);
            }
            
        });
    };
    fs.watch(`${FILES_PREFIX}${fileName}.json`, (eventType, filename) => {
        if (eventType === 'change') {
            handler(fileName);
        }
    });
    handler(fileName);
});

