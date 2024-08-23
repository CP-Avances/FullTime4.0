"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PresentarUsuarios = exports.BuscarCorreos = exports.cumpleanios = void 0;
const accesoCarpetas_1 = require("./accesoCarpetas");
const settingsMail_1 = require("./settingsMail");
const database_1 = __importDefault(require("../database"));
const path_1 = __importDefault(require("path"));
// METODO PARA ENVIAR MENSAJES DE CUMPLEANIOS A UNA HORA DETERMINADA 
const cumpleanios = function () {
    setInterval(() => __awaiter(this, void 0, void 0, function* () {
        // OBTENER RUTAS
        let separador = path_1.default.sep;
        const ruta_logo = (0, accesoCarpetas_1.ObtenerRutaLogos)();
        const ruta_cumpleanios = (0, accesoCarpetas_1.ObtenerRutaBirthday)();
        // OBTENER FECHA Y HORA
        const date = new Date();
        const hora = date.getHours();
        const minutos = date.getMinutes();
        const fecha = date.toJSON().slice(4).split("T")[0];
        console.log('ejecutandose hora ', hora, ' minuto ', minutos, 'fecha ', fecha);
        // VERIFICAR HORA DE ENVIO
        if (hora === 14) {
            const PARAMETRO = yield database_1.default.query(`
                SELECT * FROM ep_detalle_parametro WHERE id_parametro = 8
                `);
            if (PARAMETRO.rowCount != 0) {
                if ((PARAMETRO.rows[0].descripcion).toUpperCase() === 'SI') {
                    const EMPLEADOS = yield database_1.default.query(`
                        SELECT da.nombre, da.apellido, da.correo, da.fecha_nacimiento, s.id_empresa, 
                            ce.correo AS correo_empresa, ce.puerto, ce.password_correo, ce.servidor, 
                            ce.pie_firma, ce.cabecera_firma, m.asunto, m.mensaje, m.imagen, m.link  
                        FROM informacion_general AS da, e_sucursales AS s, e_message_birthday AS m,
                            e_empresa AS ce 
                        WHERE CAST(da.fecha_nacimiento AS VARCHAR) LIKE '%' || $1 AND da.id_suc = s.id
                            AND da.estado = 1 AND s.id_empresa = ce.id AND m.id_empresa = ce.id
                        `, [fecha]);
                    if (EMPLEADOS.rowCount != 0) {
                        var correos = (0, exports.BuscarCorreos)(EMPLEADOS);
                        console.log('correos ', correos);
                        var usuarios = (0, exports.PresentarUsuarios)(EMPLEADOS);
                        // ENVIAR MAIL A TODOS LOS QUE NACIERON EN LA FECHA SELECCIONADA
                        let message_url = `
                            <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;"></p>
                            `;
                        if (EMPLEADOS.rows[0].link != null) {
                            message_url =
                                `
                                <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; text-align: center;">
                                    <a style="background-color: #199319; color: white; padding: 15px 15px 15px 15px; text-decoration: none;" href="${EMPLEADOS.rows[0].url}">¡ VER FELICITACIONES !</a>
                                </p>
                                `;
                        }
                        // LEER IMAGEN DE CORREO CONFIGURADA - CABECERA
                        if (EMPLEADOS.rows[0].cabecera_firma === null || EMPLEADOS.rows[0].cabecera_firma === '') {
                            // IMAGEN POR DEFECTO
                            EMPLEADOS.rows[0].cabecera_firma = 'cabecera_firma.png';
                        }
                        // LEER IMAGEN DE CORREO CONFIGURADA - PIE DE FIRMA
                        if (EMPLEADOS.rows[0].pie_firma === null || EMPLEADOS.rows[0].pie_firma === '') {
                            // IMAGEN POR DEFECTO
                            EMPLEADOS.rows[0].pie_firma = 'pie_firma.png';
                        }
                        let data = {
                            to: correos,
                            from: EMPLEADOS.rows[0].correo_empresa,
                            subject: EMPLEADOS.rows[0].asunto,
                            html: `
                                <body>
                                    <div style="text-align: center;">
                                        <img width="100%" height="100%" src="cid:cabeceraf"/>
                                    </div>
                                    <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;">
                                        Este es un correo electrónico para desearle !Feliz Cumpleaños! <br>  
                                    </p>
                                    <div style="text-align: center;">
                                    <p style="font-family:Cambria, Cochin, Georgia, Times, 'Times New Roman', serif; color:rgb(11, 22, 121); font-size:18px;">
                                        <b> <i> ${usuarios} </i> </b>
                                    </p>
                                    </div>
                                    <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 2em;">  
                                        ${EMPLEADOS.rows[0].mensaje} <br><br>
                                        ${message_url} <br>
                                    </p>
                                    <div style="text-align: center;">
                                        <img src="cid:cumple"/> <br><br>
                                    </div>
                                    <br>                       
                                    <p style="font-family: Arial; font-size:12px; line-height: 1em;">
                                        <b>Gracias por la atención</b><br>
                                        <b>Saludos cordiales,</b> <br><br>
                                    </p>
                                    <img src="cid:pief" width="100%" height="100%"/>
                                </body>
                                `,
                            attachments: [
                                {
                                    filename: 'cabecera_firma.jpg',
                                    path: `${ruta_logo}${separador}${EMPLEADOS.rows[0].cabecera_firma}`,
                                    cid: 'cabeceraf' // COLOCAR EL MISMO cid EN LA ETIQUETA html img src QUE CORRESPONDA
                                },
                                {
                                    filename: 'pie_firma.jpg',
                                    path: `${ruta_logo}${separador}${EMPLEADOS.rows[0].pie_firma}`,
                                    cid: 'pief' // COLOCAR EL MISMO cid EN LA ETIQUETA html img src QUE CORRESPONDA
                                },
                                {
                                    filename: 'birthday1.jpg',
                                    path: `${ruta_cumpleanios}${separador}${EMPLEADOS.rows[0].imagen}`,
                                    cid: 'cumple' // COLOCAR EL MISMO cid EN LA ETIQUETA html img src QUE CORRESPONDA
                                }
                            ]
                        };
                        var corr = (0, settingsMail_1.enviarCorreos)(EMPLEADOS.rows[0].servidor, parseInt(EMPLEADOS.rows[0].puerto), EMPLEADOS.rows[0].correo_empresa, EMPLEADOS.rows[0].password_correo);
                        corr.sendMail(data, function (error, info) {
                            if (error) {
                                corr.close();
                                console.log('Email error: ' + error);
                                return 'error';
                            }
                            else {
                                corr.close();
                                console.log('Email sent: ' + info.response);
                                return 'ok';
                            }
                        });
                    }
                }
            }
        }
    }), 2700000);
};
exports.cumpleanios = cumpleanios;
// FUNCION PARA BUSCAR CORREOS
const BuscarCorreos = function (datos) {
    var correos = '';
    datos.rows.forEach((obj) => {
        if (correos === '') {
            correos = obj.correo;
        }
        else {
            correos = correos + ', ' + obj.correo;
        }
    });
    return correos;
};
exports.BuscarCorreos = BuscarCorreos;
// METODO PARA PRESENTAR INFORMACION DEL MENSAJE
const PresentarUsuarios = function (datos) {
    var nombres = '';
    datos.rows.forEach((obj) => {
        nombres = nombres + obj.nombre + ' ' + obj.apellido + '<br>';
    });
    var mensaje = '¡TE DESEAMOS FELIZ CUMPLEAÑOS!';
    if (datos.rowCount > 1) {
        mensaje = '¡LES DESEAMOS FELIZ CUMPLEAÑOS!';
    }
    var usuarios = `
        <h3 style="font-family: Arial; text-align: center;">${mensaje}</h3>
            <div style="text-align: center;"> 
             ${nombres}
            </div>
        `;
    return usuarios;
};
exports.PresentarUsuarios = PresentarUsuarios;
