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
const database_1 = __importDefault(require("../../database"));
class TimbresControlador {
    // ELIMINAR NOTIFICACIONES TABLA DE AVISOS --**VERIFICADO
    EliminarMultiplesAvisos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const arregloAvisos = req.body;
            let contador = 0;
            if (arregloAvisos.length > 0) {
                contador = 0;
                arregloAvisos.forEach((obj) => __awaiter(this, void 0, void 0, function* () {
                    yield database_1.default.query('DELETE FROM realtime_timbres WHERE id = $1', [obj])
                        .then((result) => {
                        contador = contador + 1;
                        if (contador === arregloAvisos.length) {
                            return res.jsonp({ message: 'OK' });
                        }
                        console.log(result.command, 'REALTIME ELIMINADO ====>', obj);
                    });
                }));
            }
            else {
                return res.jsonp({ message: 'error' });
            }
        });
    }
    // METODO PARA LISTAR MARCACIONES
    ObtenerTimbres(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.userIdEmpleado;
                let timbres = yield database_1.default.query(`
                SELECT CAST(t.fec_hora_timbre AS VARCHAR), t.accion, t.tecl_funcion, t.observacion, 
                    t.latitud, t.longitud, t.codigo, t.id_reloj, ubicacion, 
                    CAST(fec_hora_timbre_servidor AS VARCHAR), dispositivo_timbre 
                FROM empleados AS e, timbres AS t 
                WHERE e.id = $1 AND e.codigo = t.codigo 
                ORDER BY t.fec_hora_timbre DESC LIMIT 100
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
                    FROM empleados AS e, timbres AS t 
                    WHERE e.id = $1 AND e.codigo = t.codigo 
                        AND t.accion in (\'PES\', \'E/P\', \'S/P\')
                    `, [id]).then((result) => { return result.rows[0].count; }),
                        timbres_AES: yield database_1.default.query(`
                    SELECT count(*) 
                    FROM empleados AS e, timbres AS t 
                    WHERE e.id = $1 AND e.codigo = t.codigo 
                    AND t.accion in (\'AES\', \'E/A\', \'S/A\')
                    `, [id]).then((result) => { return result.rows[0].count; }),
                        timbres_EoS: yield database_1.default.query(`
                    SELECT count(*) 
                    FROM empleados AS e, timbres AS t 
                    WHERE e.id = $1 AND e.codigo = t.codigo 
                        AND t.accion in (\'EoS\', \'E\', \'S\')
                    `, [id]).then((result) => { return result.rows[0].count; }),
                        total_timbres: yield database_1.default.query(`
                    SELECT count(*) 
                    FROM empleados AS e, timbres AS t 
                    WHERE e.id = $1 AND e.codigo = t.codigo
                    `, [id]).then((result) => { return result.rows[0].count; })
                    }];
                return res.status(200).jsonp({
                    timbres: timbres,
                    cuenta: estado_cuenta,
                    info: yield database_1.default.query(`
                    SELECT ec.sueldo, tc.cargo, ec.hora_trabaja, cg.nombre AS departamento
                    FROM empl_cargos AS ec, tipo_cargo AS tc, cg_departamentos AS cg
                    WHERE ec.id = (SELECT MAX(cargo_id) AS cargo_id FROM datos_empleado_cargo
                                    WHERE empl_id = $1)
                    AND tc.id = ec.cargo AND cg.id = ec.id_departamento
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
    //METODO PARA BUSCAR EL TIMBRE DEL EMPLEADO POR FECHA // COLOCAR ESTADO
    ObtenertimbreFechaEmple(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let { codigo, cedula, fecha } = req.query;
                fecha = fecha + '%';
                if (codigo === '') {
                    let usuario = yield database_1.default.query(`SELECT * FROM datos_actuales_empleado 
                        WHERE cedula = $1
                    `, [cedula]).then((result) => {
                        return result.rows.map((obj) => {
                            codigo = obj.codigo;
                        });
                    });
                }
                else if (cedula === '') {
                    let usuario = yield database_1.default.query(`SELECT * FROM datos_actuales_empleado 
                        WHERE codigo = $1
                    `, [codigo]).then((result) => {
                        return result.rows.map((obj) => {
                            cedula = obj.cedula;
                        });
                    });
                }
                let timbresRows = 0;
                //TODO merge
                let timbres = yield database_1.default.query(`
                SELECT (da.nombre || ' ' || da.apellido) AS empleado, CAST(t.fec_hora_timbre AS VARCHAR), t.accion, 
                    t.tecl_funcion, t.observacion, t.latitud, t.longitud, t.codigo, t.id_reloj, ubicacion, 
                    CAST(fec_hora_timbre_servidor AS VARCHAR), dispositivo_timbre, t.id 
                FROM timbres AS t, datos_actuales_empleado AS da
                WHERE t.codigo = $1 
                    AND CAST(t.fec_hora_timbre AS VARCHAR) LIKE $2
                    AND da.codigo = t.codigo 
                    AND da.cedula = $3
                `, [codigo, fecha, cedula]).then((result) => {
                    timbresRows = result.rowCount;
                    if (result.rowCount > 0) {
                        return res.status(200).jsonp({ message: 'timbres encontrados', timbres: result.rows });
                    }
                });
                //console.log('respuesta: ', timbresRows)
                //generarTimbres('35','2023-11-01', '2023-11-30');
                if (timbresRows == 0) {
                    return res.status(400).jsonp({ message: "No se encontraron timbres en esa fecha." });
                }
            }
            catch (err) {
                const message = '!Ups poblemas con la peticion al servidor.';
                return res.status(500).jsonp({ error: err, message: message });
            }
        });
    }
    // METODO PARA ACTUALIZAR O EDITAR EL TIMBRE DEL EMPLEADO
    EditarTimbreEmpleadoFecha(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let { id, codigo, accion, tecla, observacion, fecha } = req.body;
                console.log('id: ', id);
                console.log('codigo: ', codigo);
                console.log('accion: ', accion);
                console.log('tecla: ', tecla);
                console.log('observacion: ', observacion);
                console.log('fecha: ', fecha);
                yield database_1.default.query(`
                SELECT * FROM modificartimbre ($1::timestamp without time zone, $2::character varying, $3::character varying, $4::integer, $5::character varying);  
                `, [fecha, codigo, tecla, id, observacion])
                    .then((result) => {
                    return res.status(200).jsonp({ message: 'Registro actualizado.' });
                });
            }
            catch (err) {
                const message = 'Ups!!! algo salio mal con la peticion al servidor.';
                console.log('error ----- ', err);
                return res.status(500).jsonp({ error: err, message: message });
            }
        });
    }
    // METODO DE REGISTRO DE TIMBRES PERSONALES
    CrearTimbreWeb(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // OBTENCION DE DIRECCION IP
                var ip_cliente = '';
                var requestIp = require('request-ip');
                var clientIp = requestIp.getClientIp(req);
                if (clientIp != null && clientIp != '' && clientIp != undefined) {
                    ip_cliente = clientIp.split(':')[3];
                }
                const { fec_hora_timbre, accion, tecl_funcion, observacion, latitud, longitud, id_reloj, ubicacion } = req.body;
                //console.log('ingresa informacion ', req.body)
                let f = new Date();
                const id_empleado = req.userIdEmpleado;
                let code = yield database_1.default.query(`
                SELECT codigo FROM empleados WHERE id = $1
                `, [id_empleado]).then((result) => { return result.rows; });
                if (code.length === 0)
                    return { mensaje: 'El usuario no tiene un código asignado.' };
                var codigo = parseInt(code[0].codigo);
                const [timbre] = yield database_1.default.query(`
                INSERT INTO timbres (fec_hora_timbre, accion, tecl_funcion, observacion, latitud, longitud, 
                    codigo, fec_hora_timbre_servidor, id_reloj, ubicacion, dispositivo_timbre)
                VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id
                `, [fec_hora_timbre, accion, tecl_funcion, observacion, latitud, longitud, codigo,
                    f.toLocaleString(), id_reloj, ubicacion, ip_cliente])
                    .then((result) => {
                    return result.rows;
                }).catch((err) => {
                    return err;
                });
                if (timbre) {
                    return res.status(200).jsonp({ message: 'Registro guardado.' });
                }
                return res.status(400).jsonp({ message: 'Ups!!! algo ha salido mal.' });
            }
            catch (error) {
                res.status(400).jsonp({ message: error });
            }
        });
    }
    // METODO PARA REGISTRAR TIMBRES ADMINISTRADOR
    CrearTimbreWebAdmin(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // OBTENCION DE DIRECCION IP
                var ip_cliente = '';
                var requestIp = require('request-ip');
                var clientIp = requestIp.getClientIp(req);
                if (clientIp != null && clientIp != '' && clientIp != undefined) {
                    ip_cliente = clientIp.split(':')[3];
                }
                const { fec_hora_timbre, accion, tecl_funcion, observacion, latitud, longitud, id_empleado, id_reloj, tipo } = req.body;
                let f = new Date();
                let servidor;
                if (tipo === 'admin') {
                    servidor = fec_hora_timbre;
                }
                else {
                    servidor = f.toLocaleString();
                }
                let code = yield database_1.default.query(`
                SELECT codigo FROM empleados WHERE id = $1
                `, [id_empleado]).then((result) => { return result.rows; });
                if (code.length === 0)
                    return { mensaje: 'El usuario no tiene un código asignado.' };
                // var codigo = parseInt(code[0].codigo);
                var codigo = code[0].codigo;
                yield database_1.default.query(`
                INSERT INTO timbres (fec_hora_timbre, accion, tecl_funcion, observacion, latitud, 
                    longitud, codigo, id_reloj, dispositivo_timbre, fec_hora_timbre_servidor) 
                VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                `, [fec_hora_timbre, accion, tecl_funcion, observacion, latitud, longitud, codigo,
                    id_reloj, ip_cliente, servidor])
                    .then((result) => {
                    res.status(200).jsonp({ message: 'Registro guardado.' });
                }).catch((err) => {
                    res.status(400).jsonp({ message: err });
                });
            }
            catch (error) {
                res.status(400).jsonp({ message: error });
            }
        });
    }
    // METODO PARA BUSCAR TIMBRES
    BuscarTimbresPlanificacion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { codigo, fec_inicio, fec_final } = req.body;
            console.log('ver datos timbres ', codigo, fec_inicio, fec_final);
            const TIMBRES = yield database_1.default.query("SELECT * FROM timbres " +
                "WHERE fec_hora_timbre_servidor BETWEEN $1 AND $2 " +
                "AND codigo IN (" + codigo + ") " +
                "ORDER BY codigo, fec_hora_timbre_servidor ASC", [fec_inicio, fec_final]);
            if (TIMBRES.rowCount === 0) {
                return res.status(404).jsonp({ message: 'vacio' });
            }
            else {
                var contador = 0;
                TIMBRES.rows.forEach((obj) => __awaiter(this, void 0, void 0, function* () {
                    console.log('fecha ', obj.fec_hora_timbre_servidor);
                    console.log('codigo ', obj.codigo);
                    console.log('funcion ', obj.tecl_funcion);
                    console.log('id ', obj.id);
                    console.log('observacion ', obj.observacion);
                    contador = contador + 1;
                    // fecha_hora_servidor, codigo, tecla_funcion, id_timbre, observcaion
                    yield database_1.default.query(`
                    SELECT * FROM modificartimbre ($1::timestamp without time zone, $2::character varying, $3::character varying, $4::integer, $5::character varying);  
                    `, [obj.fec_hora_timbre_servidor, obj.codigo, obj.tecl_funcion, obj.id, obj.observacion]);
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
            SELECT id, to_char(create_at, 'yyyy-MM-dd HH24:mi:ss') AS create_at, id_send_empl, visto, 
            descripcion, id_timbre, tipo, id_receives_empl
            FROM realtime_timbres WHERE id_receives_empl = $1 
            ORDER BY (visto is FALSE) DESC, id DESC LIMIT 20
            `, [id_empleado])
                .then((result) => __awaiter(this, void 0, void 0, function* () {
                if (result.rowCount > 0) {
                    return yield Promise.all(result.rows.map((obj) => __awaiter(this, void 0, void 0, function* () {
                        let nombre = yield database_1.default.query(`
                            SELECT nombre, apellido FROM empleados WHERE id = $1
                            `, [obj.id_send_empl]).then((ele) => {
                            return ele.rows[0].nombre + ' ' + ele.rows[0].apellido;
                        });
                        return {
                            create_at: obj.create_at,
                            descripcion: obj.descripcion,
                            id_receives_empl: obj.id_receives_empl,
                            visto: obj.visto,
                            id_timbre: obj.id_timbre,
                            empleado: nombre,
                            id: obj.id,
                            tipo: obj.tipo
                        };
                    })));
                }
                return [];
            }));
            if (TIMBRES_NOTIFICACION.length > 0) {
                return res.jsonp(TIMBRES_NOTIFICACION);
            }
            return res.status(404).jsonp({ message: 'No se encuentran registros' });
        });
    }
    // METODO DE BUSQUEDA DE UNA NOTIFICACION ESPECIFICA
    ObtenerUnAviso(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            const AVISOS = yield database_1.default.query(`
            SELECT r.id, r.id_send_empl, r.id_receives_empl, r.create_at, r.tipo, r.visto, 
            r.id_timbre, r.descripcion, (e.nombre || ' ' || e.apellido) AS empleado 
            FROM realtime_timbres AS r, empleados AS e 
            WHERE r.id = $1 AND e.id = r.id_send_empl
            `, [id]);
            if (AVISOS.rowCount > 0) {
                return res.jsonp(AVISOS.rows[0]);
            }
            else {
                return res.status(404).jsonp({ text: 'Registro no encontrado' });
            }
        });
    }
    ObtenerAvisosTimbresEmpleado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_empleado } = req.params;
            console.log(id_empleado);
            const TIMBRES_NOTIFICACION = yield database_1.default.query('SELECT * FROM realtime_timbres WHERE id_receives_empl = $1 ORDER BY create_at DESC', [id_empleado])
                .then((result) => { return result.rows; });
            if (TIMBRES_NOTIFICACION.length === 0)
                return res.status(404).jsonp({ message: 'No se encuentran registros' });
            console.log(TIMBRES_NOTIFICACION);
            const tim = yield Promise.all(TIMBRES_NOTIFICACION.map((obj) => __awaiter(this, void 0, void 0, function* () {
                let [empleado] = yield database_1.default.query('SELECT  (nombre || \' \' || apellido) AS fullname FROM empleados WHERE id = $1', [obj.id_send_empl]).then((ele) => {
                    console.log('¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨', ele.rows);
                    return ele.rows;
                });
                const fullname = (empleado === undefined) ? '' : empleado.fullname;
                return {
                    create_at: obj.create_at,
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
            const id = req.params.id_noti_timbre;
            const { visto } = req.body;
            console.log(id, visto);
            yield database_1.default.query('UPDATE realtime_timbres SET visto = $1 WHERE id = $2', [visto, id])
                .then((result) => {
                res.jsonp({ message: 'Vista Actualizada' });
            });
        });
    }
    ObtenerUltimoTimbreEmpleado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const codigo = req.userCodigo;
                let timbre = yield database_1.default.query('SELECT CAST(fec_hora_timbre AS VARCHAR) as timbre, accion FROM timbres WHERE codigo = $1 ORDER BY fec_hora_timbre DESC LIMIT 1', [codigo])
                    .then((result) => {
                    return result.rows.map((obj) => {
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
                if (timbre.length === 0)
                    return res.status(400).jsonp({ mensaje: 'No ha timbrado.' });
                return res.status(200).jsonp(timbre[0]);
            }
            catch (error) {
                return res.status(400).jsonp({ message: error });
            }
        });
    }
    ObtenerTimbresEmpleado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                let timbres = yield database_1.default.query('SELECT CAST(t.fec_hora_timbre AS VARCHAR), t.accion, t.tecl_funcion, ' +
                    't.observacion, t.latitud, t.longitud, t.codigo, t.id_reloj ' +
                    'FROM empleados AS e, timbres AS t WHERE e.id = $1 AND e.codigo = t.codigo ' +
                    'ORDER BY t.fec_hora_timbre DESC LIMIT 50', [id]).then((result) => {
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
                    return res.status(400).jsonp({ message: 'No se encontraron registros de timbres.' });
                return res.status(200).jsonp({
                    timbres: timbres,
                });
            }
            catch (error) {
                res.status(400).jsonp({ message: error });
            }
        });
    }
    // METODO PARA BUSCAR TIMBRES (ASISTENCIA)
    BuscarTimbresAsistencia(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { fecha, funcion, codigo } = req.body;
            const TIMBRE = yield database_1.default.query(`
            SELECT t.*, t.fec_hora_timbre_servidor::date AS t_fec_timbre, 
                t.fec_hora_timbre_servidor::time AS t_hora_timbre 
                FROM timbres AS t
                WHERE codigo = $1 AND fec_hora_timbre_servidor::date = $2 AND tecl_funcion = $3 
                ORDER BY t.fec_hora_timbre_servidor ASC;
            `, [codigo, fecha, funcion]);
            if (TIMBRE.rowCount > 0) {
                return res.jsonp({ message: 'OK', respuesta: TIMBRE.rows });
            }
            else {
                return res.status(404).jsonp({ message: 'vacio' });
            }
        });
    }
}
exports.timbresControlador = new TimbresControlador;
exports.default = exports.timbresControlador;
