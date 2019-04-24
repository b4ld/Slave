import ServerPropertyType from './enums/server-property.enum';

export default class ServerModel {
    /**
     * Server type name
     */
    name: string;

    /**
     * Server container image
     */
    image: object;

    /**
     * Server properties
     */
    properties: Map<ServerPropertyType, any>;

    constructor(
        name: string,
        image: object,
        serverProperties: Map<ServerPropertyType, any>
    ) {
        this.name = name;
        this.image = image;
        this.properties = serverProperties;
    }
}
