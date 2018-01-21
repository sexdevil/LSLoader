/*
 MIT License http://www.opensource.org/licenses/mit-license.php
 Author Tobias Koppers @sokra
 */
"use strict";

//文件路径做为chunkid

class chunkIDsByFilePath {
    constructor(options) {
    }

    apply(compiler) {

        compiler.plugin("compilation", (compilation) => {

            compilation.plugin("before-chunk-ids", (chunks) => {
                chunks.forEach((chunk) => {
                    chunk.id = chunk.name
                });
            });

        });



    }
}

module.exports = chunkIDsByFilePath;
