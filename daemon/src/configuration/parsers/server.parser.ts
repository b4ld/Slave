import ConfigurationException from '../exceptions/configuration.exception';
import ServerModel from '../../server/server.model';
import parseServerProperties from './server-property.parser';

/**
 *
 * @param {T} field
 * @param {string} message
 */
function assertFieldDefined<T>(field: T, message: string): T {
    if (!field) {
        throw new ConfigurationException(message);
    }

    return field;
}

export default (serverXml: any): ServerModel => {
    assertFieldDefined(serverXml.Image, 'Server image is undefined!');

    if (!serverXml.Properties) {
        serverXml.Properties = { Property: [] };
    }

    const name = assertFieldDefined(serverXml.Name, 'Server name is undefined!');
    const image = {
        name: assertFieldDefined(serverXml.Image.Name, 'Server image name is undefined!'),
    };
    const properties = parseServerProperties(serverXml.Name, serverXml.Properties.Property);

    const server = new ServerModel(name, image, properties);

    return server;
};
