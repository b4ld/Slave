import { EventEmitter } from 'events';

import config from '../helpers/configuration';
import Constants from '../helpers/constants';
import { newLogger } from '../logger/Logger';
import ServerPropertyType from '../server/enums/server-property.enum';
import ServerModel from '../server/server.model';
import Container, { newContainer } from './Container';
import ContainerEventType from './ContainerEventType.enum';

import Dockerode = require('dockerode');
const client = new Dockerode();
const logger = newLogger();

function isZentryServer(containerInfo: Dockerode.ContainerInfo) {
    for (const name of containerInfo.Names) {
        if (name.startsWith(`/${Constants.CONTAINER_NAME_PREFIX}`)) {
            return true;
        }
    }

    return false;
}

/**
 * Get all container images configured.
 */
function getImages() {
    return (
        Object.values(config.servers)
            .map((server: ServerModel) => server.image)
            // Filter duplicated values
            .filter((item, pos, self) => {
                for (let i = 0; i < self.length; i++) {
                    if (item === self[i]) {
                        return i === pos;
                    }
                }
            })
    );
}

export const testConnection = async (): Promise<void> => {
    await client.listContainers();
};

/**
 * Updates all the images for the containers.
 */
export const updateImages = async () => {
    const images = getImages();

    for (const image of images) {
        await client.pull(image, {});

        // await client.pull(image.image, { authconfig: image.auth });
    }
};

/**
 * Get all zentry containers currently running.
 */
export const getExistingContainers = async (): Promise<Container[]> => {
    const containers = [];

    const list = await client.listContainers({ all: true });
    for (const container of list) {
        if (isZentryServer(container)) {
            const dc = client.getContainer(container.Id);

            const c = newContainer(dc);
            containers.push(c);
        }
    }

    return containers;
};

/**
 * Get a listener for the container events
 */
export const getEvents = (): EventEmitter => {
    const emitter = new EventEmitter();

    client
        .getEvents({
            Filters: {
                type: 'container',
            },
        })
        .then(eventStream => {
            eventStream.on('data', msg => {
                msg = JSON.parse(msg);
                if (
                    !msg ||
                    !msg.Type ||
                    msg.Type !== 'container' ||
                    !msg.Action
                ) {
                    return;
                }
                if (msg.Action === 'die') {
                    emitter.emit(ContainerEventType.CONTAINER_DEAD, msg.id);
                } else if (msg.Action === 'start') {
                    emitter.emit(ContainerEventType.CONTAINER_START, msg.id);
                } else if (msg.Action === 'destroy') {
                    emitter.emit(ContainerEventType.CONTAINER_REMOVE, msg.id);
                }
            });
        });

    return emitter;
};

/**
 * Create a new container with the given properties.
 *
 * @param serverModel - The server model to create the container from.
 * @param port - Container port to expose.
 * @param identifier - Unique identifier to the server, ex and auto-increment number.
 */
export const createContainer = async (
    serverModel: ServerModel,
    port: string,
    identifier: string
): Promise<Container> => {
    const containerName =
        Constants.CONTAINER_NAME_PREFIX +
        serverModel.name +
        (identifier !== undefined ? `-${identifier}` : '');

    const options = {
        name: containerName,
        Image: serverModel.image,
        AttachStdin: true,
        OpenStdin: true,
        AttachStdout: true,
        AttachStderr: true,
        Tty: true,
        ExposedPorts: {
            '25565/tcp': {},
        },
        HostConfig: {
            Binds: serverModel.properties.get(ServerPropertyType.VOLUME),
            PortBindings: {
                '25565/tcp': [
                    {
                        HostIp: '0.0.0.0',
                        HostPort: port,
                    },
                ],
            },
        },
        // Volumes: {
        //   '/data': { }
        // },
        Env: [
            'EULA=TRUE',
            'PAPER_DOWNLOAD_URL=https://heroslender.com/assets/PaperSpigot-1.8.8.jar',
            'TYPE=PAPER',
            'VERSION=1.8.8',
            'ENABLE_RCON=false',
        ],
    };

    const container = await client.createContainer(options);
    const c = newContainer(container);

    // TODO: Add metric counter (incremental operation)
    return c;
};

export const init = async () => {
    try {
        logger.info('Trying to connect to the environment...');
        await testConnection();
    } catch (err) {
        logger.error('Connection failed!', { err });
        process.exit(1);
    }
    logger.info('Connected! Initializing now.');

    await updateImages();
};
