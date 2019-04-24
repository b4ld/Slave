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

export function readConfigFile(
    file: string = Constants.CONFIGURATION_FILE
): string {
    return fs.readFileSync(file).toString();
}
export function readConfig(configContents: string = readConfigFile()): object {
    let err;
    let xml;
    parser.parseString(
        configContents,
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
