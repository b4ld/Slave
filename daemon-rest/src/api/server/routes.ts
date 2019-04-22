import * as Hapi from 'hapi';

import IRoute from '../../helpers/route';
import Logger from '../../helpers/logger';
import ServerController from './controller';

export default class ServerRoutes implements IRoute {
  public async register(server: Hapi.Server): Promise<any> {
    return new Promise(resolve => {
      Logger.info('ServerRoutes - Start adding server routes.');
      const controller = new ServerController();

      server.route([
        {
          method: 'POST',
          path: '/api/servers',
          options: {
            handler: controller.create,
            description: 'Method that creates a new server.',
            tags: ['api', 'servers'],
            auth: false,
          },
        },
        {
          method: 'GET',
          path: '/api/servers/{id}',
          options: {
            handler: controller.getById,
            description: 'Method that get a server by its id.',
            tags: ['api', 'servers'],
            auth: false,
          },
        },
        {
          method: 'GET',
          path: '/api/servers',
          options: {
            handler: controller.getAll,
            description: 'Method that gets all servers.',
            tags: ['api', 'servers'],
            auth: false,
          },
        },
        {
          method: 'DELETE',
          path: '/api/servers/{id}',
          options: {
            handler: controller.deleteById,
            description: 'Method that deletes a server by its id.',
            tags: ['api', 'servers'],
            auth: false,
          },
        },
      ]);

      Logger.info('ServerRoutes - Finish adding server routes.');

      resolve();
    });
  }
}
