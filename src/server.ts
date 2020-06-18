import { IncomingMessage, ServerResponse, get, createServer as createHTTPServer } from 'http';
import { networkInterfaces, NetworkInterfaceInfo } from 'os';
import { URL } from 'url';
import render from './render';
import { getGames, getGame } from './games';
import { Context, PageContext } from './typings';
import { createReadStream } from 'fs';

export function findLocalInterfaces(): NetworkInterfaceInfo[] {
    const interfaces = networkInterfaces();
    const localInterfaces = [];

    for (const key in interfaces) {
        const intf = interfaces[key];
        if (!intf || intf.every(i => i.internal)) {
            continue;
        }
        const ipv4 = intf.find(i => i.family === 'IPv4');
        if (ipv4) {
            localInterfaces.push(ipv4);
        }
    }

    return localInterfaces;
}

export async function processRequest(req: IncomingMessage, res: ServerResponse, context: PageContext) {
    if (!req.url) return;

    const url = new URL(req.url, `http://${req.headers.host}`);

    if (url.pathname.startsWith('/file/')) {
        try {
            const game = await getGame(context.dir, decodeURIComponent(url.pathname.slice('/file/'.length)));

            res.writeHead(200, {
                'Content-Length': game.size
            });

            createReadStream(game.path).pipe(res);
        } catch(e) {
            console.error(e);
        }

        return;
    }

    const games = await getGames(context.dir);
    const indexPage = await render.index(context, games);
    res.end(indexPage);
}

export function processError(err: Error) {
    console.error(err);
}

export function checkServer(url: string) {
    return new Promise((resolve, reject) => {
        const checkstatus = (status?: number) => {
            if (status !== 200) {
                return reject();
            }

            resolve();
        }

        // Проверяем доступность
        get(
            url,
            ({ statusCode }) => checkstatus(statusCode)
        ).on('error', reject);
    });
}

export function createServer(context: Context): Promise<string> {
    const { address, port } = context;
    const url = `http://${address}:${port}`;
    const pageContext = {
        ...context,
        url
    };
    const server = createHTTPServer((req, res) => processRequest(req, res, pageContext));

    server.on('error', processError);
    server.listen(port, address);

    return new Promise((resolve) => {
        checkServer(url)
            .then(() => resolve(url))
            .catch(() => server.close());
    });
}
