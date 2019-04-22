export default class Repository<T> {
  public save(data: T): Promise<T> {
    return new Promise((resolve, reject) => {
      //Not implemented
    });
  }

  public getById(_id: string): Promise<any> {
    return new Promise((resolve, reject) => {
      //Not implemented
    });
  }

  public getAll(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      //Not implemented
    });
  }

  public updateById(_id: string, data: T): Promise<T> {
    return new Promise((resolve, reject) => {
      //Not implemented
    });
  }

  public deleteById(_id: string): Promise<string> {
    return new Promise((resolve, reject) => {
      //Not implemented
    });
  }
}
