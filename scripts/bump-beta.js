const fs = require('fs');
const path = require('path');

const pkgPath = path.resolve(__dirname, '../package.json');
const appJsonPath = path.resolve(__dirname, '../app.json');

const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));

const currentVersion = pkg.version;
const match = currentVersion.match(/^(\d+\.\d+\.\d+)-beta\.(\d+)$/);

if (!match) {
  console.error(
    `Error: la versi\u00f3n actual "${currentVersion}" no sigue el formato beta (X.Y.Z-beta.N).\n` +
    'Ejemplo v\u00e1lido: 0.1.0-beta.1'
  );
  process.exit(1);
}

const baseVersion = match[1];
const betaNum = parseInt(match[2], 10);
const newVersion = `${baseVersion}-beta.${betaNum + 1}`;

pkg.version = newVersion;
appJson.expo.version = newVersion;

fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, '\t') + '\n');
fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2) + '\n');

console.log(`\u2714 Versi\u00f3n actualizada: ${currentVersion} \u2192 ${newVersion}`);
