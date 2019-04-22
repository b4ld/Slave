import * as Hapi from 'hapi';
export default class Plugins {
    static status(server: Hapi.Server): Promise<Error | any>;
    static swagger(server: Hapi.Server): Promise<Error | any>;
    static registerAll(server: Hapi.Server): Promise<Error | any>;
    private static register;
}
