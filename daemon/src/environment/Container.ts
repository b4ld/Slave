import { EventEmitter } from 'events';
import { Container } from 'winston';

import ContainerStatusType from './ContainerStatusType.enum';
import ContainerImpl from './docker/ContainerImpl';

import dockerode = require('dockerode');

export default interface Container extends EventEmitter {
    /**
     * The ID of the container.
     */
    id: string;

    /**
     * The container name.
     */
    name: string;
    /**
     * The port exposed by the container
     */
    port: string;

    /**
     * Initialize the container.
     */
    init(): Promise<void>;

    /**
     * Start the container.
     */
    start(): Promise<void>;

    /**
     * Stop the container.
     */
    stop(): Promise<void>;

    /**
     * Delete the container
     * This is a permanent action
     */
    remove(): Promise<void>;

    /**
     * Attach the container to the stdin/stdout
     */
    attach(): Promise<void>;

    /**
     * Get the current status of the container
     */
    getStatus(): Promise<ContainerStatusType>;
}

export const newContainer = (container: dockerode.Container) => {
    return new ContainerImpl(container);
};
