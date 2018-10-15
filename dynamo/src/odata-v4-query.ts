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
import { ExpressLikeODataQuery } from '@guscrawford.com/jyve-core';

export class DynamoQueryMetadata {
    query: any = {};
    projection:object = null;
    sort:object = null;
    skip:number = null;
    limit:number = null;
};
