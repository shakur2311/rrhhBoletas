const xlsx = require('xlsx');
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');
const pdf = require('html-pdf');
const ejs = require('ejs');
const { type } = require('os');




//Variables
let excelFileSheets = {};
let excelCargado = false;

const cargarExcel = (req,res)=>{
    try {
        //Obtenemos el archivo excel almacenado en la carpeta excels
        const excelFile = xlsx.readFile(path.join(__dirname, '..','excels',req.filename));
        
        for (const sheetName of excelFile.SheetNames) {
            excelFileSheets[sheetName] = xlsx.utils.sheet_to_json(excelFile.Sheets[sheetName]);
        }
        res.json({"message":"Excel cargado"});
        excelCargado=true;
    } catch (error) {
        res.json({'error':error.message});
        excelCargado=false;
    }
    
}

const enviarCorreos = async (req,res)=>{
    try {
        
        if(excelCargado){
            
            //Capturo valor del mes de la boleta a emitir y tipo de boleta
            let mesPago = req.body.mesPago;
            let tipoBoleta;
            


            switch(req.body.tipoBoleta){
                case "planillaCas":
                    tipoBoleta = "PLANILLA - CAS";
                    break;
                case "planillaHaberes":
                    tipoBoleta = "PLANILLA - HABERES";
                    break;
                case "planillaPensiones":
                    tipoBoleta = "PLANILLA - PENSIONES";
                    break;
                default:
                    tipoBoleta = "Indefinido";
            }

            //Config de nodemailer
            let transporter = nodemailer.createTransport({
                host: "smtp.gmail.com",
                port: 465,
                pool:true,
                secure: true, // true for 465, false for other ports
                auth: {
                user: 'orh@unac.pe', // user gmail acc
                pass: 'zatetbrkzwhbvpmn', // contraseña de aplicaciones generadas en gmail acc
                },
            });
            //
            //Convertir createPDF de html-pdf a promesa
            const createPDF = (html, options) => new Promise(((resolve, reject) => {
                pdf.create(html, options).toBuffer((err, buffer) => {
                    if (err !== null) {reject(err);}
                    else {resolve(buffer);}
                });
            }));
            //Convertir numero int o float a string con comas separadoras de miles
            const commify = (n)=>{
                var parts = n.toString().split(".");
                const numberPart = parts[0];
                const decimalPart = parts[1];
                const thousands = /\B(?=(\d{3})+(?!\d))/g;
                return numberPart.replace(thousands, ",") + (decimalPart ? "." + decimalPart : "");
            }
            
            for(let i = 0;i<(excelFileSheets.Hoja1).length;i++){
                //Elaborando la boleta pdf
                
                //Datos extraidos del excel
                //#region 
                //Info de empleado
                let codigo = excelFileSheets.Hoja1[i]["CODIGO"];
                let apenom = excelFileSheets.Hoja1[i]["APELLIDOS Y NOMBRES"];
                let dni = excelFileSheets.Hoja1[i]["DNI/C.E"];
                let dependencia = excelFileSheets.Hoja1[i]['DEPENDENCIA'];
                let carnetEssalud = excelFileSheets.Hoja1[i]["CARNET ESSALUD"];
                let afp = excelFileSheets.Hoja1[i]['AFP'];
                let tpers = excelFileSheets.Hoja1[i]["T.PERS/PLAZA MGRH"];
                let diasLaborados = excelFileSheets.Hoja1[i]['DIAS LABORADOS'];
                let fechaIngreso = excelFileSheets.Hoja1[i]["FECHA DE INGRESO"];      
                let nivelRem = excelFileSheets.Hoja1[i]["NIVEL REM"];
                let nroCuenta = excelFileSheets.Hoja1[i]["NRO CUENTA"];
                let cargoEstructural = excelFileSheets.Hoja1[i]["CARGO ESTRUCTURAL"];
                let condLaboral = excelFileSheets.Hoja1[i]["COND. LABORAL"];
                let tServicios;
                if(excelFileSheets.Hoja1[i]["T.SERVICIOS"].toString().length==6){
                    tServicios = excelFileSheets.Hoja1[i]["T.SERVICIOS"].toString().substr(0,2) 
                    + " Años " + excelFileSheets.Hoja1[i]["T.SERVICIOS"].toString().substr(2,2) + " Meses "
                    + excelFileSheets.Hoja1[i]["T.SERVICIOS"].toString().substr(4,2) + " Dias ";
                }else if(excelFileSheets.Hoja1[i]["T.SERVICIOS"].toString().length==5){
                    tServicios = excelFileSheets.Hoja1[i]["T.SERVICIOS"].toString().substr(0,1) 
                    + " Años " + excelFileSheets.Hoja1[i]["T.SERVICIOS"].toString().substr(1,2) + " Meses "
                    + excelFileSheets.Hoja1[i]["T.SERVICIOS"].toString().substr(3,2) + " Dias ";
                }
                let cuspp = excelFileSheets.Hoja1[i]["CUSPP"];
                let horasLaboradas = excelFileSheets.Hoja1[i]["HORAS LABORADOS"];
                let correo = excelFileSheets.Hoja1[i]["CORREO"];
                
                //INGRESOS
                let pensiones = excelFileSheets.Hoja1[i]["PENSIONES"];
                let DS062020ef =  excelFileSheets.Hoja1[i]["S *, 110-06, 39-07,6-2020-EF"];
                let DS170519ef =  excelFileSheets.Hoja1[i]["D.S. N* 17-2005-EF-09-2019-EF"];
                let Asig27691 =  excelFileSheets.Hoja1[i]["ASIGNACION 276-91-EF"];
                let gratipensjul =  excelFileSheets.Hoja1[i]["GRATIF JUL. PENS."];
                let DS1118ef =  excelFileSheets.Hoja1[i]["LEY 28449--28789--D.S.11-18 EF"];
                let DS0621ef =  excelFileSheets.Hoja1[i]["D.S.006-2021-EF"];
                let DS01422ef =  excelFileSheets.Hoja1[i]["D.S.014-2022-EF"];
                let DS00723ef =  excelFileSheets.Hoja1[i]["D.S.007-23-EF"];
                let DS0516Y2017ef =  excelFileSheets.Hoja1[i]["D.S. 05-16 Y 20-17-EF"];
                let DS0022024ef =  excelFileSheets.Hoja1[i]["D.S. 002-2024-EF"];
                let DS0032025ef =  excelFileSheets.Hoja1[i]["D.S.003-2025-EF"];
                let aguinaldodic =  excelFileSheets.Hoja1[i]["AGUINAL. DIC."];
                let grati =  excelFileSheets.Hoja1[i]["GRATIF. DIC."];
                let gratijul =  excelFileSheets.Hoja1[i]["GRATIF. JULIO"];
                let gratijulcas =  excelFileSheets.Hoja1[i]["GRATIF. JUL. CAS"];
                let graticas =  excelFileSheets.Hoja1[i]["GRATIF. DIC. CAS"];
                let gratipens =  excelFileSheets.Hoja1[i]["GRATIF. DIC. PENS"];
                let docentescontratados =  excelFileSheets.Hoja1[i]["D.S 418"];
                let DS311ef =  excelFileSheets.Hoja1[i]["D.S. N* 311-2022-EF"];
                let escolaridad =  excelFileSheets.Hoja1[i]["BONIF. ESCOLARIDAD"];
                let escolaridadpension =  excelFileSheets.Hoja1[i]["BONIF. ESCOLARID. PENS."];
                let autoridades =  excelFileSheets.Hoja1[i]["D.S 313"];
                let convcentcas1 =  excelFileSheets.Hoja1[i]["D.S.313-23-EF"];
                let convcolect26524 =  excelFileSheets.Hoja1[i]["D.S.N*265-2024-EF"];
                let convcolect27924 =  excelFileSheets.Hoja1[i]["D.S.N*279-2024-EF"];
                let betvariable = excelFileSheets.Hoja1[i]["BET VARIABLE"];
                let docentesnombrados =  excelFileSheets.Hoja1[i]["MUC 58"];
                let administrativos1 =  excelFileSheets.Hoja1[i]["MUC DU 38"];
                let administrativos2 =  excelFileSheets.Hoja1[i]["BDP"];
                let administrativos3 =  excelFileSheets.Hoja1[i]["BET"];
                let aguinaldo =  excelFileSheets.Hoja1[i]["AGUINALDO JULIO"];
                let cas =  excelFileSheets.Hoja1[i]["CAS"];
                let reintegro =  excelFileSheets.Hoja1[i]["REINTEGRO"];
                let totalingresos = commify(parseFloat(excelFileSheets.Hoja1[i]["TOTAL DE ING."]).toFixed(2));

                let ingresosArray = [];

                if(typeof pensiones!='undefined'){
                    ingresosArray.push({"texto":"012 PENSIONES","valor":commify(parseFloat(pensiones).toFixed(2))});
                }
                if(typeof DS062020ef!='undefined'){
                    ingresosArray.push({"texto":"026 D.S. 06-2020-EF","valor":commify(parseFloat(DS062020ef).toFixed(2))});
                }
                if(typeof DS170519ef!='undefined'){
                    ingresosArray.push({"texto":"027 D.S. 17-05.19-EF","valor":commify(parseFloat(DS170519ef).toFixed(2))});
                }
                if(typeof Asig27691!='undefined'){
                    ingresosArray.push({"texto":"031 ASIG-276-91-EF","valor":commify(parseFloat(Asig27691).toFixed(2))});
                }
                if(typeof gratipensjul!='undefined'){
                    ingresosArray.push({"texto":"036 GRATIFIC.JUL.PEN","valor":commify(parseFloat(gratipensjul).toFixed(2))});
                }
                if(typeof DS1118ef!='undefined'){
                    ingresosArray.push({"texto":"033 D.S. 11-18-EF","valor":commify(parseFloat(DS1118ef).toFixed(2))});
                }
                if(typeof DS0621ef!='undefined'){
                    ingresosArray.push({"texto":"053 D.S. 006-21-EF","valor":commify(parseFloat(DS0621ef).toFixed(2))});
                }
                if(typeof DS01422ef!='undefined'){
                    ingresosArray.push({"texto":"056 D.S. 014-2022-EF","valor":commify(parseFloat(DS01422ef).toFixed(2))});
                }
                if(typeof DS00723ef!='undefined'){
                    ingresosArray.push({"texto":"060 D.S. 007-2023-EF","valor":commify(parseFloat(DS00723ef).toFixed(2))});
                } 
                if(typeof DS0516Y2017ef!='undefined'){
                    ingresosArray.push({"texto":"061 D.S. 05-16 Y 20-17-EF","valor":commify(parseFloat(DS0516Y2017ef).toFixed(2))});
                }
                if(typeof DS0022024ef!='undefined'){
                    ingresosArray.push({"texto":"066 D.S. 002-2024-EF","valor":commify(parseFloat(DS0022024ef).toFixed(2))});
                }
                if(typeof DS0032025ef!='undefined'){
                    ingresosArray.push({"texto":"073 D.S. 003-2025-EF","valor":commify(parseFloat(DS0032025ef).toFixed(2))});
                }
                if(typeof aguinaldodic!='undefined'){
                    ingresosArray.push({"texto":"008 AGUINAL. DIC.","valor":commify(parseFloat(aguinaldodic).toFixed(2))});
                }
                if(typeof grati!='undefined'){
                    ingresosArray.push({"texto":"063 GRATIFIC. DIC.","valor":commify(parseFloat(grati).toFixed(2))});
                }
                if(typeof gratijul!='undefined'){
                    ingresosArray.push({"texto":"054 GRATIFIC. JUL.","valor":commify(parseFloat(gratijul).toFixed(2))});
                }
                if(typeof gratijulcas!='undefined'){
                    ingresosArray.push({"texto":"040 GRATIFIC. JUL. CAS","valor":commify(parseFloat(gratijulcas).toFixed(2))});
                }
                if(typeof graticas!='undefined'){
                    ingresosArray.push({"texto":"041 GRATIFIC. DIC. CAS","valor":commify(parseFloat(graticas).toFixed(2))});
                }
                if(typeof gratipens!='undefined'){
                    ingresosArray.push({"texto":"038 GRATIFIC.DIC.PEN","valor":commify(parseFloat(gratipens).toFixed(2))});
                }
                if(typeof docentescontratados!='undefined'){
                    ingresosArray.push({"texto":"047 D.S 418-17-EF","valor":commify(parseFloat(docentescontratados).toFixed(2))});
                }
                if(typeof DS311ef!='undefined'){
                    ingresosArray.push({"texto":"059 DS 311-22-EF","valor":commify(parseFloat(DS311ef).toFixed(2))});
                }
                if(typeof escolaridad!='undefined'){
                    ingresosArray.push({"texto":"021 BONIF.ESCO","valor":commify(parseFloat(escolaridad).toFixed(2))});
                }
                if(typeof escolaridadpension!='undefined'){
                    ingresosArray.push({"texto":"037 BONIF.ESC.PENS.","valor":commify(parseFloat(escolaridadpension).toFixed(2))});
                }
                if(typeof autoridades!='undefined'){
                    ingresosArray.push({"texto":"048 D.S 313-19-EF","valor":commify(parseFloat(autoridades).toFixed(2))});
                }
                if(typeof convcentcas1!='undefined'){
                    ingresosArray.push({"texto":"065 D.S 313-23-EF","valor":commify(parseFloat(convcentcas1).toFixed(2))});
                }
                if(typeof convcolect26524!='undefined'){
                    ingresosArray.push({"texto":"068 D.S 265-24-EF","valor":commify(parseFloat(convcolect26524).toFixed(2))});
                }
                if(typeof convcolect27924!='undefined'){
                    ingresosArray.push({"texto":"069 D.S 279-24-EF","valor":commify(parseFloat(convcolect27924).toFixed(2))});
                }
                if(typeof betvariable!='undefined'){
                    ingresosArray.push({"texto":"070 BET VARIABLE","valor":commify(parseFloat(betvariable).toFixed(2))});
                }
                if(typeof docentesnombrados!='undefined'){
                    ingresosArray.push({"texto":"049 LEY 30879 58 DCF","valor":commify(parseFloat(docentesnombrados).toFixed(2))});
                }
                if(typeof administrativos1!='undefined'){
                    ingresosArray.push({"texto":"050 MUC(DS.420-19EF)","valor":commify(parseFloat(administrativos1).toFixed(2))});
                }
                if(typeof administrativos2!='undefined'){
                    ingresosArray.push({"texto":"051 BDP(DS-420-19EF)","valor":commify(parseFloat(administrativos2).toFixed(2))});
                }
                if(typeof administrativos3!='undefined'){
                    ingresosArray.push({"texto":"052 BET(DS-420-19EF)","valor":commify(parseFloat(administrativos3).toFixed(2))});
                }
                if(typeof aguinaldo!='undefined'){
                    ingresosArray.push({"texto":"020 AGUIN. JUL.","valor":commify(parseFloat(aguinaldo).toFixed(2))});
                }
                if(typeof cas!= 'undefined'){
                    ingresosArray.push({"texto":"039 CAS","valor":commify(parseFloat(cas).toFixed(2))});
                }
                if(typeof reintegro!= 'undefined'){
                    ingresosArray.push({"texto":"101 REINTEGRO","valor":commify(parseFloat(reintegro).toFixed(2))});
                }
                
        
                //EGRESOS
                let faltasyotardanzas = excelFileSheets.Hoja1[i]["FALTAS Y/O TARDANZAS"];
                let sudunaccp = excelFileSheets.Hoja1[i]["SUDUNAC OTROS"];
                let tespublico = excelFileSheets.Hoja1[i]["RESPONS. FISCAL (TESORO PUBLI)"];
                let cajamunareq = excelFileSheets.Hoja1[i]["CAJA MUNICIPAL DE AREQUIPA"];
                let cooplaunion = excelFileSheets.Hoja1[i]["COOPERATIVA LA UNION"];
                let coopsanmiguel = excelFileSheets.Hoja1[i]["SAN MIGUEL EX COOP-PONDEROSA"];
                let otrossudunac = excelFileSheets.Hoja1[i]["OTROS(SUTUNAC)"];
                let bancognb = excelFileSheets.Hoja1[i]["BANCO GNB PERU S.A."];
                let coopeltumi = excelFileSheets.Hoja1[i]["COOPERATIVO EL TUMI"];
                let regularafp= excelFileSheets.Hoja1[i]["REGULAR. AFP"];
                let asocjubunac = excelFileSheets.Hoja1[i]["ASOC. JUB.UNAC"];
                let bancoscotiabank = excelFileSheets.Hoja1[i]["SCOTIABANK PERU S.A.A."];
                let ceuunac = excelFileSheets.Hoja1[i]["CEU-UNAC"];
                let encargsinliq = excelFileSheets.Hoja1[i]["ENCARGOS SIN LIQUIDAR"];
                let sutunacfall = excelFileSheets.Hoja1[i]["SUTUNAC (FALL. CESE)"];
                let sudunacfall = excelFileSheets.Hoja1[i]["FALLECIMIENTO (SUDUNAC)JCASTIL"];
                let faltasinjustif = excelFileSheets.Hoja1[i]["INASISTENCIA INJUSTIFICADA"];
                let cajachica = excelFileSheets.Hoja1[i]["CAJA CHICA O.TES."];
                let regularonp = excelFileSheets.Hoja1[i]["REGULAR ONP"];
                let regular20530 = excelFileSheets.Hoja1[i]["REGULAR 20530-24"];
                let regularabono = excelFileSheets.Hoja1[i]["REGULAR ABONO"];
                let omc = excelFileSheets.Hoja1[i]["OMC"];
                let sutunac = excelFileSheets.Hoja1[i]["SUTUNAC"];
                let segmasvida = excelFileSheets.Hoja1[i]["+VIDA SEGURO DE ACCIDENTES"];
                let segmasvidapension = excelFileSheets.Hoja1[i]["+VIDA SEG.ACC.PENSION"];
                let segrimac = excelFileSheets.Hoja1[i]["RIMAC INTERNAC.CIA SEG."];
                let sudunacjc = excelFileSheets.Hoja1[i]["SUDUNAC"];
                let seginterseguro = excelFileSheets.Hoja1[i]["INTERSEGURO"];
                let segmapfre = excelFileSheets.Hoja1[i]["MAPFRE-PERU"];
                let colenfermeros = excelFileSheets.Hoja1[i]["COLEGIO ENFERMEROS"];
                let seglapositiva = excelFileSheets.Hoja1[i]["LA POSITIVA VIDA"];
                let aportsolidconv05 = excelFileSheets.Hoja1[i]["APORTE SOLIDARIO CONVENIO COLECTIVO 2024-2025 (0.5%)"];
                let aportsolidconv02 = excelFileSheets.Hoja1[i]["APORTE SOLIDARIO CONVENIO COLECTIVO 2024-2025 (0.2%)"];
                let dsctojudicial = excelFileSheets.Hoja1[i]["DESCUENTO JUDICIAL"];
                let aporteoblig = excelFileSheets.Hoja1[i]["APORTE OBLIGATORIO"];
                let onpcas = excelFileSheets.Hoja1[i]["ONP CAS"];
                let afpaporteoblig = excelFileSheets.Hoja1[i]["AFP APORTE OBLIGATORIO"];
                let afptasaefectiva = excelFileSheets.Hoja1[i]["AFP TASA EFECTIVA"];
                let afpcom = excelFileSheets.Hoja1[i]["AFP COM.PORC.CAS"];
                let comisporcent = excelFileSheets.Hoja1[i]["COMISION PORCENTUAL"];
                let segprima = excelFileSheets.Hoja1[i]["PRIMA SEGURO"];
                let onp = excelFileSheets.Hoja1[i]["ONP"];
                let dl2530 = excelFileSheets.Hoja1[i]["D.L. 20530"];
                let cuartacat = excelFileSheets.Hoja1[i]["4TA CATEGORIA"];
                let quintarescps = excelFileSheets.Hoja1[i]["QUINTA CATEGORIA"];
                let quintacat = excelFileSheets.Hoja1[i]["5TA CATEGORIA"];
                let essaludPensionistas = excelFileSheets.Hoja1[i]["ESSALUD PENS."];
                let totaldscts = commify(parseFloat(excelFileSheets.Hoja1[i]["TOTAL DESCUENTOS"]).toFixed(2));
                
                
                let egresosArray = [];

                if(typeof faltasyotardanzas!='undefined'){
                    egresosArray.push({"texto":"601 FAL. Y/O TARD","valor":commify(parseFloat(faltasyotardanzas).toFixed(2))});
                }
                if(typeof sudunaccp!='undefined'){
                    egresosArray.push({"texto":"605 SUDUNAC(OTROS)","valor":commify(parseFloat(sudunaccp).toFixed(2))});
                }
                if(typeof tespublico!='undefined'){
                    egresosArray.push({"texto":"607 RESP.FISCAL","valor":commify(parseFloat(tespublico).toFixed(2))});
                }
                if(typeof cajamunareq!='undefined'){
                    egresosArray.push({"texto":"611 CAJA MUNI","valor":commify(parseFloat(cajamunareq).toFixed(2))});
                }
                if(typeof cooplaunion!='undefined'){
                    egresosArray.push({"texto":"612 C.UNION","valor":commify(parseFloat(cooplaunion).toFixed(2))});
                }
                if(typeof coopsanmiguel!='undefined'){
                    egresosArray.push({"texto":"613 PONDEROSA","valor":commify(parseFloat(coopsanmiguel).toFixed(2))});
                }
                if(typeof otrossudunac!='undefined'){
                    egresosArray.push({"texto":"615 OTROS(SUTUNAC","valor":commify(parseFloat(otrossudunac).toFixed(2))});
                }
                if(typeof bancognb!='undefined'){
                    egresosArray.push({"texto":"620 BANCO GNB","valor":commify(parseFloat(bancognb).toFixed(2))});
                }
                if(typeof coopeltumi!='undefined'){
                    egresosArray.push({"texto":"625 EL TUMI","valor":commify(parseFloat(coopeltumi).toFixed(2))});
                }
                if(typeof regularafp!='undefined'){
                    egresosArray.push({"texto":"637 REGULAR.AFP","valor":commify(parseFloat(regularafp).toFixed(2))});
                }
                if(typeof asocjubunac!='undefined'){
                    egresosArray.push({"texto":"704 ASPEUNAC","valor":commify(parseFloat(asocjubunac).toFixed(2))});
                }
                if(typeof bancoscotiabank!='undefined'){
                    egresosArray.push({"texto":"640 SCOTIABANK","valor":commify(parseFloat(bancoscotiabank).toFixed(2))});
                }
                if(typeof ceuunac!='undefined'){
                    egresosArray.push({"texto":"641 CEU-UNAC","valor":commify(parseFloat(ceuunac).toFixed(2))});
                }
                if(typeof encargsinliq!='undefined'){
                    egresosArray.push({"texto":"643 ENCARGOS","valor":commify(parseFloat(encargsinliq).toFixed(2))});
                }
                if(typeof sutunacfall!='undefined'){
                    egresosArray.push({"texto":"644 SEPELIO","valor":commify(parseFloat(sutunacfall).toFixed(2))});
                }
                if(typeof sudunacfall!='undefined'){
                    egresosArray.push({"texto":"648 SUDUNAC-FALL","valor":commify(parseFloat(sudunacfall).toFixed(2))});
                }
                if(typeof faltasinjustif!='undefined'){
                    egresosArray.push({"texto":"651 FALTAS-INJUSTIF","valor":commify(parseFloat(faltasinjustif).toFixed(2))});
                }
                if(typeof cajachica!='undefined'){
                    egresosArray.push({"texto":"654 DSCTO(O.TES.)","valor":commify(parseFloat(cajachica).toFixed(2))});
                }
                if(typeof regularonp!='undefined'){
                    egresosArray.push({"texto":"656 ONP REGULAR","valor":commify(parseFloat(regularonp).toFixed(2))});
                }
                if(typeof regular20530!='undefined'){
                    egresosArray.push({"texto":"661 REGULAR 20530-24","valor":commify(parseFloat(regular20530).toFixed(2))});
                }
                if(typeof regularabono!='undefined'){
                    egresosArray.push({"texto":"659 REGULAR ABONO","valor":commify(parseFloat(regularabono).toFixed(2))});
                }
                if(typeof omc!='undefined'){
                    egresosArray.push({"texto":"660 OMC","valor":commify(parseFloat(omc).toFixed(2))});
                }
                if(typeof sutunac!='undefined'){
                    egresosArray.push({"texto":"701 SUTUNAC","valor":commify(parseFloat(sutunac).toFixed(2))});
                }
                if(typeof segmasvida!='undefined'){
                    egresosArray.push({"texto":"702 +VIDA","valor":commify(parseFloat(segmasvida).toFixed(2))});
                }
                if(typeof segmasvidapension!='undefined'){
                    egresosArray.push({"texto":"711 +VIDA PENSION","valor":commify(parseFloat(segmasvidapension).toFixed(2))});
                }
                if(typeof segrimac!='undefined'){
                    egresosArray.push({"texto":"703 RIMAC INTERNAC.","valor":commify(parseFloat(segrimac).toFixed(2))});
                }
                if(typeof sudunacjc!='undefined'){
                    egresosArray.push({"texto":"705 SUDUNAC","valor":commify(parseFloat(sudunacjc).toFixed(2))});
                }
                if(typeof seginterseguro!='undefined'){
                    egresosArray.push({"texto":"706 INTERSG","valor":commify(parseFloat(seginterseguro).toFixed(2))});
                }
                if(typeof segmapfre!='undefined'){
                    egresosArray.push({"texto":"708 MAPFRE","valor":commify(parseFloat(segmapfre).toFixed(2))});
                }
                if(typeof colenfermeros!='undefined'){
                    egresosArray.push({"texto":"709 COLEGIO","valor":commify(parseFloat(colenfermeros).toFixed(2))});
                }
                if(typeof seglapositiva!='undefined'){
                    egresosArray.push({"texto":"712 LA POSITIVA","valor":commify(parseFloat(seglapositiva).toFixed(2))});
                }
                if(typeof aportsolidconv05!='undefined'){
                    egresosArray.push({"texto":"714 AP.SOL.CONV.COLEC(0.5%)","valor":commify(parseFloat(aportsolidconv05).toFixed(2))});
                }
                if(typeof aportsolidconv02!='undefined'){
                    egresosArray.push({"texto":"715 AP.SOL.CONV.COLEC(0.2%)","valor":commify(parseFloat(aportsolidconv02).toFixed(2))});
                }
                if(typeof dsctojudicial!='undefined'){
                    egresosArray.push({"texto":"801 DESC.JUD.","valor":commify(parseFloat(dsctojudicial).toFixed(2))});
                }
                if(typeof aporteoblig!='undefined'){
                    egresosArray.push({"texto":"803 APORTE OBLIG.","valor":commify(parseFloat(aporteoblig).toFixed(2))});
                }
                if(typeof onpcas!='undefined'){
                    egresosArray.push({"texto":"817 ONP CAS","valor":commify(parseFloat(onpcas).toFixed(2))});
                }
                if(typeof afpaporteoblig!='undefined'){
                    egresosArray.push({"texto":"818 AFP AP.OBLIG.","valor":commify(parseFloat(afpaporteoblig).toFixed(2))});
                }
                if(typeof afptasaefectiva!='undefined'){
                    egresosArray.push({"texto":"819 AFP P.SEGURO","valor":commify(parseFloat(afptasaefectiva).toFixed(2))});
                }
                if(typeof afpcom!='undefined'){
                    egresosArray.push({"texto":"820 AFP COM.POR.CAS","valor":commify(parseFloat(afpcom).toFixed(2))});
                }
                if(typeof comisporcent!='undefined'){
                    egresosArray.push({"texto":"804 COMIS.PORC.","valor":commify(parseFloat(comisporcent).toFixed(2))});
                }
                if(typeof segprima!='undefined'){
                    egresosArray.push({"texto":"805 PRIMA-SEGURO","valor":commify(parseFloat(segprima).toFixed(2))});
                }
                if(typeof onp!='undefined'){
                    egresosArray.push({"texto":"808 ONP","valor":commify(parseFloat(onp).toFixed(2))});
                }
                if(typeof dl2530!='undefined'){
                    egresosArray.push({"texto":"809 D.L. 20530","valor":commify(parseFloat(dl2530).toFixed(2))});
                }
                if(typeof cuartacat!='undefined'){
                    egresosArray.push({"texto":"823 4TA CATEGORIA","valor":commify(parseFloat(cuartacat).toFixed(2))});
                }
                if(typeof quintarescps!='undefined'){
                    egresosArray.push({"texto":"807 QUINTA CATEGORIA","valor":commify(parseFloat(quintarescps).toFixed(2))});
                }
                if(typeof quintacat!='undefined'){
                    egresosArray.push({"texto":"810 5TA CATEGORIA","valor":commify(parseFloat(quintacat).toFixed(2))});
                }
                if(typeof essaludPensionistas!='undefined'){
                    egresosArray.push({"texto":"802 ESSALUD PENS.","valor":commify(parseFloat(essaludPensionistas).toFixed(2))});
                }
                

                //APORTES
                let essalud =  excelFileSheets.Hoja1[i]["ESSALUD"];
                let essaludCas =  excelFileSheets.Hoja1[i]["ESSALUD CAS"];
                let totalAportes;
                let aportesArray = [];
                if(tipoBoleta=="PLANILLA - PENSIONES"){
                    aportesArray=[{"texto":"","valor":""}];
                    totalAportes = 0;
                }else{
                    if(typeof essalud!='undefined'){
                        aportesArray.push({"texto":"901 ESSALUD","valor":commify(parseFloat(essalud).toFixed(2))});
                        totalAportes = commify((parseFloat(essalud)).toFixed(2));
                    }
                    if(typeof essaludCas!='undefined'){
                        aportesArray.push({"texto":"905 ESSALUD CAS","valor":commify(parseFloat(essaludCas).toFixed(2))});
                        totalAportes = commify((parseFloat(essaludCas)).toFixed(2));
                    }
                }

                //TOTAL LIQUIDO
                let totalLiquido = commify(parseFloat(excelFileSheets.Hoja1[i]["TOTAL LÍQUIDO"]).toFixed(2));
                
                //#endregion

                
                //Obteniendo hora y fecha actual para guardar nombre boleta PDF
                const date = new Date().toLocaleString({ timeZone: "America/Lima" });
                const newDate = date.split(' ');
                const fecha = newDate[0].replaceAll('/','');
                const hora = newDate[1].replaceAll(':','');
                const filename = codigo+'-'+fecha+'-'+hora+'.pdf';


                let fileRendered = await ejs.renderFile(path.join(__dirname,'..','boletas/templateMail/index.ejs'),{
                    tipoBoleta,
                    mesPago,
                    codigo,
                    apenom,
                    dni,
                    dependencia,
                    carnetEssalud,
                    afp,
                    tpers,
                    diasLaborados,
                    fechaIngreso,
                    nivelRem,
                    nroCuenta,
                    cargoEstructural,
                    condLaboral,
                    tServicios,
                    cuspp,
                    horasLaboradas,
                    correo,
                    //Ingresos
                    ingresosArray,
                    totalingresos,
                    //Egresos
                    egresosArray,
                    totaldscts,
                    //APORTES
                    aportesArray,
                    totalAportes,
                    //TOTALLIQUIDO
                    totalLiquido                  
                })  
                
                let pdfCreado = await createPDF(fileRendered,{timeout: '540000'});
                await fs.writeFileSync(`./boletas/emitidas/${filename}`,pdfCreado);
                //Enviando email
                await transporter.sendMail({
                    from: '<orh@unac.pe>', // sender address
                    to: correo, // list of receivers
                    subject: "Envío digital de Boleta de Pago", // Subject line
                    html: `<p>
                    Saludos cordiales <strong>${apenom}</strong>.
                    <br>La Unidad de Recursos Humanos, remite la boleta de pago correspondiente al mes de <strong>${mesPago}</strong> 2025.
                    <br>
                    <br>Atentamente,
                    <br>Unidad de Recursos Humanos.<br/></p>`,

                    // html: `<p>
                    // Saludos cordiales <strong>${apenom}</strong>. 
                    // <br>La Unidad de Recursos Humanos se remite la boleta de pago
                    // correspondiente al mes de <strong>${mesPago}</strong> 2025, solicitando dejar sin efecto la boleta anterior del mismo período.
                    // <br>
                    // <br>Asimismo, en coordinación con la Unidad de Tesoreria, se efectuó el abono correspondiente al concepto de ESCOLARIDAD
                    // el dia 03 de febrero del presente año.
                    // <br>
                    // <br>Atentamente,
                    // <br>Unidad de Recursos Humanos.<br/></p>`,

                    

                    //<br>Se agradecerá responder indicando si los datos de la boleta son los correctos con la excepción del tiempo de servicio (configuración en proceso).</br>
                    
                    attachments:[{
                        filename:filename,
                        path:path.join(__dirname,'..','boletas/emitidas',filename)
                    }]
                });
                console.log("PDF GUARDADO Y ENVIADO POR CORREO");

     
            }

            //Devuelve correos enviados luego de recorrer todo el for
            res.json({'message':'correos enviados!'});
            excelCargado = false;
            excelFileSheets = {};
        }else{
            res.json({'message':'Debe cargar un excel'});
        }
        

    } catch (error) {
        res.json({'error':error.message})
        console.log(error);
    }
}

const obtenerArchivos = (req,res)=>{
    try {
        //Obtener listado de archivos pdf en el servidor
        const boletasFolder = path.join(__dirname,'..','boletas/emitidas'); //Obtener path donde estan los excels      
        fs.readdir(boletasFolder, async (err,files)=>{
            
            var filesOfPath = [];
            
            
            for (const [index,file] of files.entries()) {
                const filePath = path.join(boletasFolder,file)
                const stat = await fs.promises.stat(filePath);
                filesOfPath[index]={
                                        fileName: file,
                                        fileSize: stat.size
                                    }
                
            }

            res.json(filesOfPath)
                      
        })
        
    } catch (error) {
        res.json({
            'error':error.message
        })
    }
}

const descargarArchivo = (req,res)=>{
    try {
        const downloadFile = path.join(__dirname, '..','boletas/emitidas',req.params.fileName);
        res.download(downloadFile);
    } catch (error) {
        res.send("No se pudo descargar el archivo!");
    }
}
module.exports = {enviarCorreos,obtenerArchivos,descargarArchivo,cargarExcel};