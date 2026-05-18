const fs = require('fs');
const files = ['index.html', 'work_planner.html', 'notes_viewer.html', 'machine_location.html', 'admin_notes.html'];
files.forEach(f => {
  if (fs.existsSync(f)) {
    let content = fs.readFileSync(f, 'utf8');
    content = content.replace(/href="index\.html"/g, 'href="/"');
    content = content.replace(/href="work_planner\.html"/g, 'href="/work_planner"');
    content = content.replace(/href="notes_viewer\.html"/g, 'href="/notes_viewer"');
    content = content.replace(/href="machine_location\.html"/g, 'href="/machine_location"');
    content = content.replace(/href="admin_notes\.html"/g, 'href="/admin_notes"');
    fs.writeFileSync(f, content);
  }
});
console.log('URLs updated in HTML files');
fs.writeFileSync('vercel.json', JSON.stringify({ cleanUrls: true }, null, 2));
fs.writeFileSync('firebase.json', JSON.stringify({ hosting: { public: '.', cleanUrls: true } }, null, 2));
console.log('Created vercel.json and firebase.json');
