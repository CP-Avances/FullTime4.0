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
exports.ValidarZonaHoraria = ValidarZonaHoraria;
const auditoriaControlador_1 = __importDefault(require("../reportes/auditoriaControlador"));
const settingsMail_1 = require("../../libs/settingsMail");
const luxon_1 = require("luxon");
const database_1 = __importDefault(require("../../database"));
class TimbresControlador {
    // ELIMINAR NOTIFICACIONES TABLA DE AVISOS --**VERIFICADO
    EliminarMultiplesAvisos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { arregloAvisos, user_name, ip, ip_local } = req.body;
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
                                ip: ip,
                                ip_local: ip_local,
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
                                ip: ip,
                                ip_local: ip_local,
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
                SELECT CAST(t.fecha_hora_timbre_servidor AS VARCHAR), t.accion, t.tecla_funcion, t.observacion, 
                    t.latitud, t.longitud, t.codigo, t.id_reloj, t.ubicacion, t.documento, t.imagen,
                    CAST(t.fecha_hora_timbre AS VARCHAR), dispositivo_timbre, 
                    CAST(t.fecha_hora_timbre_validado AS VARCHAR)
                FROM eu_empleados AS e, eu_timbres AS t 
                WHERE e.id = $1 AND e.codigo = t.codigo 
                ORDER BY t.fecha_hora_timbre_validado DESC LIMIT 100
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
                SELECT (da.nombre || ' ' || da.apellido) AS empleado, da.id AS id_empleado, 
                    CAST(t.fecha_hora_timbre AS VARCHAR), t.accion, 
                    t.tecla_funcion, t.observacion, t.latitud, t.longitud, t.codigo, t.id_reloj, ubicacion, 
                    CAST(fecha_hora_timbre_servidor AS VARCHAR), dispositivo_timbre, t.id,
                    CAST(fecha_hora_timbre_validado AS VARCHAR) 
                FROM eu_timbres AS t, informacion_general AS da
                WHERE t.codigo = $1 
                    AND CAST(t.fecha_hora_timbre_validado AS VARCHAR) LIKE $2
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
                let { id, codigo, tecla, observacion, fecha, user_name, ip, ip_local } = req.body;
                const timbre = yield database_1.default.query(`
                SELECT * FROM eu_timbres WHERE id = $1
                `, [id]);
                const [datosOriginales] = timbre.rows;
                if (!datosOriginales) {
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'eu_timbres',
                        usuario: user_name,
                        accion: 'U',
                        datosOriginales: '',
                        datosNuevos: '',
                        ip: ip,
                        ip_local: ip_local,
                        observacion: `Error al actualizar timbre con id: ${id}`
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    return res.status(404).jsonp({ message: 'Error al actualizar timbre' });
                }
                const fechaHora = yield (0, settingsMail_1.FormatearHora)(datosOriginales.fecha_hora_timbre.toLocaleString().split(' ')[1]);
                const fechaTimbre = yield (0, settingsMail_1.FormatearFecha2)(datosOriginales.fecha_hora_timbre, 'ddd');
                const fechaHoraServidor = yield (0, settingsMail_1.FormatearHora)(datosOriginales.fecha_hora_timbre_servidor.toLocaleString().split(' ')[1]);
                const fechaTimbreServidor = yield (0, settingsMail_1.FormatearFecha2)(datosOriginales.fecha_hora_timbre_servidor, 'ddd');
                const fechaHoraValidado = yield (0, settingsMail_1.FormatearHora)(datosOriginales.fecha_hora_timbre_validado.toLocaleString().split(' ')[1]);
                const fechaTimbreValidado = yield (0, settingsMail_1.FormatearFecha2)(datosOriginales.fecha_hora_timbre_validado, 'ddd');
                const actualizacion = yield database_1.default.query(`
                SELECT * FROM modificartimbre ($1::timestamp without time zone, $2::character varying, 
                    $3::character varying, $4::integer, $5::character varying) 
                `, [fecha, codigo, tecla, id, observacion]);
                const [datosNuevos] = actualizacion.rows;
                let existe_imagen = false;
                if (datosOriginales.imagen) {
                    existe_imagen = true;
                }
                let existe_documento = false;
                if (datosOriginales.documento) {
                    existe_documento = true;
                }
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'eu_timbres',
                    usuario: user_name,
                    accion: 'U',
                    datosOriginales: `{fecha_hora_timbre: ${fechaTimbre + ' ' + fechaHora}, accion: ${datosOriginales.accion}, tecla_funcion: ${datosOriginales.tecla_funcion}, observacion: ${datosOriginales.observacion}, latitud: ${datosOriginales.latitud}, longitud: ${datosOriginales.longitud}, codigo: ${datosOriginales.codigo}, fecha_hora_timbre_servidor: ${fechaTimbreServidor + ' ' + fechaHoraServidor}, fecha_hora_timbre_validado: ${fechaTimbreValidado + ' ' + fechaHoraValidado}, id_reloj: ${datosOriginales.id_reloj}, ubicacion: ${datosOriginales.ubicacion}, dispositivo_timbre: 'APP_WEB', imagen: ${existe_imagen}, documento:${existe_documento} }`,
                    datosNuevos: `{fecha_hora_timbre: ${fechaTimbre + ' ' + fechaHora}, accion: ${datosNuevos.modificartimbre}, tecla_funcion: ${tecla}, observacion: ${observacion}, latitud: ${datosOriginales.latitud}, longitud: ${datosOriginales.longitud}, codigo: ${codigo}, fecha_hora_timbre_servidor: ${fechaTimbreServidor + ' ' + fechaHoraServidor}, fecha_hora_timbre_validado: ${fechaTimbreValidado + ' ' + fechaHoraValidado}, id_reloj: ${datosOriginales.id_reloj}, ubicacion: ${datosOriginales.ubicacion}, dispositivo_timbre: 'APP_WEB', imagen: ${existe_imagen}, documento:${existe_documento}  }`,
                    ip: ip,
                    ip_local: ip_local,
                    observacion: null
                });
                return res.status(200).jsonp({ message: 'Registro actualizado.' });
                /*
                await pool.query(
                    `
                    SELECT * FROM modificartimbre ($1::timestamp without time zone, $2::character varying,
                        $3::character varying, $4::integer, $5::character varying)
                    `
                    , [fecha, codigo, tecla, id, observacion])
                    .then((result: any) => {
                        return res.status(200).jsonp({ message: 'Registro actualizado.' });
                    });
    */
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
                // DOCUMENTO ES NULL YA QUE ESTE USUARIO NO JUSTIFICA UN TIMBRE
                const { fec_hora_timbre, accion, tecl_funcion, observacion, latitud, longitud, id_reloj, ubicacion, user_name, ip, imagen, zona_dispositivo, gmt_dispositivo, capturar_segundos, ip_local } = req.body;
                console.log('datos del timbre ', req.body);
                const id_empleado = req.userIdEmpleado;
                var hora_diferente = false;
                var fecha_validada;
                var zona_servidor = Intl.DateTimeFormat().resolvedOptions().timeZone;
                // OBTENER EL OFFSET GMT EN MINUTOS
                const gmt_minutos = new Date().getTimezoneOffset();
                // CONVERTIR EL OFFSET A HORAS
                const gmt_horas = -gmt_minutos / 60;
                // FORMATEAR COMO GMT
                const gmt_servidor = `GMT${gmt_horas >= 0 ? '+' : ''}${gmt_horas.toString().padStart(2, '0')}`;
                // OBTENER LA FECHA Y HORA ACTUAL DEL SERVIDOR DEL APLICATIVO
                var now = luxon_1.DateTime.now();
                const now_ = new Date();
                // FORMATEAR LA FECHA Y HORA ACTUAL EN EL FORMATO DESEADO
                var fecha_servidor = now.toFormat('dd/MM/yyyy, hh:mm:ss a');
                fecha_validada = now.toFormat('dd/MM/yyyy, hh:mm:ss a');
                // FORMATEAR FECHA Y HORA DEL TIMBRE INGRESADO
                var fecha_timbre = luxon_1.DateTime.fromFormat(fec_hora_timbre, 'dd/MM/yyyy h:mm:ss a').toFormat('yyyy-MM-dd');
                var hora_timbre = luxon_1.DateTime.fromFormat(fec_hora_timbre, 'dd/MM/yyyy h:mm:ss a').toFormat('HH:mm:ss');
                console.log('hora ', hora_timbre);
                // VERIFICAR ZONA HORARIA
                if (zona_dispositivo != zona_servidor) {
                    const convertToTimeZone = (date, timeZone) => {
                        return luxon_1.DateTime.fromJSDate(date).setZone(timeZone).toFormat('yyyy-MM-dd HH:mm:ss');
                    };
                    var fecha_ = convertToTimeZone(now_, zona_dispositivo);
                    fecha_validada = luxon_1.DateTime.fromFormat(fecha_, 'yyyy-MM-dd HH:mm:ss', { zone: zona_dispositivo }).toFormat('dd/MM/yyyy, hh:mm:ss a');
                    var verificar_fecha = luxon_1.DateTime.fromFormat(fecha_validada, 'dd/MM/yyyy, hh:mm:ss a').toFormat('yyyy-MM-dd');
                    hora_diferente = ValidarZonaHoraria(verificar_fecha, fecha_timbre, fecha_validada, fec_hora_timbre);
                }
                else {
                    // FORMATEAR LA FECHA Y HORA ACTUAL EN EL FORMATO DESEADO
                    var verificar_fecha = luxon_1.DateTime.fromFormat(fecha_validada, 'dd/MM/yyyy, hh:mm:ss a').toFormat('yyyy-MM-dd');
                    // VERIFICAR HORAS DEL TIMBRE Y DEL SERVIDOR
                    hora_diferente = ValidarZonaHoraria(verificar_fecha, fecha_timbre, fecha_validada, fec_hora_timbre);
                }
                // METODO PARA VERIFICAR USO DE SEGUNDOS
                var fecha_servidor_final;
                var fecha_validada_final;
                console.log(' hora diferente ', fecha_servidor);
                console.log(' hora diferente ', fecha_validada);
                if (capturar_segundos === false) {
                    fecha_servidor_final = luxon_1.DateTime.fromFormat(fecha_servidor, 'dd/MM/yyyy, hh:mm:ss a')
                        .set({ second: 0 }).toFormat('dd/MM/yyyy, hh:mm:ss a');
                    fecha_validada_final = luxon_1.DateTime.fromFormat(fecha_validada, 'dd/MM/yyyy, hh:mm:ss a')
                        .set({ second: 0 }).toFormat('dd/MM/yyyy, hh:mm:ss a');
                }
                else {
                    fecha_servidor_final = fecha_servidor;
                    fecha_validada_final = fecha_validada;
                }
                console.log(' hora diferente ', hora_diferente);
                let code = yield database_1.default.query(`
                SELECT codigo FROM eu_empleados WHERE id = $1
                `, [id_empleado]).then((result) => { return result.rows; });
                if (code.length === 0)
                    return { mensaje: 'El usuario no tiene un código asignado.' };
                var codigo = parseInt(code[0].codigo);
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                yield database_1.default.query(`
                SELECT * FROM public.timbres_web ($1, $2, 
                    to_timestamp($3, 'DD/MM/YYYY, HH:MI:SS pm')::timestamp without time zone, 
                    to_timestamp($4, 'DD/MM/YYYY, HH:MI:SS pm')::timestamp without time zone, 
                    to_timestamp($5, 'DD/MM/YYYY, HH:MI:SS pm')::timestamp without time zone, 
                    $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
                `, [codigo, id_reloj, fec_hora_timbre, fecha_servidor_final, fecha_validada_final, tecl_funcion, accion,
                    observacion, latitud, longitud, ubicacion, 'APP_WEB', imagen, true, zona_servidor, gmt_servidor,
                    zona_dispositivo, gmt_dispositivo, hora_diferente], (error, results) => __awaiter(this, void 0, void 0, function* () {
                    console.log('error ', error);
                    console.log('result ', results.rows[0].timbres_web);
                    const fechaHora = yield (0, settingsMail_1.FormatearHora)(hora_timbre);
                    const fechaTimbre = yield (0, settingsMail_1.FormatearFecha2)(fecha_timbre, 'ddd');
                    let existe_imagen = false;
                    if (imagen) {
                        existe_imagen = true;
                    }
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'eu_timbres',
                        usuario: user_name,
                        accion: 'I',
                        datosOriginales: '',
                        datosNuevos: `{fecha_hora_timbre: ${fechaTimbre + ' ' + fechaHora}, accion: ${accion}, tecla_funcion: ${tecl_funcion}, observacion: ${observacion}, latitud: ${latitud}, longitud: ${longitud}, codigo: ${codigo}, fecha_hora_timbre_servidor: ${fecha_servidor}, fecha_hora_timbre_validado: ${fecha_validada}, id_reloj: ${id_reloj}, ubicacion: ${ubicacion}, dispositivo_timbre: 'APP_WEB', imagen: ${existe_imagen} }`,
                        ip: ip,
                        ip_local: ip_local,
                        observacion: null
                    });
                    //FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    if (results) {
                        if (results.rows[0].timbres_web === 0) {
                            res.status(200).jsonp({ message: 'Registro duplicado.' });
                        }
                        else {
                            res.status(200).jsonp({ message: 'Registro guardado.' });
                        }
                    }
                    else {
                        res.status(200).jsonp({ message: 'Ups!!! algo salio mal.' });
                    }
                }));
            }
            catch (error) {
                console.log('error 500 ', error);
                // REVERTIR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                res.status(500).jsonp({ message: error });
            }
        });
    }
    CrearTimbreWebAdmin(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield database_1.default.connect(); // Obtener un cliente para la transacción
            try {
                // Datos requeridos para el método
                const { fec_hora_timbre, accion, tecl_funcion, observacion, id_empleado, id_reloj, tipo, ip, user_name, documento, ip_local } = req.body;
                const id_empleados = Array.isArray(id_empleado) ? id_empleado : [id_empleado];
                console.log('req ', req.body);
                const fecha_ = luxon_1.DateTime.fromISO(fec_hora_timbre);
                var hora_fecha_timbre = fecha_.toFormat('dd/MM/yyyy, hh:mm:ss a');
                const fecha_insertar = luxon_1.DateTime.fromISO(fec_hora_timbre);
                const hora_fecha_timbre_insertar = fecha_insertar.toFormat('yyyy-MM-dd HH:mm:ss'); // Formato adecuado para PostgreSQL
                // Obtener códigos de los empleados
                const code = yield client.query(`SELECT codigo FROM eu_empleados WHERE id = ANY($1::int[])`, [id_empleados]);
                if (code.rows.length === 0) {
                    res.status(404).json({ mensaje: 'El usuario no tiene un código asignado.' });
                    return;
                }
                const code_empleados = code.rows.map((empl) => empl.codigo);
                // Iniciar transacción
                yield client.query('BEGIN');
                const timbrePromises = code_empleados.map((codigo) => __awaiter(this, void 0, void 0, function* () {
                    const res = yield client.query(`SELECT   public.timbres_verificar ($1, to_timestamp($2, 'DD/MM/YYYY, HH:MI:SS pm')::timestamp without time zone)  AS resultado`, [codigo, hora_fecha_timbre]);
                    return { codigo, resultado: res.rows[0].resultado }; // Retorna el código y el resultado
                }));
                const timbresResultados = yield Promise.all(timbrePromises); // Espera a que todas las promesas se resuelvan
                // Filtra solo los códigos donde el resultado sea 1
                const filtrados = timbresResultados
                    .filter((timbre) => timbre.resultado === 1)
                    .map((timbre) => timbre.codigo); // Extrae solo los códigos
                //console.log("ver codigos filtrados", filtrados);
                const batchSize = 1000; // Tamaño del lote (ajustable según la capacidad de tu base de datos)
                const batches = [];
                for (let i = 0; i < filtrados.length; i += batchSize) {
                    batches.push(filtrados.slice(i, i + batchSize));
                }
                console.log("ver batches: ", batches);
                for (const batch of batches) {
                    const valores = batch
                        .map((filtrados) => {
                        // Verifica si alguno de los valores es 'undefined' y lo reemplaza por NULL o un valor predeterminado
                        const documentoValue = documento === undefined ? 'NULL' : `'${documento}'`; // Reemplaza undefined por NULL
                        const horaFechaTimbre = `'${hora_fecha_timbre_insertar}'`; // Asegúrate de que la fecha esté en formato correcto
                        return `('${filtrados}', '${id_reloj}', ${horaFechaTimbre}, ${horaFechaTimbre}, '${accion}','${tecl_funcion}' , '${observacion}', 'APP_WEB', ${documentoValue}, true, ${horaFechaTimbre})`;
                    })
                        .join(', ');
                    // Ejecutar la inserción en cada lote
                    yield database_1.default.query(`INSERT INTO eu_timbres (codigo, id_reloj, fecha_hora_timbre, fecha_hora_timbre_servidor, accion, tecla_funcion, 
		                observacion, dispositivo_timbre, documento, conexion, fecha_hora_timbre_validado) 
                    VALUES ${valores}`);
                }
                var fecha = fecha_.toFormat('yyyy-MM-dd');
                var hora = fecha_.toFormat('HH:mm:ss');
                const fechaHora = yield (0, settingsMail_1.FormatearHora)(hora);
                const fechaTimbre = yield (0, settingsMail_1.FormatearFecha2)(fecha, 'ddd');
                let existe_documento = !!documento;
                const auditoria = code_empleados.map((codigo) => ({
                    tabla: 'eu_timbres',
                    usuario: user_name,
                    accion: 'I',
                    datosOriginales: '',
                    datosNuevos: `{fecha_hora_timbre: ${fechaTimbre + ' ' + fechaHora}, accion: ${accion}, tecla_funcion: ${tecl_funcion}, observacion: ${observacion}, codigo: ${codigo}, id_reloj: ${id_reloj}, dispositivo_timbre: 'APP_WEB', fecha_hora_timbre_servidor: ${fechaTimbre + ' ' + fechaHora}, documento: ${existe_documento}, fecha_hora_timbre_validado: ${fechaTimbre + ' ' + fechaHora} }`,
                    ip: ip,
                    ip_local: ip_local,
                    observacion: null
                }));
                yield auditoriaControlador_1.default.InsertarAuditoriaPorLotes(auditoria, user_name, ip, ip_local);
                // Confirmar la transacción
                yield client.query('COMMIT');
                res.status(200).json({ message: 'Registro guardado.' });
            }
            catch (error) {
                console.error('Error durante la transacción:', error);
                // Revertir la transacción en caso de error
                yield client.query('ROLLBACK');
                res.status(500).json({ message: 'Error interno del servidor.' });
            }
            finally {
                client.release(); // Liberar el cliente al final
            }
        });
    }
    // METODO PARA BUSCAR TIMBRES   **USADO
    BuscarTimbresPlanificacion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { codigo, fec_inicio, fec_final } = req.body;
            console.log("ver fec_inicio", fec_inicio);
            console.log("ver fec_final", fec_final);
            const TIMBRES = yield database_1.default.query("SELECT * FROM eu_timbres " +
                "WHERE fecha_hora_timbre_validado BETWEEN $1 AND $2 " +
                "AND codigo IN (" + codigo + ") " +
                "ORDER BY codigo, fecha_hora_timbre_validado ASC", [fec_inicio, fec_final]);
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
                    `, [obj.fecha_hora_timbre_validado, obj.codigo, obj.tecla_funcion, obj.id, obj.observacion]);
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
                const { visto, user_name, ip, ip_local } = req.body;
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
                        ip: ip,
                        ip_local: ip_local,
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
                    ip: ip,
                    ip_local: ip_local,
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
    // METODO PARA BUSCAR TIMBRES DEL USUARIO   **USADO
    ObtenerTimbresEmpleado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                let timbres = yield database_1.default.query(`
                SELECT CAST(t.fecha_hora_timbre AS VARCHAR), t.accion, t.tecla_funcion, 
                    t.observacion, t.latitud, t.longitud, t.codigo, t.id_reloj, t.ubicacion, t.imagen,
                    CAST(t.fecha_hora_timbre_servidor AS VARCHAR), t.documento,
                    CAST(t.fecha_hora_timbre_validado AS VARCHAR)
                FROM eu_empleados AS e, eu_timbres AS t 
                WHERE e.id = $1 AND e.codigo = t.codigo 
                ORDER BY t.fecha_hora_timbre_validado DESC LIMIT 50
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
            SELECT t.*, t.fecha_hora_timbre_validado::date AS t_fec_timbre, 
                t.fecha_hora_timbre_validado::time AS t_hora_timbre 
            FROM eu_timbres AS t
            WHERE codigo = $1 AND fecha_hora_timbre_validado::date = $2 AND tecla_funcion = $3 
            ORDER BY t.fecha_hora_timbre_validado ASC;
            `, [codigo, fecha, funcion]);
            if (TIMBRE.rowCount != 0) {
                return res.jsonp({ message: 'OK', respuesta: TIMBRE.rows });
            }
            else {
                return res.status(404).jsonp({ message: 'vacio' });
            }
        });
    }
    /** ************************************************************************************************* **
     ** **           CONSULTAS DE CONFIGURACION DE OPCIONES DE MARCACIONES APLICACION MOVIL            ** **
     ** ************************************************************************************************* **/
    // METODO PARA ALMACENAR CONFIGURACION DE TIMBRE     **USADO
    IngresarOpcionTimbre(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id_empleado, timbre_internet, timbre_foto, timbre_especial, timbre_ubicacion_desconocida, user_name, ip, ip_local } = req.body;
                const batchSize = 1000; // Tamaño del lote (ajustable según la capacidad de tu base de datos)
                const batches = [];
                for (let i = 0; i < id_empleado.length; i += batchSize) {
                    batches.push(id_empleado.slice(i, i + batchSize));
                }
                for (const batch of batches) {
                    const valores = batch
                        .map((id_empleado) => `(${id_empleado}, ${timbre_internet}, ${timbre_foto}, ${timbre_especial}, ${timbre_ubicacion_desconocida})`)
                        .join(', ');
                    // Ejecutar la inserción en cada lote
                    yield database_1.default.query(`INSERT INTO mrv_opciones_marcacion (id_empleado, timbre_internet, timbre_foto, timbre_especial,
                    timbre_ubicacion_desconocida) 
                VALUES ${valores}`);
                }
                const auditoria = id_empleado.map((id_empleado) => ({
                    tabla: 'mtv_opciones_marcacion',
                    usuario: user_name,
                    accion: 'I',
                    datosOriginales: '',
                    datosNuevos: `id_empleado: ${id_empleado}, timbre_internet: ${timbre_internet}, timbre_foto: ${timbre_foto}, timbre_especial: ${timbre_especial}, 
                    timbre_ubicacion_desconocida: ${timbre_ubicacion_desconocida}`,
                    ip: ip,
                    ip_local: ip_local,
                    observacion: null
                }));
                yield auditoriaControlador_1.default.InsertarAuditoriaPorLotes(auditoria, user_name, ip, ip_local);
                yield database_1.default.query('COMMIT');
                res.jsonp({ message: 'Sin duplicados' });
            }
            catch (error) {
                console.log('error ', error);
                // REVERTIR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                res.status(500).jsonp({ message: 'error' });
            }
        });
    }
    // METODO PARA ALMACENAR CONFIGURACION DE TIMBRE      **USADO
    ActualizarOpcionTimbre(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id_empleado, timbre_internet, timbre_foto, timbre_especial, timbre_ubicacion_desconocida, user_name, ip, ip_local } = req.body;
                console.log(req.body);
                var opciones;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                let rowsAffected = 0;
                if (timbre_internet != null && timbre_foto != null && timbre_especial != null && timbre_ubicacion_desconocida != null) {
                    //console.log('1')
                    const response = yield database_1.default.query(`
                    UPDATE mrv_opciones_marcacion SET timbre_internet = $2, timbre_foto = $3, timbre_especial = $4,
                        timbre_ubicacion_desconocida = $5
                    WHERE id_empleado = ANY($1::int[])
                    `, [id_empleado, timbre_internet, timbre_foto, timbre_especial, timbre_ubicacion_desconocida]);
                    rowsAffected = response.rowCount || 0;
                }
                else if (timbre_internet != null && timbre_foto != null && timbre_especial != null) {
                    //console.log('1')
                    const response = yield database_1.default.query(`
                    UPDATE mrv_opciones_marcacion SET timbre_internet = $2, timbre_foto = $3, timbre_especial = $4
                    WHERE id_empleado = ANY($1::int[])
                    `, [id_empleado, timbre_internet, timbre_foto, timbre_especial]);
                    rowsAffected = response.rowCount || 0;
                }
                else if (timbre_internet != null && timbre_foto != null && timbre_ubicacion_desconocida != null) {
                    //console.log('1')
                    const response = yield database_1.default.query(`
                    UPDATE mrv_opciones_marcacion SET timbre_internet = $2, timbre_foto = $3, timbre_ubicacion_desconocida = $4
                    WHERE id_empleado = ANY($1::int[])
                    `, [id_empleado, timbre_internet, timbre_foto, timbre_ubicacion_desconocida]);
                    rowsAffected = response.rowCount || 0;
                }
                else if (timbre_internet != null && timbre_especial != null && timbre_ubicacion_desconocida != null) {
                    //console.log('1')
                    const response = yield database_1.default.query(`
                    UPDATE mrv_opciones_marcacion SET timbre_internet = $2, timbre_especial = $3, timbre_ubicacion_desconocida = $4
                    WHERE id_empleado = ANY($1::int[])
                    `, [id_empleado, timbre_internet, timbre_especial, timbre_ubicacion_desconocida]);
                    rowsAffected = response.rowCount || 0;
                }
                else if (timbre_foto != null && timbre_especial != null && timbre_ubicacion_desconocida != null) {
                    //console.log('1')
                    const response = yield database_1.default.query(`
                    UPDATE mrv_opciones_marcacion SET timbre_foto = $2, timbre_especial = $3, timbre_ubicacion_desconocida = $4
                    WHERE id_empleado = ANY($1::int[])
                    `, [id_empleado, timbre_foto, timbre_especial, timbre_ubicacion_desconocida]);
                    rowsAffected = response.rowCount || 0;
                }
                else if (timbre_internet != null && timbre_foto != null) {
                    //console.log('2')
                    const response = yield database_1.default.query(`
                    UPDATE mrv_opciones_marcacion SET timbre_internet = $2, timbre_foto = $3
                    WHERE id_empleado = ANY($1::int[])
                    `, [id_empleado, timbre_internet, timbre_foto]);
                    rowsAffected = response.rowCount || 0;
                }
                else if (timbre_internet != null && timbre_especial != null) {
                    //console.log('3')
                    const response = yield database_1.default.query(`
                    UPDATE mrv_opciones_marcacion SET timbre_internet = $2, timbre_especial = $3
                    WHERE id_empleado = ANY($1::int[])
                    `, [id_empleado, timbre_internet, timbre_especial]);
                    rowsAffected = response.rowCount || 0;
                }
                else if (timbre_internet != null && timbre_ubicacion_desconocida != null) {
                    //console.log('3')
                    const response = yield database_1.default.query(`
                    UPDATE mrv_opciones_marcacion SET timbre_internet = $2, timbre_ubicacion_desconocida = $3
                    WHERE id_empleado = ANY($1::int[])
                    `, [id_empleado, timbre_internet, timbre_ubicacion_desconocida]);
                    rowsAffected = response.rowCount || 0;
                }
                else if (timbre_foto != null && timbre_especial != null) {
                    //console.log('4')
                    const response = yield database_1.default.query(`
                    UPDATE mrv_opciones_marcacion SET timbre_foto = $2, timbre_especial = $3
                    WHERE id_empleado = ANY($1::int[])
                    `, [id_empleado, timbre_foto, timbre_especial]);
                    rowsAffected = response.rowCount || 0;
                }
                else if (timbre_foto != null && timbre_ubicacion_desconocida != null) {
                    //console.log('4')
                    const response = yield database_1.default.query(`
                    UPDATE mrv_opciones_marcacion SET timbre_foto = $2, timbre_ubicacion_desconocida = $3
                    WHERE id_empleado = ANY($1::int[])
                    `, [id_empleado, timbre_foto, timbre_ubicacion_desconocida]);
                    rowsAffected = response.rowCount || 0;
                }
                else if (timbre_especial != null && timbre_ubicacion_desconocida != null) {
                    //console.log('4')
                    const response = yield database_1.default.query(`
                    UPDATE mrv_opciones_marcacion SET timbre_especial = $2, timbre_ubicacion_desconocida = $3
                    WHERE id_empleado = ANY($1::int[])
                    `, [id_empleado, timbre_especial, timbre_ubicacion_desconocida]);
                    rowsAffected = response.rowCount || 0;
                }
                else if (timbre_internet != null) {
                    //console.log('5')
                    const response = yield database_1.default.query(`
                    UPDATE mrv_opciones_marcacion SET timbre_internet = $2
                    WHERE id_empleado = ANY($1::int[])
                    `, [id_empleado, timbre_internet]);
                    rowsAffected = response.rowCount || 0;
                }
                else if (timbre_foto != null) {
                    //console.log('6')
                    const response = yield database_1.default.query(`
                    UPDATE mrv_opciones_marcacion SET timbre_foto = $2
                    WHERE id_empleado = ANY($1::int[])
                    `, [id_empleado, timbre_foto]);
                    rowsAffected = response.rowCount || 0;
                }
                else if (timbre_especial != null) {
                    //console.log('7')
                    const response = yield database_1.default.query(`
                    UPDATE mrv_opciones_marcacion SET timbre_especial = $2
                    WHERE id_empleado = ANY($1::int[])
                    `, [id_empleado, timbre_especial]);
                    rowsAffected = response.rowCount || 0;
                }
                else if (timbre_ubicacion_desconocida != null) {
                    //console.log('7')
                    const response = yield database_1.default.query(`
                    UPDATE mrv_opciones_marcacion SET timbre_ubicacion_desconocida = $2
                    WHERE id_empleado = ANY($1::int[])
                    `, [id_empleado, timbre_ubicacion_desconocida]);
                    rowsAffected = response.rowCount || 0;
                }
                const auditoria = id_empleado.map((id_empleado) => ({
                    tabla: 'mrv_opciones_marcacion',
                    usuario: user_name,
                    accion: 'I',
                    datosOriginales: '',
                    datosNuevos: `id_empleado: ${id_empleado}, timbre_internet: ${timbre_internet}, timbre_foto: ${timbre_foto}, timbre_especial: ${timbre_especial}, 
                    timbre_ubicacion_desconocida: ${timbre_ubicacion_desconocida}`,
                    ip: ip,
                    ip_local: ip_local,
                    observacion: null
                }));
                yield auditoriaControlador_1.default.InsertarAuditoriaPorLotes(auditoria, user_name, ip, ip_local);
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                //console.log('opciones ', opciones)
                if (rowsAffected > 0) {
                    return res.status(200).jsonp({ message: 'Actualización exitosa', rowsAffected });
                }
                else {
                    return res.status(404).jsonp({ message: 'error' });
                }
            }
            catch (error) {
                // REVERTIR TRANSACCION
                console.log("ver error de actualizar: ", error);
                yield database_1.default.query('ROLLBACK');
                return res.status(500).jsonp({ message: 'error' });
            }
        });
    }
    // METODO PARA BUSCAR OPCIONES DE TIMBRES    **USADO
    BuscarOpcionesTimbre(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { ids_empleados } = req.body;
            console.log("ver req.body: ", req.body);
            // Validar que ids_empleados sea un array
            if (!Array.isArray(ids_empleados) || ids_empleados.length === 0) {
                return res.status(400).jsonp({ message: 'Debe proporcionar un array de IDs de empleados válido' });
            }
            const OPCIONES = yield database_1.default.query(`
            SELECT * FROM mrv_opciones_marcacion 
            WHERE id_empleado = ANY($1)
            `, [ids_empleados]);
            if (OPCIONES.rowCount != 0) {
                return res.jsonp({ message: 'OK', respuesta: OPCIONES.rows });
            }
            else {
                return res.status(404).jsonp({ message: 'vacio' });
            }
        });
    }
    // METODO PARA BUSCAR OPCIONES DE TIMBRES DE VARIOS USUARIOS    **USADO
    BuscarMultipleOpcionesTimbre(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_empleado } = req.body;
            const OPCIONES = yield database_1.default.query("SELECT e.nombre, e.apellido, e.cedula, e.codigo, om.id, om.id_empleado, om.timbre_internet, " +
                "   om.timbre_foto, om.timbre_especial, om.timbre_ubicacion_desconocida " +
                "FROM mrv_opciones_marcacion AS om, eu_empleados AS e " +
                "WHERE e.id = om.id_empleado AND om.id_empleado IN (" + id_empleado + ") ");
            if (OPCIONES.rowCount != 0) {
                return res.jsonp({ message: 'OK', respuesta: OPCIONES.rows });
            }
            else {
                return res.status(404).jsonp({ message: 'vacio' });
            }
        });
    }
    // METODO PARA ELIMINAR REGISTROS    **USADO
    EliminarRegistros(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { user_name, ip, ids, ip_local } = req.body;
                console.log('req.body ', req.body);
                if (!Array.isArray(ids) || ids.length === 0) {
                    return res.status(400).jsonp({ message: 'Debe proporcionar un array de IDs válido.' });
                }
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                // OBTENER DATOSORIGINALES
                const consulta = yield database_1.default.query(`SELECT * FROM mrv_opciones_marcacion WHERE id_empleado = ANY($1)`, [ids]);
                const datosOriginales = consulta.rows;
                const idsEncontrados = datosOriginales.map((row) => row.id_empleado);
                const idsNoEncontrados = ids.filter((id) => !idsEncontrados.includes(id));
                if (idsEncontrados.length === 0) {
                    const auditoria = idsNoEncontrados.map((id_empleado) => ({
                        tabla: 'mrv_opciones_marcacion',
                        usuario: user_name,
                        accion: 'D',
                        datosOriginales: '',
                        datosNuevos: '',
                        ip: ip,
                        ip_local: ip_local,
                        observacion: `Error al eliminar registro con id ${id_empleado}`
                    }));
                    yield auditoriaControlador_1.default.InsertarAuditoriaPorLotes(auditoria, user_name, ip, ip_local);
                    yield database_1.default.query('COMMIT');
                    return res.status(404).jsonp({ message: 'Ningún registro encontrado para eliminar.', idsNoEncontrados: ids });
                }
                else {
                    if (idsNoEncontrados.length != 0) {
                        const auditoria = idsNoEncontrados.map((id_empleado) => ({
                            tabla: 'mrv_opciones_marcacion',
                            usuario: user_name,
                            accion: 'D',
                            datosOriginales: '',
                            datosNuevos: '',
                            ip: ip,
                            ip_local: ip_local,
                            observacion: `Error al eliminar registro con id ${id_empleado}`
                        }));
                        yield auditoriaControlador_1.default.InsertarAuditoriaPorLotes(auditoria, user_name, ip, ip_local);
                    }
                    yield database_1.default.query(`
                DELETE FROM mrv_opciones_marcacion WHERE id_empleado = ANY($1)
                `, [idsEncontrados]);
                    const auditoria = datosOriginales.map((item) => ({
                        tabla: 'mrv_opciones_marcacion',
                        usuario: user_name,
                        accion: 'D',
                        datosOriginales: JSON.stringify(item),
                        datosNuevos: '',
                        ip: ip,
                        ip_local: ip_local,
                        observacion: null
                    }));
                    yield auditoriaControlador_1.default.InsertarAuditoriaPorLotes(auditoria, user_name, ip, ip_local);
                    yield database_1.default.query('COMMIT');
                    return res.jsonp({ message: 'Se ha eliminado ' + idsEncontrados.length + ' registros.' });
                }
            }
            catch (error) {
                // REVERTIR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                return res.jsonp({ message: 'error' });
            }
        });
    }
    /** ************************************************************************************************* **
     ** **             CONSULTAS DE CONFIGURACION DE OPCIONES DE MARCACIONES SISTEMA WEB               ** **
     ** ************************************************************************************************* **/
    // METODO PARA ALMACENAR CONFIGURACION DE TIMBRE     **USADO
    IngresarOpcionTimbreWeb(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id_empleado, timbre_foto, timbre_especial, timbre_ubicacion_desconocida, user_name, ip, ip_local } = req.body;
                const batchSize = 1000; // Tamaño del lote (ajustable según la capacidad de tu base de datos)
                const batches = [];
                for (let i = 0; i < id_empleado.length; i += batchSize) {
                    batches.push(id_empleado.slice(i, i + batchSize));
                }
                for (const batch of batches) {
                    const valores = batch
                        .map((id_empleado) => `(${id_empleado}, ${timbre_foto}, ${timbre_especial}, ${timbre_ubicacion_desconocida})`)
                        .join(', ');
                    // Ejecutar la inserción en cada lote
                    yield database_1.default.query(`
                INSERT INTO mtv_opciones_marcacion (id_empleado, timbre_foto, timbre_especial, 
                    timbre_ubicacion_desconocida) 
                VALUES ${valores}`);
                }
                const auditoria = id_empleado.map((id_empleado) => ({
                    tabla: 'mtv_opciones_marcacion',
                    usuario: user_name,
                    accion: 'I',
                    datosOriginales: '',
                    datosNuevos: `id_empleado: ${id_empleado}, timbre_foto: ${timbre_foto}, timbre_especial: ${timbre_especial}, 
                    timbre_ubicacion_desconocida: ${timbre_ubicacion_desconocida}`,
                    ip: ip,
                    ip_local: ip_local,
                    observacion: null
                }));
                yield auditoriaControlador_1.default.InsertarAuditoriaPorLotes(auditoria, user_name, ip, ip_local);
                yield database_1.default.query('COMMIT');
                res.jsonp({ message: 'Sin duplicados' });
            }
            catch (error) {
                // Revertir la transacción en caso de error
                console.log("ver el error: ", error);
                yield database_1.default.query('ROLLBACK');
                res.status(500).jsonp({ message: 'Error al guardar registros.' });
            }
        });
    }
    // METODO PARA ALMACENAR CONFIGURACION DE TIMBRE      **USADO
    ActualizarOpcionTimbreWeb(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id_empleado, timbre_foto, timbre_especial, timbre_ubicacion_desconocida, user_name, ip, ip_local } = req.body;
                console.log(req.body);
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                let rowsAffected = 0;
                if (timbre_foto != null && timbre_especial != null && timbre_ubicacion_desconocida != null) {
                    //console.log('1')
                    const response = yield database_1.default.query(`
                    UPDATE mtv_opciones_marcacion SET timbre_foto = $2, timbre_especial = $3,
                        timbre_ubicacion_desconocida = $4
                    WHERE id_empleado = ANY($1::int[]) 
                    `, [id_empleado, timbre_foto, timbre_especial, timbre_ubicacion_desconocida]);
                    rowsAffected = response.rowCount || 0;
                }
                else if (timbre_foto != null && timbre_especial != null) {
                    //console.log('4')
                    const response = yield database_1.default.query(`
                    UPDATE mtv_opciones_marcacion SET timbre_foto = $2, timbre_especial = $3
                    WHERE id_empleado = ANY($1::int[]) 
                    `, [id_empleado, timbre_foto, timbre_especial]);
                    rowsAffected = response.rowCount || 0;
                }
                else if (timbre_foto != null && timbre_ubicacion_desconocida != null) {
                    //console.log('4')
                    const response = yield database_1.default.query(`
                    UPDATE mtv_opciones_marcacion SET timbre_foto = $2, timbre_ubicacion_desconocida = $3
                    WHERE id_empleado = ANY($1::int[]) 
                    `, [id_empleado, timbre_foto, timbre_ubicacion_desconocida]);
                    rowsAffected = response.rowCount || 0;
                }
                else if (timbre_especial != null && timbre_ubicacion_desconocida != null) {
                    console.log('timbre_especial != null && timbre_ubicacion_desconocida != null');
                    const response = yield database_1.default.query(`
                    UPDATE mtv_opciones_marcacion SET timbre_especial = $2, timbre_ubicacion_desconocida = $3
                    WHERE id_empleado = ANY($1::int[]) 
                    `, [id_empleado, timbre_especial, timbre_ubicacion_desconocida]);
                    rowsAffected = response.rowCount || 0;
                }
                else if (timbre_foto != null) {
                    console.log('6');
                    const response = yield database_1.default.query(`
                    UPDATE mtv_opciones_marcacion SET timbre_foto = $2
                    WHERE id_empleado = ANY($1::int[]) 
                    `, [id_empleado, timbre_foto]);
                    rowsAffected = response.rowCount || 0;
                }
                else if (timbre_especial != null) {
                    //console.log('7')
                    const response = yield database_1.default.query(`
                    UPDATE mtv_opciones_marcacion SET timbre_especial = $2
                    WHERE id_empleado = ANY($1::int[]) 
                    `, [id_empleado, timbre_especial]);
                    rowsAffected = response.rowCount || 0;
                }
                else if (timbre_ubicacion_desconocida != null) {
                    //console.log('7')
                    const response = yield database_1.default.query(`
                    UPDATE mtv_opciones_marcacion SET timbre_ubicacion_desconocida = $2
                    WHERE id_empleado = ANY($1::int[]) 
                    `, [id_empleado, timbre_ubicacion_desconocida]);
                    rowsAffected = response.rowCount || 0;
                }
                const auditoria = id_empleado.map((id_empleado) => ({
                    tabla: 'mtv_opciones_marcacion',
                    usuario: user_name,
                    accion: 'I',
                    datosOriginales: '',
                    datosNuevos: `id_empleado: ${id_empleado}, , timbre_foto: ${timbre_foto}, timbre_especial: ${timbre_especial}, 
                    timbre_ubicacion_desconocida: ${timbre_ubicacion_desconocida}`,
                    ip: ip,
                    ip_local: ip_local,
                    observacion: null
                }));
                yield auditoriaControlador_1.default.InsertarAuditoriaPorLotes(auditoria, user_name, ip, ip_local);
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                //console.log('opciones ', opciones)
                if (rowsAffected > 0) {
                    return res.status(200).jsonp({ message: 'Actualización exitosa', rowsAffected });
                }
                else {
                    return res.status(404).jsonp({ message: 'error' });
                }
            }
            catch (error) {
                // REVERTIR TRANSACCION
                console.log("ver error de actualizar: ", error);
                yield database_1.default.query('ROLLBACK');
                return res.status(500).jsonp({ message: 'error' });
            }
        });
    }
    // METODO PARA BUSCAR OPCIONES DE TIMBRES DE VARIOS USUARIOS    **USADO
    BuscarMultipleOpcionesTimbreWeb(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_empleado } = req.body;
            const OPCIONES = yield database_1.default.query("SELECT * FROM mtv_opciones_marcacion " +
                "WHERE id_empleado IN (" + id_empleado + ") ");
            if (OPCIONES.rowCount != 0) {
                return res.jsonp({ message: 'OK', respuesta: OPCIONES.rows });
            }
            else {
                return res.status(404).jsonp({ message: 'vacio' });
            }
        });
    }
    BuscarMultipleOpcionesTimbreWebMultiple(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { ids_empleados } = req.body; // ids_empleados debe ser un array de ids
                // Validar que ids_empleados sea un array
                if (!Array.isArray(ids_empleados) || ids_empleados.length === 0) {
                    return res.status(400).jsonp({ message: 'Debe proporcionar un array de IDs de empleados válido' });
                }
                const OPCIONES = yield database_1.default.query("SELECT * FROM mtv_opciones_marcacion " +
                    "WHERE id_empleado = ANY($1)", [ids_empleados] // Pasamos el array directamente a la consulta
                );
                if (OPCIONES.rowCount !== 0) {
                    return res.jsonp({ message: 'OK', respuesta: OPCIONES.rows });
                }
                else {
                    return res.status(404).jsonp({ message: 'vacio' });
                }
            }
            catch (error) {
                console.error('Error al buscar opciones de marcación:', error);
                return res.status(500).jsonp({ message: 'Error interno del servidor' });
            }
        });
    }
    // METODO PARA ELIMINAR REGISTROS    **USADO
    EliminarRegistrosWeb(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { user_name, ip, ids, ip_local } = req.body;
                console.log('req.body ', req.body);
                // INICIAR TRANSACCION
                if (!Array.isArray(ids) || ids.length === 0) {
                    return res.status(400).jsonp({ message: 'Debe proporcionar un array de IDs válido.' });
                }
                yield database_1.default.query('BEGIN');
                // OBTENER DATOSORIGINALES
                const consulta = yield database_1.default.query(`SELECT * FROM mtv_opciones_marcacion WHERE id_empleado = ANY($1)`, [ids]);
                const datosOriginales = consulta.rows;
                // Obtener los IDs encontrados
                const idsEncontrados = datosOriginales.map((row) => row.id_empleado);
                const idsNoEncontrados = ids.filter((id) => !idsEncontrados.includes(id));
                if (idsEncontrados.length === 0) {
                    const auditoria = idsNoEncontrados.map((id_empleado) => ({
                        tabla: 'mtv_opciones_marcacion',
                        usuario: user_name,
                        accion: 'D',
                        datosOriginales: '',
                        datosNuevos: '',
                        ip: ip,
                        ip_local: ip_local,
                        observacion: `Error al eliminar registro con id ${id_empleado}`
                    }));
                    yield auditoriaControlador_1.default.InsertarAuditoriaPorLotes(auditoria, user_name, ip, ip_local);
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    return res.status(404).jsonp({ message: 'Ningún registro encontrado para eliminar.', idsNoEncontrados: ids });
                }
                else {
                    if (idsNoEncontrados.length != 0) {
                        const auditoria = idsNoEncontrados.map((id_empleado) => ({
                            tabla: 'mtv_opciones_marcacion',
                            usuario: user_name,
                            accion: 'D',
                            datosOriginales: '',
                            datosNuevos: '',
                            ip: ip,
                            ip_local: ip_local,
                            observacion: `Error al eliminar registro con id ${id_empleado}`
                        }));
                        yield auditoriaControlador_1.default.InsertarAuditoriaPorLotes(auditoria, user_name, ip, ip_local);
                    }
                    yield database_1.default.query(`
                DELETE FROM mtv_opciones_marcacion WHERE id_empleado = ANY($1)
                `, [idsEncontrados]);
                    const auditoria = datosOriginales.map((item) => ({
                        tabla: 'mtv_opciones_marcacion',
                        usuario: user_name,
                        accion: 'D',
                        datosOriginales: JSON.stringify(item),
                        datosNuevos: '',
                        ip: ip,
                        ip_local: ip_local,
                        observacion: null
                    }));
                    yield auditoriaControlador_1.default.InsertarAuditoriaPorLotes(auditoria, user_name, ip, ip_local);
                    yield database_1.default.query('COMMIT');
                    return res.jsonp({ message: 'Se ha eliminado ' + idsEncontrados.length + ' registros.' });
                }
            }
            catch (error) {
                // REVERTIR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                return res.jsonp({ message: 'error' });
            }
        });
    }
    /** ************************************************************************************************* **
     ** **                                 METODOS PARA APP MOVIL                                      ** **
     ** ************************************************************************************************* **/
    //METODO PARA CREAR TIMBRE
    crearTimbre(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const hoy = new Date();
                const timbre = req.body;
                yield database_1.default.query('BEGIN');
                const pad = (num) => num.toString().padStart(2, '0');
                timbre.fecha_hora_timbre_servidor = `${hoy.getFullYear()}-${pad(hoy.getMonth() + 1)}-${pad(hoy.getDate())} ${pad(hoy.getHours())}:${pad(hoy.getMinutes())}:${pad(hoy.getSeconds())}`;
                const fechaHoraEnZonaHorariaDispositivo = luxon_1.DateTime.fromJSDate(hoy)
                    .setZone(timbre.zona_horaria_dispositivo)
                    .toFormat('yyyy-MM-dd HH:mm:ss');
                const zonaHorariaServidor = luxon_1.DateTime.local().zoneName;
                const timbreRV = new Date(fechaHoraEnZonaHorariaDispositivo || '');
                const timbreDispositivo = new Date(timbre.fecha_hora_timbre || '');
                const restaTimbresHoras = timbreRV.getHours() - timbreDispositivo.getHours();
                const restaTimbresMinutos = timbreRV.getMinutes() - timbreDispositivo.getMinutes();
                const restaTimbresDias = timbreRV.getDate() - timbreDispositivo.getDate();
                if (restaTimbresDias != 0 || restaTimbresHoras != 0 || restaTimbresMinutos > 3 || restaTimbresMinutos < -3) {
                    timbre.hora_timbre_diferente = true;
                }
                else {
                    timbre.hora_timbre_diferente = false;
                }
                // Verificar el valor de timbre.accion antes de la consulta
                console.log('Valor de timbre.accion:', timbre.accion);
                const response = yield database_1.default.query('INSERT INTO eu_timbres (fecha_hora_timbre, accion, tecla_funcion, ' +
                    'observacion, latitud, longitud, codigo, id_reloj, tipo_autenticacion, ' +
                    'dispositivo_timbre, fecha_hora_timbre_servidor, hora_timbre_diferente, ubicacion, conexion, fecha_subida_servidor, novedades_conexion, imagen, fecha_hora_timbre_validado, zona_horaria_dispositivo, zona_horaria_servidor ) ' +
                    'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $19, $18, $20);', [timbre.fecha_hora_timbre, timbre.accion, timbre.tecla_funcion, timbre.observacion,
                    timbre.latitud, timbre.longitud, timbre.codigo, timbre.id_reloj,
                    timbre.tipo_autenticacion, timbre.dispositivo_timbre, timbre.fecha_hora_timbre_servidor,
                    timbre.hora_timbre_diferente, timbre.ubicacion, timbre.conexion, timbre.fecha_subida_servidor, timbre.novedades_conexion, timbre.imagen, timbre.zona_horaria_dispositivo, fechaHoraEnZonaHorariaDispositivo, zonaHorariaServidor]);
                const fechaHora = yield (0, settingsMail_1.FormatearHora)(timbre.fecha_hora_timbre.toLocaleString().split(' ')[1]);
                const fechaTimbre = yield (0, settingsMail_1.FormatearFecha2)(timbre.fecha_hora_timbre.toLocaleString(), 'ddd');
                const fechaHoraServidor = yield (0, settingsMail_1.FormatearHora)(timbre.fecha_hora_timbre_servidor.toLocaleString().split(' ')[1]);
                const fechaTimbreServidor = yield (0, settingsMail_1.FormatearFecha2)(timbre.fecha_hora_timbre_servidor.toLocaleString(), 'ddd');
                let imagen_existe = false;
                if (timbre.imagen) {
                    imagen_existe = true;
                }
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'eu_timbres',
                    usuario: timbre.user_name,
                    accion: 'I',
                    datosOriginales: '',
                    datosNuevos: `{fecha_hora_timbre: ${fechaTimbre + ' ' + fechaHora}, accion: ${timbre.accion}, tecla_funcion: ${timbre.tecla_funcion}, observacion: ${timbre.observacion}, latitud: ${timbre.latitud}, longitud: ${timbre.longitud}, codigo: ${timbre.codigo}, fecha_hora_timbre_servidor: ${fechaTimbreServidor + ' ' + fechaHoraServidor}, id_reloj: ${timbre.id_reloj}, ubicacion: ${timbre.ubicacion}, dispositivo_timbre: ${timbre.dispositivo_timbre}, imagen: ${imagen_existe} }`,
                    ip: timbre.ip,
                    ip_local: timbre.ip_local,
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
    // METODO PARA CREAR TIMBRE SIN CONEXION A INTERNET
    crearTimbreDesconectado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const hoy = new Date();
                const timbre = req.body;
                yield database_1.default.query('BEGIN');
                console.log("ver req.body", req.body);
                const pad = (num) => num.toString().padStart(2, '0');
                timbre.fecha_subida_servidor = `${hoy.getFullYear()}-${pad(hoy.getMonth() + 1)}-${pad(hoy.getDate())} ${pad(hoy.getHours())}:${pad(hoy.getMinutes())}:${pad(hoy.getSeconds())}`;
                const zonaHorariaServidor = luxon_1.DateTime.local().zoneName;
                timbre.hora_timbre_diferente = false;
                const response = yield database_1.default.query('INSERT INTO eu_timbres (fecha_hora_timbre, accion, tecla_funcion, ' +
                    'observacion, latitud, longitud, codigo, id_reloj, tipo_autenticacion, ' +
                    'dispositivo_timbre, fecha_hora_timbre_servidor, hora_timbre_diferente, ubicacion, conexion, fecha_subida_servidor, novedades_conexion, imagen, fecha_hora_timbre_validado, zona_horaria_servidor) ' +
                    'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19);', [timbre.fecha_hora_timbre, 'dd', timbre.tecla_funcion, timbre.observacion,
                    timbre.latitud, timbre.longitud, timbre.codigo, timbre.id_reloj,
                    timbre.tipo_autenticacion, timbre.dispositivo_timbre, timbre.fecha_hora_timbre,
                    timbre.hora_timbre_diferente, timbre.ubicacion, timbre.conexion, timbre.fecha_subida_servidor, timbre.novedades_conexion, timbre.imagen, timbre.fecha_hora_timbre, zonaHorariaServidor]);
                const fechaHora = yield (0, settingsMail_1.FormatearHora)(timbre.fecha_hora_timbre.toLocaleString().split(' ')[1]);
                const fechaTimbre = yield (0, settingsMail_1.FormatearFecha2)(timbre.fecha_hora_timbre.toLocaleString(), 'ddd');
                const fechaHoraSubida = yield (0, settingsMail_1.FormatearHora)(timbre.fecha_subida_servidor.toLocaleString().split(' ')[1]);
                const fechaTimbreSubida = yield (0, settingsMail_1.FormatearFecha2)(timbre.fecha_subida_servidor.toLocaleString(), 'ddd');
                let imagen_existe = false;
                if (timbre.imagen) {
                    imagen_existe = true;
                }
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'eu_timbres',
                    usuario: timbre.user_name,
                    accion: 'I',
                    datosOriginales: '',
                    datosNuevos: `{fecha_hora_timbre: ${fechaTimbre + ' ' + fechaHora}, accion: ${timbre.accion}, tecla_funcion: ${timbre.tecla_funcion}, observacion: ${timbre.observacion}, latitud: ${timbre.latitud}, longitud: ${timbre.longitud}, codigo: ${timbre.codigo}, fecha_hora_timbre_servidor: ${fechaTimbre + ' ' + fechaHora}, id_reloj: ${timbre.id_reloj}, ubicacion: ${timbre.ubicacion}, dispositivo_timbre: ${timbre.dispositivo_timbre}, fecha_subida_servidor :  ${fechaTimbreSubida + ' ' + fechaHoraSubida}, imagen: ${timbre.imagen} }`,
                    ip: timbre.ip,
                    ip_local: timbre.ip_local,
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
    //METODO PARA CREAR TIMBRE POR EL ADMINISTRADOR
    crearTimbreJustificadoAdmin(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { fec_hora_timbre, accion, tecl_funcion, observacion, latitud, longitud, codigo, id_reloj, user_name, ip, documento, dispositivo_timbre, conexion, hora_timbre_diferente, ip_local } = req.body;
                console.log(req.body);
                yield database_1.default.query('BEGIN');
                const zonaHorariaServidor = luxon_1.DateTime.local().zoneName;
                const [timbre] = yield database_1.default.query('INSERT INTO eu_timbres (fecha_hora_timbre, accion, tecla_funcion, observacion, latitud, longitud, codigo, id_reloj, fecha_hora_timbre_servidor, documento, dispositivo_timbre,conexion, hora_timbre_diferente, fecha_hora_timbre_validado, zona_horaria_servidor) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $1, $14) RETURNING id', [fec_hora_timbre, accion, tecl_funcion, observacion, latitud, longitud, codigo, id_reloj, fec_hora_timbre, documento, dispositivo_timbre, conexion, hora_timbre_diferente, zonaHorariaServidor])
                    .then(result => {
                    return result.rows;
                });
                const fechaHora = yield (0, settingsMail_1.FormatearHora)(fec_hora_timbre.toLocaleString().split(' ')[1]);
                const fechaTimbre = yield (0, settingsMail_1.FormatearFecha2)(fec_hora_timbre.toLocaleString(), 'ddd');
                let documento_existe = false;
                if (documento) {
                    documento_existe = true;
                }
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'eu_timbres',
                    usuario: user_name,
                    accion: 'I',
                    datosOriginales: '',
                    datosNuevos: `{fecha_hora_timbre: ${fechaTimbre + ' ' + fechaHora}, accion: ${accion}, tecla_funcion: ${tecl_funcion}, observacion: ${observacion}, latitud: ${latitud}, longitud: ${longitud}, codigo: ${codigo}, fecha_hora_timbre_servidor: ${fec_hora_timbre}, id_reloj: ${id_reloj}, ubicacion: 'null', dispositivo_timbre: ${dispositivo_timbre}, documento: ${documento_existe} }`,
                    ip: ip,
                    ip_local: ip_local,
                    observacion: null
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                if (!timbre)
                    return res.status(400).jsonp({ message: "No se inserto timbre" });
                return res.status(200).jsonp({ message: "Tímbre creado exitosamente" });
            }
            catch (error) {
                console.log("ver error", error);
                return res.status(400).jsonp({ message: error });
            }
        });
    }
    //METODO PARA LEER TIMBRES POR UN RANGO DE FECHA
    FiltrarTimbre(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { fecInicio, fecFinal, codigo } = req.body;
                console.log("ver body", req.body);
                let fechaDesde = new Date(fecInicio);
                let fechaHasta = new Date(fecFinal);
                const fechaDesdeStr = fechaDesde.toISOString().split('T')[0] + " 00:00:00";
                const fechaHastaStr = fechaHasta.toISOString().split('T')[0] + " 23:59:59";
                console.log(req.body);
                const response = yield database_1.default.query(`
                SELECT * FROM eu_timbres 
                WHERE codigo = $3 AND fecha_hora_timbre_validado BETWEEN $1 AND $2 
                ORDER BY fecha_hora_timbre_validado DESC
                `, [fechaDesdeStr, fechaHastaStr, codigo]);
                const timbres = response.rows;
                return res.jsonp(timbres);
            }
            catch (error) {
                console.log("Error de filtro de timbre", error);
                return res.status(400).jsonp({ message: error });
            }
        });
    }
    //METODO PARA LEER TIMBRES POR CODIGO DEL EMPLEADO
    getTimbreByCodigo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = parseInt(req.params.idUsuario);
                // Obtener la fecha actual
                const fechaHasta = new Date();
                // Establecer la hora final del día (23:59:59)
                const fechaHastaStr = fechaHasta.toISOString().split('T')[0] + " 23:59:59";
                // Calcular la fecha de hace 2 meses
                const fechaDesde = new Date();
                fechaDesde.setMonth(fechaDesde.getMonth() - 2);
                // Establecer la hora inicial del día (00:00:00) para dos meses atrás
                const fechaDesdeStr = fechaDesde.toISOString().split('T')[0] + " 00:00:00";
                const response = yield database_1.default.query(`
                SELECT * FROM eu_timbres 
                WHERE codigo = $1 
                    AND fecha_hora_timbre_validado BETWEEN $2 AND $3
                ORDER BY fecha_hora_timbre_servidor DESC
                `, [id, fechaDesdeStr, fechaHastaStr]);
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
}
exports.timbresControlador = new TimbresControlador;
exports.default = exports.timbresControlador;
// FUNCION PARA VALIDAR ZONA HORARIA DEL DISPOSITIVO Y DEL SERVIDOR
function ValidarZonaHoraria(fecha_valida, fecha_timbre, fecha_validada, fec_hora_timbre) {
    //console.log('ver datos ', fec_hora_timbre, ' fecha_validad ', fecha_validada)
    var hora_diferente;
    // VERIFICAR FECHAS DEBE SER LA MISMA DEL SERVIDOR
    if (fecha_valida != fecha_timbre) {
        hora_diferente = true;
    }
    else {
        // VALDAR HORAS NO DEBE SER MENOR NI MAYOR A LA HORA DEL SERVIDOR -- 1 MINUTO DE ESPERA
        var hora_valida = luxon_1.DateTime.fromFormat(fecha_validada, 'dd/MM/yyyy, hh:mm:ss a');
        var hora_timbre_ = luxon_1.DateTime.fromFormat(fec_hora_timbre, 'dd/MM/yyyy h:mm:ss a');
        var resta_hora_valida = hora_valida.minus({ minutes: 1 });
        //console.log(' hora_valida ', hora_valida)
        //console.log('resta ', resta_hora_valida)
        //console.log('hora_timbre.... ', hora_timbre_)
        if (hora_timbre_ > (hora_valida)) {
            //console.log('ingresa true, hora mayor');
            hora_diferente = true;
        }
        else {
            if (hora_timbre_ >= (resta_hora_valida)) {
                //console.log('ingresa false');
                hora_diferente = false;
            }
            else {
                //console.log('ingresa true, hora menor');
                hora_diferente = true;
            }
        }
    }
    return hora_diferente;
}
