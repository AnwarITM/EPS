const fs = require('fs');
const https = require('https');
const path = require('path');

const relations = {
    'Surabaya': 8225862,
    'Bangkalan': 9674056,
    'Sampang': 9674057,
    'Pamekasan': 9674058,
    'Sumenep': 9674059
};

// We will use simplified polygons (params=0) to keep size small
const getGeoJSON = (id) => {
    return new Promise((resolve, reject) => {
        // use openstreetmap.fr service which serves pre-computed geojson for relations
        const url = `https://polygons.openstreetmap.fr/get_geojson.py?id=${id}&params=0`;
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', reject);
    });
};

async function main() {
    console.log('Downloading administrative boundaries...');
    let features = [];
    
    for (const [name, id] of Object.entries(relations)) {
        console.log(`Fetching ${name} (Rel: ${id})...`);
        try {
            const geojson = await getGeoJSON(id);
            // The service returns a Geometry (Polygon/MultiPolygon), we wrap it in a Feature
            features.push({
                type: "Feature",
                properties: { name: name },
                geometry: geojson
            });
        } catch (err) {
            console.error(`Failed to fetch ${name}:`, err.message);
        }
    }
    
    const featureCollection = {
        type: "FeatureCollection",
        features: features
    };
    
    const targetPath = path.join(__dirname, '..', 'data', 'surabaya-madura.json');
    fs.writeFileSync(targetPath, JSON.stringify(featureCollection));
    console.log('Saved to data/surabaya-madura.json');
}

main();
