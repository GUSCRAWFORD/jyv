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
const DB_CONFIG = APP_CONFIG[process.env.NODE_ENV||'local'].db, DEFAULT_DB_CONFIG = DB_CONFIG[DB_CONFIG.default];
import { ObjectID, MongoClient, Db } from "mongodb";
export { ObjectID, MongoClient, Db };
export interface HasMongoKey extends HasKey {
    _id?:string | object | any;
}
export class ODataV4MongoDbGenericRepo<T extends HasMongoKey> extends ODataV4GenericRepo<T> {
    constructor(public name:string, public connectionConfig?:ConnectionInfo) {
        super(name);
    }
    //GET /
    async query (query?: ExpressLikeODataQuery, context?:OperationContext<T>) : Promise<Array<T>> {
        context = await this.pre(null, query, null, context, 'query');
        var mongoQuery = (context as any).mongodbQuery, queryFilter = mongoQuery.query as HasKey;
        context.result = typeof mongoQuery.limit == "number" && mongoQuery.limit === 0 ? [] : await context.db.collection(this.name)
                .find(mongoQuery.query)
                .project(mongoQuery.projection)
                .skip(mongoQuery.skip || 0)
                .limit(mongoQuery.limit || 0)
                .sort(mongoQuery.sort)
                .toArray();
        await this.post(context, 'query');
        return context.result;
    }
    //GET /:id
    async read(key:string,  query?:ExpressLikeODataQuery, context?:OperationContext<T>) : Promise<T> {
        context = await this.pre(key, query, null, context, 'read');
        context.result = await context.db.collection(this.name)
            .findOne({_id:(context as any).keyObject || key},{
                fields: (context as any).mongodbQuery.projection
            });
        await this.post(context, 'read');
        return context.result;
    }
    // POST /
    async create(data:T, context?:OperationContext<T>) : Promise<T> {
        context = await this.pre(null, null, data, context, 'create');
        var result = await context.db
        .collection(this.name)
        .insertOne(data);
        data._id = result.insertedId;
        await this.post(context, 'create');
        return data;
    }
    // PUT /:id
    async upsert(key: string,data: any, context?:OperationContext<T>) : Promise<T> {
        context = await this.pre(key, null, data, context,'update');
        context.result = await context.db
        .collection(this.name)
        .updateOne(
            { _id: (context as any).keyObject || context.key },
            { $set:data }, 
            {
                upsert: true
            }
        );
        if (!data._id)
            data._id = context.result.upsertedId;
        await this.post(context, 'update')
        return context.data;
    }
    // PATCH /
    async update(query: ExpressLikeODataQuery, delta: any, context?:OperationContext<T>) : Promise<number> {
        context = await this.pre(null, query, delta, context,'update');
        context.result = await context.db
            .collection(this.name)
            .update(
                (context as any).mongodbQuery.query,
                { $set: delta },
                {
                    multi:true
                }
            );
        await this.post(context, 'update');
        return context.result.modifiedCount;
    }

    // DELETE /
    async delete(query?: ExpressLikeODataQuery, context?:OperationContext<T>) : Promise<number> {
        context = await this.pre(null, query, null, null, 'delete');
        //console.log('deleteing')
        //console.log((context as any).mongodbQuery);
        context.result = await context.db
            .collection(this.name)
            .remove((context as any).mongodbQuery.query,{justOne:false});
        //console.log(context.result);
        //console.log(context.query)
        await this.post(context, 'delete');
        return context.result.result.n;
    }
    /**
     * By default, any MongoDB query with fields ending in '_id' (case insensitive) are treated as `ObjectID`'s
     * when queried.  For cases where you have an externalId field; query as so {externalId:$fieldValue} to cancel
     * the `ObjectID` wrapping
     * @param qry a MongoDB query structure
     */
    private objectifyKeys(qry) {
        Object.keys(qry).forEach(k=>{
            if (typeof qry[k] === 'string' && k.toLowerCase().endsWith('_id') && !qry[k].startsWith('$')) {
                qry[k] = ObjectID(qry[k]);
            }
            else if (typeof qry[k] === 'object') {
                if (qry[k] instanceof Array && (k==='$or'||k==='$and')) qry[k].forEach(subQuery=>this.objectifyKeys(subQuery));
                else if (k.toLowerCase().endsWith('_id'))
                    Object.keys(qry[k]).forEach(
                        operation=> {
                            if (typeof qry[k][operation] === "string" && !qry[k][operation].startsWith('$'))
                                qry[k][operation] = ObjectID(qry[k][operation]);
                            console.log(qry)
                        }
                    )
            }
        })
    }
    private convertKeys(context) {
        let keyObject;
        try {
            keyObject = context.key.startsWith('$')?context.key:new ObjectID(context.key);
            context.keyObject = keyObject;
        } catch(ex){ }
        var mongoQuery = (context as any).mongodbQuery, queryFilter = mongoQuery.query as HasKey;
        this.objectifyKeys(queryFilter);
    }
    async pre(key, query, data, context, before:string) {
        if (!context) context = {};
        context.query = query;
        await this.before.connect(context);
        const mongodbQuery = ODataV42MongoQuery(query as ExpressLikeODataQuery),
            client:MongoClient = this.connection || await connect(this.connectionConfig||DEFAULT_DB_CONFIG),
            db:Db = client.db((this.connectionConfig && this.connectionConfig.schema)||DEFAULT_DB_CONFIG.schema);
        this.connection = client;
        context.key = key;
        context.mongodbQuery = mongodbQuery;
        context.db = db;
        context.data = data;
        this.convertKeys(context);
        await this.before.any(context);
        await this.before[before](context);
        return context;
    }
    async post(context, after:string) { // Like "post"-operation (ALL HTTP verbs ought to map to CRUD names below)
        await this.after.any(context);
        await this.after[after](context);
        if(this.connection)
            (this.connection as any).close();
        await this.after.connect(context);
        this.connection = null;
        return context;
    }
}
export async function connect(connection?:ConnectionInfo): Promise<MongoClient> {
    if (!connection) connection = {};
    if (!connection.host) connection.host = 'localhost';
    var userAndPwdAt = `${connection.user?(connection.user+':'):''}${connection[connection.user]||connection.pwd?connection[connection.user]||connection.pwd:''}`,
        mongoConnectionString = `mongodb://`
            + `${userAndPwdAt}${connection.user?'@':''}`                                // 'user:pass@'
            + `${connection.host}${!isNaN(connection.port)?(':'+connection.port):''}`   // localhost
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
