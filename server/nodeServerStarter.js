const service = require('node-windows').Service


const newService = new service({
    name: "Boletas Server Service",
    description: "Servicio en windows para autoboot de Boletas Server",
    script: "C:\\Users\\RR.HH\\Desktop\\rrhh-boletas-master\\server\\index.js"
});

newService.on("install",()=>{
    newService.start();
});

newService.install();