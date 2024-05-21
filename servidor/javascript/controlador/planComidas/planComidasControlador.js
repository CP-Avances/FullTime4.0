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
exports.PLAN_COMIDAS_CONTROLADOR = void 0;
const settingsMail_1 = require("../../libs/settingsMail");
const database_1 = __importDefault(require("../../database"));
const path_1 = __importDefault(require("path"));
class PlanComidasControlador {
    // CONSULTA DE SOLICITUDES DE SERVICIO DE ALIMENTACIÓN CON ESTADO PENDIENTE
    EncontrarSolicitaComidaNull(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const PLAN_COMIDAS = yield database_1.default.query(`
      SELECT e.apellido, e.nombre, e.cedula, e.codigo, sc.aprobada, sc.id, sc.id_empleado, sc.fecha, sc.observacion, 
        sc.fecha_comida, sc.hora_inicio, sc.hora_fin, sc.aprobada, sc.verificar, ctc.id AS id_menu, 
        ctc.nombre AS nombre_menu, tc.id AS id_servicio, tc.nombre AS nombre_servicio, dm.id AS id_detalle, dm.valor, 
        dm.nombre AS nombre_plato, dm.observacion AS observa_menu, sc.extra 
      FROM ma_solicitud_comida AS sc, ma_horario_comidas AS ctc, ma_cat_comidas AS tc, ma_detalle_comida AS dm, 
        eu_empleados AS e 
      WHERE ctc.id_comida = tc.id AND sc.verificar = \'NO\' AND e.id = sc.id_empleado AND 
        ctc.id = dm.id_horario_comida AND sc.id_detalle_comida = dm.id AND sc.fecha_comida >= current_date 
      ORDER BY sc.fecha_comida DESC
      `);
            if (PLAN_COMIDAS.rowCount > 0) {
                return res.jsonp(PLAN_COMIDAS.rows);
            }
            res.status(404).jsonp({ text: 'Registro no encontrado.' });
        });
    }
    // CONSULTA DE SOLICITUDES DE SERVICIO DE ALIMENTACIÓN CON ESTADO AUTORIZADO O NEGADO
    EncontrarSolicitaComidaAprobada(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const PLAN_COMIDAS = yield database_1.default.query(`
      SELECT e.apellido, e.nombre, e.cedula, e.codigo, sc.aprobada, sc.id, sc.id_empleado, sc.fecha, sc.observacion, 
        sc.fecha_comida, sc.hora_inicio, sc.hora_fin, sc.aprobada, sc.verificar, ctc.id AS id_menu, 
        ctc.nombre AS nombre_menu, tc.id AS id_servicio, tc.nombre AS nombre_servicio, dm.id AS id_detalle, dm.valor, 
        dm.nombre AS nombre_plato, dm.observacion AS observa_menu, sc.extra 
      FROM ma_solicitud_comida AS sc, ma_horario_comidas AS ctc, ma_cat_comidas AS tc, ma_detalle_comida AS dm, 
        eu_empleados AS e 
      WHERE ctc.id_comida = tc.id AND (sc.aprobada = true OR sc.aprobada = false) AND e.id = sc.id_empleado 
        AND ctc.id = dm.id_horario_comida AND sc.id_detalle_comida = dm.id AND sc.fecha_comida >= current_date 
      ORDER BY sc.fecha_comida DESC
      `);
            if (PLAN_COMIDAS.rowCount > 0) {
                return res.jsonp(PLAN_COMIDAS.rows);
            }
            res.status(404).jsonp({ text: 'Registro no encontrado.' });
        });
    }
    // CONSULTA DE SOLICITUDES DE SERVICIO DE ALIMENTACIÓN CON ESTADO EXPIRADO
    EncontrarSolicitaComidaExpirada(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const PLAN_COMIDAS = yield database_1.default.query(`
      SELECT e.apellido, e.nombre, e.cedula, e.codigo, sc.aprobada, sc.id, sc.id_empleado, sc.fecha, sc.observacion, 
        sc.fecha_comida, sc.hora_inicio, sc.hora_fin, sc.aprobada, sc.verificar, ctc.id AS id_menu, 
        ctc.nombre AS nombre_menu, tc.id AS id_servicio, tc.nombre AS nombre_servicio, dm.id AS id_detalle, dm.valor, 
        dm.nombre AS nombre_plato, dm.observacion AS observa_menu, sc.extra 
      FROM ma_solicitud_comida AS sc, ma_horario_comidas AS ctc, ma_cat_comidas AS tc, ma_detalle_comida AS dm, 
        eu_empleados AS e 
      WHERE ctc.id_comida = tc.id AND e.id = sc.id_empleado AND ctc.id = dm.id_horario_comida AND sc.id_detalle_comida = dm.id 
        AND sc.fecha_comida < current_date 
      ORDER BY sc.fecha_comida DESC
      `);
            if (PLAN_COMIDAS.rowCount > 0) {
                return res.jsonp(PLAN_COMIDAS.rows);
            }
            res.status(404).jsonp({ text: 'Registro no encontrado.' });
        });
    }
    BuscarSolEmpleadoFechasActualizar(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id, id_empleado, fecha, hora_inicio, hora_fin } = req.body;
            const PLAN_COMIDAS = yield database_1.default.query(`
      SELECT * FROM ma_solicitud_comida 
      WHERE NOT id = $1 AND id_empleado = $2 AND fecha_comida = $3 
        AND ($4 BETWEEN hora_inicio AND hora_fin OR $5 BETWEEN hora_inicio AND hora_fin)
      `, [id, id_empleado, fecha, hora_inicio, hora_fin]);
            if (PLAN_COMIDAS.rowCount > 0) {
                return res.jsonp(PLAN_COMIDAS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    EncontrarSolicitaComidaIdEmpleado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_empleado } = req.params;
            const PLAN_COMIDAS = yield database_1.default.query(`
      SELECT sc.verificar, sc.aprobada, sc.id, sc.id_empleado, sc.fecha, sc.observacion, sc.fecha_comida, sc.hora_inicio, 
        sc.hora_fin, ctc.id AS id_menu, ctc.nombre AS nombre_menu, tc.id AS id_servicio, tc.nombre AS nombre_servicio, 
        dm.id AS id_detalle, dm.valor, dm.nombre AS nombre_plato, dm.observacion AS observa_menu, sc.extra 
      FROM ma_solicitud_comida AS sc, ma_horario_comidas AS ctc, ma_cat_comidas AS tc, ma_detalle_comida AS dm 
      WHERE sc.id_empleado = $1 AND ctc.id_comida = tc.id AND ctc.id = dm.id_horario_comida AND sc.id_detalle_comida = dm.id 
      ORDER BY sc.fecha_comida DESC
      `, [id_empleado]);
            if (PLAN_COMIDAS.rowCount > 0) {
                return res.jsonp(PLAN_COMIDAS.rows);
            }
            res.status(404).jsonp({ text: 'Registro no encontrado.' });
        });
    }
    // CONSULTA PARA BUSCAR TODAS LAS PLANIFICACIONES DE COMIDAS
    ListarPlanComidas(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const PLAN_COMIDAS = yield database_1.default.query(`
      SELECT pc.id, pc.fecha, pc.observacion, pc.fecha_inicio, pc.fecha_final, pc.hora_inicio, pc.hora_fin, 
        ctc.id AS id_menu, ctc.nombre AS nombre_menu, tc.id AS id_servicio, tc.nombre AS nombre_servicio, 
        dm.id AS id_detalle, dm.valor, dm.nombre AS nombre_plato, dm.observacion AS observa_menu, pc.extra 
      FROM ma_detalle_plan_comida AS pc, ma_horario_comidas AS ctc, ma_cat_comidas AS tc, ma_detalle_comida AS dm 
      WHERE ctc.id_comida = tc.id AND ctc.id = dm.id_horario_comida AND pc.id_detalle_comida = dm.id 
      ORDER BY pc.fecha_inicio DESC
      `);
            if (PLAN_COMIDAS.rowCount > 0) {
                return res.jsonp(PLAN_COMIDAS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    // CONSULTA PARA CREAR UNA PLANIFICACIÓN
    CrearPlanComidas(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { fecha, id_comida, observacion, fec_comida, hora_inicio, hora_fin, extra, fec_inicio, fec_final } = req.body;
                const response = yield database_1.default.query(`
        INSERT INTO ma_detalle_plan_comida (fecha, id_comida, observacion, fecha_comida, hora_inicio, hora_fin, extra, 
          fecha_inicio, fecha_final) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *
        `, [fecha, id_comida, observacion, fec_comida, hora_inicio, hora_fin, extra, fec_inicio, fec_final]);
                const [planAlimentacion] = response.rows;
                if (!planAlimentacion) {
                    return res.status(404).jsonp({ message: 'error' });
                }
                else {
                    return res.status(200).jsonp({ message: 'ok', info: planAlimentacion });
                }
            }
            catch (error) {
                return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
            }
        });
    }
    ObtenerUltimaPlanificacion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const PLAN_COMIDAS = yield database_1.default.query(`
      SELECT MAX(id) AS ultimo FROM ma_detalle_plan_comida
      `);
            if (PLAN_COMIDAS.rowCount > 0) {
                return res.jsonp(PLAN_COMIDAS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    ActualizarPlanComidas(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { fecha, id_comida, observacion, fec_comida, hora_inicio, hora_fin, extra, id } = req.body;
            yield database_1.default.query(`
      UPDATE ma_detalle_plan_comida SET id_empleado = $1, fecha = $2, id_comida = $3,
        observacion = $4, fecha_comida = $5, hora_inicio = $6, hora_fin = $7, extra = $8
      WHERE id = $9
      `, [fecha, id_comida, observacion, fec_comida, hora_inicio, hora_fin, extra, id]);
            res.jsonp({ message: 'Registro guardado.' });
        });
    }
    EncontrarPlanComidaEmpleadoConsumido(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_plan_comida, id_empleado } = req.body;
            const PLAN_COMIDAS = yield database_1.default.query(`
      SELECT * FROM ma_empleado_plan_comida_general 
      WHERE id_detalle_plan = $1 AND consumido = true AND id_empleado = $2
      `, [id_plan_comida, id_empleado]);
            if (PLAN_COMIDAS.rowCount > 0) {
                return res.jsonp(PLAN_COMIDAS.rows);
            }
            res.status(404).jsonp({ text: 'Registro no encontrado.' });
        });
    }
    // BUSQUEDA DE PLANIFICACIONES POR EMPLEADO Y FECHA 
    BuscarPlanComidaEmpleadoFechas(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id, fecha_inicio, fecha_fin, hora_inicio, hora_fin } = req.body;
            const PLAN_COMIDAS = yield database_1.default.query(`
      SELECT * FROM ma_empleado_plan_comida_general 
      WHERE id_empleado = $1 AND fecha BETWEEN $2 AND $3
      `, [id, fecha_inicio, fecha_fin]);
            if (PLAN_COMIDAS.rowCount > 0) {
                return res.jsonp(PLAN_COMIDAS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    // CONSULTA PARA BUSCAR DATOS DE EMPLEADO Y FECHAS DE PLANIFICACIÓN SIN INCLUIR LA QUE SERA ACTUALIZADA
    ActualizarPlanComidaEmpleadoFechas(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id, fecha_inicio, fecha_fin, id_plan_comida } = req.body;
            const PLAN_COMIDAS = yield database_1.default.query(`
      SELECT * FROM ma_empleado_plan_comida_general WHERE NOT id_detalle_plan = $4 
        AND id_empleado = $1 AND fecha BETWEEN $2 AND $3
      `, [id, fecha_inicio, fecha_fin, id_plan_comida]);
            if (PLAN_COMIDAS.rowCount > 0) {
                return res.jsonp(PLAN_COMIDAS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    // CONSULTA PARA BUSCAR DATOS DE EMPLEADO Y FECHAS DE PLANIFICACIÓN-SOLICITUD SIN INCLUIR LA QUE SERA ACTUALIZADA
    ActualizarSolComidaEmpleadoFechas(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id, fecha_inicio, fecha_fin, id_sol_comida } = req.body;
            const PLAN_COMIDAS = yield database_1.default.query(`
      SELECT * FROM ma_empleado_plan_comida_general 
      WHERE NOT id_solicitud_comida = $4 AND id_empleado = $1 AND fecha BETWEEN $2 AND $3
      `, [id, fecha_inicio, fecha_fin, id_sol_comida]);
            if (PLAN_COMIDAS.rowCount > 0) {
                return res.jsonp(PLAN_COMIDAS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    /** TABLA TIPO COMIDAS */
    ListarTipoComidas(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const PLAN_COMIDAS = yield database_1.default.query(`
      SELECT * FROM ma_cat_comidas
      `);
            if (PLAN_COMIDAS.rowCount > 0) {
                return res.jsonp(PLAN_COMIDAS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    CrearTipoComidas(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { nombre } = req.body;
            const response = yield database_1.default.query(`
      INSERT INTO ma_cat_comidas (nombre) VALUES ($1) RETURNING *
      `, [nombre]);
            const [tipo] = response.rows;
            if (tipo) {
                return res.status(200).jsonp(tipo);
            }
            else {
                return res.status(404).jsonp({ message: "error" });
            }
            ;
        });
    }
    VerUltimoTipoComidas(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const PLAN_COMIDAS = yield database_1.default.query(`
      SELECT MAX(id) FROM ma_cat_comidas
      `);
            if (PLAN_COMIDAS.rowCount > 0) {
                return res.jsonp(PLAN_COMIDAS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    /** **************************************************************************************************** **
     ** **                          METODOS DE CREACION DE SOLICITUD DE COMIDAS                           ** **
     ** **************************************************************************************************** **/
    // CONSULTA PARA REGISTRAR DATOS DE SOLICITUD DE COMIDA
    CrearSolicitaComida(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id_empleado, fecha, id_comida, observacion, fec_comida, hora_inicio, hora_fin, extra, verificar, id_departamento } = req.body;
                const response = yield database_1.default.query(`
        INSERT INTO ma_solicitud_comida (id_empleado, fecha, id_comida, observacion, fecha_comida,
          hora_inicio, hora_fin, extra, verificar) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *
        `, [id_empleado, fecha, id_comida, observacion, fec_comida, hora_inicio, hora_fin, extra, verificar]);
                const [objetoAlimento] = response.rows;
                if (!objetoAlimento)
                    return res.status(404).jsonp({ message: 'Registro guardado.' });
                const alimento = objetoAlimento;
                return res.status(200).jsonp(alimento);
            }
            catch (error) {
                console.log(error);
                return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
            }
        });
    }
    // METODO DE ACTUALIZACIÓN DE SERVICIO DE ALIMENTACION
    ActualizarSolicitaComida(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_empleado, fecha, id_comida, observacion, fec_comida, hora_inicio, hora_fin, extra, id, id_departamento } = req.body;
            const response = yield database_1.default.query(`
      UPDATE ma_solicitud_comida SET id_empleado = $1, fecha = $2, id_comida = $3, 
        observacion = $4, fecha_comida = $5, hora_inicio = $6, hora_fin = $7, extra = $8 
      WHERE id = $9 RETURNING *
      `, [id_empleado, fecha, id_comida, observacion, fec_comida, hora_inicio, hora_fin, extra, id]);
            const [objetoAlimento] = response.rows;
            if (!objetoAlimento)
                return res.status(404).jsonp({ message: 'Solicitud no registrada.' });
            const alimento = objetoAlimento;
            return res.status(200).jsonp(alimento);
        });
    }
    // ELIMINAR REGISTRO DE SOLIICTUD DE COMIDA
    EliminarSolicitudComida(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            const response = yield database_1.default.query(`
      DELETE FROM ma_solicitud_comida WHERE id = $1 RETURNING *
      `, [id]);
            const [alimentacion] = response.rows;
            if (alimentacion) {
                return res.status(200).jsonp(alimentacion);
            }
            else {
                return res.status(404).jsonp({ message: 'Registro no eliminado.' });
            }
        });
    }
    // METODO PARA ACTUALIZAR ESTADO DE SOLICITUD DE ALIMENTACION
    AprobarSolicitaComida(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { aprobada, verificar, id } = req.body;
            const response = yield database_1.default.query(`
      UPDATE ma_solicitud_comida SET aprobada = $1, verificar = $2 WHERE id = $3 RETURNING *
      `, [aprobada, verificar, id]);
            const [objetoAlimento] = response.rows;
            if (objetoAlimento) {
                return res.status(200).jsonp(objetoAlimento);
            }
            else {
                return res.status(404).jsonp({ message: 'error' });
            }
        });
    }
    //  CREAR REGISTRO DE ALIMENTOS APROBADOS POR EMPLEADO
    CrearComidaAprobada(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { codigo, id_empleado, id_sol_comida, fecha, hora_inicio, hora_fin, consumido } = req.body;
            const response = yield database_1.default.query(`
      INSERT INTO ma_empleado_plan_comida_general (codigo, id_empleado, id_sol_comida, fecha,
        hora_inicio, hora_fin, consumido) 
      VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *
      `, [codigo, id_empleado, id_sol_comida, fecha, hora_inicio, hora_fin, consumido]);
            const [objetoAlimento] = response.rows;
            if (objetoAlimento) {
                return res.status(200).jsonp(objetoAlimento);
            }
            else {
                return res.status(404).jsonp({ message: 'error' });
            }
        });
    }
    // ELIMINAR ALIMENTACION APROBADA
    EliminarComidaAprobada(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            const fecha = req.params.fecha;
            const id_empleado = req.params.id_empleado;
            const response = yield database_1.default.query(`
      DELETE FROM ma_empleado_plan_comida_general 
      WHERE id_solicitud_comida = $1 AND fecha = $2 AND id_empleado = $3
      RETURNING *
      `, [id, fecha, id_empleado]);
            const [objetoAlimento] = response.rows;
            if (objetoAlimento) {
                return res.status(200).jsonp(objetoAlimento);
            }
            else {
                return res.status(404).jsonp({ message: 'error' });
            }
        });
    }
    // ELIMINAR REGISTRO DE ALIMENTACION
    EliminarRegistros(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            yield database_1.default.query(`
      DELETE FROM ma_detalle_plan_comida WHERE id = $1
      `, [id]);
            res.jsonp({ message: 'Registro eliminado.' });
        });
    }
    // ELIMINAR PLANIFICACION DE UN USUARIO ESPECIFICO
    EliminarPlanComidaEmpleado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            const id_empleado = req.params.id_empleado;
            yield database_1.default.query(`
      DELETE FROM ma_empleado_plan_comida_general WHERE id_detalle_plan = $1 AND id_empleado = $2
      `, [id, id_empleado]);
            res.jsonp({ message: 'Registro eliminado.' });
        });
    }
    // BUSQUEDA DE PLANIFICCAIONES DE ALIMENTACION POR ID DE PLANIFICACION
    EncontrarPlanComidaIdPlan(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const PLAN_COMIDAS = yield database_1.default.query(`
      SELECT DISTINCT pc.id, pce.id_empleado, pc.fecha, pc.observacion, pc.fecha_inicio, pc.fecha_final, pc.hora_inicio, 
        pc.hora_fin, (e.nombre || ' ' || e.apellido) AS nombre, e.codigo, e.cedula, e.correo, ctc.id AS id_menu, 
        ctc.nombre AS nombre_menu, tc.id AS id_servicio, tc.nombre AS nombre_servicio, dm.id AS id_detalle, dm.valor, 
        dm.nombre AS nombre_plato, dm.observacion AS observa_menu, pc.extra 
      FROM ma_detalle_plan_comida AS pc, ma_empleado_plan_comida_general AS pce, ma_horario_comidas AS ctc, 
        ma_cat_comidas AS tc, ma_detalle_comida AS dm, eu_empleados AS e 
      WHERE pc.id = $1 AND ctc.id_comida = tc.id AND ctc.id = dm.id_horario_comida AND pc.id_detalle_comida = dm.id 
        AND pc.id = pce.id_detalle_plan AND e.id = pce.id_empleado 
      ORDER BY pc.fecha_inicio DESC
      `, [id]);
            if (PLAN_COMIDAS.rowCount > 0) {
                return res.jsonp(PLAN_COMIDAS.rows);
            }
            res.status(404).jsonp({ text: 'Registro no encontrado.' });
        });
    }
    // CREAR PLANIFICACIÓN POR EMPLEADO
    CrearPlanEmpleado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { codigo, id_empleado, id_plan_comida, fecha, hora_inicio, hora_fin, consumido } = req.body;
            yield database_1.default.query(`
      INSERT INTO plan_comida_empleado (codigo, id_empleado, id_detalle_plan, fecha, 
        hora_inicio, hora_fin, consumido) 
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [codigo, id_empleado, id_plan_comida, fecha, hora_inicio, hora_fin, consumido]);
            res.jsonp({ message: 'Registro guardado.' });
        });
    }
    // METODO PARA BUSCAR DATOS DE PLANIFICACIÓN DE ALIMENTACIÓN POR ID DE USUARIO
    EncontrarPlanComidaIdEmpleado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_empleado } = req.params;
            const PLAN_COMIDAS = yield database_1.default.query(`
      SELECT DISTINCT pc.id, pce.id_empleado, pc.fecha, pc.observacion, pc.fecha_inicio, pc.fecha_final, pc.hora_inicio, 
        pc.hora_fin, ctc.id AS id_menu, ctc.nombre AS nombre_menu, tc.id AS id_servicio, tc.nombre AS nombre_servicio, 
        dm.id AS id_detalle, dm.valor, dm.nombre AS nombre_plato, dm.observacion AS observa_menu, pc.extra, e.codigo, 
        e.cedula, e.correo, (e.nombre || ' ' || e.apellido) AS nombre
      FROM ma_detalle_plan_comida AS pc, ma_empleado_plan_comida_general AS pce, ma_horario_comidas AS ctc, 
        ma_cat_comidas AS tc, ma_detalle_comida AS dm, eu_empleados AS e 
	    WHERE pce.id_empleado = $1 AND ctc.id_comida = tc.id AND ctc.id = dm.id_horario_comida AND pc.id_detalle_comida = dm.id 
        AND pc.id = pce.id_detalle_plan AND e.id = pce.id_empleado
	    ORDER BY pc.fecha_inicio DESC
      `, [id_empleado]);
            if (PLAN_COMIDAS.rowCount > 0) {
                return res.jsonp(PLAN_COMIDAS.rows);
            }
            res.status(404).jsonp({ text: 'Registro no encontrado.' });
        });
    }
    /** ********************************************************************************************** **
     ** *              ENVIO DE NOTIFICACIONES DE SERVICIOS DE ALIMENTACIÓN                          * **
     ** ********************************************************************************************** **/
    // NOTIFICACIONES DE SOLICITUDES Y PLANIFICACIÓN DE SERVICIO DE ALIMENTACIÓN
    EnviarNotificacionComidas(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let { id_empl_envia, id_empl_recive, mensaje, tipo, id_comida } = req.body;
            var tiempo = (0, settingsMail_1.fechaHora)();
            let create_at = tiempo.fecha_formato + ' ' + tiempo.hora;
            const SERVICIO_SOLICITADO = yield database_1.default.query(`
        SELECT tc.nombre AS servicio, ctc.nombre AS menu, ctc.hora_inicio, ctc.hora_fin, 
          dm.nombre AS comida, dm.valor, dm.observacion 
        FROM ma_cat_comidas AS tc, ma_horario_comidas AS ctc, ma_detalle_comida AS dm 
        WHERE tc.id = ctc.id_comida AND ctc.id = dm.id_horario_comida AND dm.id = $1
      `, [id_comida]);
            let notifica = mensaje + SERVICIO_SOLICITADO.rows[0].servicio;
            const response = yield database_1.default.query(`
      INSERT INTO ecm_realtime_timbres (fecha_hora, id_empleado_envia, id_empleado_recibe, descripcion, tipo) 
      VALUES($1, $2, $3, $4, $5) 
      RETURNING *
      `, [create_at, id_empl_envia, id_empl_recive, notifica, tipo]);
            const [notificiacion] = response.rows;
            if (!notificiacion)
                return res.status(400).jsonp({ message: 'Notificación no ingresada.' });
            const USUARIO = yield database_1.default.query(`
      SELECT (nombre || ' ' || apellido) AS usuario
      FROM eu_empleados WHERE id = $1
      `, [id_empl_envia]);
            notificiacion.usuario = USUARIO.rows[0].usuario;
            return res.status(200)
                .jsonp({ message: 'Se ha enviado la respectiva notificación.', respuesta: notificiacion });
        });
    }
    /** ******************************************************************************************** **
     ** *            METODO ENVÍO DE CORREO ELECTRÓNICO DE SOLICITUDES DE ALIMENTACIÓN             * **
     ** ******************************************************************************************** **/
    // ENVIAR CORRE ELECTRÓNICO INDICANDO QUE SE HA REALIZADO UNA SOLICITUD DE COMIDA MEDIANTE APP WEB
    EnviarCorreoComidas(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var tiempo = (0, settingsMail_1.fechaHora)();
            var fecha = yield (0, settingsMail_1.FormatearFecha)(tiempo.fecha_formato, settingsMail_1.dia_completo);
            var hora = yield (0, settingsMail_1.FormatearHora)(tiempo.hora);
            const path_folder = path_1.default.resolve('logos');
            var datos = yield (0, settingsMail_1.Credenciales)(req.id_empresa);
            if (datos === 'ok') {
                const { id_usua_solicita, correo, fec_solicitud, id_comida, inicio, final, observacion, extra, solicitado_por, asunto, tipo_solicitud, proceso, estadoc } = req.body;
                var tipo_servicio = 'Extra';
                if (extra === false) {
                    tipo_servicio = 'Normal';
                }
                const EMPLEADO_SOLICITA = yield database_1.default.query(`
        SELECT e.correo, e.nombre, e.apellido, e.cedula, ecr.id_departamento, ecr.id_sucursal, ecr.id AS cargo, 
          tc.cargo AS tipo_cargo, d.nombre AS departamento 
        FROM eu_empleados AS e, eu_empleado_cargos AS ecr, e_cat_tipo_cargo AS tc, ed_departamentos AS d 
        WHERE (SELECT MAX(cargo_id) AS cargo FROM datos_empleado_cargo WHERE empl_id = e.id) = ecr.id 
          AND tc.id = ecr.id_tipo_cargo AND d.id = ecr.id_departamento AND e.id = $1 
        ORDER BY cargo DESC
        `, [id_usua_solicita]);
                const SERVICIO_SOLICITADO = yield database_1.default.query(`
        SELECT tc.nombre AS servicio, ctc.nombre AS menu, ctc.hora_inicio, ctc.hora_fin, 
          dm.nombre AS comida, dm.valor, dm.observacion 
        FROM ma_cat_comidas AS tc, ma_horario_comidas AS ctc, ma_detalle_comida AS dm 
        WHERE tc.id = ctc.id_comida AND ctc.id = dm.id_horario_comida AND dm.id = $1
        `, [id_comida]);
                console.log(EMPLEADO_SOLICITA.rows);
                var url = `${process.env.URL_DOMAIN}/listaSolicitaComida`;
                let data = {
                    to: correo,
                    from: settingsMail_1.email,
                    subject: asunto,
                    html: `
          <body>
            <div style="text-align: center;">
              <img width="25%" height="25%" src="cid:cabeceraf"/>
            </div>
            <br>
            <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;">
              El presente correo es para informar que se ha ${proceso} la siguiente solicitud de servicio de alimentación: <br>  
            </p>
            <h3 style="font-family: Arial; text-align: center;">DATOS DEL SOLICITANTE</h3>
            <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;">
              <b>Empresa:</b> ${settingsMail_1.nombre} <br>   
              <b>Asunto:</b> ${asunto} <br> 
              <b>Colaborador que envía:</b> ${EMPLEADO_SOLICITA.rows[0].nombre} ${EMPLEADO_SOLICITA.rows[0].apellido} <br>
              <b>Número de Cédula:</b> ${EMPLEADO_SOLICITA.rows[0].cedula} <br>
              <b>Cargo:</b> ${EMPLEADO_SOLICITA.rows[0].tipo_cargo} <br>
              <b>Departamento:</b> ${EMPLEADO_SOLICITA.rows[0].departamento} <br>
              <b>Generado mediante:</b> Aplicación Web <br>
              <b>Fecha de envío:</b> ${fecha} <br> 
              <b>Hora de envío:</b> ${hora} <br><br> 
            </p>
            <h3 style="font-family: Arial; text-align: center;">INFORMACIÓN DE LA SOLICITUD</h3>
            <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;">
              <b>Motivo:</b> ${observacion} <br>   
              <b>Fecha de Solicitud:</b> ${fec_solicitud} <br> 
              <b>Servicio:</b> ${SERVICIO_SOLICITADO.rows[0].servicio} <br>
              <b>Menú:</b> ${SERVICIO_SOLICITADO.rows[0].menu} - ${SERVICIO_SOLICITADO.rows[0].comida} <br>
              <b>Detalle del servicio:</b> ${SERVICIO_SOLICITADO.rows[0].observacion} <br>
              <b>Servicio desde:</b> ${inicio} <br>
              <b>Servicio hasta:</b> ${final} <br>
              <b>Tipo de servicio:</b> ${tipo_servicio} <br>
              <b>Estado:</b> ${estadoc} <br><br>
              <b>${tipo_solicitud}:</b> ${solicitado_por} <br><br>
              <a href="${url}">Dar clic en el siguiente enlace para revisar solicitud de servicio de alimentación.</a> <br><br>
            </p>
            <p style="font-family: Arial; font-size:12px; line-height: 1em;">
              <b>Gracias por la atención</b><br>
              <b>Saludos cordiales,</b> <br><br>
            </p>
            <img src="cid:pief" width="50%" height="50%"/>
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
                res.jsonp({ message: 'Ups!!! algo salio mal. No fue posible enviar correo electrónico.' });
            }
        });
    }
    // METODO DE ENVIO DE CORREO ELECTRÓNICO MEDIANTE APLICACIÓN MÓVIL
    EnviarCorreoComidasMovil(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var tiempo = (0, settingsMail_1.fechaHora)();
            var fecha = yield (0, settingsMail_1.FormatearFecha)(tiempo.fecha_formato, settingsMail_1.dia_completo);
            var hora = yield (0, settingsMail_1.FormatearHora)(tiempo.hora);
            const path_folder = path_1.default.resolve('logos');
            var datos = yield (0, settingsMail_1.Credenciales)(parseInt(req.params.id_empresa));
            if (datos === 'ok') {
                const { id_usua_solicita, correo, fec_solicitud, id_comida, inicio, final, observacion, extra, solicitado_por, asunto, tipo_solicitud, proceso, estadoc } = req.body;
                var tipo_servicio = 'Extra';
                if (extra === false) {
                    tipo_servicio = 'Normal';
                }
                const EMPLEADO_SOLICITA = yield database_1.default.query(`
          SELECT e.correo, e.nombre, e.apellido, e.cedula, ecr.id_departamento, ecr.id_sucursal, ecr.id AS cargo, 
            tc.cargo AS tipo_cargo, d.nombre AS departamento 
          FROM eu_empleados AS e, eu_empleado_cargos AS ecr, e_cat_tipo_cargo AS tc, ed_departamentos AS d
          WHERE (SELECT MAX(cargo_id) AS cargo FROM datos_empleado_cargo WHERE empl_id = e.id) = ecr.id 
            AND tc.id = ecr.id_tipo_cargo AND d.id = ecr.id_departamento AND e.id = $1 
          ORDER BY cargo DESC
        `, [id_usua_solicita]);
                const SERVICIO_SOLICITADO = yield database_1.default.query(`
          SELECT tc.nombre AS servicio, ctc.nombre AS menu, ctc.hora_inicio, ctc.hora_fin, dm.nombre AS comida, dm.valor, 
            dm.observacion 
          FROM ma_cat_comidas AS tc, ma_horario_comidas AS ctc, ma_detalle_comida AS dm 
          WHERE tc.id = ctc.id_comida AND ctc.id = dm.id_horario_comida AND dm.id = $1
        `, [id_comida]);
                console.log(EMPLEADO_SOLICITA.rows);
                let data = {
                    to: correo,
                    from: settingsMail_1.email,
                    subject: asunto,
                    html: `
          <body>
            <div style="text-align: center;">
              <img width="25%" height="25%" src="cid:cabeceraf"/>
            </div>
            <br>
            <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;">
              El presente correo es para informar que se ha ${proceso} la siguiente solicitud de servicio de alimentación: <br>  
            </p>
            <h3 style="font-family: Arial; text-align: center;">DATOS DEL SOLICITANTE</h3>
            <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;">
              <b>Empresa:</b> ${settingsMail_1.nombre} <br>   
              <b>Asunto:</b> ${asunto} <br> 
              <b>Colaborador que envía:</b> ${EMPLEADO_SOLICITA.rows[0].nombre} ${EMPLEADO_SOLICITA.rows[0].apellido} <br>
              <b>Número de Cédula:</b> ${EMPLEADO_SOLICITA.rows[0].cedula} <br>
              <b>Cargo:</b> ${EMPLEADO_SOLICITA.rows[0].tipo_cargo} <br>
              <b>Departamento:</b> ${EMPLEADO_SOLICITA.rows[0].departamento} <br>
              <b>Generado mediante:</b> Aplicación Móvil <br>
              <b>Fecha de envío:</b> ${fecha} <br> 
              <b>Hora de envío:</b> ${hora} <br><br> 
            </p>
            <h3 style="font-family: Arial; text-align: center;">INFORMACIÓN DE LA SOLICITUD</h3>
            <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;">
              <b>Motivo:</b> ${observacion} <br>   
              <b>Fecha de Solicitud:</b> ${fec_solicitud} <br> 
              <b>Servicio:</b> ${SERVICIO_SOLICITADO.rows[0].servicio} <br>
              <b>Menú:</b> ${SERVICIO_SOLICITADO.rows[0].menu} - ${SERVICIO_SOLICITADO.rows[0].comida} <br>
              <b>Detalle del servicio:</b> ${SERVICIO_SOLICITADO.rows[0].observacion} <br>
              <b>Servicio desde:</b> ${inicio} <br>
              <b>Servicio hasta:</b> ${final} <br>
              <b>Tipo de servicio:</b> ${tipo_servicio} <br>
              <b>Estado:</b> ${estadoc} <br><br>
              <b>${tipo_solicitud}:</b> ${solicitado_por} <br><br>
            </p>
            <p style="font-family: Arial; font-size:12px; line-height: 1em;">
              <b>Gracias por la atención</b><br>
              <b>Saludos cordiales,</b> <br><br>
            </p>
            <img src="cid:pief" width="50%" height="50%"/>
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
                res.jsonp({ message: 'Ups!!! algo salio mal. No fue posible enviar correo electrónico.' });
            }
        });
    }
    /** ************************************************************************************************ **
     ** **    METODOS DE ENVIO DE CORREO ELECTRONICO DE PLANIFICACION DE SERVICIOS DE ALIMENTACION    ** **
     ** ************************************************************************************************ **/
    // ENVIAR CORREO ELECTRÓNICO DE PLANIFICACIÓN DE COMIDA APLICACION WEB  -- verificar si se requiere estado
    EnviarCorreoPlanComidas(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var tiempo = (0, settingsMail_1.fechaHora)();
            var fecha = yield (0, settingsMail_1.FormatearFecha)(tiempo.fecha_formato, settingsMail_1.dia_completo);
            var hora = yield (0, settingsMail_1.FormatearHora)(tiempo.hora);
            const path_folder = path_1.default.resolve('logos');
            var datos = yield (0, settingsMail_1.Credenciales)(req.id_empresa);
            if (datos === 'ok') {
                const { id_envia, desde, hasta, inicio, final, correo, id_comida, observacion, extra, nombres, asunto, tipo_solicitud, proceso } = req.body;
                console.log('data', req.body);
                var tipo_servicio = 'Extra';
                if (extra === false) {
                    tipo_servicio = 'Normal';
                }
                const Envia = yield database_1.default.query(`
        SELECT da.nombre, da.apellido, da.cedula, da.correo, 
          (SELECT tc.cargo FROM e_cat_tipo_cargo AS tc WHERE tc.id = ec.id_tipo_cargo) AS tipo_cargo,
          (SELECT cd.nombre FROM ed_departamentos AS cd WHERE cd.id = ec.id_departamento) AS departamento
        FROM datos_actuales_empleado AS da, eu_empleado_cargos AS ec
        WHERE da.id = $1 AND ec.id = da.id_cargo
        `, [id_envia]).then((resultado) => { return resultado.rows[0]; });
                console.log('envia...', Envia);
                const SERVICIO_SOLICITADO = yield database_1.default.query(`
        SELECT tc.nombre AS servicio, ctc.nombre AS menu, ctc.hora_inicio, ctc.hora_fin, dm.nombre AS comida, dm.valor, 
          dm.observacion 
        FROM ma_cat_comidas AS tc, ma_horario_comidas AS ctc, ma_detalle_comida AS dm 
        WHERE tc.id = ctc.id_comida AND ctc.id = dm.id_horario_comida AND dm.id = $1
        `, [id_comida]);
                let data = {
                    to: correo,
                    from: settingsMail_1.email,
                    subject: asunto,
                    html: `
          <body>
            <div style="text-align: center;">
              <img width="25%" height="25%" src="cid:cabeceraf"/>
            </div>
            <br>
            <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;">
              El presente correo es para informar que se ha ${proceso} la siguiente planificación de servicio de alimentación: <br>  
            </p>
            <h3 style="font-family: Arial; text-align: center;">DATOS DEL COLABORADOR QUE ${tipo_solicitud} PLANIFICACIÓN DE ALIMENTACIÓN</h3>
            <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;">
              <b>Empresa:</b> ${settingsMail_1.nombre} <br>   
              <b>Asunto:</b> ${asunto} <br> 
              <b>Colaborador que envía:</b> ${Envia.nombre} ${Envia.apellido} <br>
              <b>Número de Cédula:</b> ${Envia.cedula} <br>
              <b>Cargo:</b> ${Envia.tipo_cargo} <br>
              <b>Departamento:</b> ${Envia.departamento} <br>
              <b>Generado mediante:</b> Aplicación Web <br>
              <b>Fecha de envío:</b> ${fecha} <br> 
              <b>Hora de envío:</b> ${hora} <br><br> 
            </p>
            <h3 style="font-family: Arial; text-align: center;">INFORMACIÓN DE LA PLANIFICACIÓN</h3>
            <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;">
              <b>Motivo:</b> ${observacion} <br>   
              <b>Fecha de Planificación:</b> ${fecha} <br> 
              <b>Desde:</b> ${desde} <br>
              <b>Hasta:</b> ${hasta} <br>
              <b>Horario:</b> ${inicio} a ${final} <br>
              <b>Servicio:</b> ${SERVICIO_SOLICITADO.rows[0].servicio} <br>
              <b>Menú:</b> ${SERVICIO_SOLICITADO.rows[0].menu} - ${SERVICIO_SOLICITADO.rows[0].comida} <br>
              <b>Detalle del servicio:</b> ${SERVICIO_SOLICITADO.rows[0].observacion} <br>
              <b>Servicio desde:</b> ${inicio} <br>
              <b>Servicio hasta:</b> ${final} <br>
              <b>Tipo de servicio:</b> ${tipo_servicio} <br><br>
              <b>Colabores a los cuales se les ha ${proceso} una planificación de servicio de alimentación:</b>
            </p>
            <div style="text-align: center;"> 
            <table border=2 cellpadding=10 cellspacing=0 style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px;">
              <tr>
                <th><h5>COLABORADOR</h5></th> 
                <th><h5>CÉDULA</h5></th> 
              </tr>            
              ${nombres} 
            </table>
            </div>
              <p style="font-family: Arial; font-size:12px; line-height: 1em;">
                <b>Gracias por la atención</b><br>
                <b>Saludos cordiales,</b> <br><br>
              </p>
              <img src="cid:pief" width="50%" height="50%"/>
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
                res.jsonp({ message: 'Ups!!! algo salio mal. No fue posible enviar correo electrónico.' });
            }
        });
    }
}
exports.PLAN_COMIDAS_CONTROLADOR = new PlanComidasControlador();
exports.default = exports.PLAN_COMIDAS_CONTROLADOR;
