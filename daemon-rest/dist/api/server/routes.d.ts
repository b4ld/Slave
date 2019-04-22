import * as Hapi from 'hapi';
import IRoute from '../../helpers/route';
export default class ServerRoutes implements IRoute {
    register(server: Hapi.Server): Promise<any>;
}
