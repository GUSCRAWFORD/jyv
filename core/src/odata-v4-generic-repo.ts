import { ODataV42MongoFilter, ODataV42MongoQuery, ExpressLikeODataQuery } from './odata-v4-query';
export interface HasKey {_id?: object | string | any}
export class OperationContext<T extends HasKey>{
    instance: ODataV4GenericRepo<T>;
    data:T;
    result:any;
    http: any; // req, res, next, etc.
    key: any;
    query: any;
    db:any;
    client:any;
}
export class OperationSet<G extends ODataV4GenericRepo<HasKey>> {
    constructor(private instance:G) {}
    connect(context:OperationContext<HasKey>):Promise<any> { return new Promise(res=>res())}
    any(context:OperationContext<HasKey>):Promise<any> { return new Promise(res=>res())}
    create(context:OperationContext<HasKey>):Promise<any> { return new Promise(res=>res())}
    read(context:OperationContext<HasKey>):Promise<any> { return new Promise(res=>res())}
    update(context:OperationContext<HasKey>):Promise<any> { return new Promise(res=>res())}
    delete(context:OperationContext<HasKey>):Promise<any> { return new Promise(res=>res())}
    query(context:OperationContext<HasKey>):Promise<any> { return new Promise(res=>res())}
}
export abstract class ODataV4GenericRepo<T extends HasKey> {
    constructor(public name:string) { }
    before: OperationSet<ODataV4GenericRepo<T>> = new OperationSet(this);
    after: OperationSet<ODataV4GenericRepo<T>> = new OperationSet(this);
    abstract async query (query?: ExpressLikeODataQuery, context?:OperationContext<T>) : Promise<Array<T>>;
    abstract async read(key:string, query?: ExpressLikeODataQuery, context?:OperationContext<T>): Promise<T>;
    abstract async create(data:T, context?:OperationContext<T>): Promise<T>;
    abstract async upsert(key: string, data: any, context?:OperationContext<T>): Promise<T>;
    abstract async update(query: ExpressLikeODataQuery, delta: any, context?:OperationContext<T>): Promise<number>;
    abstract async delete(query: ExpressLikeODataQuery, context?:OperationContext<T>): Promise<number>;
    connection:object;
}
export class ConnectionInfo {
    schema?:string;
    user?:string;
    pwd?:string;
    host?:string;
    port?:number;
}
export const OS_INST = 0, OS_HTTP = 1, OS_DB = 2, OS_QUERY = 3, OS_QUERYLESS_DATA = 3, OS_DATA = 4, OS_RESULT = 5, OS_QUERYLESS_RESULT = 4;
