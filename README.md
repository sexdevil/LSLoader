# LSLoader
### localStorage loader to increase mobile webapp speed

## 一 项目背景
外卖I版页面,红包页面每天访问量很大,其中红包页在微信Webview中访问为主,<br/>
但是微信webview的缓存有已知如下问题:<br/>
1 微信webview退出10分钟后,js css 缓存失效,触发304;<br/>
2 微信webview进程退出,重新进入后,缓存作废,触发200;<br/>
在日常场景中,用户访问一次红包页后再次访问期间会间隔很长时间,
单纯的浏览器缓存微信客户端内命中率较低,同时移动网络延时较高,<br/>
304,200情况下用户开始加载红包到可以领取需要3-4s时间其中2.5s时间用于css js下载.<br/>
为了解决这个问题,外卖I版决定引入LocalStorage当作缓存来让前端工程化控制文件缓存.<br/>
LsLoader相对于其他接近方案,有兼容性好,时效性长,以及便于js工程化的特点.业内有美团<br/>
主站,百度移动版,滴滴移动端使用了这种方案,效果明显.<br/>

## 二 技术选型
### 主站目前已有truckJS解决方案<br/>
技术基本原理是前端重新定义了require,define函数,重写AMD加载器,<br/>
结合上线时打包进行AST语法分析进行依赖分析,浏览器端按照AMD模块粒度进行缓存<br/>
如果模块有变化,combo服务把所有变化文件进行更新,省流量省加载时间.<br/>

truckJS功能强大,但是使用时候依赖AMD结构,不支持非AMD模块,不支持行内脚本顺序执行,<br/>
不支持顶部css 缓存,同时AMD加载为了达到效果必须要有线上combo才可以发挥出极致.<br/>

对应我们的红包页面,里面混杂了外站js,非AMD js接口,页面行内脚本依赖外引非AMD js.<br/>
红包页面css样式有两个请求,需要缓存优化.<br/>

## 三 Why LsLoader--一个并行加载顺序执行,最贴近原生js模式的本地缓存库
不同于truckJS架构对AMD加载器的依赖,LsLoader运行方式模仿原生js css的加载方式,<br/>
css异步加载,样式在页面顺序按照编码是顺序保证正确;<br/>
js 异步加载,顺序执行,有序性保证xhr加载的js 本地缓存的js 标签加载的js 以及行内
js按照出现顺序执行.<br/>
由于不重写define/require,LsLoader在js缓存时可以选用线下打包,不依赖后端线上<br/>
combo服务.如果想用combo达到AMD文件粒度的缓存,LsLoader也有runCombo和loadCombo方法(
目前线上服务Demo未提供,只有Mock模拟)<br/>
由于使用顺序运行逻辑,所有行内脚本亦可编译成迟缓运行的代码,css样式也可以开启异步加载.<br/>
开发时,你可以选择任何你想要的组织方式--全局变量,AMD,webPack...  LsLoader不干涉模块处理;<br/>
模块的交给模块库,LsLoader只负责把代码存储到LocalStroage,并且按顺序运行<br/>
对于加载执行,我们只暴露两个接口<br/>

1. LsLoader.load()    读取运行一个js,异步加载,按照load出现位置执行css js

2. LsLoader.loadCombo() 读取运行一组js数组,其中数组内的js会被合并为一个请求,防止过多http影响性能.异步加载,按照数组内js出现顺序执行


build时,你只要模版中加入各种标记注释,标识下你要开启缓存的css/js,一切编译工作都在templateBuild.js<br/>
和ASTbuild.js.编译过程基于gulp插件.如果你有其他没有覆盖到的问题,可以修改templateBuild.js,让缓存代码支持更多的组织形式<br/>



## 四 代码原理
LsLoader线上代码会将每个css js文件利用异步的方式进行加载处理,代码本地缓存.<br/>
所有可以缓存的文件都以key:'相对路径,value : 线上路径/*codestart*/代码' 的方式存储到LocalStorage中来.<br/>
相对路径做key可以防止项目同名文件互相覆盖,线上路径带有md5戳可以作版本标示.<br/>
<img src='http://wiki.sankuai.com/download/attachments/450467260/lsLoader.001.jpeg?version=1&modificationDate=1462280066879&api=v2'/>

css使用xhr异步加载,加载成功后直接放入对应位置的内联style标签,由于内联标签顺序和css顺序一致,渲染结果可以达到和原生link加载一致效果.<br/>

js加载使用xhr异步加载,成功后代码放入待执行队列<br/>
其中,不支持跨域XHR的js使用script tag加载,但是异步js会立即执行,为了保证执行顺序,script加载的js统一为到需要执行时在加载,成功后回调继续.<br/>
行内脚本使用textarea包裹,到执行时机时取出内部text,append到新建script标签中即可达到执行效果<br/>



## 五 使用方式
LsLoader分两部分,一个是运行再客户端,压缩后2k大小的LsLoader.js,一个是运行在gulp环境里的打包程序templateBuild.js<br/>
任务配置:gulp调用templateBuild程序,传入唯一参数path,标示需要编译处理的模版文件<br/>
templateBuild文件头部jsonPath 配置上工程打包生成版本号生成的json文件,key-value对应写好本地相对路径和
线上带md5的路径.<br/>


开发时如同往常一样写自己的业务逻辑,css ,js, 对于需要加缓存的页面,顶部加入\<!--lsloder build--\>\<!--lsloder endbuild--\>注释
编译时压缩后的Lsloader.js代码会被引入页面<br/>
之后,页面内需要缓存的js css加入对应的注释代码,为编译工具标定需要处理的部分.<br/>

开发调试过后,运行上线脚本gulp,之前先进行md5打包,css js合并,最后一步templateBuild.js会把标示的js css加载标签替换为
lsloader加载方式,开启本地强缓存<br/>


### 格式 \<!--任务名 build--\>\<!--任务名 endbuild--\><br/>

### 添加库文件
\<!--lsloder build--\>\<!--lsloder endbuild--\><br/>

编译结果: 用内联js 写入压缩后的lsLoader,一定要在所有编译标签之前加入,例如head中使用

### css引入 缓存 onload一定要加双引号
\<!--css ls build--\><br/>
\<link rel="stylesheet" type="text/css" href='../css/page3.css' onload="document.documentElement.style.display='';"\><br/>
\<!--css ls endbuild--\><br/>

编译结果:\<style id="../css/page3.css"\>\</style\>\<script\>lsloader.load("../css/page3.css","../css/page3-fdc56dff1b.css",function(){document.documentElement.style.display='';} )\</script\>

原来\<link\>的位置替换为\<style\>,lsloader把正确的css读取后插入对应的\<style\>,由于样式覆盖按照style顺序,所有无所谓插入的先后

每个link带的onload中的代码,都会被插入到lsloader的callback中,当前css加载完即执行,利用callback可以控制页面的显示隐藏,防止异步css造成的乱序


### js xhr引入 缓存
\<!--js ls build--\><br/>
\<script src='../js/jquery.js'\><br/>
\<!--js ls endbuild--\><br/>

编译结果:\<script\>lsloader.load("../js/jquery.js","../js/jquery-aca795763d.js" )\</script\>

利用ajax加载缓存js 成功后加入jsRunsequence队列 顺序执行


### 外站js script tag 引入
 \<!--js tagload build--\><br/>
\<script src='http://res.wx.qq.com/open/js/jweixin-1.0.0.js'\><br/>
\<!--js tagload endbuild--\><br/>

编译结果:\<script\>lsloader.tagLoad("http://res.wx.qq.com/open/js/jweixin-1.0.0.js","ls-loader-tagload1")\</script\>

用script标签加载 单次加载单个文件,保证执行顺序

### 内联脚本运行

\<!--js inline build--\>
\<script\>
$(document.body).append('<div>????</div>');
console.log('?')
\<script\>
\<!--js inline endbuild--\>

编译结果:\<textarea id='inline-1'\>jsCode\<textarea\>

\<script\>lsloader.runInlineScript('inline-1')\<script\>

把内连脚本放入textarea 延迟运行


### AMD模块js分析 根据模块内的依赖把所有amd模块用combo加载,本地缓存

<script src='../js/index.js'></script>
templateBuild.js会扫描模版引用中所有js文件，如果分析语法词含有define，
则认定为AMD模块，引入处子动进行AST语法树分析－》转换为一个依赖序列－》最后使用
lsLoader.loadCombo方法进行处理。
如果你的项目不支持线上combo 在templateBuild.js中注释掉“//替换AMD模块依赖分析后的脚本入行内”
后面的代码即可。

编译结果:lsloader.loadCombo([所有index.js依赖的模块,从树叶到树根顺序排列]);

### 非AMD模式js combo 所有注释内的文件会combo缓存进本地 灰度更新
<!--js combo build-->
<script src="../js/jquery.js"></script>
<script src="../js/noAMD/1.js"></script>
<script src="../js/noAMD/2.js"></script>
<!--js combo endbuild-->

编译结果:lsloader.loadCombo([jquery.js,1.js,2.js]);

### 关于css的缓存:
由于调用css时候需要使用异步模式,为了防止页面css乱序造成的repaint/reflow,
开发时候css link标签onload函数可以被编译成线上模版运行,<br/>
\<link rel="stylesheet" type="text/css" href='../css/page3.css' onload="document.documentElement.style.display='';"\><br/>
在页面头部加入document.documentElement.style.display='none';主css加载完回调函数再修改display,即可防止repaint/reflow造成的
负面效果.<br/>

### 关于js的缓存:
js采用异步加载,顺序执行,所以所有需要保证运行顺序的js,包括外引/行内代码块,都要参与编译,才能让LsLoader决定执行顺序.

如果你的js/css 由于模版嵌套共用等原因不方便加入lsLoader工作流,你也可以用传统link,script方式引入文件,并不会影响

执行顺序,近似原生


## 六 Demo 运行方式
根目录下npm install

运行gulp amd<br/>

运行node app.js 启动express<br/>

访问localhost:3000/ 即可看见打包后的代码<br/>

每次修改css/js后 gulp打包, 刷新页面 资源自动灰度更新缓存 最大化减少请求<br/>
 
build/html下即可看到打包localStorage的模版<br/>

放入自己的后端服务的目录结构中，运行<br/>
dev/html下是打包缓存前代码<br/>
build/html 下打包缓存后代码<br/>





## 七 templateBuild.js

该文件是用来把未缓存代码转换为LsLoader代码的gulp任务

1.首先调用usemin等插件把静态资源替换成md5名称,路径替换成线上;

2.上一步完成时把开发时的相对路径和上线时的md5路径生成一个json文件;

3.templateBuild.js 配置jsonPath读取这个json

4.templateBuild.run 时传入path[] 参数,配置要编译的模版路径,里面路径下的ftl html都会被遍历扫描

5.遍历读取模版文件时,根据\<!--任务名 build--\> 进入不同的处理函数,按照LsLoader.js的API格式传入想要的参数

6.遇见\<!--ASTbuild--\> 时候,需要调用递归遍历js内容,找出define里的模块依赖.从树根找到依赖树的树枝后,按出现顺序去重,传入lsLoader.loadCombo()

## 八 如何接入自己的工作流

templateBuild.js是所有文档编译的核心文件,它是基于gulp工作流写的node.js程序

 从入口函数分析,他做了如下工作

  var path = args.path; //外部传入一个参数,为你要编译的模版目录,下面所有的html,ftl文件都会扫描注释编译成lsLoader格式

     var data = fs.readFileSync(jsonPath,"utf-8");

     // 从当前项目中读取一份json文件,里面记录着所有文件的相对路径/线上路径的 map,他的作用是用唯一的相对路径作为key存储在浏览器端localStorage里,

     线上带版本路径用于标示程序版本和远程加载文件,这个json应该是你的grunt/gulp之前进行路径替换生成的结果

     data = JSON.parse(data)

     for(var i in data){
         data[i] = staticPath + data[i];
     } // 演示demo中将所有最终路径加上一个前缀,这个动作根据自己项目情况配置,只要保证compileFile调用的data是key/线上路径格式即可

     compileFile(data,path); //编译模版,传入处理好的data,和项目模版路径path即可

     addJSHead(devjs); //所有js添加头部信息,如果需要启用combo服务需要加分隔符分开每个模块,devjs为你需要添加头部标示的文件目录,下面所有文件都会遍历

     console.log('templatebuild success')  //最后都执行完后在部署环境留下日志


     AMDModule build 的处理

     对于AMDModule build包裹的js,目前只支持单个require入口的函数,文件被传入编译后,会使用ASTbuild.js进行语法分析,AST语法分析请看http://tech.meituan.com/abstract-syntax-tree.html介绍

     AMDModule 入口函数

     /*
      * filePath 要AST分析的文件本地路径
      * basePath 要取js的本地根路径
      * */
     exports.run=function(filePath,basePath){
         relyList =[];//依赖数组

         getDefine(fs.readFileSync(filePath,"utf-8"),basePath) //读取filePath对应出的入口函数,在basePath内遍历所有define模块

         relyList = sliceSame(relyList) //依赖列表去除重复,从树叶到树根顺序排列所有依赖文件,重复的文件去除,保证依赖正确的同时没有重复加载

         console.log('AST分析'+filePath+'依赖AMD模块为:'+relyList)

         for (var key in relyList){   //依赖列表项恢复为相对路径

             relyList[key] = staticPath+relyList[key]+'.js'  //依赖列表写入的都是相对与ASTBuild的路径,根据后端combo服务的名称规则进行修饰

         }
         return relyList;
     }

     需要传入filePath:入口函数相对与ASTBuild.js的全路径

     basePath: 相对与ASTBuild.js的目录,该目录下的js文件会被AST分析程序过滤搜索

## 九 Lsloader 配合webpack2 使用
结合webpack2的打包hash打包能力,Lsloader能够对webpack2的模块进行拆分打包操作.
具体原理是利用HashedModuleIdsPlugin让模块序号稳定,再自动分析
js源代码的es6引用路径,通过commonChunksPlugin插件,让入口引用的模块都独立打包
并且调用Lsloader.loadCombo统一读取/存储
具体演示:

项目根目录下npm install

运行gulp webpack 源码预处理

再运行 webpack  打包

最后gulp addcombo 完成预处理

运行node app.js 启动express

访问http://localhost:3000/webpack/index 即可看见打包后的webpack2代码


















