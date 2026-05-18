const query = `[out:json];
area["name"="Surabaya"]->.searchArea;
(
  relation["admin_level"="6"](area.searchArea);
);
out body;
>;
out skel qt;`;

fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    body: query
})
.then(res => res.text())
.then(data => console.log('Sukses', data.substring(0, 500)))
.catch(err => console.log('Error fetch'));
