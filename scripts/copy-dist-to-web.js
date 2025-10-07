const fs = require('fs');
const path = require('path');

const srcDir = path.resolve(__dirname, '..', 'dist');
const destDir = path.resolve(__dirname, '..', 'web', 'public', 'app');
const publicRoot = path.resolve(__dirname, '..', 'web', 'public');
const publicFontsDir = path.join(publicRoot, 'assets', 'fonts');

function copyRecursive(src, dest) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyRecursive(from, to);
    } else {
      fs.copyFileSync(from, to);
    }
  }
}

if (!fs.existsSync(srcDir)) {
  console.error('dist/ not found. Run "npm run build:web" first.');
  process.exit(1);
}

copyRecursive(srcDir, destDir);
// Also expose root-level folders expected by Expo export
const expoDir = path.join(srcDir, '_expo');
if (fs.existsSync(expoDir)) {
  copyRecursive(expoDir, path.join(publicRoot, '_expo'));
}
const assetsDir = path.join(srcDir, 'assets');
if (fs.existsSync(assetsDir)) {
  copyRecursive(assetsDir, path.join(publicRoot, 'assets'));
}
// Ensure key icon fonts are also available at a stable short path
try {
  const fontsSrc = path.join(assetsDir, 'node_modules', '@expo', 'vector-icons', 'build', 'vendor', 'react-native-vector-icons', 'Fonts');
  if (fs.existsSync(fontsSrc)) {
    if (!fs.existsSync(publicFontsDir)) fs.mkdirSync(publicFontsDir, { recursive: true });
    const copyFont = (name) => {
      const from = path.join(fontsSrc, name);
      if (fs.existsSync(from)) {
        fs.copyFileSync(from, path.join(publicFontsDir, name));
      }
    };
    copyFont('MaterialIcons.4e85bc9ebe07e0340c9c4fc2f6c38908.ttf');
    copyFont('MaterialCommunityIcons.b62641afc9ab487008e996a5c5865e56.ttf');
    copyFont('Ionicons.6148e7019854f3bde85b633cb88f3c25.ttf');
  }
} catch (e) {
  console.warn('Could not mirror fonts to /assets/fonts:', e.message);
}
console.log('Copied dist/ to web/public/app/ and mirrored _expo/ & assets/ at web/public/.');


