/*
 MIT License http://www.opensource.org/licenses/mit-license.php
 Author Tobias Koppers @sokra
 */
"use strict";

//文件路径做为moduleID
class moduleIDbyFilePath {
    constructor(options) {
    }

    apply(compiler) {

        compiler.plugin("compilation", (compilation) => {

            compilation.plugin("module-ids", (modules) => {
                modules.forEach((module) => {
                    if(module.id === null) {
                        module.id = module.dependencies[0].module.rawRequest
                    }
                });
            });
        });
    }
}

module.exports = moduleIDbyFilePath;
