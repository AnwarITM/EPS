const query = `[out:json][timeout:25];
(
  relation["name"~"Surabaya Barat|Surabaya Timur|Surabaya Selatan|Surabaya Utara|Surabaya Pusat"];
);
out tags;`;

fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    body: query
})
.then(res => res.json())
.then(data => console.log(JSON.stringify(data.elements, null, 2)))
.catch(err => console.error(err));
