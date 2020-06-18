export interface Context {
    address: string;
    port: number;
    dir: string;
}

export interface PageContext extends Context {
    url: string;
}

export type Game = string;

export interface GameFile {
    path: string;
    size: number;
}
