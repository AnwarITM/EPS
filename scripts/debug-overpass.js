const query = `[out:json];
area["name"="Surabaya"]["admin_level"="5"]->.searchArea;
(
  relation["admin_level"="6"](area.searchArea);
);
out body;
>;
out skel qt;`;

fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    headers: {
        'User-Agent': 'EPS-Location-App/1.0',
        'Accept': 'application/json'
    },
    body: query
})
.then(res => res.json())
.then(data => console.log('Sukses', data.elements.length))
.catch(err => console.log('Error fetch', err));
