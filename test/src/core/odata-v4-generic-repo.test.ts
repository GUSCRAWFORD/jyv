

import 'mocha';
import {spy} from 'sinon';
import { notEqual, equal } from 'assert';
import { ODataV4GenericRepo, OperationContext, OperationSet, HasKey } from '../../../core/src/odata-v4-generic-repo';
import { ExpressLikeODataQuery } from '../../../core/src/express-like-odata-query';
process.env.DEFAULT_SESSION_HEADER='x';
//const USERS_ROUTE = 'users';
class ConcreteRepo extends ODataV4GenericRepo<HasKey> {
    constructor () {
        super('test');
    }
    async query (query?: ExpressLikeODataQuery, context?:OperationContext<HasKey>)  {
        return [];
    }
    async read(key:string,query?:ExpressLikeODataQuery,context?:OperationContext<HasKey>) {
        return {
            _id:key
        }
    }
    async create(data:any, context?:OperationContext<HasKey>) {
        return { _id:'key'}
    }
    async upsert(key: string, data: HasKey, context?:OperationContext<HasKey>) {
        return { _id:key}
    }
    async update(query: ExpressLikeODataQuery, delta: any, context?:OperationContext<HasKey>) {
        return 1;
    }
    async delete(query: ExpressLikeODataQuery, context?:OperationContext<any>) {
        return 1;
    }
}
describe(`⚙️  Core Classes`, function (){
    //console.info(routes);
    var genRepo:ConcreteRepo, context:OperationContext<HasKey>;
    beforeEach(function(){
        genRepo = new ConcreteRepo();
        context = new OperationContext<HasKey>();
    });
    it(`ODataV4GenericRepo builds and instances`, function () {
        notEqual(
            genRepo
            , null
        );
    });
    describe('OperationSet', function () {
        var operation: OperationSet<ConcreteRepo>;
        beforeEach(function() {
            operation  = new OperationSet<ConcreteRepo>(genRepo);
        });
        ['create','read','update','delete','query','any','connect'].forEach((func:string)=>{
            it(`.${func} returns a Promise`, function() {
                var expectedPromise = (operation as any)[func](context);
                equal(expectedPromise instanceof Promise, true);
            });
        })
    });

});