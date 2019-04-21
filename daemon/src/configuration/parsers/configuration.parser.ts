import ServerModel from '../../server/server.model';
import ConfigurationModel from '../configuration.model';
import InvalidConfigurationException from '../exceptions/invalid-configuration.exception';
import parseServer from './server.parser';
import validateConfig from '../configuration-checker';
import ConfigurationValidationException from '../exceptions/configuration-validation.exception';

export default (xml: any): ConfigurationModel => {
    if (!xml.Configuration) {
        throw new InvalidConfigurationException();
    }

    const config = xml.Configuration;

    try {
        validateConfig(config);
    } catch (error) {
        throw new ConfigurationValidationException(error);
    }

    const portRange = {
        start: config.Daemon.PortRange.Start,
        end: config.Daemon.PortRange.End,
    };
    const servers: ServerModel[] = [];

    if (config.Servers) {
        if (Array.isArray(config.Servers.Server)) {
            for (const server of config.Servers.Server) {
                const s = parseServer(server);
                servers[s.name] = s;
            }
        } else {
            const s = parseServer(config.Servers.Server);
            servers[s.name] = s;
        }
    }

    return {
        portRange: portRange,
        servers: servers,
    };
};
