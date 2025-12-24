import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.join(__dirname, '..');
const packageJsonPath = path.join(rootDir, 'package.json');
const navbarPath = path.join(rootDir, 'src', 'components', 'Navbar.jsx');
const readmePath = path.join(rootDir, 'README.md');
const indexPath = path.join(rootDir, 'index.html');

// 1. Read package.json
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const oldVersion = packageJson.version;

// 2. Bump Version (Rollover Style: 2.9.9 -> 3.0.0)
const versionParts = oldVersion.split('.').map(Number);
versionParts[2] += 1;

if (versionParts[2] >= 10) {
    versionParts[2] = 0;
    versionParts[1] += 1;
}

if (versionParts[1] >= 10) {
    versionParts[1] = 0;
    versionParts[0] += 1;
}

const newVersion = versionParts.join('.');

console.log(`🚀 Bumping version: ${oldVersion} -> ${newVersion}`);

// 3. Update package.json
packageJson.version = newVersion;
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');

// 4. Update Navbar.jsx
let navbarContent = fs.readFileSync(navbarPath, 'utf8');
const navbarRegex = /v\d+\.\d+\.\d+/g;
if (navbarRegex.test(navbarContent)) {
    navbarContent = navbarContent.replace(navbarRegex, `v${newVersion}`);
    fs.writeFileSync(navbarPath, navbarContent);
    console.log(`✅ Updated Navbar.jsx`);
} else {
    console.warn(`⚠️ Could not find version string in Navbar.jsx`);
}

// 5. Update README.md
let readmeContent = fs.readFileSync(readmePath, 'utf8');
// Matches "# SoraList (v2.9.2)"
const readmeHeaderRegex = /# SoraList \(v\d+\.\d+\.\d+\)/;
if (readmeHeaderRegex.test(readmeContent)) {
    readmeContent = readmeContent.replace(readmeHeaderRegex, `# SoraList (v${newVersion})`);
    fs.writeFileSync(readmePath, readmeContent);
    console.log(`✅ Updated README.md`);
} else {
    console.warn(`⚠️ Could not find version header in README.md`);
}

// 6. Update index.html
let indexContent = fs.readFileSync(indexPath, 'utf8');
const indexVersionRegex = /data-version="\d+\.\d+\.\d+"/;
if (indexVersionRegex.test(indexContent)) {
    indexContent = indexContent.replace(indexVersionRegex, `data-version="${newVersion}"`);
    fs.writeFileSync(indexPath, indexContent);
    console.log(`✅ Updated index.html`);
} else {
    console.warn(`⚠️ Could not find data-version in index.html`);
}

console.log(`✨ Version bump complete!`);
