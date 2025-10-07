const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');

const nameMap = new Map([
  ['cube', 'inventory'],
  ['people', 'group'],
  ['log-out', 'logout'],
  ['ellipse', 'circle'],
  ['arrow-forward', 'arrow-forward'],
  ['add', 'add'],
  ['add-circle', 'add-circle'],
  ['home', 'home'],
  ['list', 'list'],
  ['menu', 'menu'],
  ['close', 'close'],
  ['person', 'person'],
  ['settings', 'settings'],
  ['notifications', 'notifications'],
  ['share', 'share'],
  ['edit', 'edit'],
  ['visibility', 'visibility'],
  ['delete', 'delete'],
]);

function walk(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p, acc);
    else if (/\.(tsx?|jsx?)$/.test(entry.name)) acc.push(p);
  }
  return acc;
}

function transform(content) {
  let out = content;
  // Replace import
  out = out.replace(/import\s*\{\s*Ionicons\s*\}\s*from\s*'@expo\/vector-icons';?/g, "import { MaterialIcons } from '@expo/vector-icons';");

  // Replace JSX components <Ionicons ... /> -> <MaterialIcons ... />
  out = out.replace(/<\s*Ionicons(\s+[^>]*)\/>/g, (m, attrs) => {
    // Replace name="..." mapping
    const nameMatch = attrs.match(/name\s*=\s*"([^"]+)"/);
    let attrsOut = attrs;
    if (nameMatch) {
      const original = nameMatch[1];
      const mapped = nameMap.get(original) || original;
      attrsOut = attrs.replace(/name\s*=\s*"([^"]+)"/, `name="${mapped}"`);
    }
    return `<MaterialIcons${attrsOut}/>`;
  });

  // Replace JSX components with children form <Ionicons ...></Ionicons>
  out = out.replace(/<\s*Ionicons(\s+[^>]*)>(.*?)<\s*\/\s*Ionicons\s*>/gs, (m, attrs, children) => {
    const nameMatch = attrs.match(/name\s*=\s*"([^"]+)"/);
    let attrsOut = attrs;
    if (nameMatch) {
      const original = nameMatch[1];
      const mapped = nameMap.get(original) || original;
      attrsOut = attrs.replace(/name\s*=\s*"([^"]+)"/, `name="${mapped}"`);
    }
    return `<MaterialIcons${attrsOut}>${children}</MaterialIcons>`;
  });

  return out;
}

const files = walk(SRC);
let changed = 0;
for (const f of files) {
  const src = fs.readFileSync(f, 'utf8');
  const out = transform(src);
  if (out !== src) {
    fs.writeFileSync(f, out, 'utf8');
    changed++;
  }
}
console.log(`MaterialIcons migration complete. Files changed: ${changed}`);



