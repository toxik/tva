const http = require('https');
let payloadDemo = [
    { "cui": 36755345, "data":"2016-11-19" },
    { "cui": 36752470, "data":"2016-11-19" },
    { "cui": 5572496,  "data":"2016-11-19" }		
];
let getTVA = ( payload, cb ) => {
    payload = JSON.stringify(payload);
    var options = {
        protocol: 'https:',
        hostname: 'webservicesp.anaf.ro',
        port: 443,
        path: '/PlatitorTvaRest/api/v1/ws/tva',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(payload)
        }
    };
    let req = http.request(options, (res) => {
        let chunkString = '', response;
        res.setEncoding('utf8');
        res.on('data', (chunk) => chunkString += chunk);
        res.on('end', () => {
            try {
                response = JSON.parse(chunkString);
            } catch (e) {
                console.error('JSON parse failed', chunkString);
                cb({ found: [] });
            }
            cb(response);
        });
    });

    req.on('error', (e) => {
        console.log(`problem with request: ${e.message}`);
    });

    req.write(payload);
    req.end(); 
};
module.exports = getTVA;