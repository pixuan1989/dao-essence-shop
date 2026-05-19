const fs = require('fs');
const d = JSON.parse(fs.readFileSync('./zodiac/seo-content/2026-05-19.json', 'utf8'));
const c = d.fortunesEn.rat.content;

// Inline md helper
function inlineMd(text) {
  text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  text = text.replace(/\*(.+?)\*/g, '<em>$1</em>');
  text = text.replace(/  \n/g, '<br>');
  return text;
}

function markdownToHtml(text) {
  text = text.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F000}-\u{1F02F}\u{1F0A0}-\u{1F0FF}\u{1F100}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}]/gu, '');
  text = text.replace(/  \n/g, '<br>');
  text = text.replace(/[ \t]+$/gm, '');
  const blocks = text.split(/\n\s*\n/).filter(b => b.trim());
  const htmlBlocks = blocks.map(block => {
    block = block.trim();
    if (block.startsWith('### ')) {
      return '<h3>' + inlineMd(block.slice(4).trim()) + '</h3>';
    }
    if (block.startsWith('## ')) {
      return '<h2>' + inlineMd(block.slice(3).trim()) + '</h2>';
    }
    return '<p>' + inlineMd(block) + '</p>';
  });
  return htmlBlocks.join('\n');
}

const result = markdownToHtml(c);
console.log('First 1000 chars of output:');
console.log(result.substring(0, 1000));
