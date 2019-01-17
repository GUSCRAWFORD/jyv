
import 'mocha';
import {spy} from 'sinon';
import { notEqual, equal, deepStrictEqual/* doesn't work?*/, deepEqual } from 'assert';

import { ODataV42MongoQuery } from '../../../mongo/src/odata-v4-2-mongo-query';
describe(`🔎 🍃  OData v4 to Mongo Query`, function () {
    beforeEach(function(){

    });
    describe('$filter:', function () {
        describe('eq', function () {
            it('$filter=_id eq "1" returns {query:{_id:"1"},...}',function(){
                var mongoQuery = ODataV42MongoQuery({
                    $filter:`_id eq "1"`
                });
                deepEqual(
                    mongoQuery,
                    {
                        query: { _id: { '$eq': '1' } },
                        projection: null,
                        sort: null,
                        skip: null,
                        limit: null
                    }
                )
            });
            it('$filter=_id eq 1 returns {query:{_id:"1"},...}',function(){
                var mongoQuery = ODataV42MongoQuery({
                    $filter:`_id eq 1`
                });
                deepEqual(
                    mongoQuery,
                    {
                        query: { _id: { '$eq': 1 } },
                        projection: null,
                        sort: null,
                        skip: null,
                        limit: null
                    }
                )
            });
        }); // eq
    }); // $filter
    describe('$select:', function () {
        it('$select=_id,name returns {projection:{_id:true,name:true},...}',function(){
            var mongoQuery = ODataV42MongoQuery({
                $select:`_id,name`
            });
            deepEqual(
                mongoQuery,
                {
                    query: {},
                    projection: {_id:true,name:true},
                    sort: null,
                    skip: null,
                    limit: null
                }
            )
        });
    }); // $select
    describe('$skip:', function () {
        it('$skip=1 returns {skip:1,...}',function(){
            var mongoQuery = ODataV42MongoQuery({
                $skip:`1`
            });
            deepEqual(
                mongoQuery,
                {
                    query: {},
                    projection: null,
                    sort: null,
                    skip: 1,
                    limit: null
                }
            )
        });
    }); // $limit
    describe('$top:', function () {
        it('$top=1 returns {limit:1,...}',function(){
            var mongoQuery = ODataV42MongoQuery({
                $top:`1`
            });
            deepEqual(
                mongoQuery,
                {
                    query: {},
                    projection: null,
                    sort: null,
                    skip: null,
                    limit: 1
                }
            )
        });
    }); // $limit
});