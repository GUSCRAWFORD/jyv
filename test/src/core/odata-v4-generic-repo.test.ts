

import 'mocha';
import { notEqual } from 'assert';
import { ODataV4GenericRepo, OperationContext } from '../../../core/src/odata-v4-generic-repo';
import { ExpressLikeODataQuery } from '../../../core/src/express-like-odata-query';
process.env.DEFAULT_SESSION_HEADER='x';
//const USERS_ROUTE = 'users';
class ConcreteRepo extends ODataV4GenericRepo<any> {
    constructor () {
        super('test');
    }
    async query (query?: ExpressLikeODataQuery, context?:OperationContext<any>)  {
        return [];
    }
    async read(key:string,query?:ExpressLikeODataQuery,context?:OperationContext<any>) {

    }
    async create(data:any, context?:OperationContext<any>) {
        
    }
    async upsert(key: string, data: any, context?:OperationContext<any>) {
        
    }
    async update(query: ExpressLikeODataQuery, delta: any, context?:OperationContext<any>) {
        return 1;
    }
    async delete(query: ExpressLikeODataQuery, context?:OperationContext<any>) {
        return 1;
    }
}
describe(`⚙️  Core Classes`, function (){
    //console.info(routes);
    it(`ODataV4GenericRepo builds and instances`, function () {
        var genRepo = null;
        genRepo = new ConcreteRepo();
        notEqual(
            genRepo
            , null
        );
    })

});