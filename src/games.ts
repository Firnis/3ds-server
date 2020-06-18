import { readdir, stat } from 'fs';
import { Game, GameFile } from './typings';
import { join } from 'path';

export function getGames(dir: string): Promise<Game[]> {
    return new Promise((resolve, reject) => {
        readdir(dir, function(err, files) {
            if (err) {
                reject(err);
            }

            resolve(
                files.reduce<Game[]>((files, file) => {
                    if (file.endsWith('cia') || file.endsWith('3ds')) {
                        files.push(file);
                    }

                    return files;
                }, [])
            );
        });
    });
}

export async function getGame(dir: string, filename: string): Promise<GameFile> {
    return new Promise((resolve, reject) => {
        const path = join(dir, filename);

        stat(path, function(err, stats) {
            if (err) return reject(err);

            resolve({
                path,
                size: stats.size,
            });
        });
    });
}
