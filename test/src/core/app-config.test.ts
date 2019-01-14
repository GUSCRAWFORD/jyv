

import 'mocha';
import { equal, notEqual } from 'assert';
import { JYV_CONFIG } from '../../../core/src/app-config';
//const USERS_ROUTE = 'users';
describe(`⚙️  Core Configs`, function (){
    //console.info(routes);
    it(`🐞 when JYV_CONFIG.debug==='*', JYVE_CONFIG.debugMode('anything') returns true`, function () {
        JYV_CONFIG.debug="*";
        equal(
            JYV_CONFIG.debugMode('anything')
            , true
        );
    });
    it(`🐞 when JYV_CONFIG.debug==='test-debug-topic', JYVE_CONFIG.debugMode('anything') does not return true`, function () {
        JYV_CONFIG.debug="test-debug-topic";
        notEqual(
            JYV_CONFIG.debugMode('anything')
            , true
        );
    });
    it(`🐞 when JYV_CONFIG.debug==='test-debug-topic', JYVE_CONFIG.debugMode('test-debug-topic') returns true`, function () {
        JYV_CONFIG.debug="test-debug-topic";
        equal(
            JYV_CONFIG.debugMode('test-debug-topic')
            , true
        );
    });
});
//process.exit(0);