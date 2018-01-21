"use strict";
var webpack = require('webpack');
var fs = require('fs');

var entryPath =  './webpack_lsloader_entry.json';
var entryString = fs.readFileSync(entryPath, 'utf8');
var entry = JSON.parse(entryString);

var ManifestPlugin = require('webpack-manifest-plugin');
var manifestPlugin = new ManifestPlugin({
    publicPath: '/webpack2/',
    // publicPath: 'http://s0.meituan.net/bs/js?f=wm/inode_lfs:/build/'
});

var ChunkIDsByFilePath = require('./webpackPlugin/chunkIDsByFilePath');
var chunkIDsByFilePath = new ChunkIDsByFilePath();

var ModuleIDbyFilePath = require('./webpackPlugin/moduleIDbyFilePath');
var moduleIDbyFilePath = new ModuleIDbyFilePath();

var afterEmitAddFileSeprate = require('./webpackPlugin/afterEmitAddFileSeprate');
var afteremitaddfileSeprate = new afterEmitAddFileSeprate();

//自定义拆分列表数组
let commonChunksListString = fs.readFileSync('./gulptask/webpack2/build/commonChunksConfig.json', 'utf8');
commonChunksListString = JSON.parse(commonChunksListString);
let commonChunksList = [];
for(var i in commonChunksListString){
    commonChunksList.push(new webpack.optimize.CommonsChunkPlugin(commonChunksListString[i]))
}

module.exports = {
    //插件项
    plugins: [
        new webpack.optimize.CommonsChunkPlugin({
            name:'common',
            filename : 'common_[chunkhash].js'
        }),
        manifestPlugin,
        chunkIDsByFilePath,
        moduleIDbyFilePath,
        new webpack.HashedModuleIdsPlugin(),
        afteremitaddfileSeprate
    ].concat(commonChunksList),
        //页面入口文件配置
        entry: entry,
        //入口文件输出配置
        output: {
        path: __dirname+'/build/webpack2',
            filename: 'page_[name]_[chunkhash].js'
    },
    module: {
        //加载器配置
        loaders: [
            { test: /\.css$/, loader: 'style-loader!css-loader' },
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: function(path) {
                    // 路径中含有 node_modules 的就不去解析。
                    var isNpmModule = !!path.match(/node_modules/);
                    return isNpmModule;
                }
            },
            { test: /\.scss$/, loader: 'style!css!sass?sourceMap'},
            { test: /\.(png|jpg)$/, loader: 'url-loader?limit=8192'},
            { test: /\.vue$/, loader: 'vue-loader'}
        ]
    },
    watch: false
}