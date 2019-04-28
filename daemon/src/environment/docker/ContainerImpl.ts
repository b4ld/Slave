import { EventEmitter } from 'events';

import Container from '../container';
import ContainerEventType from '../ContainerEventType.enum';
import ContainerStatusType from '../ContainerStatusType.enum';

import dockerode = require('dockerode');

export default class ContainerImpl extends EventEmitter implements Container {
    readonly id: string;
    name: string;
    port: string;

    private readonly container: dockerode.Container;

    constructor(container: dockerode.Container) {
        super();

        this.container = container;
        this.id = container.id;
        this.name = container.id;
    }

    async init() {
        const info = await this.container.inspect();
        this.name = info.Name.substr(1);

        const ports = info.NetworkSettings.Ports['25565/tcp'] || [
            { HostPort: '-1' },
        ];

        this.port = ports[0].HostPort;
    }

    async start() {
        await this.container.start();
    }

    async stop() {
        await this.container.stop();
    }

    async remove() {
        await this.container.remove();
    }

    async attach() {
        const stream = await this.container.attach({
            stream: true,
            stdout: true,
            stderr: true,
        });
        stream.setEncoding('utf8');
        // Listen for console output
        stream
            .on('data', (data: Buffer) => {
                data.toString()
                    .split('\n')
                    .forEach(line => {
                        if (line) {
                            this.emit(
                                ContainerEventType.CONSOLE_OUTPUT,
                                line.trim()
                            );
                        }
                    });
            })
            .on('end', () => {
                console.log('Attach stream closed!');
            })
            .on('error', (err: Error) => {
                console.log('Attach stream error!', { err });
            });
    }
    async getStatus(): Promise<ContainerStatusType> {
        const info = await this.container.inspect();

        let status = ContainerStatusType.OFFLINE;
        if (info.State.Running) {
            status = ContainerStatusType.ONLINE;
        }

        return status;
    }
}
