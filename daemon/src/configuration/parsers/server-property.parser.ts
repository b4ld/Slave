/* eslint-disable @typescript-eslint/no-explicit-any */
import ServerPropertyType, {
    ServerProperty,
} from '../../server/enums/server-property.enum';
import { logger } from '../configuration.controller';

class ServerPropertyParser {
    server: string;
    properties: { [key: string]: any } = {};

    constructor(serverName: string, props: any) {
        this.server = serverName;
        if (props) {
            if (Array.isArray(props)) {
                for (const prop of props) {
                    this.parseProperty(prop);
                }
            } else {
                this.parseProperty(props);
            }
        }

        if (this.properties[ServerPropertyType.AUTO_RESTART.name]) {
            this.properties[ServerPropertyType.DELETE_ON_STOP.name] = false;
        }

        // Fill undefined properties
        for (const p of ServerPropertyType.values()) {
            if (this.properties[p.name] === undefined) {
                this.properties[p.name] = p.default;
            }
        }
    }

    /**
     * Parse a single property
     *
     * @param {object} propertyXml
     */
    parseProperty(propertyXml: any): void {
        if (!propertyXml.$ || !propertyXml.$.name) {
            return;
        }

        const property = this.isValidServerProperty(propertyXml.$.name);
        if (!property) {
            logger.warn(
                `${this.server} - The property ${
                    propertyXml.$.name
                } does not exist!`
            );
            return;
        }

        if (property === ServerPropertyType.VOLUME) {
            /** @type {string[]} */
            const volumes =
                this.properties[ServerPropertyType.VOLUME.name] || [];
            volumes.push(propertyXml.$.type);
            this.properties[ServerPropertyType.VOLUME.name] = volumes;
        } else {
            this.properties[property.name] =
                propertyXml.$.type === undefined
                    ? property.default
                    : propertyXml.$.type;
        }
    }

    /**
     * Check if the property exists
     *
     * @param {string} property property to check
     * @returns {ServerProperty} ServerProperty if property exists, undefined otherwise
     */
    isValidServerProperty(property: string): ServerProperty {
        for (const p of Object.values(ServerPropertyType)) {
            if (p.name.toLowerCase() === property.toLowerCase()) {
                return p;
            }
        }
    }
}

export default (serverName: string, props: any): { [key: string]: any } => {
    const parser = new ServerPropertyParser(serverName, props);

    return parser.properties;
};
