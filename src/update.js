const StringDecoder = require('string_decoder').StringDecoder;
const spawn = require('child_process').spawn;
const decoder = new StringDecoder('latin1');
const readline = require('readline');
const fs = require('fs');
const http = require('http');
const dataDir = `${__dirname}/../data`;
const agentsFile = `${dataDir}/agents.json`;
const historyFile = `${dataDir}/history.json`;
const timeStampFile = `${dataDir}/timestamp.json`;
let updateCheckTimer = null;

let MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://m.navigheaza.ro:27017/tva';
let db = null;
MongoClient.connect(url, function (err, dbHandle) {
    if (err) { throw err; }
    db = dbHandle;
});

// create files and directoy if they don't exist
if (!fs.existsSync(dataDir)){
    fs.mkdirSync(dataDir);
}
[ agentsFile, historyFile, timeStampFile ].forEach( (file) => {
    if (!fs.existsSync(file)){
        let data = file.endsWith("timestamp.json") ? "" : {};
        fs.writeFile(file, JSON.stringify(data));
    }   
});

let update = (date) => {
    clearTimeout(updateCheckTimer);
    let fileName = `${__dirname}/../public/ultim_${date}.zip`;
    let request = http.get(`http://static.anaf.ro/static/10/Anaf/TVA_incasare//ultim_${date}.zip`, (res) => {
        if (res.statusCode !== 200) {
            console.log('file not yet available, retrying in 60 sec');
            setTimeout(updateCheck, 60 * 1e3);
            return;
        }
        let download = fs.createWriteStream(fileName);
        res.pipe(download);

        res.on('end', () => {
            // mongo init
            let agents = db.collection('agents');
            agents.createIndex({ "cui": 1 });
            agents.createIndex({ "cui.history.update": -1 });

            let unzipAgents = spawn('unzip', ['-p', fileName, 'agenti.txt']);
            let agentsReader = readline.createInterface({
                input: unzipAgents.stdout
            });

            agentsReader.on('line', (line) => {
                let row = decoder.write(line);
                let [ cui, name ] = row.split('#');
                if (!cui) return; 
                let agent = { $set: {cui, name} };
                agents.update({"cui": cui}, agent, { upsert: true }, (err, result) => {
                    if (err) throw err;
                });
            });

            unzipAgents.on('close', () => {
                console.log('updated the agents list to', date);
                let unzipHistory = spawn('unzip', ['-p', fileName, 'istoric.txt']);
                let historyReader = readline.createInterface({
                    input: unzipHistory.stdout
                });
                historyReader.on('line', (line) => {
                    data = decoder.write(line).split('#');
                    let history = {};
                    let cui = data[1];
                    if (!cui) return;
                    history = {
                        update: data[5],
                        start: data[2],
                        end: data[3],
                        type: data[6]
                    };

                    agents.update({"cui": cui}, { $addToSet: { 'history': history } }, (err, result) => {
                        if (err) throw err;
                    });
                });
                unzipHistory.on('close', () => {
                    console.log('updated the history to', date);
                    fs.writeFile(timeStampFile, JSON.stringify(date));
                    fs.unlink(fileName);
                    setTimeout(updateCheck, 15 * 1e3);
                });
            });
        });
    });

};

let getFullDate = () => {
    let today = new Date();
    let [year, month, day] = [today.getFullYear(), today.getMonth() + 1, today.getDate()];
    month = month < 10 ? '0' + month : month;
    day = day < 10 ? '0' + day : day;
    return `${year}${month}${day}`;
};

let updateCheck = () => {
    fs.readFile(timeStampFile, 'ascii', (err, data) => {
        console.log('check if update is needed');
        let fileDate = "";
        try {
            fileDate = JSON.parse(data);
        } catch (e) { }
        if (getFullDate() > fileDate) {
            console.log('attempt update to', getFullDate());
            update(getFullDate());
        } else {
            updateCheckTimer = setTimeout(updateCheck, 15 * 1e3);
        }
    });
};
updateCheck(); 

module.exports = update;