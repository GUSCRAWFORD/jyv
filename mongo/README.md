![Jyv](http://jyv.s3-website-us-east-1.amazonaws.com/jyv-logo.png)

[![Build Status](https://travis-ci.com/GUSCRAWFORD/jyv.svg?branch=master)](https://travis-ci.com/GUSCRAWFORD/jyv)
[![Maintainability](https://api.codeclimate.com/v1/badges/4ed8f46f4aa08e1ee410/maintainability)](https://codeclimate.com/github/GUSCRAWFORD/jyv/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/4ed8f46f4aa08e1ee410/test_coverage)](https://codeclimate.com/github/GUSCRAWFORD/jyv/test_coverage)

# Out-of-the-box Generic Repo for MongoDB and NodeJS

## Common Usage

### Extend a Repository on a Data-set

#### MongoDB

```
import { ODataV4MongoDbGenericRepo } from '@jyv/mongo';
class Book {
    _id:string;
    title:string;
}
export class BooksService : extends ODataV4MongoDbGenericRepo<Book> {
    super ('books-collection');
    /* Inherited methods
    //GET /
    async query (query?: ExpressLikeODataQuery) : Promise<Array<Book>>
    //GET /:id
    async read(key:string,  query?:ExpressLikeODataQuery) : Promise<Book>
    // POST /
    async create(data:Book) : Promise<Book>
    // PUT /:id
    async upsert(key: string,data: any) : Promise<Book>
    // PATCH /
    async update(query: ExpressLikeODataQuery, delta: any) : Promise<number>
    // DELETE /
    async delete(query?: ExpressLikeODataQuery) : Promise<number> 
    */
}
const express = require(express), app = express();
app.use('/books', async (req, res , next)=>
    var list = await new BooksService().query(req.query);
    req.json(list);
    return list;
);
```

## Passing to Context

Throughout the managment of the operation lifespan; metadata is maintained on an optional `context` object

### Injecting Express Route Handling Intances
```
import { ODataV4MongoDbGenericRepo } from '@jyv/mongo';
class Book {
    _id:string;
    title:string;
}
export class BooksService : extends ODataV4MongoDbGenericRepo<Book> {
    constructor() {
        super ('books-collection');
    }
    static instance = new BooksService();
    /*
    //GET /
    async query (query?: ExpressLikeODataQuery, context?:OperationContext<Book>) : Promise<Array<Book>>
    //GET /:id
    async read(key:string,  query?:ExpressLikeODataQuery, context?:OperationContext<Book>) : Promise<Book>
    // POST /
    async create(data:Book, context?:OperationContext<Book>) : Promise<Book>
    // PUT /:id
    async upsert(key: string,data: any, context?:OperationContext<Book>) : Promise<Book>
    // PATCH /
    async update(query: ExpressLikeODataQuery, delta: any, context?:OperationContext<Book>) : Promise<number>

    // DELETE /
    async delete(query?: ExpressLikeODataQuery, context?:OperationContext<Book>) : Promise<number> 
    */
}

const express = require(express), app = express();
app.use('/books',(req, res,next)=>BooksService.indysnvr.query(req.query, {http:{req:req}));

/*

export class OperationContext<T extends HasKey>{
    instance?: ODataV4GenericRepo<T>;
    data?:T;
    result:any;
    http: any; // req, res, next, etc.
    key: any;
    query: any;
    db:any;
    client:any;
}
*/
```
# Developer Setup

## First Setup

1. `yarn install`
   1. Installs sub-project dependencies
   2. Builds sub-projects
2. If you wish to use integrated code-coverage reporting with [Mocha Sidebar](https://marketplace.visualstudio.com/items?itemName=maty.vscode-mocha-sidebar) on OSX:
   1. `cd test && yarn fix-mocha-sidebar-coverage` will add the [needed execute permissions](https://github.com/maty21/mocha-sidebar/issues/167)