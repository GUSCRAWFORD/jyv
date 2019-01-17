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
import {
    ExpressLikeODataQuery,
    JYV_CONFIG
} from '@jyv/core';
export class MongoQueryMetadata {
    query: MongoFilter = {};
    projection:any = null;
    sort:{[key:string]:number}|any = null;
    skip:number|any = null;
    limit:number|any = null;
};
export class MongoFilter {$and?:any;$or?:any;[key:string]:any}
/**
 * Create **MongoDB** query metadata from an `object` with **odata** *v4* query parameters
 * @param odataQuery An express-like `object`ified query-string with odata compliant parameters
 */
export function ODataV42MongoQuery(odataQuery:ExpressLikeODataQuery) {
    if (JYV_CONFIG.debugMode('query')) {
        console.info(`⚙️  Converting OData-V4 Query:`);
        console.info(odataQuery);
    }
    const mongoQuery = new MongoQueryMetadata();
    var queryLevel = mongoQuery.query;
    if (!odataQuery) return mongoQuery;
    try {
        Object.keys(odataQuery).forEach(key=>{
            switch (key) {
                case '$filter':
                    ODataV42MongoFilter(odataQuery.$filter || '', mongoQuery.query);
                    break;
                case '$skip':
                    mongoQuery.skip = parseInt(odataQuery.$skip || '');
                    break;
                case '$top':
                    mongoQuery.limit = parseInt(odataQuery.$top || '');
                    break;
                case '$select':
                    (odataQuery.$select as string).split(/\s*,\s*/g).forEach(key=>{
                        if (!mongoQuery.projection) mongoQuery.projection = {};
                        mongoQuery.projection[key]=1;
                    });
                    break;
                case '$orderby':
                    mongoQuery.sort = ODataV4OrderBy2MongoSort(odataQuery.$orderby || '')
                default:

            }
        });
    }
    catch (x) {
        console.error(x);
    }
    if (JYV_CONFIG.debugMode('query')) {
        console.info(`📦  ... to MongoDB Query:`)
        console.info(`${JSON.stringify(mongoQuery, null, ' ')}`);
    }
    return mongoQuery;
}
/**
 * Create a **MongoDB** query `object` from an **odata** `$filter` string
 * @param odataFilter the `$filter` sub-part of an **odata** query
 * @param query the **mongo** query `object`
 */
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
                toMongoOperation(filterOpr, filterExpr, word, i);
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
                    toMongoOperation(filterOpr, filterExpr, word, i);
                    query[word.replace(/\//g,'.')] = filterOpr;
                    ignoreWordsUntil = i + 3;

                }
            });
        })

    });
    return query;
}
/**
 * Create a **MongoDB** *sort structure* from an **odata** `$orderby` string
 * @param orderBy the **odata** `orderby` string
 */
function ODataV4OrderBy2MongoSort(orderBy:string) {
    var result:{[key:string]:number} = {};
    orderBy.split(',').forEach((ordering:string)=>{
        var parts = ordering.split(/\s+/),
        key = parts[0].replace(/\//,'.'), ascDesc = (parts[1]&&parts[1].toLowerCase()==='desc')?-1:1;
        result[key] = ascDesc
    });
    return result;
}

/**
 * Create a **MongoDB** operator from a sub-section of an **odata** `$filter` expression
 * @param filterOpr 
 * @param filterExpr 
 * @param word consider removing
 * @param i 
 */
function toMongoOperation(filterOpr:any, filterExpr:any, word:string, i:number) {
    if (filterExpr[i+1]==='in')
        filterOpr[`$${filterExpr[i+1]}`] = filterExpr[i+2].split(',').map((val:any)=>interpretJson(val));
    filterOpr[`$${filterExpr[i+1]}`] = interpretJson(filterExpr[i+2]);
}
/**
 * Trim whitespace and characters that would parse value as a string-literal
 * @param str string to operate on
 * @param char string literal character to treat for
 */
function trimStringLiterals(str:string, char:string) {
    var result  = str.trim();
    if (result.startsWith(char)&&result.endsWith(char))
        result = result.substr(1, result.length - 2);
    return result;
}
/**
 * Try to parse value as a number, fallback to a string-literal, return real `null` for a string value of `"null"`
 * @param val 
 */
function interpretJson(val:any) {
    if (val === 'null')
        return null;
    else if (isNaN(val)) {
        ['"',"'"].forEach(char=>val = trimStringLiterals(val, char));
        return val;
    }
    else return parseFloat(val);
}