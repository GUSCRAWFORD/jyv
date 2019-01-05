

import 'mocha';
import { equal } from 'assert';
import { JYV_CONFIG } from '../../../core/src/app-config';
process.env.DEFAULT_SESSION_HEADER='x';
//const USERS_ROUTE = 'users';
describe(`⚙️  Core Configs`, function (){
    //console.info(routes);
    it(`🐞 when JYV_CONFIG.debug==='*', JYVE_CONFIG.debugMode('anything') returns true`, function () {
        JYV_CONFIG.debug="*";
        equal(
            JYV_CONFIG.debugMode('anything')
            , true
        );
    })
    // it(`http://localhost:${process.env.PORT}/users returns "unauthorized" (${UNAUTHORIZED})`, async function() {

    //     var result;
    //     try {
    //         result = await Request.get(`http://localhost:${process.env.PORT}/users`);
    //     }
    //     catch(e) {
    //         equal(e.statusCode, UNAUTHORIZED)
    //     }
    //     return result;
    // });
    // it(`http://localhost:${process.env.PORT}/users/x returns "unauthorized" (${UNAUTHORIZED})`, async function () {
    //     var result;
    //     try {
    //         result = await Request.get(`http://localhost:${process.env.PORT}/users/x`);
    //     }
    //     catch(e) {
    //         equal(e.statusCode, UNAUTHORIZED)
    //     }
    //     return result;
    // });
});
//process.exit(0);