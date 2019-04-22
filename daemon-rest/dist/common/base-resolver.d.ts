import Repository from './base-repository';
export default class CrudResolver<T> {
    protected repository: Repository<T>;
    constructor(repository: Repository<T>);
    save(data: T): Promise<T>;
    getOneById(id: string): Promise<T>;
    updateOneById(id: string, update: any): Promise<T>;
    deleteOneById(id: string): Promise<any>;
    getAll(): Promise<T[]>;
    bulkUpdate(ids: string[], field: string, value: string): Promise<T[]>;
    bulkDelete(ids: string[]): Promise<T[]>;
}
