import { readConfig, parseConfig } from './configuration.controller';
import InvalidConfigurationException from './exceptions/invalid-configuration.exception';
import ConfigurationModel from './configuration.model';
import ServerPropertyType from '../server/enums/server-property.enum';

const sampleConfig = `
<Configuration>
    <Daemon>
        <PortRange>
            <Start>25000</Start>
            <End>26000</End>
        </PortRange>
    </Daemon>
    <Servers>
        <Server>
            <Name>hub</Name>
            <Image>
                <Name>itzg/minecraft-server</Name>
            </Image>
            <Properties>
                <Property name="autoRestart" type="true" />
            </Properties>
        </Server>
        <Server>
            <Name>bedwars</Name>
            <Image>
                <Name>itzg/minecraft-server</Name>
            </Image>
        </Server>
    </Servers>
</Configuration>
`;

describe('Configuration tests', () => {
    test('should be parsed', () => {
        const parsedXml = readConfig(sampleConfig);

        expect(() => {
            parseConfig(parsedXml);
        }).not.toThrow();
    });

    test('should throw for invalid', () => {
        const parsedXml = readConfig(`
<Configuration>
    <Daemon>
        <PortRange>
            <Start>25000</Start>
        </PortRange>
    </Daemon>
</Configuration>
        `);

        expect(() => {
            parseConfig(parsedXml);
        }).toThrow(InvalidConfigurationException);
    });

    describe('Config validation', () => {
        let cfg: ConfigurationModel;

        beforeAll(() => {
            const config = readConfig(sampleConfig);
            cfg = parseConfig(config);
        });

        test('should parse values successfully', () => {
            expect(cfg.servers.size).toBeGreaterThan(0);

            expect(cfg.servers.get('a server not defined')).toBe(undefined);

            expect(cfg.servers.get('bedwars')).not.toBe(undefined);
            expect(cfg.servers.get('bedwars').image).toBe(
                'itzg/minecraft-server'
            );

            expect(cfg.servers.get('hub')).not.toBe(undefined);
            expect(cfg.servers.get('hub').name).toBe('hub');
            expect(cfg.servers.get('hub').image).toBe('itzg/minecraft-server');
            expect(
                cfg.servers
                    .get('hub')
                    .properties.get(ServerPropertyType.AUTO_RESTART)
            ).toBe(true);
        });

        test('deleteOnStop should be false when autoRestart is true', () => {
            expect(
                cfg.servers
                    .get('hub')
                    .properties.get(ServerPropertyType.AUTO_RESTART)
            ).toBe(true);
            expect(
                cfg.servers
                    .get('hub')
                    .properties.get(ServerPropertyType.DELETE_ON_STOP)
            ).toBe(false);
        });
    });
});
