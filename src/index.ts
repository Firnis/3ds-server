import { isAbsolute, join } from 'path';
import { statSync } from 'fs';
import { findLocalInterfaces, createServer } from './server';
import { getGames } from './games';

const args = process.argv;
const port = parseInt(args[3], 10) || 3000;
const dirname = args[2] || 'roms';
const networkInterfaces = findLocalInterfaces();
let dir = isAbsolute(dirname) ? dirname : join(__dirname, '..', dirname);

try {
    const stats = statSync(dir);
    if (!stats.isDirectory()) {
        throw new Error();
    }
} catch(e) {
    console.warn(`${dir} is not directory`);
    dir = join(__dirname, '..', 'roms');
}

if (!networkInterfaces.length) {
    console.error('Не найден внешний IPv4 адресс');
    process.exit(1);
}

for (const network of networkInterfaces) {
    createServer({
        address: network.address,
        port,
        dir
    }).then(
        url => console.log(`listening on ${url}`)
    );
}

console.log('Reading files in ' + dir);

getGames(dir)
    .then(games => console.log(`Found ${games.length} games`))
    .catch(e => console.error(e));
