import InvalidConfigurationException from './invalid-configuration.exception';

export default class ConfigurationValidationException extends InvalidConfigurationException {
    constructor(baseError: any) {
        super(baseError.message);
        if (baseError.isJoi) {
            const details = baseError.details[baseError.details.length - 1];

            if (details.type === 'any.allowOnly') {
                details.message += ` but got "${details.context.value}".`;
            }

            this.formatMessage(details.message, details.path, details.context);
        } else {
            this.name = baseError.name;
            this.message = baseError.message;
            this.stack = baseError.stack;
        }
    }
    formatMessage(message: string, path: any[], contex: object) {
        const pathFormated = path
            .filter(v => v !== '$')
            .reduce((acc, value) => {
                if (typeof value === 'number') {
                    return acc + `[${value}]`;
                } else {
                    return acc + ` => ${value}`;
                }
            });

        this.message = `${message}
Path: ${pathFormated}
Context: ${JSON.stringify(contex)}
        `;
    }
}
