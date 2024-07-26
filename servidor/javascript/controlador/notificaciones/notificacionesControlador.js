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
exports.NOTIFICACION_TIEMPO_REAL_CONTROLADOR = void 0;
const settingsMail_1 = require("../../libs/settingsMail");
const auditoriaControlador_1 = __importDefault(require("../auditoria/auditoriaControlador"));
const database_1 = __importDefault(require("../../database"));
const path_1 = __importDefault(require("path"));
class NotificacionTiempoRealControlador {
    // METODO PARA ELIMINAR NOTIFICACIONES DE PERMISOS - VACACIONES - HORAS EXTRAS  --**VERIFICACION
    EliminarMultiplesNotificaciones(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { arregloNotificaciones, user_name, ip } = req.body;
            let contador = 0;
            if (arregloNotificaciones.length > 0) {
                contador = 0;
                arregloNotificaciones.forEach((obj) => __awaiter(this, void 0, void 0, function* () {
                    try {
                        // INICIAR TRANSACCION
                        yield database_1.default.query('BEGIN');
                        // OBTENER DATOSORIGINALES
                        const consulta = yield database_1.default.query('SELECT * FROM ecm_realtime_notificacion WHERE id = $1', [obj]);
                        const [datosOriginales] = consulta.rows;
                        if (!datosOriginales) {
                            yield auditoriaControlador_1.default.InsertarAuditoria({
                                tabla: 'ecm_realtime_notificacion',
                                usuario: user_name,
                                accion: 'D',
                                datosOriginales: '',
                                datosNuevos: '',
                                ip,
                                observacion: `Error al eliminar el registro con id ${obj}. No existe el registro en la base de datos.`
                            });
                            // FINALIZAR TRANSACCION
                            yield database_1.default.query('COMMIT');
                            return res.status(404).jsonp({ message: 'Registro no encontrado.' });
                        }
                        yield database_1.default.query(`
            DELETE FROM ecm_realtime_notificacion WHERE id = $1
            `, [obj])
                            .then((result) => {
                            contador = contador + 1;
                            console.log(result.command, 'REALTIME ELIMINADO ====>', obj);
                        });
                        // AUDITORIA
                        yield auditoriaControlador_1.default.InsertarAuditoria({
                            tabla: 'ecm_realtime_notificacion',
                            usuario: user_name,
                            accion: 'D',
                            datosOriginales: JSON.stringify(datosOriginales),
                            datosNuevos: '',
                            ip,
                            observacion: null
                        });
                        // FINALIZAR TRANSACCION
                        yield database_1.default.query('COMMIT');
                    }
                    catch (error) {
                        // ROEVERTIR TRANSACCION
                        yield database_1.default.query('ROLLBACK');
                        return res.status(500).jsonp({ message: 'Error al eliminar el registro.' });
                    }
                }));
                return res.jsonp({ message: 'OK' });
            }
            else {
                return res.jsonp({ message: 'error' });
            }
        });
    }
    // METODO PARA LISTAR CONFIGURACION DE RECEPCION DE NOTIFICACIONES
    ObtenerConfigEmpleado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id_empleado = req.params.id;
            if (id_empleado != 'NaN') {
                const CONFIG_NOTI = yield database_1.default.query(`
        SELECT * FROM eu_configurar_alertas WHERE id_empleado = $1
        `, [id_empleado]);
                if (CONFIG_NOTI.rowCount != 0) {
                    return res.jsonp(CONFIG_NOTI.rows);
                }
                else {
                    return res.status(404).jsonp({ text: 'Registro no encontrados.' });
                }
            }
            else {
                res.status(404).jsonp({ text: 'Sin registros encontrados.' });
            }
        });
    }
    // METODO PARA CREAR NOTIFICACIONES
    CrearNotificacion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                var tiempo = (0, settingsMail_1.fechaHora)();
                const { id_send_empl, id_receives_empl, id_receives_depa, estado, id_permiso, id_vacaciones, id_hora_extra, mensaje, tipo, user_name, ip } = req.body;
                let create_at = tiempo.fecha_formato + ' ' + tiempo.hora;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                const response = yield database_1.default.query(`
        INSERT INTO ecm_realtime_notificacion (id_empleado_envia, id_empleado_recibe, id_departamento_recibe, estado, 
          fecha_hora, id_permiso, id_vacaciones, id_hora_extra, mensaje, tipo) 
        VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10 ) RETURNING * 
        `, [id_send_empl, id_receives_empl, id_receives_depa, estado, create_at, id_permiso, id_vacaciones,
                    id_hora_extra, mensaje, tipo]);
                const [notificiacion] = response.rows;
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'ecm_realtime_notificacion',
                    usuario: user_name,
                    accion: 'I',
                    datosOriginales: '',
                    datosNuevos: JSON.stringify(notificiacion),
                    ip,
                    observacion: null
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                if (!notificiacion)
                    return res.status(400).jsonp({ message: 'Notificación no ingresada.' });
                const USUARIO = yield database_1.default.query(`
        SELECT (nombre || ' ' || apellido) AS usuario
        FROM eu_empleados WHERE id = $1
        `, [id_send_empl]);
                notificiacion.usuario = USUARIO.rows[0].usuario;
                return res.status(200)
                    .jsonp({ message: 'Se ha enviado la respectiva notificación.', respuesta: notificiacion });
            }
            catch (error) {
                // REVERTIR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                return res.status(500)
                    .jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
            }
        });
    }
    ListaNotificacionesRecibidas(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id_receive;
            const REAL_TIME_NOTIFICACION = yield database_1.default.query(`
      SELECT r.id, r.id_empleado_envia, r.id_empleado_recibe, r.id_departamento_recibe, r.estado, r.fecha_hora, 
        r.id_permiso, r.id_vacaciones, r.id_hora_extra, r.visto, r.mensaje, e.nombre, e.apellido 
      FROM ecm_realtime_notificacion AS r, eu_empleados AS e 
      WHERE r.id_empleado_recibe = $1 AND e.id = r.id_empleado_envia 
      ORDER BY id DESC
      `, [id])
                .then((result) => {
                return result.rows.map((obj) => {
                    console.log(obj);
                    return {
                        id: obj.id,
                        id_send_empl: obj.id_empleado_envia,
                        id_receives_empl: obj.id_empleado_recibe,
                        id_receives_depa: obj.id_departamento_recibe,
                        estado: obj.estado,
                        create_at: obj.fecha_hora,
                        id_permiso: obj.id_permiso,
                        id_vacaciones: obj.id_vacaciones,
                        id_hora_extra: obj.id_hora_extra,
                        visto: obj.visto,
                        mensaje: obj.mensaje,
                        empleado: obj.nombre + ' ' + obj.apellido
                    };
                });
            });
            if (REAL_TIME_NOTIFICACION.length > 0) {
                return res.jsonp(REAL_TIME_NOTIFICACION);
            }
            else {
                return res.status(404).jsonp({ text: 'Registro no encontrado' });
            }
        });
    }
    ActualizarVista(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                const { visto, user_name, ip } = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                // OBTENER DATOSORIGINALES
                const consulta = yield database_1.default.query('SELECT * FROM ecm_realtime_notificacion WHERE id = $1', [id]);
                const [datosOriginales] = consulta.rows;
                if (!datosOriginales) {
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'ecm_realtime_notificacion',
                        usuario: user_name,
                        accion: 'U',
                        datosOriginales: '',
                        datosNuevos: '',
                        ip,
                        observacion: `Error al modificar el registro con id ${id}. Registro no encontrado.`
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    return res.status(404).jsonp({ message: 'Registro no encontrado.' });
                }
                yield database_1.default.query(`
        UPDATE ecm_realtime_notificacion SET visto = $1 WHERE id = $2
        `, [visto, id]);
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'ecm_realtime_notificacion',
                    usuario: user_name,
                    accion: 'U',
                    datosOriginales: JSON.stringify(datosOriginales),
                    datosNuevos: `{"visto": "${visto}"}`,
                    ip,
                    observacion: null
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                return res.jsonp({ message: 'Vista modificado' });
            }
            catch (error) {
                // REVERTIR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                return res.status(500).jsonp({ message: 'Error al modificar el registro.' });
            }
        });
    }
    /** *********************************************************************************************** **
     **                         METODOS PARA LA TABLA DE CONFIGURAR_ALERTAS                                    **
     ** *********************************************************************************************** **/
    // METODO PARA REGISTRAR CONFIGURACIÓN DE RECEPCIÓN DE NOTIFICACIONES
    CrearConfiguracion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id_empleado, vaca_mail, vaca_noti, permiso_mail, permiso_noti, hora_extra_mail, hora_extra_noti, comida_mail, comida_noti, comunicado_mail, comunicado_noti, user_name, ip } = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                const response = yield database_1.default.query(`
        INSERT INTO eu_configurar_alertas (id_empleado, vacacion_mail, vacacion_notificacion, permiso_mail,
          permiso_notificacion, hora_extra_mail, hora_extra_notificacion, comida_mail, comida_notificacion, comunicado_mail,
        comunicado_notificacion)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *
        `, [id_empleado, vaca_mail, vaca_noti,
                    permiso_mail, permiso_noti, hora_extra_mail, hora_extra_noti, comida_mail, comida_noti,
                    comunicado_mail, comunicado_noti]);
                const [datosNuevos] = response.rows;
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'eu_configurar_alertas',
                    usuario: user_name,
                    accion: 'I',
                    datosOriginales: '',
                    datosNuevos: JSON.stringify(datosNuevos),
                    ip,
                    observacion: null
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                res.jsonp({ message: 'Configuracion guardada' });
            }
            catch (error) {
                // REVERTIR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                res.status(500).jsonp({ message: 'Error al guardar la configuración.' });
            }
        });
    }
    // METODO PARA ACTUALIZAR CONFIGURACIÓN DE RECEPCIÓN DE NOTIFICACIONES
    ActualizarConfigEmpleado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { vaca_mail, vaca_noti, permiso_mail, permiso_noti, hora_extra_mail, hora_extra_noti, comida_mail, comida_noti, comunicado_mail, comunicado_noti, user_name, ip } = req.body;
                const id_empleado = req.params.id;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                // OBTENER DATOSORIGINALES
                const consulta = yield database_1.default.query('SELECT * FROM eu_configurar_alertas WHERE id_empleado = $1', [id_empleado]);
                const [datosOriginales] = consulta.rows;
                if (!datosOriginales) {
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'eu_configurar_alertas',
                        usuario: user_name,
                        accion: 'U',
                        datosOriginales: '',
                        datosNuevos: '',
                        ip,
                        observacion: `Error al modificar el registro con id ${id_empleado}. Registro no encontrado.`
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    return res.status(404).jsonp({ message: 'Registro no encontrado.' });
                }
                const actualizacion = yield database_1.default.query(`
        UPDATE eu_configurar_alertas SET vacacion_mail = $1, vacacion_notificacion = $2, permiso_mail = $3,
          permiso_notificacion = $4, hora_extra_mail = $5, hora_extra_notificacion = $6, comida_mail = $7, 
          comida_notificacion = $8, comunicado_mail = $9, comunicado_notificacion = $10 
        WHERE id_empleado = $11 RETURNING *
        `, [vaca_mail, vaca_noti, permiso_mail, permiso_noti, hora_extra_mail, hora_extra_noti,
                    comida_mail, comida_noti, comunicado_mail, comunicado_noti, id_empleado]);
                const [datosNuevos] = actualizacion.rows;
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'eu_configurar_alertas',
                    usuario: user_name,
                    accion: 'U',
                    datosOriginales: JSON.stringify(datosOriginales),
                    datosNuevos: JSON.stringify(datosNuevos),
                    ip,
                    observacion: null
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                return res.jsonp({ message: 'Configuración actualizada.' });
            }
            catch (error) {
                // REVERTIR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                return res.status(500).jsonp({ message: 'Error al modificar el registro.' });
            }
        });
    }
    /** ******************************************************************************************** **
     ** **                               CONSULTAS DE NOTIFICACIONES                              ** **
     ** ******************************************************************************************** **/
    ListarNotificacionUsuario(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id_receive;
            if (id != 'NaN') {
                const REAL_TIME_NOTIFICACION = yield database_1.default.query(`
        SELECT r.id, r.id_empleado_envia, r.id_empleado_recibe, r.id_departamento_recibe, r.estado, 
          to_char(r.fecha_hora, 'yyyy-MM-dd HH:mi:ss') AS fecha_hora, r.id_permiso, r.id_vacaciones, 
          r.id_hora_extra, r.visto, r.mensaje, r.tipo, e.nombre, e.apellido 
        FROM ecm_realtime_notificacion AS r, eu_empleados AS e 
        WHERE r.id_empleado_recibe = $1 AND e.id = r.id_empleado_envia 
        ORDER BY (visto is FALSE) DESC, id DESC LIMIT 20
        `, [id]);
                if (REAL_TIME_NOTIFICACION.rowCount != 0) {
                    return res.jsonp(REAL_TIME_NOTIFICACION.rows);
                }
                else {
                    return res.status(404).jsonp({ text: 'Registro no encontrado' });
                }
            }
            else {
                return res.status(404).jsonp({ message: 'sin registros' });
            }
        });
    }
    // METODO DE BUSQUEDA DE UNA NOTIFICACION ESPECIFICA
    ObtenerUnaNotificacion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            const REAL_TIME_NOTIFICACION_VACACIONES = yield database_1.default.query(`
      SELECT r.id, r.id_empleado_envia, r.id_empleado_recibe, r.id_departamento_recibe, r.estado, 
        r.fecha_hora, r.id_permiso, r.id_vacaciones, r.tipo, r.id_hora_extra, r.visto, 
        r.mensaje, e.nombre, e.apellido 
      FROM ecm_realtime_notificacion AS r, eu_empleados AS e 
      WHERE r.id = $1 AND e.id = r.id_empleado_envia
      `, [id]);
            if (REAL_TIME_NOTIFICACION_VACACIONES.rowCount != 0) {
                return res.jsonp(REAL_TIME_NOTIFICACION_VACACIONES.rows[0]);
            }
            else {
                return res.status(404).jsonp({ text: 'Registro no encontrado' });
            }
        });
    }
    /** ******************************************************************************************** **
     ** **                      METODOS PARA ENVIOS DE COMUNICADOS                                ** **
     ** ******************************************************************************************** **/
    // METODO PARA ENVÍO DE CORREO ELECTRÓNICO DE COMUNICADOS MEDIANTE APLICACIÓN MÓVIL  -- verificar si se requiere estado
    EnviarCorreoComunicadoMovil(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var tiempo = (0, settingsMail_1.fechaHora)();
            var fecha = yield (0, settingsMail_1.FormatearFecha)(tiempo.fecha_formato, settingsMail_1.dia_completo);
            var hora = yield (0, settingsMail_1.FormatearHora)(tiempo.hora);
            const path_folder = path_1.default.resolve('logos');
            var datos = yield (0, settingsMail_1.Credenciales)(parseInt(req.params.id_empresa));
            const { id_envia, correo, mensaje, asunto } = req.body;
            if (datos === 'ok') {
                const USUARIO_ENVIA = yield database_1.default.query(`
        SELECT e.id, e.correo, e.nombre, e.apellido, e.cedula,
          e.name_cargo AS cargo, e.name_dep AS departamento
        FROM informacion_general AS e
        WHERE e.id = $1
        `, [id_envia]);
                let data = {
                    to: correo,
                    from: settingsMail_1.email,
                    subject: asunto,
                    html: `
          <body>
            <div style="text-align: center;">
              <img width="100%" height="100%" src="cid:cabeceraf"/>
            </div>
            <br>
            <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;">
              El presente correo es para informar el siguiente comunicado: <br>  
            </p>
            <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;" >
              <b>Empresa:</b> ${settingsMail_1.nombre}<br>
              <b>Asunto:</b> ${asunto} <br>
              <b>Colaborador que envía:</b> ${USUARIO_ENVIA.rows[0].nombre} ${USUARIO_ENVIA.rows[0].apellido} <br>
              <b>Cargo:</b> ${USUARIO_ENVIA.rows[0].cargo} <br>
              <b>Departamento:</b> ${USUARIO_ENVIA.rows[0].departamento} <br>
              <b>Generado mediante:</b> Aplicación Móvil <br>
              <b>Fecha de envío:</b> ${fecha} <br> 
              <b>Hora de envío:</b> ${hora} <br><br>                   
              <b>Mensaje:</b> ${mensaje} <br><br>
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
                            cid: 'cabeceraf' // VALOR cid COLOCARSE IGUAL EN LA ETIQUETA img src DEL HTML.
                        },
                        {
                            filename: 'pie_firma.jpg',
                            path: `${path_folder}/${settingsMail_1.pie_firma}`,
                            cid: 'pief' // VALOR cid COLOCARSE IGUAL EN LA ETIQUETA img src DEL HTML.
                        }
                    ]
                };
                var corr = (0, settingsMail_1.enviarMail)(settingsMail_1.servidor, parseInt(settingsMail_1.puerto));
                corr.sendMail(data, function (error, info) {
                    if (error) {
                        corr.close();
                        console.log('Email error: ' + error);
                        return res.jsonp({ message: 'error' });
                    }
                    else {
                        corr.close();
                        console.log('Email sent: ' + info.response);
                        return res.jsonp({ message: 'ok' });
                    }
                });
            }
            else {
                res.jsonp({ message: 'Ups! algo salio mal. No fue posible enviar correo electrónico.' });
            }
        });
    }
    /** ***************************************************************************************** **
     ** **                          MANEJO DE COMUNICADOS                                      ** **
     ** ***************************************************************************************** **/
    // METODO PARA ENVIO DE CORREO ELECTRONICO DE COMUNICADOS MEDIANTE SISTEMA WEB  -- verificar si se requiere estado
    EnviarCorreoComunicado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var tiempo = (0, settingsMail_1.fechaHora)();
            var fecha = yield (0, settingsMail_1.FormatearFecha)(tiempo.fecha_formato, settingsMail_1.dia_completo);
            var hora = yield (0, settingsMail_1.FormatearHora)(tiempo.hora);
            const path_folder = path_1.default.resolve('logos');
            var datos = yield (0, settingsMail_1.Credenciales)(req.id_empresa);
            const { id_envia, correo, mensaje, asunto } = req.body;
            if (datos === 'ok') {
                const USUARIO_ENVIA = yield database_1.default.query(`
        SELECT e.id, e.correo, e.nombre, e.apellido, e.cedula,
          e.name_cargo AS cargo, e.name_dep AS departamento 
        FROM informacion_general AS e
        WHERE e.id = $1
        `, [id_envia]);
                let data = {
                    to: correo,
                    from: settingsMail_1.email,
                    subject: asunto,
                    html: `
          <body>
            <div style="text-align: center;">
              <img width="100%" height="100%" src="cid:cabeceraf"/>
            </div>
            <br>
            <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;">
              El presente correo es para informar el siguiente comunicado: <br>  
            </p>
            <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;" >
              <b>Empresa:</b> ${settingsMail_1.nombre}<br>
              <b>Asunto:</b> ${asunto} <br>
              <b>Colaborador que envía:</b> ${USUARIO_ENVIA.rows[0].nombre} ${USUARIO_ENVIA.rows[0].apellido} <br>
              <b>Cargo:</b> ${USUARIO_ENVIA.rows[0].cargo} <br>
              <b>Departamento:</b> ${USUARIO_ENVIA.rows[0].departamento} <br>
              <b>Generado mediante:</b> Aplicación Web <br>
              <b>Fecha de envío:</b> ${fecha} <br> 
              <b>Hora de envío:</b> ${hora} <br><br>                  
              <b>Mensaje:</b> ${mensaje} <br><br>
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
                            cid: 'cabeceraf' // VALOR cid COLOCARSE IGUAL EN LA ETIQUETA img src DEL HTML.
                        },
                        {
                            filename: 'pie_firma.jpg',
                            path: `${path_folder}/${settingsMail_1.pie_firma}`,
                            cid: 'pief' // VALOR cid COLOCARSE IGUAL EN LA ETIQUETA img src DEL HTML.
                        }
                    ]
                };
                var corr = (0, settingsMail_1.enviarMail)(settingsMail_1.servidor, parseInt(settingsMail_1.puerto));
                corr.sendMail(data, function (error, info) {
                    if (error) {
                        console.log('error: ', error);
                        corr.close();
                        return res.jsonp({ message: 'error' });
                    }
                    else {
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
    // NOTIFICACIONES GENERALES
    EnviarNotificacionGeneral(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let { id_empl_envia, id_empl_recive, mensaje, tipo, user_name, ip, descripcion } = req.body;
                var tiempo = (0, settingsMail_1.fechaHora)();
                let create_at = tiempo.fecha_formato + ' ' + tiempo.hora;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                const response = yield database_1.default.query(`
        INSERT INTO ecm_realtime_timbres (fecha_hora, id_empleado_envia, id_empleado_recibe, descripcion, tipo, mensaje) 
        VALUES($1, $2, $3, $4, $5, $6) RETURNING *
        `, [create_at, id_empl_envia, id_empl_recive, descripcion, tipo, mensaje]);
                const [notificiacion] = response.rows;
                const fechaHoraN = yield (0, settingsMail_1.FormatearHora)(create_at.split(' ')[1]);
                const fechaN = yield (0, settingsMail_1.FormatearFecha2)(create_at, 'ddd');
                notificiacion.fecha_hora = `${fechaN} ${fechaHoraN}`;
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'ecm_realtime_timbres',
                    usuario: user_name,
                    accion: 'I',
                    datosOriginales: '',
                    datosNuevos: JSON.stringify(notificiacion),
                    ip,
                    observacion: null
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                if (!notificiacion)
                    return res.status(400).jsonp({ message: 'Notificación no ingresada.' });
                const USUARIO = yield database_1.default.query(`
        SELECT (nombre || ' ' || apellido) AS usuario
        FROM eu_empleados WHERE id = $1
        `, [id_empl_envia]);
                notificiacion.usuario = USUARIO.rows[0].usuario;
                return res.status(200)
                    .jsonp({ message: 'Comunicado enviado exitosamente.', respuesta: notificiacion });
            }
            catch (error) {
                // REVERTIR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                return res.status(500)
                    .jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
            }
        });
    }
    /** ***************************************************************************************** **
     ** **                      MANEJO DE ENVIO DE CORREOS DE SOLICITUDES                      ** **
     ** ***************************************************************************************** **/
    // METODO PARA ENVIO DE CORREO ELECTRONICO DE COMUNICADOS MEDIANTE SISTEMA WEB -- veriifcar si se requiere estado
    EnviarCorreoSolicitudes(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var tablaHTML = '';
            var tiempo = (0, settingsMail_1.fechaHora)();
            var fecha = yield (0, settingsMail_1.FormatearFecha)(tiempo.fecha_formato, settingsMail_1.dia_completo);
            var hora = yield (0, settingsMail_1.FormatearHora)(tiempo.hora);
            var dispositivo = '';
            const path_folder = path_1.default.resolve('logos');
            const { id_envia, correo, mensaje, asunto } = req.body.datosCorreo;
            const solicitudes = req.body.solicitudes;
            console.log('req.body.movil: ', req.body.movil);
            if (req.body.movil === true) {
                dispositivo = 'Aprobado desde aplicación móvil';
                var datos = yield (0, settingsMail_1.Credenciales)(req.body.id_empresa);
                tablaHTML = yield generarTablaHTMLMovil(solicitudes);
            }
            else {
                dispositivo = 'Aprobado desde la aplicacion web';
                var datos = yield (0, settingsMail_1.Credenciales)(req.id_empresa);
                tablaHTML = yield generarTablaHTMLWeb(solicitudes);
            }
            if (datos === 'ok') {
                const USUARIO_ENVIA = yield database_1.default.query(`
        SELECT e.id, e.correo, e.nombre, e.apellido, e.cedula,
          e.name_cargo AS cargo, e.name_dep AS departamento 
        FROM informacion_general AS e
        WHERE e.id = $1 
        `, [id_envia]);
                let data = {
                    to: correo,
                    from: settingsMail_1.email,
                    subject: asunto,
                    html: `
          <body>
            <div style="text-align: center;">
              <img width="100%" height="100%" src="cid:cabeceraf"/>
            </div>
            <br>
            <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;">
              El presente correo es para informar el siguiente comunicado: <br>  
            </p>
            <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;" >
              <b>Empresa:</b> ${settingsMail_1.nombre}<br>
              <b>Asunto:</b> ${asunto} <br>
              <b>Colaborador que envía:</b> ${USUARIO_ENVIA.rows[0].nombre} ${USUARIO_ENVIA.rows[0].apellido} <br>
              <b>Cargo:</b> ${USUARIO_ENVIA.rows[0].cargo} <br>
              <b>Departamento:</b> ${USUARIO_ENVIA.rows[0].departamento} <br>
              <b>Generado mediante:</b> Aplicación Web <br>
              <b>Fecha de envío:</b> ${fecha} <br> 
              <b>Hora de envío:</b> ${hora} <br><br>                  
              <b>Mensaje:</b> ${dispositivo} 
            </p>
            <div style="font-family: Arial; font-size:15px; margin: auto; text-align: center;">
              <p><b>LISTADO DE PERMISOS</b></p>
              ${tablaHTML}
              <br><br>
            </div>
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
                            cid: 'cabeceraf' // VALOR cid COLOCARSE IGUAL EN LA ETIQUETA img src DEL HTML.
                        },
                        {
                            filename: 'pie_firma.jpg',
                            path: `${path_folder}/${settingsMail_1.pie_firma}`,
                            cid: 'pief' // VALOR cid COLOCARSE IGUAL EN LA ETIQUETA img src DEL HTML.
                        }
                    ]
                };
                var corr = (0, settingsMail_1.enviarMail)(settingsMail_1.servidor, parseInt(settingsMail_1.puerto));
                corr.sendMail(data, function (error, info) {
                    if (error) {
                        corr.close();
                        return res.jsonp({ message: 'error' });
                    }
                    else {
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
}
const generarTablaHTMLWeb = function (datos) {
    return __awaiter(this, void 0, void 0, function* () {
        let tablaHtml = "<table style='border-collapse: collapse; width: 100%;'>";
        tablaHtml += "<tr style='background-color: #f2f2f2; text-align: center; font-size: 14px;'>";
        tablaHtml += "<th scope='col'>Permiso</th><th scope='col'>Departamento</th><th scope='col'>Empleado</th><th scope='col'>Aprobado</th><th scope='col'>Estado</th><th scope='col'>Observación</th>";
        tablaHtml += "</tr>";
        for (const dato of datos) {
            let colorText = "black";
            if (dato.aprobar === "SI") {
                colorText = "green";
            }
            else if (dato.aprobar === "NO") {
                colorText = "red";
            }
            tablaHtml += "<tr style='text-align: center; font-size: 14px;'>";
            tablaHtml += `<td style='border: 1px solid #ddd; padding: 8px;'>${dato.id}</td>`;
            tablaHtml += `<td style='border: 1px solid #ddd; padding: 8px;'>${dato.nombre_depa}</td>`;
            tablaHtml += `<td style='border: 1px solid #ddd; padding: 8px;'>${dato.empleado}</td>`;
            tablaHtml += `<td style='border: 1px solid #ddd; padding: 8px; color: ${colorText};'>${dato.aprobar}</td>`;
            tablaHtml += `<td style='border: 1px solid #ddd; padding: 8px;'>${dato.estado}</td>`;
            tablaHtml += `<td style='border: 1px solid #ddd; padding: 8px;'>${dato.observacion}</td>`;
            tablaHtml += "<tr>";
        }
        tablaHtml += "</table>";
        return tablaHtml;
    });
};
const generarTablaHTMLMovil = function (datos) {
    return __awaiter(this, void 0, void 0, function* () {
        let tablaHtml = "<table style='border-collapse: collapse; width: 100%;'>";
        tablaHtml += "<tr style='background-color: #f2f2f2; text-align: center; font-size: 14px;'>";
        tablaHtml += "<th scope='col'>Permiso</th><th scope='col'>Departamento</th><th scope='col'>Empleado</th><th scope='col'>Aprobado</th><th scope='col'>Estado</th><th scope='col'>Observación</th>";
        tablaHtml += "</tr>";
        for (const dato of datos) {
            let colorText = "black";
            if (dato.aprobacion === "SI") {
                colorText = "green";
            }
            else if (dato.aprobacion === "NO") {
                colorText = "red";
            }
            tablaHtml += "<tr style='text-align: center; font-size: 14px;'>";
            tablaHtml += `<td style='border: 1px solid #ddd; padding: 8px;'>${dato.id}</td>`;
            tablaHtml += `<td style='border: 1px solid #ddd; padding: 8px;'>${dato.nombre_depa}</td>`;
            tablaHtml += `<td style='border: 1px solid #ddd; padding: 8px;'>${dato.nempleado}</td>`;
            tablaHtml += `<td style='border: 1px solid #ddd; padding: 8px; color: ${colorText};'>${dato.aprobacion}</td>`;
            tablaHtml += `<td style='border: 1px solid #ddd; padding: 8px;'>${dato.estado}</td>`;
            tablaHtml += `<td style='border: 1px solid #ddd; padding: 8px;'>${dato.observacion}</td>`;
            tablaHtml += "<tr>";
        }
        tablaHtml += "</table>";
        return tablaHtml;
    });
};
exports.NOTIFICACION_TIEMPO_REAL_CONTROLADOR = new NotificacionTiempoRealControlador();
exports.default = exports.NOTIFICACION_TIEMPO_REAL_CONTROLADOR;
