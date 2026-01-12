
const https = require('https');

const url = "https://rest.isric.org/soilgrids/v2.0/properties/query?lat=11.0168&lon=76.9558&property=clay&depth=0-5cm&value=mean";

console.log("Fetching: " + url);

https.get(url, (res) => {
    console.log('statusCode:', res.statusCode);
    console.log('headers:', res.headers);

    let data = '';
    res.on('data', (d) => {
        data += d;
    });

    res.on('end', () => {
        console.log('Body length:', data.length);
        console.log('First 100 chars:', data.substring(0, 100));
    });

}).on('error', (e) => {
    console.error('Error:', e);
});
