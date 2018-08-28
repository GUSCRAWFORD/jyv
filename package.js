#!/usr/bin/env node
const prog = require('caporal'), path = require('path'), fs = require('fs');
prog
  .version(require('./package.json').version)
  .command('dist', 'Copy package.json and transform')
    .argument('<directory>', 'path to app that will be packaged')
    .argument('[directories...]', 'additional paths to package')
    .option('--distFolder','the path to the output directory of your published package, \'dist\' by default')
    .option('--dry','don\'t do anything, print the effect of the operation')
  .action(function(args, options, logger) {

    if (!args.directories) args.directories = [];
    if (args.directory) args.directories.push(args.directory);
    logger.info(options);
    args.directories.forEach(createPackageJsonFor);
    function createPackageJsonFor (projectPath) {
        var absPath = path.resolve(projectPath);
        logger.info(`ℹ️ Creating package.json for project in: ${absPath}`);
        fs.lstat(absPath,function lstat_cb (error, info) {
            //logger.info(info);
            fs.readFile(`${path.join(absPath,'package.json')}`, {encoding:'utf8'}, transformPackage);
        });
        function transformPackage (error, packageJson) {
            if (error) {
                logger.error(error);
                return error;
            }
            var package = JSON.parse(packageJson);
            logger.info(`♻️  Transforming: ${path.join(absPath,'package.json')} to ${path.join(absPath,options.distFolder||'dist','package.json')}`)
            if (options.dry) logger.info(package);
            if (package["@package:transform"]) {
                Object.keys(package["@package:transform"]).forEach(keyToTransform=>{
                    switch(package["@package:transform"][keyToTransform]) {
                        case '@package:remove':
                            delete package[keyToTransform];
                        break;
                        default:
                    }
                    delete package["@package:transform"];
                });
                
            }
            if (options.dry) logger.info(`✅  Into:`);
            if (options.dry) logger.info(package);
            savePackage(JSON.stringify(package, null, '\t'), `${path.join(absPath, options.distFolder||'dist','package.json')}`);
        }
    }

    function savePackage(packageData, packagePath) {
        if (options.dry) logger.info(`ℹ️  writes to: ${packagePath}`);
        else fs.writeFile(packagePath, packageData, 'utf8', (err,done)=>
            err?logger.error(`❌  ${err}`):
                logger.info(`📝  ${packagePath}`))
    }
  });
prog.parse(process.argv);