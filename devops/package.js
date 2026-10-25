// Empaqueta la aplicación en dist/incident-hub manteniendo la estructura del repositorio,
// lista para comprimirse como artefacto del pipeline.
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'dist', 'incident-hub');

const INCLUDE = [
  'package.json',
  'package-lock.json',
  'README.md',
  'CHANGELOG.md',
  'database',
  'backend/package.json',
  'backend/src',
  'frontend/package.json',
  'frontend/dist',
  'devops/deploy.ps1',
  'devops/docker-compose.deploy.yml',
  'tests/smoke',
];

fs.rmSync(path.join(ROOT, 'dist'), { recursive: true, force: true });

for (const item of INCLUDE) {
  const from = path.join(ROOT, item);
  if (!fs.existsSync(from)) {
    console.log(`(omitido, no existe) ${item}`);
    continue;
  }
  fs.cpSync(from, path.join(OUT, item), { recursive: true });
  console.log(`+ ${item}`);
}

const { version } = require(path.join(ROOT, 'package.json'));
const buildInfo = {
  version,
  commit: process.env.BUILD_SOURCEVERSION || 'local',
  buildId: process.env.BUILD_BUILDID || 'local',
  builtAt: new Date().toISOString(),
};
fs.writeFileSync(path.join(OUT, 'build-info.json'), JSON.stringify(buildInfo, null, 2));
console.log(`Paquete listo en ${path.relative(ROOT, OUT)} (v${version})`);
