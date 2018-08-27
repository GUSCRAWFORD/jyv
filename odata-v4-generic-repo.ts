import { join } from 'path';
var APP_CONFIG:{
    local:{
        db:any&{
            default:string
        }
    }
};
try {
     APP_CONFIG = require(join(process.cwd(),'app/app.config.json'));
}
catch (e) {
    APP_CONFIG = {
        local:{
            db:{
                default:'defaultConnection',
                defaultConnection: {
                    schema:'default',
                    host:'localhost',
                    port:27017
                }
            }
        }
    };
}
export { APP_CONFIG };
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
/**
 * UPDATE: F@#!$ JayStack for this projo
 * NOTE: Design wise, I don't want to have to decorate all the model properties I want back if I use the derrivative repos
 * in this project in an odata context, so I'm not going to allow the odata requestHandler to preprocess and turn the query-string
 * into it's own query structure necessary to run through their own createMongoQuery function, so from the outside context, this is ours
 * since we don't have access to run their query parser without hacking their decorated data and causing more untraceable problems-
 * 
 * This does /not/ really implement odata at all beyond some fundamentals for:
 * - Querying / $filter'ing the data
 * - Projecting / $select'ing the data
 * - Skip, Limit / $top
 */
class MongoQueryMetadata {
    query: MongoFilter = {};
    projection:object = null;
    sort:object = null;
    skip:number = null;
    limit:number = null;
};
class MongoFilter {$and?:any;$or?:any}
export class ExpressLikeODataQuery {$filter:string;$select:string;$skip:string;$top:string;};
export function ODataV42MongoQuery(odataQuery:ExpressLikeODataQuery) {
    console.info(`⚙️  Converting OData-V4 Query:`);
    console.info(odataQuery);
    const mongoQuery = new MongoQueryMetadata();
    var queryLevel = mongoQuery.query;
    if (!odataQuery) return mongoQuery;
    try {
        Object.keys(odataQuery).forEach(key=>{
            switch (key) {
                case '$filter':
                    ODataV42MongoFilter(odataQuery.$filter, mongoQuery.query);
                    break;
                case '$skip':
                    mongoQuery.skip = parseInt(odataQuery.$skip);
                    break;
                case '$top':
                    mongoQuery.limit = parseInt(odataQuery.$top);
                    break;
                case '$select':
                    Object.keys(odataQuery.$select).forEach(key=>{
                        if (!mongoQuery.projection) mongoQuery.projection = {};
                        mongoQuery.projection[key]=1;
                    })
                    break;
                default:

            }
        });
    }
    catch (x) {
        console.error(x);
    }
    console.info(`📦  ... to MongoDB Query:`)
    console.info(`${JSON.stringify(mongoQuery, null, ' ')}`);
    return mongoQuery;
}
export function ODataV42MongoFilter(odataFilter:string, query:MongoFilter = new MongoFilter()) {
    if (odataFilter.startsWith("'")&&odataFilter.endsWith("'"))
        odataFilter = odataFilter.substring(1, odataFilter.length-1);
    var bracketedGroups = odataFilter.match(/\((.*?)\)/g);
    if (bracketedGroups && bracketedGroups.length)
        bracketedGroups.forEach(group => odataFilter.replace(group,'') && ODataV42MongoFilter(group, query));
    var overlaps = odataFilter.split(/\s+or\s+/g);
    overlaps.forEach(orExpr=>{
        if (!query.$or && overlaps.length > 1) query.$or = [];
        var filter, intersections = orExpr.split(/\s+and\s+/g).slice(1);
        var filterExpr = orExpr.split(/\s+/g), ignoreWordsUntil = 0, filterOpr;
        //console.log(orExpr)
        filterExpr.forEach((word, i)=>{
            if (word==='and') ignoreWordsUntil ++;
            if (ignoreWordsUntil === i) {
                filter = {};
                filterOpr = {};
                filterOpr[`$${filterExpr[i+1]}`] = filterExpr[i+2]==='null'?null:(filterExpr[i+1]==='in'?filterExpr[i+2].split(','):filterExpr[i+2]);
                filter[word.replace(/\//g,'.')] = filterOpr;
                if (query.$or)query.$or.push(filter);
                else query[word.replace(/\//g,'.')] = filterOpr;
                ignoreWordsUntil = i + 3;

            }
        });
        intersections.forEach(intersection=>{
            var filterExpr = intersection.split(/\s+/g), ignoreWordsUntil = 0, filterOpr;
            filterExpr.forEach((word, i)=>{

                if (ignoreWordsUntil === i) {
                    filter = {};
                    filterOpr = {};
                    filterOpr[`$${filterExpr[i+1]}`] = filterExpr[i+2]==='null'?null:filterExpr[i+2];
                    query[word.replace(/\//g,'.')] = filterOpr;
                    ignoreWordsUntil = i + 3;

                }
            });
        })

    });
    return query;
}
