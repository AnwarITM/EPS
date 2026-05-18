const fs = require('fs');
const osmtogeojson = require('osmtogeojson');

const ZONES = {
  'Surabaya Pusat': ['Tegalsari', 'Simokerto', 'Genteng', 'Bubutan'],
  'Surabaya Utara': ['Bulak', 'Kenjeran', 'Semampir', 'Pabean Cantian', 'Krembangan'],
  'Surabaya Timur': ['Gubeng', 'Gunung Anyar', 'Sukolilo', 'Tambaksari', 'Mulyorejo', 'Rungkut', 'Tenggilis Mejoyo'],
  'Surabaya Selatan': ['Wonokromo', 'Wonocolo', 'Wiyung', 'Karang Pilang', 'Jambangan', 'Gayungan', 'Dukuh Pakis', 'Sawahan'],
  'Surabaya Barat': ['Asemrowo', 'Benowo', 'Pakal', 'Sukomanunggal', 'Tandes', 'Sambikerep', 'Lakarsantri']
};

function getZone(name) {
    for (const [zone, kecs] of Object.entries(ZONES)) {
        if (kecs.includes(name)) return zone;
    }
    return 'Lainnya';
}

const query = `[out:json];
area["name"="Surabaya"]["admin_level"="5"]->.searchArea;
(
  relation["admin_level"="6"](area.searchArea);
);
out body;
>;
out skel qt;`;

console.log("Mengunduh data kecamatan Surabaya dari Overpass API...");

fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    headers: {
        'User-Agent': 'EPS-Location-App/1.0',
        'Accept': 'application/json'
    },
    body: query
})
.then(res => res.json())
.then(osmData => {
    console.log("Data diterima. Memparsing ke GeoJSON...");
    const geojson = osmtogeojson(osmData);
    
    // Filter out only Multipolygons / Polygons that represent Kecamatan
    const kecamatanFeatures = geojson.features.filter(f => 
        (f.geometry.type === 'Polygon' || f.geometry.type === 'MultiPolygon') &&
        f.properties.name
    );

    // Group by Zone
    kecamatanFeatures.forEach(f => {
        let name = f.properties.name.replace('Kecamatan ', '').trim();
        let zone = getZone(name);
        f.properties.zona = zone;
        f.properties.kecamatan = name;
    });

    const finalGeoJSON = {
        type: "FeatureCollection",
        features: kecamatanFeatures.filter(f => f.properties.zona !== 'Lainnya')
    };

    fs.writeFileSync('../data/surabaya-grids.json', JSON.stringify(finalGeoJSON));
    console.log("Berhasil! Tersimpan di data/surabaya-grids.json");
})
.catch(err => console.error("Error:", err));
