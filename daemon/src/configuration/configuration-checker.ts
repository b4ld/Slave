import Joi from 'joi';

const portRangeSchema = Joi.object()
    .keys({
        Start: Joi.number()
            .max(65535)
            .required(),
        End: Joi.number()
            .max(65535)
            .required(),
    })
    .required();

const serverPropertySchema = Joi.object().keys({
    $: Joi.object().keys({
        name: Joi.string()
            .valid('autoRestart', 'singleInstance', 'deleteOnStop', 'volume')
            .required(),
        type: Joi.any().required(),
    }),
});

const serverSchema = Joi.object().keys({
    Name: Joi.string().required(),
    Image: Joi.object().keys({
        Name: Joi.string().required(),
    }),
    Properties: Joi.object().keys({
        Property: Joi.alternatives().try(
            serverPropertySchema,
            Joi.array().items(serverPropertySchema)
        ),
    }),
});

const schema = Joi.object().keys({
    Daemon: Joi.object().keys({
        PortRange: portRangeSchema,
    }),
    Servers: Joi.object().keys({
        Server: [serverSchema, Joi.array().items(serverSchema)],
    }),
});

export default (config: object): boolean => {
    const result = Joi.validate(config, schema);

    if (result.error) {
        throw result.error;
    }

    return true;
};
