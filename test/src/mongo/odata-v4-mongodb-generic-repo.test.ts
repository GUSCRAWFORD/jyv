

import 'mocha';
import {spy} from 'sinon';
import { notEqual, equal } from 'assert';
//import { ODataV4GenericRepo, OperationContext } from '../../../core/src/odata-v4-generic-repo';

import { ODataV4MongoDbGenericRepo } from '../../../mongo/src/odata-v4-mongodb-generic-repo';
//import { ODataV4MongoGenericRepo } from '@jyv/mongo';
//import { ExpressLikeODataQuery } from '../../../core/src/express-like-odata-query';
process.env.DEFAULT_SESSION_HEADER='x';
//const USERS_ROUTE = 'users';
class MockCollection {
    find = spy(
        ()=>[]
    )
}
describe(`🍃  Mongo Classes`, function (){
    //console.info(routes);
    it(`ODataV4MongoDbGenericRepo builds and instances`, function () {
        var genRepo = null;
        genRepo = new  ODataV4MongoDbGenericRepo<any>('test');
        notEqual(
            genRepo
            , null
        );
    });
    it(`query calls connect `, async function () {
        var genRepo = null,
        mockContext = {},
        mockCollection = new MockCollection(),
        mockDb = {
            collection: spy(
                ()=>mockCollection
            )
        },
        mockClient = {
            db:spy(
                ()=>mockDb
            )
        };
        ODataV4MongoDbGenericRepo.connect = spy(
            ()=>mockClient
        );
        genRepo = new  ODataV4MongoDbGenericRepo<any>('test');
        await genRepo.pre(null, null, null, mockContext, 'query');
        equal(
            (ODataV4MongoDbGenericRepo.connect as any).called,
            true
        )
    });

});