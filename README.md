# LSLoader
###localStorage loader to increase mobile webapp speed

##最新配合webpack2实现的离线化demo示例

 Lsloader 配合webpack2 使用
     结合webpack2的打包hash打包能力,Lsloader能够对webpack2的模块进行拆分打包操作.
     具体原理是利用HashedModuleIdsPlugin让模块序号稳定,再自动分析
     js源代码的es6引用路径,通过commonChunksPlugin插件,让入口引用的模块都独立打包
     并且调用Lsloader.loadCombo统一读取/存储
     具体演示:

     项目根目录下npm install

     运行 webpack  打包 (lsloader处理过程已经加入到webpack.config.js中)

     运行node app.js 启动express

     访问http://localhost:3000/webpack/index 即可看见打包后的webpack2代码


具体实现原理 选型背景见知乎blog
配合requireJS
https://zhuanlan.zhihu.com/p/21357211
配合webpack2
https://zhuanlan.zhihu.com/p/25012345



















