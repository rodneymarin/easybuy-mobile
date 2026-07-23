const fs = require('fs');
const path = require('path');

const pkgPath = path.resolve(__dirname, '../package.json');
const appJsonPath = path.resolve(__dirname, '../app.json');

const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));

const currentVersion = pkg.version;
const match = currentVersion.match(/^(\d+\.\d+\.\d+)$/);

if (!match) {
  console.error(
    `Error: la versión actual "${currentVersion}" no sigue el formato X.Y.Z.\n` +
    'Ejemplo válido: 0.1.0'
  );
  process.exit(1);
}

const currentBuildNumber = parseInt(appJson.expo.ios?.buildNumber ?? '0', 10);
const currentVersionCode = appJson.expo.android?.versionCode ?? 0;
const newBuildNumber = currentBuildNumber + 1;
const newVersionCode = currentVersionCode + 1;

appJson.expo.ios = appJson.expo.ios || {};
appJson.expo.ios.buildNumber = String(newBuildNumber);
appJson.expo.android = appJson.expo.android || {};
appJson.expo.android.versionCode = newVersionCode;

fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, '\t') + '\n');
fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2) + '\n');

console.log(`✔ Build incrementado: buildNumber ${currentBuildNumber} → ${newBuildNumber}, versionCode ${currentVersionCode} → ${newVersionCode} (versión ${currentVersion})`);
