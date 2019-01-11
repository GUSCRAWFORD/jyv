

import 'mocha';
import {spy} from 'sinon';
import { notEqual, equal } from 'assert';
//import { ODataV4GenericRepo, OperationContext } from '../../../core/src/odata-v4-generic-repo';

import { ODataV4MongoDbGenericRepo } from '../../../mongo/src/odata-v4-mongodb-generic-repo';
//import { ODataV4MongoGenericRepo } from '@jyv/mongo';
//import { ExpressLikeODataQuery } from '../../../core/src/express-like-odata-query';
process.env.DEFAULT_SESSION_HEADER='x';
//const USERS_ROUTE = 'users';
class MockCursor {
    skip = ()=>this;
    limit = ()=>this;
    sort = ()=>this;
    toArray=()=>[];
    project=()=>this;
}
class MockCollection {
    find = spy(
        ()=>new MockCursor()
    );
    insertOne = spy(()=>Object.assign({},{insertedId:'key'}));
    findOne = spy();
    update = spy(()=>Object.assign({},{modifiedCount:0}));
    updateOne = spy(()=>Object.assign({},{upsertedId:'key'}));
    remove = spy(()=>Object.assign({},{n:0}));
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
        });
        it(`instances`, function () {
            notEqual( genRepo , null );
        });
        describe('.pre(...)', function() {
            beforeEach(async function(){
                await genRepo.pre(null, null, null, mockContext, 'query');
            });
            it(`calls before.connect `, function () {
                equal(
                    (genRepo.before.connect as any).called,
                    true
                )
            });
            it(`calls connect `, function () {
                equal(
                    (ODataV4MongoDbGenericRepo.connect as any).called,
                    true
                )
            });
            it(`calls db `, function () {
                equal(
                    (mockClient.db as any).called,
                    true
                )
            });
            it(`sets .connection to MongoClient`, function () {
                equal(
                    genRepo.connection,
                    mockClient
                )
            });
        });
        ['create','read','update',/*'delete',*/'query','upsert'].forEach(operationName=>{
            describe(`.${operationName}`,function() {
                var result, args:any[];
                beforeEach(async function(){
                    //console.info(genRepo)
                    spy(genRepo, 'pre');
                    args = [];
                    switch (operationName) {
                        case 'read': case 'upsert':
                            args.push('key');
                        default:
                    }
                    switch (operationName) {
                        case 'update': case 'upsert': case 'create':
                            args.push({property:'value'})
                        default:
                    }
                    result = await (genRepo as any)[operationName].apply(genRepo, args);
                });
                it('calls pre', function() {
                    equal( (genRepo.pre as any).called, true);
                })
            })
        })
        describe('.post(...)', function() {
            beforeEach(async function() {
                await genRepo.pre(null, null, null, mockContext, 'query');
                await genRepo.post(mockContext, 'query');
            });
            it(`calls after.connect `, async function () {
                equal(
                    (genRepo.after.connect as any).called,
                    true
                )
            });
            it(`calls close `, async function () {
                equal(
                    (mockClient.close as any).called,
                    true
                )
            });
        });
    });

});