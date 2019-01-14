import { ExpressLikeODataQuery } from './express-like-odata-query';
export interface HasKey {[key:string]:any}
/**
 * Metadata about the "context" of a request, broadly pass-through when implementing custom repos
 */
export class OperationContext<T extends HasKey>{
    instance?: ODataV4GenericRepo<T>;
    data?:T;
    result:any;
    http: any; // req, res, next, etc.
    key: any;
    query: any;
    db:any;
    client:any;
}
/**
 * An set of operations attached to a repository life-cycle state
 */
export class OperationSet<G extends ODataV4GenericRepo<HasKey>> {
    constructor(private instance:G) {}
    /**
     * Called before / after connection
     * @param context see `OperationContext<T>`
     */
    connect(context:OperationContext<HasKey>):Promise<any> { return new Promise(res=>res())}
    /**
     * Called before / after any operation 
     * @param context see `OperationContext<T>`
     */
    any(context:OperationContext<HasKey>):Promise<any> { return new Promise(res=>res())}
    /**
     * Called before / after create operations
     * @param context see `OperationContext<T>`
     */
    create(context:OperationContext<HasKey>):Promise<any> { return new Promise(res=>res())}
    /**
     * Called before / after read operations
     * @param context see `OperationContext<T>`
     */
    read(context:OperationContext<HasKey>):Promise<any> { return new Promise(res=>res())}
    /**
     * Called before / after update operations
     * @param context see `OperationContext<T>`
     */
    update(context:OperationContext<HasKey>):Promise<any> { return new Promise(res=>res())}
    /**
     * Called before / after delete operations
     * @param context see `OperationContext<T>`
     */
    delete(context:OperationContext<HasKey>):Promise<any> { return new Promise(res=>res())}
    /**
     * Called before / after query operations
     * @param context see `OperationContext<T>`
     */
    query(context:OperationContext<HasKey>):Promise<any> { return new Promise(res=>res())}
}
/**
 * Base-repo class that all others derive from
 */
export abstract class ODataV4GenericRepo<T extends HasKey> {
    constructor(public name:string) { }
    before: OperationSet<ODataV4GenericRepo<T>> = new OperationSet(this);
    after: OperationSet<ODataV4GenericRepo<T>> = new OperationSet(this);
    /**
     * Query a collection or table
     * @param query an object with odata-v4 query properties like `$select`, `$filter`, etc.
     * @param context not required, see `OperationContext<T>`
     */
    abstract async query (query?: ExpressLikeODataQuery, context?:OperationContext<T>) : Promise<Array<T>>;

    /**
     * Read a record or document from a collection or table by default key
     * @param key a primary key or data-base level index
     * @param query an object with odata-v4 query properties like `$select`, `$filter`, etc.
     * @param context not required, see `OperationContext<T>`
     */
    abstract async read(key:string, query?: ExpressLikeODataQuery, context?:OperationContext<T>): Promise<T>;

    /**
     * Create a new record
     * @param data data to save
     * @param context not required, see `OperationContext<T>`
     */
    abstract async create(data:T, context?:OperationContext<T>): Promise<T>;

    /**
     * Insert or update a new record
     * @param key a primary key or data-base level index
     * @param data data to save
     * @param context not required, see `OperationContext<T>`
     */
    abstract async upsert(key: string, data: any, context?:OperationContext<T>): Promise<T>;

    /**
     * Bulk update records matching a query
     * @param query an object with odata-v4 query properties like `$select`, `$filter`, etc.
     * @param delta data changes to save
     * @param context not required, see `OperationContext<T>`
     */
    abstract async update(query: ExpressLikeODataQuery, delta: any, context?:OperationContext<T>): Promise<number>;

    /**
     * Bulk delete records matching a query
     * @param query an object with odata-v4 query properties like `$select`, `$filter`, etc.
     * @param context not required, see `OperationContext<T>`
     */
    abstract async delete(query: ExpressLikeODataQuery, context?:OperationContext<T>): Promise<number>;

    /**
     * Instance of this repo's data connection
     */
    connection:any;
}
/**
 * Ubiquitous interface for details necessary to connect to a data server
 */
export class ConnectionInfo {
    schema?:string;
    user?:string;
    pwd?:string;
    host?:string;
    port?:number;
}
export const OS_INST = 0, OS_HTTP = 1, OS_DB = 2, OS_QUERY = 3, OS_QUERYLESS_DATA = 3, OS_DATA = 4, OS_RESULT = 5, OS_QUERYLESS_RESULT = 4;
