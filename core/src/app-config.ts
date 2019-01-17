import { join } from 'path';

/**
 * A map generic
 */
export interface JyMap<T> { [key:string]:T };
/**
 * Fundamental details about a data-center connection
 */
export class ConnectionConfig {
    schema?:string;
    host?:string;
    port?:number;
    user?:string;
}

/**
 * Root or default database connection
 */
export class RootDbConfig {
    default?:string;
}

export type DbConfig = RootDbConfig&JyMap<ConnectionConfig>;

export class EnvironmentConfig {
    host?:string;
    port?:number;
    db?:DbConfig;
}
export class RootAppConfig {

}
export type AppConfig = RootAppConfig&JyMap<EnvironmentConfig>;
export var APP_CONFIG:AppConfig;
try {
     APP_CONFIG = require(join(process.cwd(),'app/app.config.json'));
}
catch (e) {
    APP_CONFIG = {
        local:{
            db:{
                default:'defaultConnection',
                defaultConnection: {
                    schema:'default',
                    host:'localhost',
                    port:27017
                }
            } as any
        }
    };
}
/**
 * JYV_CONFIG options
 * JYV_CONFIG_DEBUG=*|<topic>[,<other-topic>,...]
 */
export const JYV_CONFIG = {
    debug:process.env.JYV_CONFIG_DEBUG||'',
    debugMode:debugMode
}
/**
 * True or false?  Jyv components are set to debug on the given "mode" or topic
 * @param mode Topic that must be set
 */
function debugMode(mode:any) {
    if (JYV_CONFIG.debug==='*') return true;
    else if (JYV_CONFIG.debug.split(',').find(m=>m===mode)) return true;
}