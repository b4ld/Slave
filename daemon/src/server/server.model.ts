export default class ServerModel {
    /**
     * Server type name
     *
     * @type {string}
     */
    name: string;

    /**
     * Server container image
     *
     * @type {ContainerImage}
     */
    image: object;

    /**
     * Server properties
     *
     * @type {ServerProperties}
     */
    properties: object;

    constructor(name: string, image: object, serverProperties: object) {
        this.name = name;
        this.image = image;
        this.properties = serverProperties;
    }
}
