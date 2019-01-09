

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
    describe('ODataV4MongoDbGenericRepo', function() {
        var genRepo:ODataV4MongoDbGenericRepo<any> = null as any,
        mockContext:any, mockCollection:MockCollection,
        mockDb:{collection:(args:any)=>MockCollection},
        mockClient:{db:()=>MockCollection,close:()=>any};
        beforeEach(function(){
            genRepo = new ODataV4MongoDbGenericRepo<any>('test');
            genRepo.before.connect = spy();
            genRepo.after.connect = spy();
            mockContext = {};
            mockCollection = new MockCollection();
            mockDb = {
                collection: spy(
                    ()=>mockCollection
                )
            };
            mockClient = {
                db:spy(
                    ()=>mockDb
                ),
                close:spy()
            };
            ODataV4MongoDbGenericRepo.connect = spy(
                ()=>mockClient
            );
        })
        it(`instances`, function () {
            notEqual( genRepo , null );
        });
        describe('.pre(...)', function() {
            it(`calls before.connect `, async function () {
                await genRepo.pre(null, null, null, mockContext, 'query');
                equal(
                    (genRepo.before.connect as any).called,
                    true
                )
            });
            it(`calls connect `, async function () {
                await genRepo.pre(null, null, null, mockContext, 'query');
                equal(
                    (ODataV4MongoDbGenericRepo.connect as any).called,
                    true
                )
            });
        });
        describe('.post(...)', function() {
            it(`calls after.connect `, async function () {
                await genRepo.post(mockContext, 'query');
                equal(
                    (genRepo.after.connect as any).called,
                    true
                )
            });
            // it(`calls close `, async function () {
            //     await genRepo.post( mockContext, 'query');
            //     equal(
            //         (mockClient.close as any).called,
            //         true
            //     )
            // });
        });
    });

});