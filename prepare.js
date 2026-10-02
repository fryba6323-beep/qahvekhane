// Builds the "www" folder: copies the game and makes it fully OFFLINE
// (replaces the CDN links for three.js and the font with local files).
const fs = require('fs');
const path = require('path');

const WWW = path.join(__dirname, 'www');
fs.rmSync(WWW, { recursive: true, force: true });
fs.mkdirSync(WWW, { recursive: true });

let html = fs.readFileSync(path.join(__dirname, 'game.html'), 'utf8');

// 1) three.js (required)
const threeSrc = path.join(__dirname, 'node_modules', 'three', 'build', 'three.min.js');
if (!fs.existsSync(threeSrc)) {
  console.error('ERROR: node_modules/three/build/three.min.js not found. Did "npm install" run?');
  process.exit(1);
}
fs.copyFileSync(threeSrc, path.join(WWW, 'three.min.js'));
const threeTag = /<script src="https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/three\.js\/r128\/three\.min\.js"><\/script>/;
if (!threeTag.test(html)) {
  console.error('ERROR: three.js script tag not found in game.html');
  process.exit(1);
}
html = html.replace(threeTag, '<script src="three.min.js"></script>');

// 2) Vazirmatn font (optional: if anything is missing we just drop the link; the game has fallback fonts)
const fontTag = /<link rel="stylesheet" href="https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/vazirmatn\/[^"]+">/;
let fontOk = false;
try {
  const vz = path.join(__dirname, 'node_modules', 'vazirmatn');
  const css = path.join(vz, 'Vazirmatn-font-face.css');
  if (fs.existsSync(css)) {
    fs.copyFileSync(css, path.join(WWW, 'vazirmatn.css'));
    for (const d of ['fonts']) {
      const src = path.join(vz, d);
      if (fs.existsSync(src)) fs.cpSync(src, path.join(WWW, d), { recursive: true });
    }
    fontOk = true;
  }
} catch (e) {
  console.warn('Font copy failed, continuing without it:', e.message);
}
html = html.replace(fontTag, fontOk ? '<link rel="stylesheet" href="vazirmatn.css">' : '');

fs.writeFileSync(path.join(WWW, 'index.html'), html);
console.log('www ready. three.js: yes, font:', fontOk ? 'yes' : 'no (fallback fonts)');
