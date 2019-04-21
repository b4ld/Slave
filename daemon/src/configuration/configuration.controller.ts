import fs from 'fs';
import xmlToJs from 'xml2js';

import Constants from '../helpers/constants';
import Logger, { newLogger } from '../logger/Logger';
import ConfigurationModel from './configuration.model';
import parseConfiguration from './parsers/configuration.parser';

const logger: Logger = newLogger();

const parser = new xmlToJs.Parser({
    explicitArray: false,
    attrValueProcessors: [xmlToJs.processors.parseBooleans],
});

export { logger };

export function readConfig(): object {
    const configFile = fs.readFileSync(Constants.CONFIGURATION_FILE);

    let err;
    let xml;
    parser.parseString(
        configFile,
        (e: Error, r: object): void => {
            err = e;
            xml = r;
        }
    );

    if (err) {
        throw err;
    }

    return xml;
}

export function parseConfig(xml?: object): ConfigurationModel {
    if (!xml) {
        xml = readConfig();
    }

    const parsed = parseConfiguration(xml);

    return parsed;
}
