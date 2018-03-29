Program ->
    NEJModuleVisitor()
        requireStats-[deps]
        injectParamStat-[depsVal]
        txtModuleInitStats
        [cbStats] || cb.name -> callbackVisitor
        [outputResultExport]
    callbackVisitor
        cbStats
    returnVisitor
        returnExportStat


1. nej模块的判断：仅限第一层代码
nej.define
define

func | [], func || [], var || var

3. 回调函数函数体 callbackStat
 - 为函数
 - 为变量
    - 找到变量对应的函数(仅限两者同层), 如果找不到，退出
    - 替换变量为函数
    - 移除原函数

2. 依赖文件
- 获取文件列表
- 获取文件变量
- 文本文件初始化为""  - txtModuleInitStats
- 获取注入参数、输出结果集 - injectParamStats outputResultExportStat
- 规范化依赖文件
    - !xxx去掉
    - .js去掉
    - {mode}替换为{web}
    - {}去掉，并考虑}/
    - 形成require - requireStats



5. 创建一个自执行函数名为nejModule，将这些语句塞入
    - requireStats, txtModuleInitStats, injectParamStats, callbackStat

4. 回调函数的return语句
    - 对回调函数中的所有return，寻找最近function，如果是函数名为nejModule, 原地转换为require - hasReturn

6. !hasReturn ： IEFF 放入 outputExportStat
