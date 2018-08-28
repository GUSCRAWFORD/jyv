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
export class MongoQueryMetadata {
    query: MongoFilter = {};
    projection:object = null;
    sort:object = null;
    skip:number = null;
    limit:number = null;
};
export class MongoFilter {$and?:any;$or?:any}
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
