const enum ContainerEventType {
    /**
     * Got new data from the container stdout
     */
    CONSOLE_OUTPUT = 'console_output',
    /**
     * a container was started
     */
    CONTAINER_START = 'container_start',
    /**
     * A container died
     */
    CONTAINER_DEAD = 'container_die',
    /**
     * A container was removed from docker
     */
    CONTAINER_REMOVE = 'container_destroy',
}

export default ContainerEventType;
