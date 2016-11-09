const StringDecoder = require('string_decoder').StringDecoder;
const spawn = require('child_process').spawn;
const decoder = new StringDecoder('latin1');
const fs = require('fs');
const http = require('http');
const dataDir = `${__dirname}/../data`;
const agentsFile = `${dataDir}/agents.json`;
const historyFile = `${dataDir}/history.json`;
const timeStampFile = `${dataDir}/timestamp.json`;
let updateCheckTimer = null;

// create files and directoy if they don't exist
if (!fs.existsSync(dataDir)){
    fs.mkdirSync(dataDir);
}
[ agentsFile, historyFile, timeStampFile ].forEach( (file) => {
    if (!fs.existsSync(file)){
        fs.createWriteStream(file);
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
            let agentsStr = '';
            let unzipAgents = spawn('unzip', ['-p', fileName, 'agenti.txt']);
            unzipAgents.stdout.on('data', (data) => {
                agentsStr += decoder.write(data);
            });
            unzipAgents.on('close', () => {
                let agents = {};
                let history = {};
                agentsStr.split('\n').forEach(agent => {
                    let [ cui, name ] = agent.split('#');
                    if (!cui) return; 
                    agents[cui] =  { cui, name };
                    history[cui] = [];
                });
                fs.writeFile(agentsFile, JSON.stringify(agents));

                let historyStr = '';
                let unzipHistory = spawn('unzip', ['-p', fileName, 'istoric.txt']);
                unzipHistory.stdout.on('data', (data) => {
                    historyStr += decoder.write(data);
                });
                unzipHistory.on('close', (data) => {
                    historyArr = historyStr.split("\n");
                    historyArr.forEach( (data) => {
                        data = data.split('#');
                        let cui = data[1];
                        if (!cui) return;
                        let update = data[5];
                        let start = data[2]; 
                        let end = data[3];
                        try {
                            history[cui].push({
                                cui, update, start, end
                            });
                        } catch (e) {
                            console.error(e, cui, history[cui]);
                            throw e;
                        }
                    });
                    fs.writeFile(historyFile, JSON.stringify(history));
                    fs.writeFile(timeStampFile, JSON.stringify(date));
                    fs.unlink(fileName);
                    console.log("updated to", date);
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