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
exports.timbresControlador = void 0;
const auditoriaControlador_1 = __importDefault(require("../auditoria/auditoriaControlador"));
const settingsMail_1 = require("../../libs/settingsMail");
const moment_1 = __importDefault(require("moment"));
const database_1 = __importDefault(require("../../database"));
class TimbresControlador {
    // ELIMINAR NOTIFICACIONES TABLA DE AVISOS --**VERIFICADO
    EliminarMultiplesAvisos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { arregloAvisos, user_name, ip } = req.body;
                let contador = 0;
                if (arregloAvisos.length > 0) {
                    contador = 0;
                    arregloAvisos.forEach((obj) => __awaiter(this, void 0, void 0, function* () {
                        // INICIAR TRANSACCION
                        yield database_1.default.query('BEGIN');
                        // CONSULTAR DATOSORIGINALES
                        const consulta = yield database_1.default.query('SELECT * FROM ecm_realtime_timbres WHERE id = $1', [obj]);
                        const [datosOriginales] = consulta.rows;
                        if (!datosOriginales) {
                            yield auditoriaControlador_1.default.InsertarAuditoria({
                                tabla: 'ecm_realtime_timbres',
                                usuario: user_name,
                                accion: 'D',
                                datosOriginales: '',
                                datosNuevos: '',
                                ip,
                                observacion: `Error al eliminar el registro con id ${obj}. Registro no encontrado.`
                            });
                            //FINALIZAR TRANSACCION
                            yield database_1.default.query('COMMIT');
                            return res.status(404).jsonp({ message: 'Registro no encontrado.' });
                        }
                        yield database_1.default.query(`
                        DELETE FROM ecm_realtime_timbres WHERE id = $1
                        `, [obj])
                            .then((result) => __awaiter(this, void 0, void 0, function* () {
                            contador = contador + 1;
                            // AUDITORIA
                            yield auditoriaControlador_1.default.InsertarAuditoria({
                                tabla: 'ecm_realtime_timbres',
                                usuario: user_name,
                                accion: 'D',
                                datosOriginales: JSON.stringify(datosOriginales),
                                datosNuevos: '',
                                ip,
                                observacion: null
                            });
                            //FINALIZAR TRANSACCION
                            yield database_1.default.query('COMMIT');
                            if (contador === arregloAvisos.length) {
                                return res.jsonp({ message: 'OK' });
                            }
                            console.log(result.command, 'REALTIME ELIMINADO ====>', obj);
                        }));
                    }));
                }
                else {
                    return res.jsonp({ message: 'error' });
                }
            }
            catch (error) {
                // REVERTIR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                return res.status(500).jsonp({ message: 'error' });
            }
        });
    }
    // METODO PARA LISTAR MARCACIONES    **USADO
    ObtenerTimbres(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.userIdEmpleado;
                let timbres = yield database_1.default.query(`
                SELECT CAST(t.fecha_hora_timbre AS VARCHAR), t.accion, t.tecla_funcion, t.observacion, 
                    t.latitud, t.longitud, t.codigo, t.id_reloj, ubicacion, 
                    CAST(fecha_hora_timbre_servidor AS VARCHAR), dispositivo_timbre 
                FROM eu_empleados AS e, eu_timbres AS t 
                WHERE e.id = $1 AND e.codigo = t.codigo 
                ORDER BY t.fecha_hora_timbre DESC LIMIT 100
                `, [id]).then((result) => {
                    return result.rows
                        .map((obj) => {
                        switch (obj.accion) {
                            case 'EoS':
                                obj.accion = 'Entrada o salida';
                                break;
                            case 'AES':
                                obj.accion = 'Inicio o fin alimentación';
                                break;
                            case 'PES':
                                obj.accion = 'Inicio o fin permiso';
                                break;
                            case 'E':
                                obj.accion = 'Entrada';
                                break;
                            case 'S':
                                obj.accion = 'Salida';
                                break;
                            case 'I/A':
                                obj.accion = 'Inicio alimentación';
                                break;
                            case 'F/A':
                                obj.accion = 'Fin alimentación';
                                break;
                            case 'I/P':
                                obj.accion = 'Inicio permiso';
                                break;
                            case 'F/P':
                                obj.accion = 'Fin permiso';
                                break;
                            case 'HA':
                                obj.accion = 'Timbre libre';
                                break;
                            default:
                                obj.accion = 'Desconocido';
                                break;
                        }
                        return obj;
                    });
                });
                if (timbres.length === 0)
                    return res.status(400).jsonp({ message: 'Ups!!! no existen registros.' });
                let estado_cuenta = [{
                        timbres_PES: yield database_1.default.query(`
                    SELECT count(*) 
                    FROM eu_empleados AS e, eu_timbres AS t 
                    WHERE e.id = $1 AND e.codigo = t.codigo 
                        AND t.accion in (\'PES\', \'E/P\', \'S/P\')
                    `, [id]).then((result) => { return result.rows[0].count; }),
                        timbres_AES: yield database_1.default.query(`
                    SELECT count(*) 
                    FROM eu_empleados AS e, eu_timbres AS t 
                    WHERE e.id = $1 AND e.codigo = t.codigo 
                    AND t.accion in (\'AES\', \'E/A\', \'S/A\')
                    `, [id]).then((result) => { return result.rows[0].count; }),
                        timbres_EoS: yield database_1.default.query(`
                    SELECT count(*) 
                    FROM eu_empleados AS e, eu_timbres AS t 
                    WHERE e.id = $1 AND e.codigo = t.codigo 
                        AND t.accion in (\'EoS\', \'E\', \'S\')
                    `, [id]).then((result) => { return result.rows[0].count; }),
                        total_timbres: yield database_1.default.query(`
                    SELECT count(*) 
                    FROM eu_empleados AS e, eu_timbres AS t 
                    WHERE e.id = $1 AND e.codigo = t.codigo
                    `, [id]).then((result) => { return result.rows[0].count; })
                    }];
                return res.status(200).jsonp({
                    timbres: timbres,
                    cuenta: estado_cuenta,
                    info: yield database_1.default.query(`
                    SELECT ec.sueldo, tc.cargo, ec.hora_trabaja, cg.nombre AS departamento
                    FROM eu_empleado_cargos AS ec, e_cat_tipo_cargo AS tc, ed_departamentos AS cg
                    WHERE ec.id = (SELECT id_cargo FROM contrato_cargo_vigente WHERE id_empleado = $1)
                        AND tc.id = ec.id_tipo_cargo AND cg.id = ec.id_departamento
                    `, [id]).then((result) => {
                        return result.rows;
                    }),
                });
            }
            catch (error) {
                res.status(400).jsonp({ message: error });
            }
        });
    }
    // METODO PARA BUSCAR EL TIMBRE DEL EMPLEADO POR FECHA     **USADO
    ObtenertimbreFechaEmple(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let { codigo, cedula, fecha } = req.query;
                fecha = fecha + '%';
                if (codigo === '') {
                    let usuario = yield database_1.default.query(`
                    SELECT * FROM informacion_general    
                    WHERE cedula = $1
                    `, [cedula]).then((result) => {
                        return result.rows.map((obj) => {
                            codigo = obj.codigo;
                        });
                    });
                }
                else if (cedula === '') {
                    let usuario = yield database_1.default.query(`
                    SELECT * FROM informacion_general 
                    WHERE codigo = $1
                    `, [codigo]).then((result) => {
                        return result.rows.map((obj) => {
                            cedula = obj.cedula;
                        });
                    });
                }
                let timbresRows = 0;
                let timbres = yield database_1.default.query(`
                SELECT (da.nombre || ' ' || da.apellido) AS empleado, da.id AS id_empleado, CAST(t.fecha_hora_timbre AS VARCHAR), t.accion, 
                    t.tecla_funcion, t.observacion, t.latitud, t.longitud, t.codigo, t.id_reloj, ubicacion, 
                    CAST(fecha_hora_timbre_servidor AS VARCHAR), dispositivo_timbre, t.id 
                FROM eu_timbres AS t, informacion_general AS da
                WHERE t.codigo = $1 
                    AND CAST(t.fecha_hora_timbre AS VARCHAR) LIKE $2
                    AND da.codigo = t.codigo 
                    AND da.cedula = $3
                `, [codigo, fecha, cedula]).then((result) => {
                    timbresRows = result.rowCount;
                    if (result.rowCount != 0) {
                        return res.status(200).jsonp({ message: 'timbres encontrados', timbres: result.rows });
                    }
                });
                if (timbresRows == 0) {
                    return res.status(400).jsonp({ message: "No se encontraron registros." });
                }
            }
            catch (err) {
                const message = 'Ups!!! problemas con la petición al servidor.';
                return res.status(500).jsonp({ error: err, message: message });
            }
        });
    }
    // METODO PARA ACTUALIZAR O EDITAR EL TIMBRE DEL EMPLEADO   **USADO
    EditarTimbreEmpleadoFecha(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let { id, codigo, tecla, observacion, fecha } = req.body;
                yield database_1.default.query(`
                SELECT * FROM modificartimbre ($1::timestamp without time zone, $2::character varying, 
                    $3::character varying, $4::integer, $5::character varying) 
                `, [fecha, codigo, tecla, id, observacion])
                    .then((result) => {
                    return res.status(200).jsonp({ message: 'Registro actualizado.' });
                });
            }
            catch (err) {
                console.log('timbre error ', err);
                const message = 'Ups!!! algo salio mal con la peticion al servidor.';
                return res.status(500).jsonp({ error: err, message: message });
            }
        });
    }
    // METODO DE REGISTRO DE TIMBRES PERSONALES    **USADO
    CrearTimbreWeb(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { fec_hora_timbre, accion, tecl_funcion, observacion, latitud, longitud, id_reloj, ubicacion, user_name, ip } = req.body;
                // OBTENER LA FECHA Y HORA ACTUAL
                var now = (0, moment_1.default)();
                // FORMATEAR LA FECHA Y HORA ACTUAL EN EL FORMATO DESEADO
                var fecha_hora = now.format('DD/MM/YYYY, h:mm:ss a');
                // FORMATEAR HORA Y FECHA DEL TIMBRE
                var hora_fecha_timbre = (0, moment_1.default)(fec_hora_timbre).format('DD/MM/YYYY, h:mm:ss a');
                const id_empleado = req.userIdEmpleado;
                let code = yield database_1.default.query(`
                SELECT codigo FROM eu_empleados WHERE id = $1
                `, [id_empleado]).then((result) => { return result.rows; });
                if (code.length === 0)
                    return { mensaje: 'El usuario no tiene un código asignado.' };
                var codigo = parseInt(code[0].codigo);
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                database_1.default.query(`
                SELECT * FROM public.timbres_web ($1, $2, $3, 
                    to_timestamp($4, 'DD/MM/YYYY, HH:MI:SS pm')::timestamp without time zone, $5, $6, $7, $8, $9, $10)
                `, [codigo, id_reloj, hora_fecha_timbre, fecha_hora, accion, tecl_funcion, latitud, longitud,
                    observacion, 'APP_WEB'], (error, results) => __awaiter(this, void 0, void 0, function* () {
                    const fechaHora = yield (0, settingsMail_1.FormatearHora)(fec_hora_timbre.split('T')[1]);
                    const fechaTimbre = yield (0, settingsMail_1.FormatearFecha)(fec_hora_timbre.toLocaleString(), 'ddd');
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'eu_timbres',
                        usuario: user_name,
                        accion: 'I',
                        datosOriginales: '',
                        datosNuevos: `{fecha_hora_timbre: ${fechaTimbre + ' ' + fechaHora}, accion: ${accion}, tecla_funcion: ${tecl_funcion}, observacion: ${observacion}, latitud: ${latitud}, longitud: ${longitud}, codigo: ${codigo}, fecha_hora_timbre_servidor: ${fecha_hora}, id_reloj: ${id_reloj}, ubicacion: ${ubicacion}, dispositivo_timbre: 'APP_WEB'}`,
                        ip,
                        observacion: null
                    });
                    //FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    res.status(200).jsonp({ message: 'Registro guardado.' });
                }));
            }
            catch (error) {
                // REVERTIR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                res.status(500).jsonp({ message: error });
            }
        });
    }
    // METODO PARA REGISTRAR TIMBRES ADMINISTRADOR    **USADO
    CrearTimbreWebAdmin(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { fec_hora_timbre, accion, tecl_funcion, observacion, latitud, longitud, id_empleado, id_reloj, tipo, ip, user_name } = req.body;
                console.log('datos ', req.body);
                var hora_fecha_timbre = (0, moment_1.default)(fec_hora_timbre).format('DD/MM/YYYY, h:mm:ss a');
                // OBTENER LA FECHA Y HORA ACTUAL
                var now = (0, moment_1.default)();
                // FORMATEAR LA FECHA Y HORA ACTUAL EN EL FORMATO DESEADO
                var fecha_hora = now.format('DD/MM/YYYY, h:mm:ss a');
                let servidor;
                if (tipo === 'administrar') {
                    servidor = hora_fecha_timbre;
                }
                else {
                    servidor = fecha_hora;
                }
                let code = yield database_1.default.query(`
                SELECT codigo FROM eu_empleados WHERE id = $1
                `, [id_empleado]).then((result) => { return result.rows; });
                if (code.length === 0)
                    return { mensaje: 'El usuario no tiene un código asignado.' };
                var codigo = code[0].codigo;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                yield database_1.default.query(`
                SELECT * FROM public.timbres_web ($1, $2, $3, 
                    to_timestamp($4, 'DD/MM/YYYY, HH:MI:SS pm')::timestamp without time zone, $5, $6, $7, $8, $9, $10)
                `, [codigo, id_reloj, hora_fecha_timbre, servidor, accion, tecl_funcion, latitud, longitud,
                    observacion, 'APP_WEB'], (error, results) => __awaiter(this, void 0, void 0, function* () {
                    const fechaHora = yield (0, settingsMail_1.FormatearHora)(fec_hora_timbre.split('T')[1]);
                    const fechaTimbre = yield (0, settingsMail_1.FormatearFecha2)(fec_hora_timbre, 'ddd');
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'eu_timbres',
                        usuario: user_name,
                        accion: 'I',
                        datosOriginales: '',
                        datosNuevos: `{fecha_hora_timbre: ${fechaTimbre + ' ' + fechaHora}, accion: ${accion}, tecla_funcion: ${tecl_funcion}, observacion: ${observacion}, latitud: ${latitud}, longitud: ${longitud}, codigo: ${codigo}, id_reloj: ${id_reloj}, dispositivo_timbre: 'APP_WEB', fecha_hora_timbre_servidor: ${servidor}}`,
                        ip,
                        observacion: null
                    });
                    yield database_1.default.query('COMMIT');
                    res.status(200).jsonp({ message: 'Registro guardado.' });
                }));
            }
            catch (error) {
                // REVERTIR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                res.status(500).jsonp({ message: error });
            }
        });
    }
    // METODO PARA BUSCAR TIMBRES   **USADO
    BuscarTimbresPlanificacion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { codigo, fec_inicio, fec_final } = req.body;
            const TIMBRES = yield database_1.default.query("SELECT * FROM eu_timbres " +
                "WHERE fecha_hora_timbre_servidor BETWEEN $1 AND $2 " +
                "AND codigo IN (" + codigo + ") " +
                "ORDER BY codigo, fecha_hora_timbre_servidor ASC", [fec_inicio, fec_final]);
            if (TIMBRES.rowCount === 0) {
                return res.status(404).jsonp({ message: 'vacio' });
            }
            else {
                var contador = 0;
                TIMBRES.rows.forEach((obj) => __awaiter(this, void 0, void 0, function* () {
                    contador = contador + 1;
                    yield database_1.default.query(`
                    SELECT * FROM modificartimbre ($1::timestamp without time zone, $2::character varying, 
                            $3::character varying, $4::integer, $5::character varying)  
                    `, [obj.fecha_hora_timbre_servidor, obj.codigo, obj.tecla_funcion, obj.id, obj.observacion]);
                }));
                if (contador === TIMBRES.rowCount) {
                    return res.jsonp({ message: 'OK', respuesta: TIMBRES.rows });
                }
                else {
                    return res.status(404).jsonp({ message: 'error' });
                }
            }
        });
    }
    // METODO DE BUSQUEDA DE AVISOS GENERALES POR EMPLEADO
    ObtenerAvisosColaborador(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_empleado } = req.params;
            const TIMBRES_NOTIFICACION = yield database_1.default.query(`
            SELECT id, to_char(fecha_hora, 'yyyy-MM-dd HH24:mi:ss') AS fecha_hora, id_empleado_envia, visto, 
                descripcion, mensaje, id_timbre, tipo, id_empleado_recibe
            FROM ecm_realtime_timbres WHERE id_empleado_recibe = $1 
            ORDER BY (visto is FALSE) DESC, id DESC LIMIT 20
            `, [id_empleado])
                .then((result) => __awaiter(this, void 0, void 0, function* () {
                if (result.rowCount != 0) {
                    return yield Promise.all(result.rows.map((obj) => __awaiter(this, void 0, void 0, function* () {
                        let nombre = yield database_1.default.query(`
                            SELECT nombre, apellido FROM eu_empleados WHERE id = $1
                            `, [obj.id_empleado_envia]).then((ele) => {
                            return ele.rows[0].nombre + ' ' + ele.rows[0].apellido;
                        });
                        return {
                            id_receives_empl: obj.id_empleado_recibe,
                            descripcion: obj.descripcion,
                            create_at: obj.fecha_hora,
                            id_timbre: obj.id_timbre,
                            empleado: nombre,
                            mensaje: obj.mensaje,
                            visto: obj.visto,
                            tipo: obj.tipo,
                            id: obj.id,
                        };
                    })));
                }
                return [];
            }));
            if (TIMBRES_NOTIFICACION.length != 0) {
                return res.jsonp(TIMBRES_NOTIFICACION);
            }
            else {
                return res.status(404).jsonp({ message: 'No se encuentran registros.' });
            }
        });
    }
    // METODO DE BUSQUEDA DE UNA NOTIFICACION ESPECIFICA
    ObtenerUnAviso(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            const AVISOS = yield database_1.default.query(`
            SELECT r.id, r.id_empleado_envia, r.id_empleado_recibe, r.fecha_hora, r.tipo, r.visto, 
                r.id_timbre, r.descripcion, (e.nombre || ' ' || e.apellido) AS empleado 
            FROM ecm_realtime_timbres AS r, eu_empleados AS e 
            WHERE r.id = $1 AND e.id = r.id_empleado_envia
            `, [id]);
            if (AVISOS.rowCount != 0) {
                return res.jsonp(AVISOS.rows[0]);
            }
            else {
                return res.status(404).jsonp({ text: 'Registro no encontrado.' });
            }
        });
    }
    ObtenerAvisosTimbresEmpleado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_empleado } = req.params;
            console.log(id_empleado);
            const TIMBRES_NOTIFICACION = yield database_1.default.query(`
            SELECT * FROM ecm_realtime_timbres WHERE id_empleado_recibe = $1 
            ORDER BY fecha_hora DESC
            `, [id_empleado])
                .then((result) => { return result.rows; });
            if (TIMBRES_NOTIFICACION.length === 0)
                return res.status(404).jsonp({ message: 'No se encuentran registros.' });
            console.log(TIMBRES_NOTIFICACION);
            const tim = yield Promise.all(TIMBRES_NOTIFICACION.map((obj) => __awaiter(this, void 0, void 0, function* () {
                let [empleado] = yield database_1.default.query(`
                SELECT  (nombre || \' \' || apellido) AS fullname FROM eu_empleados WHERE id = $1
                `, [obj.id_empleado_envia]).then((ele) => {
                    console.log('¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨', ele.rows);
                    return ele.rows;
                });
                const fullname = (empleado === undefined) ? '' : empleado.fullname;
                return {
                    create_at: obj.fecha_hora,
                    descripcion: obj.descripcion,
                    visto: obj.visto,
                    id_timbre: obj.id_timbre,
                    empleado: fullname,
                    id: obj.id
                };
            })));
            console.log(tim);
            if (tim.length > 0) {
                return res.jsonp(tim);
            }
        });
    }
    ActualizarVista(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id_noti_timbre;
                const { visto, user_name, ip } = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                // CONSULTAR DATOSORIGINALES
                const consulta = yield database_1.default.query('SELECT * FROM ecm_realtime_timbres WHERE id = $1', [id]);
                const [datosOriginales] = consulta.rows;
                if (!datosOriginales) {
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'ecm_realtime_timbres',
                        usuario: user_name,
                        accion: 'U',
                        datosOriginales: '',
                        datosNuevos: '',
                        ip,
                        observacion: `Error al actualizar el registro con id ${id}. Registro no encontrado.`
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    return res.status(404).jsonp({ message: 'Registro no encontrado.' });
                }
                yield database_1.default.query(`
                UPDATE ecm_realtime_timbres SET visto = $1 WHERE id = $2
                `, [visto, id]);
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'ecm_realtime_timbres',
                    usuario: user_name,
                    accion: 'U',
                    datosOriginales: JSON.stringify(datosOriginales),
                    datosNuevos: `{visto: ${visto}}`,
                    ip,
                    observacion: null
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                return res.status(200).jsonp({ message: 'Vista actualizada' });
            }
            catch (error) {
                // REVERTIR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                return res.status(500).jsonp({ message: 'Error al actualizar la vista.' });
            }
        });
    }
    // METODO PARA BUSCAR TIMBRES DEL USUARIO   **USAD
    ObtenerTimbresEmpleado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                let timbres = yield database_1.default.query(`
                SELECT CAST(t.fecha_hora_timbre AS VARCHAR), t.accion, t.tecla_funcion, 
                    t.observacion, t.latitud, t.longitud, t.codigo, t.id_reloj 
                FROM eu_empleados AS e, eu_timbres AS t 
                WHERE e.id = $1 AND e.codigo = t.codigo 
                ORDER BY t.fecha_hora_timbre DESC LIMIT 50
                `, [id]).then((result) => {
                    return result.rows
                        .map((obj) => {
                        switch (obj.accion) {
                            case 'EoS':
                                obj.accion = 'Entrada o salida';
                                break;
                            case 'AES':
                                obj.accion = ' Inicio o fin alimentación';
                                break;
                            case 'PES':
                                obj.accion = 'Inicio o fin permiso';
                                break;
                            case 'E':
                                obj.accion = 'Entrada';
                                break;
                            case 'S':
                                obj.accion = 'Salida';
                                break;
                            case 'I/A':
                                obj.accion = 'Inicio alimentación';
                                break;
                            case 'F/A':
                                obj.accion = 'Fin alimentación';
                                break;
                            case 'I/P':
                                obj.accion = 'Inicio permiso';
                                break;
                            case 'F/P':
                                obj.accion = 'Fin permiso';
                                break;
                            case 'HA':
                                obj.accion = 'Timbre libre';
                                break;
                            default:
                                obj.accion = 'Desconocido';
                                break;
                        }
                        return obj;
                    });
                });
                if (timbres.length === 0)
                    return res.status(400).jsonp({ message: 'No se encontraron registros.' });
                return res.status(200).jsonp({
                    timbres: timbres,
                });
            }
            catch (error) {
                res.status(400).jsonp({ message: error });
            }
        });
    }
    // METODO PARA BUSCAR TIMBRES (ASISTENCIA)    **USADO
    BuscarTimbresAsistencia(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { fecha, funcion, codigo } = req.body;
            const TIMBRE = yield database_1.default.query(`
            SELECT t.*, t.fecha_hora_timbre_servidor::date AS t_fec_timbre, 
                t.fecha_hora_timbre_servidor::time AS t_hora_timbre 
            FROM eu_timbres AS t
            WHERE codigo = $1 AND fecha_hora_timbre_servidor::date = $2 AND tecla_funcion = $3 
            ORDER BY t.fecha_hora_timbre_servidor ASC;
            `, [codigo, fecha, funcion]);
            if (TIMBRE.rowCount != 0) {
                return res.jsonp({ message: 'OK', respuesta: TIMBRE.rows });
            }
            else {
                return res.status(404).jsonp({ message: 'vacio' });
            }
        });
    }
    //------------------------ METODOS PARA APP MOVIL ---------------------------------------------------------------
    crearTimbre(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const hoy = new Date();
                const timbre = req.body;
                yield database_1.default.query('BEGIN');
                // Verificar el contenido de req.body
                console.log('Contenido de req.body:', timbre);
                timbre.fecha_hora_timbre_servidor = hoy.getFullYear() + "-" + (hoy.getMonth() + 1) + "-" + hoy.getDate() + " " + hoy.getHours() + ":" + hoy.getMinutes() + ":" + hoy.getSeconds();
                const timbreRV = new Date(timbre.fecha_hora_timbre || '');
                const restaTimbresHoras = timbreRV.getHours() - hoy.getHours();
                const restaTimbresMinutos = timbreRV.getMinutes() - hoy.getMinutes();
                const restaTimbresDias = timbreRV.getDate() - hoy.getDate();
                if (restaTimbresDias != 0 || restaTimbresHoras != 0 || restaTimbresMinutos > 3 || restaTimbresMinutos < -3) {
                    if (restaTimbresHoras == 1 && restaTimbresMinutos > 58 && restaTimbresMinutos < -58) {
                        timbre.hora_timbre_diferente = false;
                    }
                    else if (restaTimbresDias == 1 && restaTimbresHoras == 23 || restaTimbresHoras == -23 && restaTimbresMinutos > 58 && restaTimbresMinutos < -58) {
                        timbre.hora_timbre_diferente = false;
                    }
                    else {
                        timbre.hora_timbre_diferente = true;
                    }
                }
                else {
                    timbre.hora_timbre_diferente = false;
                }
                // Verificar el valor de timbre.accion antes de la consulta
                console.log('Valor de timbre.accion:', timbre.accion);
                const response = yield database_1.default.query('INSERT INTO eu_timbres (fecha_hora_timbre, accion, tecla_funcion, ' +
                    'observacion, latitud, longitud, codigo, id_reloj, tipo_autenticacion, ' +
                    'dispositivo_timbre, fecha_hora_timbre_servidor, hora_timbre_diferente, ubicacion, conexion, fecha_subida_servidor, novedades_conexion, imagen) ' +
                    'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17);', [timbre.fecha_hora_timbre, timbre.accion, timbre.tecla_funcion, timbre.observacion,
                    timbre.latitud, timbre.longitud, timbre.codigo, timbre.id_reloj,
                    timbre.tipo_autenticacion, timbre.dispositivo_timbre, timbre.fecha_hora_timbre_servidor,
                    timbre.hora_timbre_diferente, timbre.ubicacion, timbre.conexion, timbre.fecha_subida_servidor, timbre.novedades_conexion, timbre.imagen]);
                const fechaHora = yield (0, settingsMail_1.FormatearHora)(timbre.fecha_hora_timbre.toLocaleString().split(' ')[1]);
                const fechaTimbre = yield (0, settingsMail_1.FormatearFecha2)(timbre.fecha_hora_timbre.toLocaleString(), 'ddd');
                const fechaHoraServidor = yield (0, settingsMail_1.FormatearHora)(timbre.fecha_hora_timbre_servidor.toLocaleString().split(' ')[1]);
                const fechaTimbreServidor = yield (0, settingsMail_1.FormatearFecha2)(timbre.fecha_hora_timbre_servidor.toLocaleString(), 'ddd');
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'eu_timbres',
                    usuario: timbre.user_name,
                    accion: 'I',
                    datosOriginales: '',
                    datosNuevos: `{fecha_hora_timbre: ${fechaTimbre + ' ' + fechaHora}, accion: ${timbre.accion}, tecla_funcion: ${timbre.tecla_funcion}, observacion: ${timbre.observacion}, latitud: ${timbre.latitud}, longitud: ${timbre.longitud}, codigo: ${timbre.codigo}, fecha_hora_timbre_servidor: ${fechaTimbreServidor + ' ' + fechaHoraServidor}, id_reloj: ${timbre.id_reloj}, ubicacion: ${timbre.ubicacion}, dispositivo_timbre: ${timbre.dispositivo_timbre}, imagen: ${timbre.imagen} }`,
                    ip: timbre.ip,
                    observacion: null
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                res.jsonp({
                    message: 'Timbre creado con éxito',
                    respuestaBDD: response
                });
            }
            catch (error) {
                console.log("ver el error", error);
                return res.status(500).jsonp({ message: 'Error al crear Timbre' });
            }
        });
    }
    ;
    crearTimbreDesconectado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const hoy = new Date();
                const timbre = req.body;
                yield database_1.default.query('BEGIN');
                timbre.fecha_subida_servidor = hoy.getFullYear() + "-" + (hoy.getMonth() + 1) + "-" + hoy.getDate() + " " + hoy.getHours() + ":" + hoy.getMinutes() + ":" + hoy.getSeconds();
                const timbreRV = new Date(timbre.fecha_hora_timbre || '');
                const restaTimbresHoras = timbreRV.getHours() - hoy.getHours();
                const restaTimbresMinutos = timbreRV.getMinutes() - hoy.getMinutes();
                const restaTimbresDias = timbreRV.getDate() - hoy.getDate();
                if (restaTimbresDias != 0 || restaTimbresHoras != 0 || restaTimbresMinutos > 3 || restaTimbresMinutos < -3) {
                    if (restaTimbresHoras == 1 && restaTimbresMinutos > 58 && restaTimbresMinutos < -58) {
                        timbre.hora_timbre_diferente = false;
                    }
                    else if (restaTimbresDias == 1 && restaTimbresHoras == 23 || restaTimbresHoras == -23 && restaTimbresMinutos > 58 && restaTimbresMinutos < -58) {
                        timbre.hora_timbre_diferente = false;
                    }
                    else {
                        timbre.hora_timbre_diferente = true;
                    }
                }
                else {
                    timbre.hora_timbre_diferente = false;
                }
                const response = yield database_1.default.query('INSERT INTO eu_timbres (fecha_hora_timbre, accion, tecla_funcion, ' +
                    'observacion, latitud, longitud, codigo, id_reloj, tipo_autenticacion, ' +
                    'dispositivo_timbre, fecha_hora_timbre_servidor, hora_timbre_diferente, ubicacion, conexion, fecha_subida_servidor, novedades_conexion, imagen) ' +
                    'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17);', [timbre.fecha_hora_timbre, 'dd', timbre.tecla_funcion, timbre.observacion,
                    timbre.latitud, timbre.longitud, timbre.codigo, timbre.id_reloj,
                    timbre.tipo_autenticacion, timbre.dispositivo_timbre, timbre.fecha_hora_timbre_servidor,
                    timbre.hora_timbre_diferente, timbre.ubicacion, timbre.conexion, timbre.fecha_subida_servidor, timbre.novedades_conexion, timbre.imagen]);
                const fechaHora = yield (0, settingsMail_1.FormatearHora)(timbre.fecha_hora_timbre.toLocaleString().split(' ')[1]);
                const fechaTimbre = yield (0, settingsMail_1.FormatearFecha2)(timbre.fecha_hora_timbre.toLocaleString(), 'ddd');
                // const fechaHoraServidor = await FormatearHora(timbre.fecha_hora_timbre_servidor.toLocaleString().split('T')[1]);
                // const fechaTimbreServidor = await FormatearFecha2(timbre.fecha_hora_timbre_servidor.toLocaleString(), 'ddd');
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'eu_timbres',
                    usuario: timbre.user_name,
                    accion: 'I',
                    datosOriginales: '',
                    datosNuevos: `{fecha_hora_timbre: ${fechaTimbre + ' ' + fechaHora}, accion: ${timbre.accion}, tecla_funcion: ${timbre.tecla_funcion}, observacion: ${timbre.observacion}, latitud: ${timbre.latitud}, longitud: ${timbre.longitud}, codigo: ${timbre.codigo}, fecha_hora_timbre_servidor: '', id_reloj: ${timbre.id_reloj}, ubicacion: ${timbre.ubicacion}, dispositivo_timbre: ${timbre.dispositivo_timbre}, id_empleado: ${timbre.id_empleado}, imagen: ${timbre.imagen} }`,
                    ip: timbre.ip,
                    observacion: null
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                res.jsonp({
                    message: 'Timbre creado con éxito',
                    respuestaBDD: response
                });
            }
            catch (error) {
                console.log(error);
                return res.status(500).jsonp({ message: 'Error al crear Timbre' });
            }
        });
    }
    ;
    crearTimbreJustificadoAdmin(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { fec_hora_timbre, accion, tecl_funcion, observacion, latitud, longitud, codigo, id_reloj, user_name, ip } = req.body;
                console.log(req.body);
                yield database_1.default.query('BEGIN');
                const [timbre] = yield database_1.default.query('INSERT INTO eu_timbres (fecha_hora_timbre, accion, tecla_funcion, observacion, latitud, longitud, codigo, id_reloj) VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id', [fec_hora_timbre, accion, tecl_funcion, observacion, latitud, longitud, codigo, id_reloj])
                    .then(result => {
                    return result.rows;
                });
                const fechaHora = yield (0, settingsMail_1.FormatearHora)(fec_hora_timbre.toLocaleString().split('T')[1]);
                const fechaTimbre = yield (0, settingsMail_1.FormatearFecha2)(fec_hora_timbre.toLocaleString(), 'ddd');
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'eu_timbres',
                    usuario: user_name,
                    accion: 'I',
                    datosOriginales: '',
                    datosNuevos: `{fecha_hora_timbre: ${fechaTimbre + ' ' + fechaHora}, accion: ${accion}, tecla_funcion: ${tecl_funcion}, observacion: ${observacion}, latitud: ${latitud}, longitud: ${longitud}, codigo: ${codigo}, fecha_hora_timbre_servidor:'null', id_reloj: ${id_reloj}, ubicacion: 'null', dispositivo_timbre: 'null }`,
                    ip: ip,
                    observacion: null
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                if (!timbre)
                    return res.status(400).jsonp({ message: "No se inserto timbre" });
                return res.status(200).jsonp({ message: "Timbre Creado exitosamente" });
            }
            catch (error) {
                return res.status(400).jsonp({ message: error });
            }
        });
    }
    FiltrarTimbre(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { fecInicio, fecFinal, codigo } = req.body;
                console.log(req.body);
                const response = yield database_1.default.query('SELECT * FROM eu_timbres WHERE codigo = $3 AND fecha_hora_timbre BETWEEN $1 AND $2 ORDER BY fecha_hora_timbre DESC ', [fecInicio, fecFinal, codigo]);
                const timbres = response.rows;
                return res.jsonp(timbres);
            }
            catch (error) {
                return res.status(400).jsonp({ message: error });
            }
        });
    }
    getTimbreByCodigo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = parseInt(req.params.idUsuario);
                const response = yield database_1.default.query('SELECT * FROM eu_timbres WHERE codigo = $1 ORDER BY fecha_hora_timbre DESC LIMIT 100', [id]);
                const timbres = response.rows;
                return res.jsonp(timbres);
            }
            catch (error) {
                console.log(error);
                return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
            }
        });
    }
    ;
    justificarAtraso(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { descripcion, fec_justifica, codigo, create_time, codigo_create_user, user_name, ip } = req.body;
                yield database_1.default.query('BEGIN');
                const [atraso] = yield database_1.default.query('INSERT INTO eu_empleado_justificacion_atraso(descripcion, fecha_justifica, id_empleado, fecha_hora, id_empleado_justifica) ' +
                    'VALUES($1, $2, $3, $4, $5) RETURNING id', [descripcion, fec_justifica, codigo, create_time, codigo_create_user])
                    .then(res => {
                    return res.rows;
                });
                const fechaHora = yield (0, settingsMail_1.FormatearHora)(create_time.toLocaleString().split('T')[1]);
                const fechaTimbre = yield (0, settingsMail_1.FormatearFecha2)(create_time.toLocaleString(), 'ddd');
                const fechaHoraJustificacion = yield (0, settingsMail_1.FormatearHora)(fec_justifica.toLocaleString().split('T')[1]);
                const fechaTimbreJustificacion = yield (0, settingsMail_1.FormatearFecha2)(fec_justifica.toLocaleString(), 'ddd');
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'eu_empleado_justificacion_atraso',
                    usuario: user_name,
                    accion: 'I',
                    datosOriginales: '',
                    datosNuevos: `{fecha_hora: ${fechaTimbre + ' ' + fechaHora}, fecha_justifica: ${fechaTimbreJustificacion + ' ' + fechaHoraJustificacion}, descripcion: ${descripcion}, id_empleado: ${codigo}, id_empleado_justifica: ${codigo_create_user} }`,
                    ip: ip,
                    observacion: null
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                if (!atraso)
                    return res.status(400).jsonp({ message: "Atraso no insertado" });
                return res.status(200).jsonp({
                    body: {
                        mensaje: "Atraso justificado",
                        response: atraso.rows
                    }
                });
            }
            catch (error) {
                console.log(error);
                return res.status(500).jsonp({ message: 'Error al crear justificación' });
            }
        });
    }
    ;
}
exports.timbresControlador = new TimbresControlador;
exports.default = exports.timbresControlador;
