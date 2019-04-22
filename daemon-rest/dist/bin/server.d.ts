import * as Hapi from 'hapi';
export default class Server {
    private static _instance;
    static start(): Promise<Hapi.Server>;
    static stop(): Promise<Error | void>;
    static recycle(): Promise<Hapi.Server>;
    static instance(): Hapi.Server;
    static inject(options: string | Hapi.ServerInjectOptions): Promise<Hapi.ServerInjectResponse>;
}
