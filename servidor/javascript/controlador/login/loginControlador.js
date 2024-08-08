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
// IMPORTAR LIBRERIAS
const settingsMail_1 = require("../../libs/settingsMail");
const auditoriaControlador_1 = __importDefault(require("../auditoria/auditoriaControlador"));
const database_1 = __importDefault(require("../../database"));
const path_1 = __importDefault(require("path"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const fs_1 = __importDefault(require("fs"));
const accesoCarpetas_1 = require("../../libs/accesoCarpetas");
class LoginControlador {
    // METODO PARA VALIDAR DATOS DE ACCESO AL SISTEMA     **USADO
    ValidarCredenciales(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            // VARIABLE USADO PARA BUSQUEDA DE LICENCIA
            let caducidad_licencia = new Date();
            // OBTENCION DE DIRECCION IP
            var requestIp = require('request-ip');
            var clientIp = requestIp.getClientIp(req);
            if (clientIp != null && clientIp != '' && clientIp != undefined) {
                var ip_cliente = clientIp.split(':')[3];
            }
            try {
                const { nombre_usuario, pass } = req.body;
                //console.log('req body ', req.body)
                // BUSQUEDA DE USUARIO
                const USUARIO = yield database_1.default.query(`
        SELECT id, usuario, id_rol, id_empleado FROM accesoUsuarios($1, $2)
        `, [nombre_usuario, pass]);
                // SI EXISTE USUARIOS
                if (USUARIO.rowCount != 0) {
                    const { id, id_empleado, id_rol, usuario: user } = USUARIO.rows[0];
                    let ACTIVO = yield database_1.default.query(
                    //FIXME
                    `
          SELECT e.estado AS empleado, u.estado AS usuario, e.codigo, e.web_access, e.nombre, e.apellido, e.cedula
          FROM eu_empleados AS e, eu_usuarios AS u WHERE e.id = u.id_empleado AND u.id = $1
          `, [USUARIO.rows[0].id])
                        .then((result) => {
                        return result.rows;
                    });
                    const { empleado, usuario, codigo, web_access, nombre, apellido, cedula } = ACTIVO[0];
                    // SI EL USUARIO NO SE ENCUENTRA ACTIVO
                    if (empleado === 2 && usuario === false) {
                        return res.jsonp({ message: 'inactivo' });
                    }
                    // SI LOS USUARIOS NO TIENEN PERMISO DE ACCESO
                    if (!web_access)
                        return res.status(404).jsonp({ message: "sin_permiso_acceso" });
                    // BUSQUEDA DE MODULOS DEL SISTEMA
                    const [modulos] = yield database_1.default.query(`
          SELECT * FROM e_funciones LIMIT 1
          `).then((result) => { return result.rows; });
                    // BUSQUEDA DE CLAVE DE LICENCIA
                    //FIXME
                    const EMPRESA = yield database_1.default.query(`
          SELECT public_key, id AS id_empresa, ruc FROM e_empresa
          `);
                    const { public_key, id_empresa, ruc } = EMPRESA.rows[0];
                    // BUSQUEDA DE LICENCIA DE USO DE APLICACION
                    let archivo_licencia = (0, accesoCarpetas_1.ObtenerRutaLicencia)();
                    //console.log('licencia ', archivo_licencia)
                    const data = fs_1.default.readFileSync(archivo_licencia, 'utf8');
                    const FileLicencias = JSON.parse(data);
                    const ok_licencias = FileLicencias.filter((o) => {
                        return o.public_key === public_key;
                    }).map((o) => {
                        o.fec_activacion = new Date(o.fec_activacion),
                            o.fec_desactivacion = new Date(o.fec_desactivacion);
                        return o;
                    });
                    if (ok_licencias.length === 0)
                        return res.status(404)
                            .jsonp({ message: 'licencia_no_existe' });
                    const hoy = new Date();
                    const { fec_activacion, fec_desactivacion } = ok_licencias[0];
                    if (hoy > fec_desactivacion)
                        return res.status(404).jsonp({ message: 'licencia_expirada' });
                    if (hoy < fec_activacion)
                        return res.status(404).jsonp({ message: 'licencia_expirada' });
                    caducidad_licencia = fec_desactivacion;
                    // BUSQUEDA DE INFORMACION
                    const INFORMACION = yield database_1.default.query(`
          SELECT cv.id_contrato, cv.id_cargo, cv.id_departamento, d.nombre AS ndepartamento, ec.hora_trabaja,
            d.id_sucursal, s.id_empresa, e.acciones_timbres, e.public_key
          FROM contrato_cargo_vigente AS cv, ed_departamentos AS d, e_sucursales AS s, e_empresa AS e,
            eu_empleado_cargos AS ec
          WHERE cv.id_empleado = $1 AND d.id = cv.id_departamento AND s.id = d.id_sucursal AND ec.id = cv.id_cargo
          `, [USUARIO.rows[0].id_empleado]);
                    // VALIDACION DE ACCESO CON LICENCIA 
                    if (INFORMACION.rowCount != 0) {
                        const { id_contrato, id_cargo, id_departamento, acciones_timbres, id_sucursal, id_empresa, public_key: licencia } = INFORMACION.rows[0];
                        const token = jsonwebtoken_1.default.sign({
                            _licencia: licencia, codigo: codigo, _id: id, _id_empleado: id_empleado, rol: id_rol,
                            _dep: id_departamento, _web_access: web_access, _acc_tim: acciones_timbres, _suc: id_sucursal,
                            _empresa: id_empresa, cargo: id_cargo, ip_adress: ip_cliente, modulos: modulos,
                            id_contrato: id_contrato
                        }, process.env.TOKEN_SECRET || 'llaveSecreta', { expiresIn: 60 * 60 * 23, algorithm: 'HS512' });
                        return res.status(200).jsonp({
                            caducidad_licencia, token, usuario: user, rol: id_rol, empleado: id_empleado,
                            departamento: id_departamento, acciones_timbres: acciones_timbres, sucursal: id_sucursal,
                            empresa: id_empresa, cargo: id_cargo, ip_adress: ip_cliente, modulos: modulos,
                            id_contrato: id_contrato, nombre: nombre, apellido: apellido, cedula: cedula, codigo: codigo, ruc: ruc, version: '4.0.0'
                        });
                    }
                    else {
                        // VALIDAR SI EL USUARIO QUE ACCEDE ES ADMINISTRADOR
                        if (id_rol === 1) {
                            const token = jsonwebtoken_1.default.sign({
                                _licencia: public_key, codigo: codigo, _id: id, _id_empleado: id_empleado, rol: id_rol,
                                _web_access: web_access, _empresa: id_empresa, ip_adress: ip_cliente, modulos: modulos
                            }, process.env.TOKEN_SECRET || 'llaveSecreta', { expiresIn: 60 * 60 * 23, algorithm: 'HS512' });
                            return res.status(200).jsonp({
                                caducidad_licencia, token, usuario: user, rol: id_rol, empleado: id_empleado,
                                empresa: id_empresa, ip_adress: ip_cliente, modulos: modulos
                            });
                        }
                        else {
                            return res.jsonp({ message: 'error_' });
                        }
                    }
                }
                else {
                    return res.jsonp({ message: 'error' });
                }
            }
            catch (error) {
                return res.jsonp({ message: 'error', text: ip_cliente });
            }
        });
    }
    // METODO PARA CAMBIAR CONTRASEÑA - ENVIO DE CORREO    **USADO
    EnviarCorreoContrasena(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const correo = req.body.correo;
            const url_page = req.body.url_page;
            var tiempo = (0, settingsMail_1.fechaHora)();
            var fecha = yield (0, settingsMail_1.FormatearFecha)(tiempo.fecha_formato, settingsMail_1.dia_completo);
            var hora = yield (0, settingsMail_1.FormatearHora)(tiempo.hora);
            const path_folder = path_1.default.resolve('logos');
            const correoValido = yield database_1.default.query(`
      SELECT e.id, e.nombre, e.apellido, e.correo, u.usuario, u.contrasena 
      FROM eu_empleados AS e, eu_usuarios AS u 
      WHERE e.correo = $1 AND u.id_empleado = e.id
      `, [correo]);
            if (correoValido.rows[0] == undefined)
                return res.status(401).send('Correo de usuario no válido.');
            var datos = yield (0, settingsMail_1.Credenciales)(1);
            if (datos === 'ok') {
                const token = jsonwebtoken_1.default.sign({ _id: correoValido.rows[0].id }, process.env.TOKEN_SECRET_MAIL || 'llaveEmail', { expiresIn: 60 * 5, algorithm: 'HS512' });
                var url = url_page + '/confirmar-contrasenia';
                let data = {
                    to: correoValido.rows[0].correo,
                    from: settingsMail_1.email,
                    subject: 'FULLTIME CAMBIO DE CONTRASEÑA',
                    html: `
          <body>
            <div style="text-align: center;">
               <img width="100%" height="100%" src="cid:cabeceraf"/>
            </div>
            <br>
            <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;">
              El presente correo es para informar que se ha enviado un link para cambiar su contraseña. <br>  
            </p>
            <h3 style="font-family: Arial; text-align: center;">DATOS DEL SOLICITANTE</h3>
            <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;">
              <b>Empresa:</b> ${settingsMail_1.nombre} <br>   
              <b>Asunto:</b> CAMBIAR CONTRASEÑA DE ACCESO <br> 
              <b>Colaborador que envía:</b> ${correoValido.rows[0].nombre} ${correoValido.rows[0].apellido} <br>
              <b>Generado mediante:</b> Aplicación Web <br>
              <b>Fecha de envío:</b> ${fecha} <br> 
              <b>Hora de envío:</b> ${hora} <br><br> 
            </p>
              <h3 style="font-family: Arial; text-align: center;">CAMBIAR CONTRASEÑA DE USUARIO</h3>
            <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;">
              <b>Ingrese al siguiente link y registre una nueva contraseña.</b> <br>   
              <a href="${url}/${token}">${url}/${token}</a>  
            </p>
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
                            path: `${path_folder}/${settingsMail_1.cabecera_firma}`,
                            cid: 'cabeceraf' // COLOCAR EL MISMO cid EN LA ETIQUETA html img src QUE CORRESPONDA
                        },
                        {
                            filename: 'pie_firma.jpg',
                            path: `${path_folder}/${settingsMail_1.pie_firma}`,
                            cid: 'pief' //COLOCAR EL MISMO cid EN LA ETIQUETA html img src QUE CORRESPONDA
                        }
                    ]
                };
                var corr = (0, settingsMail_1.enviarMail)(settingsMail_1.servidor, parseInt(settingsMail_1.puerto));
                corr.sendMail(data, function (error, info) {
                    if (error) {
                        console.log('Email error: ' + error);
                        corr.close();
                        return res.jsonp({ message: 'error' });
                    }
                    else {
                        console.log('Email sent: ' + info.response);
                        corr.close();
                        return res.jsonp({ message: 'ok' });
                    }
                });
            }
            else {
                res.jsonp({ message: 'Ups!!! algo salio mal. No fue posible enviar correo electrónico.' });
            }
        });
    }
    // METODO PARA CAMBIAR CONTRASEÑA
    CambiarContrasenia(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let { token, contrasena, user_name, ip } = req.body;
            try {
                const payload = jsonwebtoken_1.default.verify(token, process.env.TOKEN_SECRET_MAIL || 'llaveEmail');
                const id_empleado = payload._id;
                try {
                    // INICIAR TRANSACCION
                    yield database_1.default.query('BEGIN');
                    // OBTENER DATOSORIGINALES
                    const datosOriginales = yield database_1.default.query(`
          SELECT contrasena FROM eu_usuarios WHERE id_empleado = $1
          `, [id_empleado]);
                    const [contrasenaOriginal] = datosOriginales.rows;
                    if (!contrasenaOriginal) {
                        yield auditoriaControlador_1.default.InsertarAuditoria({
                            tabla: 'eu_usuarios',
                            usuario: user_name,
                            accion: 'U',
                            datosOriginales: '',
                            datosNuevos: '',
                            ip,
                            observacion: `Error al cambiar la contraseña del usuario con id ${id_empleado}`
                        });
                        // FINALIZAR TRANSACCION
                        yield database_1.default.query('COMMIT');
                        return res.status(404).jsonp({ message: 'error' });
                    }
                    yield database_1.default.query(`
          UPDATE eu_usuarios SET contrasena = $2 WHERE id_empleado = $1
          `, [id_empleado, contrasena]);
                    // AUDITORIA
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'eu_usuarios',
                        usuario: user_name,
                        accion: 'U',
                        datosOriginales: JSON.stringify(contrasenaOriginal),
                        datosNuevos: `{"contrasena": "${contrasena}"}`,
                        ip,
                        observacion: null
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                }
                catch (error) {
                    // ROLLBACK
                    yield database_1.default.query('ROLLBACK');
                    return res.status(500).jsonp({ message: 'error' });
                }
                return res.jsonp({
                    expiro: 'no',
                    message: "Contraseña actualizada. Intente ingresar con la nueva contraseña."
                });
            }
            catch (error) {
                return res.jsonp({
                    expiro: 'si',
                    message: "Tiempo para cambiar contraseña ha expirado. Vuelva a solicitar cambio de contraseña."
                });
            }
        });
    }
}
const LOGIN_CONTROLADOR = new LoginControlador();
exports.default = LOGIN_CONTROLADOR;
