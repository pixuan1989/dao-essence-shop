var fs = require('fs');
var path = 'C:\\Users\\agenew\\Desktop\\DaoEssence1.0\\js\\bazi-share.js';
var content = fs.readFileSync(path, 'utf8');

var oldCode = "      /* Use exact SVG from learn-bazi.html, colorize via fill */\n      var svgHtml = SVG_ICONS[p.id] || '';\n      /* Strip all fill attributes, then add platform color to each <path> */\n      var coloredSvg = svgHtml.replace(/\\sfill=\"[^\"]*\"/g, ' ');\n      coloredSvg = coloredSvg.replace(/<path /g, '<path fill=\"' + p.color + '\" ');";

var newCode = "      /* Colorize SVG via DOMParser */\n      var svgHtml = SVG_ICONS[p.id] || '';\n      var coloredSvg = svgHtml;\n      try {\n        var parser = new DOMParser();\n        var doc = parser.parseFromString(svgHtml, 'image/svg+xml');\n        var paths = doc.querySelectorAll('path');\n        for (var i = 0; i < paths.length; i++) {\n          paths[i].setAttribute('fill', p.color);\n        }\n        coloredSvg = new XMLSerializer().serializeToString(doc);\n      } catch(e) { /* fallback: use original svgHtml */ }";

if (content.indexOf(oldCode) !== -1) {
  content = content.replace(oldCode, newCode);
  fs.writeFileSync(path, content, 'utf8');
  console.log('Done: replaced regex-based coloring with DOMParser');
} else {
  console.log('ERROR: oldCode not found. Check whitespace.');
  // Debug: show surrounding context
  var idx = content.indexOf('colorize via fill');
  if (idx !== -1) {
    console.log('Found "colorize via fill" at index', idx);
    console.log('Context:', content.substring(idx - 50, idx + 200));
  }
}
