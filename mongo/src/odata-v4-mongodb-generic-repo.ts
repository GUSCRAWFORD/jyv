import {
    ODataV4GenericRepo,
    ConnectionInfo,
    APP_CONFIG,
    HasKey,
    OperationContext,
    ExpressLikeODataQuery
} from '@jyv/core';
import { ODataV42MongoFilter, ODataV42MongoQuery } from './odata-v4-2-mongo-query';
export { ODataV4GenericRepo, ConnectionInfo, APP_CONFIG, OperationContext };
const DB_CONFIG = (APP_CONFIG[process.env.NODE_ENV||'local'] as any).db, DEFAULT_DB_CONFIG = DB_CONFIG[DB_CONFIG.default];
import { ObjectID, MongoClient, Db } from "mongodb";
export { ObjectID, MongoClient, Db };
export interface HasMongoKey extends HasKey {
    _id?:string | object | any;
}
export class ODataV4MongoDbGenericRepo<T extends HasMongoKey> extends ODataV4GenericRepo<T> {
    constructor(public name:string, public connectionConfig?:ConnectionInfo) {
        super(name);
    }

    /**
     * Query a collection or table `GET /[?$filter=...]`
     * @param query an object with odata-v4 query properties like `$select`, `$filter`, etc.
     * @param context not required, see `OperationContext<T>`
     */
    async query (query?: ExpressLikeODataQuery, context?:OperationContext<T>) : Promise<Array<T>> {
        context = await this.pre(null, query, null, context, 'query');
        var mongoQuery = (context as any).mongodbQuery, queryFilter = mongoQuery.query as HasKey;
        (context as any).result = typeof (mongoQuery as any).limit == "number" && (mongoQuery as any).limit === 0 ? [] : await (context as any).db.collection(this.name)
                .find(mongoQuery.query)
                .project(mongoQuery.projection)
                .skip(mongoQuery.skip || 0)
                .limit(mongoQuery.limit || 0)
                .sort(mongoQuery.sort)
                .toArray();
        await this.post(context, 'query');
        return (context as any).result as any;
    }

    /**
     * Read a record or document from a collection or table by default key `GET /:key[?$filter=...]`
     * @param key a primary key or data-base level index
     * @param query an object with odata-v4 query properties like `$select`, `$filter`, etc.
     * @param context not required, see `OperationContext<T>`
     */
    async read(key:string,  query?:ExpressLikeODataQuery, context?:OperationContext<T>) : Promise<T> {
        context = await this.pre(key, query, null, context, 'read');
        (context as any).result = await (context as any).db.collection(this.name)
            .findOne({_id:(context as any).keyObject || key},{
                fields: (context as any).mongodbQuery.projection
            });
        await this.post(context, 'read');
        return (context as any).result;
    }

    /**
     * Create a new record `POST /`
     * @param data data to save
     * @param context not required, see `OperationContext<T>`
     */
    async create(data:T, context?:OperationContext<T>) : Promise<T> {
        context = await this.pre(null, null, data, context, 'create');
        var result = await (context as any).db
        .collection(this.name)
        .insertOne(data);
        data._id = result.insertedId;
        await this.post(context, 'create');
        return data;
    }

    /**
     * Insert or update a new record `PUT /:key`
     * @param key a primary key or data-base level index
     * @param data data to save
     * @param context not required, see `OperationContext<T>`
     */
    async upsert(key: string,data: any, context?:OperationContext<T>) : Promise<T> {
        context = await this.pre(key, null, data, context,'update');
        (context as any).result = await (context as any).db
        .collection(this.name)
        .updateOne(
            { _id: (context as any).keyObject || (context as any).key },
            { $set:data }, 
            {
                upsert: true
            }
        );
        if (!data._id)
            data._id = (context as any).result.upsertedId;
        await this.post(context, 'update')
        return (context as any).data;
    }
    
    /**
     * Bulk update records matching a query `PATCH /?$filter=...`
     * @param query an object with odata-v4 query properties like `$select`, `$filter`, etc.
     * @param delta data changes to save
     * @param context not required, see `OperationContext<T>`
     */
    async update(query: ExpressLikeODataQuery, delta: any, context?:OperationContext<T>) : Promise<number> {
        context = await this.pre(null, query, delta, context,'update');
        (context as any).result = await (context as any).db
            .collection(this.name)
            .update(
                (context as any).mongodbQuery.query,
                { $set: delta },
                {
                    multi:true
                }
            );
        await this.post(context, 'update');
        return (context as any).result.modifiedCount;
    }

    /**
     * Bulk delete records matching a query `DELETE /[?$filter=...]`
     * @param query an object with odata-v4 query properties like `$select`, `$filter`, etc.
     * @param context not required, see `OperationContext<T>`
     */
    async delete(query?: ExpressLikeODataQuery, context?:OperationContext<T>) : Promise<number> {
        context = await this.pre(null, query, null, null, 'delete');
        //console.log('deleteing')
        //console.log((context as any).mongodbQuery);
        (context as any).result = await (context as any).db
            .collection(this.name)
            .remove((context as any).mongodbQuery.query,{justOne:false});
        //console.log(context.result);
        //console.log(context.query)
        await this.post(context, 'delete');
        return (context as any).result.result.n;
    }

    /**
     * By default, any MongoDB query with fields ending in '_id' (case insensitive) are treated as `ObjectID`'s
     * when queried.  For cases where you have an externalId field; query as so {externalId:$fieldValue} to cancel
     * the `ObjectID` wrapping
     * @param qry a MongoDB query structure
     */
    private objectifyKeys(qry:any) {
        Object.keys(qry).forEach(k=>{
            if (typeof qry[k] === 'string' && k.toLowerCase().endsWith('_id') && !qry[k].startsWith('$')) {
                qry[k] = new ObjectID(qry[k]);
            }
            else if (typeof qry[k] === 'object') {
                if (qry[k] instanceof Array && (k==='$or'||k==='$and')) qry[k].forEach((subQuery:any)=>this.objectifyKeys(subQuery));
                else if (k.toLowerCase().endsWith('_id'))
                    Object.keys(qry[k]).forEach(
                        operation=> {
                            if (typeof qry[k][operation] === "string" && !qry[k][operation].startsWith('$'))
                                qry[k][operation] = new ObjectID(qry[k][operation]);
                            console.log(qry)
                        }
                    )
            }
        })
    }

    /**
     * De-serialize keys
     * @param context `OperationContext`
     */
    private convertKeys(context:any) {
        //console.error(context)
        let keyObject;
        try {
            if (context.key)
                keyObject = context.key.startsWith('$')?context.key:new ObjectID(context.key);
            context.keyObject = keyObject;
        } catch(ex) {
            console.error(ex);
            if (ex && ex.message && ex.message.indexOf('12 bytes or a string of 24 hex')!==-1)
                console.error(`... tried to convert "${context.key}" to ObjectID`);
        }
        var mongoQuery = (context as any).mongodbQuery, queryFilter = mongoQuery.query as HasKey;
        this.objectifyKeys(queryFilter);
    }
    /**
     * Prepare for an operation
     * @param key 
     * @param query 
     * @param data 
     * @param context 
     * @param before 
     */
    async pre(key:any, query:any, data:any, context:any, before:string) {
        //console.error(`⚠️`)
        if (!context) context = {};
        context.query = query;
        await (this as any).before.connect(context);
        const mongodbQuery = ODataV42MongoQuery(query as ExpressLikeODataQuery),
            client:MongoClient = ((this as any).connection || await ODataV4MongoDbGenericRepo.connect((this as any).connectionConfig||DEFAULT_DB_CONFIG)) as any,
            db:Db = client.db(((this as any).connectionConfig && (this as any).connectionConfig.schema)||DEFAULT_DB_CONFIG.schema);
        (this as any).connection = client;
        context.key = key;
        context.mongodbQuery = mongodbQuery;
        context.db = db;
        context.data = data;
        this.convertKeys(context);
        await (this as any).before.any(context);
        await ((this as any).before as any)[before](context);
        return context;
    }
    /**
     * Post operation
     * @param context 
     * @param after 
     */
    async post(context:any, after:string) { // Like "post"-operation (ALL HTTP verbs ought to map to CRUD names below)
        await (this as any).after.any(context);
        await ((this as any).after as any)[after](context);
        if((this as any).connection)
            ((this as any).connection as any).close();
        await (this as any).after.connect(context);
        (this as any).connection = null as any;
        return context;
    }
    /**
     * Return an instance of or connect to this repo's data center
     */
    static connect = async (connection?:ConnectionInfo)=>connect(connection)
}
/**
 * Return a `MongoClient` based on the configured `ConnectionInfo`
 * @param connection connection parameters
 */
export async function connect(connection?:ConnectionInfo): Promise<MongoClient> {
    if (!connection) connection = {};
    if (!connection.host) connection.host = 'localhost';
    var userAndPwdAt = `${connection.user?(connection.user+':'):''}${(connection as any)[connection.user as string]||(connection as any).pwd?(connection as any)[(connection as any).user as string]||connection.pwd:''}`,
        mongoConnectionString = `mongodb://`
            + `${userAndPwdAt}${connection.user?'@':''}`                                // 'user:pass@'
            + `${connection.host}${!isNaN(connection.port as any)?(':'+(connection.port as any)):''}`   // localhost
            + `${connection.schema?'/':''}${connection.schema}`;                        // /schema
    if(process.env.NODE_ENV==='local') console.info(`🔑  Connecting to mongodb 🌐 (${mongoConnectionString})`);
    return await MongoClient.connect(mongoConnectionString);
}

export enum MongoSort {
    Ascending = 1,
    Descending = -1
}
export enum MongoProject {
    Show = 1,
    Hide = 0
}
