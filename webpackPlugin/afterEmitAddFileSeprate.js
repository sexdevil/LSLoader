/*
 MIT License http://www.opensource.org/licenses/mit-license.php
 Author Tobias Koppers @sokra
 */
"use strict";

let addCombo = require('./addCombo.js');

//文件编译过程完成后 打上分割符/*combojs*/
class afterEmitAddFileSeprate {
    constructor(options) {
    }

    apply(compiler) {

        compiler.plugin("after-emit", (compilation, callback) => {
            callback();

            addCombo.run();
        });

    }
}

module.exports = afterEmitAddFileSeprate;
