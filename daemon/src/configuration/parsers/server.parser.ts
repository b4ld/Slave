import ServerModel from '../../server/server.model';
import parseServerProperties from './server-property.parser';

export default (serverXml: any): ServerModel => {
    if (!serverXml.Properties) {
        serverXml.Properties = { Property: [] };
    }

    const name = serverXml.Name;
    const image = serverXml.Image.Name;
    const properties = parseServerProperties(
        serverXml.Name,
        serverXml.Properties.Property
    );
    const server = new ServerModel(name, image, properties);

    return server;
};
