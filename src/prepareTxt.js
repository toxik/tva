const fs = require('fs');
const readline = require('readline');
const dataDir = `${__dirname}/../data`;
const agentsFileIn = `${dataDir}/agenti.txt`;
const historyFileIn = `${dataDir}/istoric.txt`;
const agentsFileOut = `${dataDir}/agents.json`;

let agents = {};
let agentsReader = readline.createInterface({ input: fs.createReadStream(agentsFileIn) });

agentsReader.on('line', (line) => {
    let row = line;
    let [ cui, name ] = row.split('#');
    if (!cui) return; 
    let agent = {cui, name, history: []};
    agents[cui] = agent;
});
agentsReader.on('close', () => {
    let historyReader = readline.createInterface({ input: fs.createReadStream(historyFileIn) });
    historyReader.on('line', (line) => {
        data = line.split('#');
        let history = {};
        let cui = data[1];
        if (!cui) return;
        history = {
            update: data[5],
            start: data[2],
            end: data[3],
            type: data[6]
        };
        if (cui == '5572496') {
            console.log('bebe', history);
        }

        agents[cui].history.push(history);
    });
    historyReader.on('close', () => {
        fs.writeFile(agentsFileOut, JSON.stringify(agents, null, 2));
    });
});