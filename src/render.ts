import QRCode from 'qrcode';
import { PageContext, Game } from './typings';
import { readFileSync } from 'fs';
import { join } from 'path';

const templatesDir = join(__dirname, '..', 'templates/');
const indexTemplate = readFileSync(join(templatesDir, 'index.html')).toString();
const gameTemplate = readFileSync(join(templatesDir, 'game.html')).toString();

export default {
    index: async function(context: PageContext, games: Game[]): Promise<string> {
        const gameList = await Promise.all(
            games.map(async file => {
                const url = `${context.url}/file/${encodeURIComponent(file)}`;
                const code = await QRCode.toDataURL(url, {
                    errorCorrectionLevel: 'M',
                    scale: 5
                });
                return gameTemplate
                    .replace(/{{FILE}}/g, file)
                    .replace(/{{URL}}/g, url)
                    .replace(/{{CODE}}/g, code);
            })
        );

        return indexTemplate.replace('{{GAME_LIST}}', gameList.join(''));
    }
}
