export default class Repository<T> {
    save(data: T): Promise<T>;
    getById(_id: string): Promise<any>;
    getAll(): Promise<any[]>;
    updateById(_id: string, data: T): Promise<T>;
    deleteById(_id: string): Promise<string>;
}
