const fs = require('fs');
const path = 'C:\\Users\\agenew\\Desktop\\DaoEssence1.0\\scripts\\generate-wallpapers.cjs';
let c = fs.readFileSync(path, 'utf8');

// Find the exact string: auth.js line followed by Language Switcher comment
const target = "    + '    <script src=\"/js/auth.js\"></script>\\n'    + '    <!-- Language Switcher JS -->\\n'";
const replacement = "    + '    <script src=\"/js/auth.js\"></script>\\n'    + '    <script src=\"/js/download-guard.js\"></script>\\n'    + '    <!-- Language Switcher JS -->\\n'";

if (c.includes(target)) {
    c = c.replace(target, replacement);
    fs.writeFileSync(path, c, 'utf8');
    console.log('Done - added download-guard.js to template');
} else {
    console.log('Pattern not found, trying alternate...');
    // Try just finding auth.js line and inserting after it
    const lines = c.split('\\n');
    let modified = false;
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('auth.js</script>') && !lines[i+1].includes('download-guard')) {
            lines.splice(i+1, 0, "    + '    <script src=\"/js/download-guard.js\"></script>\\n'");
            modified = true;
            console.log('Inserted at line', i+1);
            break;
        }
    }
    if (modified) {
        fs.writeFileSync(path, lines.join('\\n'), 'utf8');
        console.log('Done via line insertion');
    } else {
        console.log('Could not find insertion point');
    }
}
