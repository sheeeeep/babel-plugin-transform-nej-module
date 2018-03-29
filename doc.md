Program ->
    NEJModuleVisitor()
        requireStats-deps
        injectParamStat-depsVal
        txtModuleInitStats
        cbStats || cb.name -> callbackVisitor
        outputResultExport
    callbackVisitor
        cbStats
    returnVisitor
        returnExportStat