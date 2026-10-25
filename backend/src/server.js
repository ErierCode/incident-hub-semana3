const fs = require('fs');
const path = require('path');
const { createApp } = require('./app');
const { loadConfig } = require('./config');
const { createPool } = require('./db/pool');

const config = loadConfig();

// Si existe el frontend compilado (frontend/dist), la API también sirve la interfaz web.
// La ruta relativa es la misma en el repositorio y en el artefacto empaquetado.
const frontendDist = path.resolve(__dirname, '../../frontend/dist');
const staticDir = fs.existsSync(path.join(frontendDist, 'index.html')) ? frontendDist : undefined;

const app = createApp({ db: createPool(config.db), staticDir });

app.listen(config.port, () => {
  console.log(`IT Incident Hub escuchando en http://localhost:${config.port}${staticDir ? ' (API + interfaz web)' : ' (solo API)'}`);
});
