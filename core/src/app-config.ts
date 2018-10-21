import { join } from 'path';
export interface JyMap<T> { [key:string]:T };
export class ConnectionConfig {
    schema?:string;
    host?:string;
    port?:number;
    user?:string;
}

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
export const JYV_CONFIG = process.env.JYV_CONFIG?JSON.parse(process.env.JYV_CONFIG):{
    debug:'',
    debugMode:debugMode
}
function debugMode(mode) {
    if (JYV_CONFIG.debug==='*') return true;
    else if (JYV_CONFIG.debug.split(',').find(m=>m===mode)) return true;
}