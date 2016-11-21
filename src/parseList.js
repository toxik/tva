const sleep = require('sleep').sleep;
const tvaReq = require(__dirname + '/platitorTVA');
const agents = require(__dirname + '/../data/agents.json');

let list = require(__dirname + '/inputList.json');
list = list.map( (item) => {
    let cui = parseInt(item.replace(/[^0-9]/g, ''), 10);
    if (isNaN(cui) || cui > 2e9) return '';
    return cui;
});
notes = list.map( (item) => item ? '' : 'INVALID');

let getFullDate = (dash) => {
    let today = new Date();
    let [year, month, day] = [today.getFullYear(), today.getMonth() + 1, today.getDate()];
    month = month < 10 ? '0' + month : month;
    day = day < 10 ? '0' + day : day;
    if (dash) return `${year}-${month}-${day}`; 
    return `${year}${month}${day}`;
};
let date = getFullDate();
let tvaIncasare = list.map( cui => {
    if (agents[cui] && agents[cui].history.length) {
        let history = agents[cui].history[0];
        if (!history.end) return 'DA';
        if (history.end < date) return 'NU';
    } 
    return '';
});
let platitorTVA = list.map( () => '' );
let set = Array.from(new Set(list.filter( c => c ).sort()));
let remaining = Math.ceil(set.length / 500);
while(set.length) {
    let pieces = set.splice(0, 500).map( cui => ({ cui, "data": getFullDate(true) }) );
    tvaReq(pieces, (res) => {
        res.found.forEach( entry => {
            let found = entry.cui;
            platitorTVA[ list.indexOf(found) ] = entry.tva ? 'DA' : 'NU';
        });
        console.error('Finished a slice of ', pieces.length);
        remaining -= 1;
        sleep(1);
    });
    sleep(1);
}
let t = 0;
t = setInterval( () => {
    if (!remaining) {
        console.log(
            list.map( (cui, index) => {
                let denumire = platitorTVA[index] === 'DA' ? 
                                 tvaIncasare[index] === 'DA' ? 'Persoana cu TVA la incasare' : 
                                        'Persoana juridica' : '';
                if (platitorTVA[index] === 'NU') denumire = 'Persoana neplatitoare de TVA';
                return `${denumire}\t${platitorTVA[index]}\t${tvaIncasare[index]}\t${notes[index]}\t${cui ? cui : ''}`; 
            }).join("\n")
        );
        clearInterval(t);
    }
}, 100);