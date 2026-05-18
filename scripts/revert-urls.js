const fs = require('fs');
const files = ['index.html', 'work_planner.html', 'notes_viewer.html', 'machine_location.html', 'admin_notes.html'];
files.forEach(f => {
  if (fs.existsSync(f)) {
    let content = fs.readFileSync(f, 'utf8');
    content = content.replace(/href="\/"/g, 'href="index.html"');
    content = content.replace(/href="\/work_planner"/g, 'href="work_planner.html"');
    content = content.replace(/href="\/notes_viewer"/g, 'href="notes_viewer.html"');
    content = content.replace(/href="\/machine_location"/g, 'href="machine_location.html"');
    content = content.replace(/href="\/admin_notes"/g, 'href="admin_notes.html"');
    fs.writeFileSync(f, content);
  }
});
console.log('URLs reverted back to .html for local development');
