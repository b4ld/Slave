/* eslint-disable @typescript-eslint/no-explicit-any */
import ServerPropertyType from '../../server/enums/server-property.enum';
import { logger } from '../configuration.controller';

class ServerPropertyParser {
    server: string;
    properties: Map<ServerPropertyType, any> = new Map<
        ServerPropertyType,
        any
    >();

    constructor(serverName: string, props: any) {
        this.server = serverName;
        if (props) {
            if (Array.isArray(props)) {
                for (const prop of props) {
                    this.mapProperty(prop);
                }
            } else {
                this.mapProperty(props);
            }
        }

        if (this.properties.has(ServerPropertyType.AUTO_RESTART)) {
            this.properties.set(ServerPropertyType.DELETE_ON_STOP, false);
        }

        // Fill undefined properties
        this.setIfUndefined(ServerPropertyType.AUTO_RESTART, false);
        this.setIfUndefined(ServerPropertyType.SINGLE_INSTANCE, false);
        this.setIfUndefined(ServerPropertyType.DELETE_ON_STOP, true);
        this.setIfUndefined(ServerPropertyType.VOLUME, []);
    }

    setIfUndefined(prop: ServerPropertyType, value: any): void {
        if (!this.properties.has(prop)) {
            this.properties.set(prop, value);
        }
    }

    /**
     * Parse a single property
     *
     * @param {object} propertyXml
     */
    mapProperty(propertyXml: any) {
        if (!propertyXml.$ || !propertyXml.$.name) {
            return;
        }

        const property = propertyXml.$.name;
        const value = propertyXml.$.type;

        switch (property) {
            case 'autoRestart':
                this.properties.set(
                    ServerPropertyType.AUTO_RESTART,
                    value || false
                );
                break;
            case 'singleInstance':
                this.properties.set(
                    ServerPropertyType.SINGLE_INSTANCE,
                    value || false
                );
                break;
            case 'deleteOnStop':
                this.properties.set(
                    ServerPropertyType.DELETE_ON_STOP,
                    value || true
                );
                break;
            case 'volume':
                const volumes =
                    this.properties.get(ServerPropertyType.VOLUME) || [];
                volumes.push(value);
                this.properties.set(ServerPropertyType.VOLUME, volumes);
                break;
            default:
                logger.warn(
                    `${this.server} - The property ${property} does not exist!`
                );
                break;
        }
    }
}

export default (
    serverName: string,
    props: any
): Map<ServerPropertyType, any> => {
    const parser = new ServerPropertyParser(serverName, props);

    return parser.properties;
};
