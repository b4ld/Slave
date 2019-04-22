import * as Hapi from 'hapi';
import CrudResolver from '../common/base-resolver';
export default class CrudController<T> {
    private crudResolver;
    constructor(crudResolver: CrudResolver<T>);
    create: (request: Hapi.Request, h: Hapi.ResponseToolkit) => Promise<any>;
    updateById: (request: Hapi.Request, h: Hapi.ResponseToolkit) => Promise<any>;
    getById: (request: Hapi.Request, h: Hapi.ResponseToolkit) => Promise<any>;
    getAll: (request: Hapi.Request, h: Hapi.ResponseToolkit) => Promise<any>;
    deleteById: (request: Hapi.Request, h: Hapi.ResponseToolkit) => Promise<any>;
}
