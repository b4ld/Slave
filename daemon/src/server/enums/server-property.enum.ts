/**
 * The avaliable server properties with
 * its default value.
 */
export default class ServerPropertyType {
    static readonly AUTO_RESTART: ServerProperty = {
        name: 'autoRestart',
        default: false,
    };
    static readonly SINGLE_INSTANCE: ServerProperty = {
        name: 'singleInstance',
        default: false,
    };
    static readonly DELETE_ON_STOP: ServerProperty = {
        name: 'deleteOnStop',
        default: true,
    };
    static readonly VOLUME: ServerProperty = {
        name: 'volume',
        default: [],
    };

    static values(): ServerProperty[] {
        return [
            ServerPropertyType.AUTO_RESTART,
            ServerPropertyType.SINGLE_INSTANCE,
            ServerPropertyType.DELETE_ON_STOP,
            ServerPropertyType.VOLUME,
        ];
    }
}

export interface ServerProperty {
    name: string;
    default: any;
}
