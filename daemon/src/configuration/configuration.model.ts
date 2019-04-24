import ServerModel from '../server/server.model';

export default interface ConfigurationModel {
    /**
     * The range of ports avaliable to register the servers
     */
    portRange: PortRange;

    /**
     * All avaliable server types
     */
    servers: Map<string, ServerModel>;
}

/**
 * A port range
 */
export interface PortRange {
    /**
     * The start of the port range
     */
    start: number;
    /**
     * The end of the port range
     */
    end: number;
}
