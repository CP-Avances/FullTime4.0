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
exports.EMPLEADO_HORARIOS_CONTROLADOR = void 0;
const database_1 = __importDefault(require("../../../database"));
class EmpleadoHorariosControlador {
    // METODO PARA BUSCAR HORARIOS DEL EMPLEADO EN DETERMINADA FECHA  **USADO
    VerificarHorariosExistentes(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { fechaInicio, fechaFinal } = req.body;
            console.log(" ver body", req.body);
            const { id_empleado } = req.params;
            const HORARIO = yield database_1.default.query(`
            SELECT DISTINCT pg.id_horario, ch.hora_trabajo, ch.codigo, ch.default_  
            FROM eu_asistencia_general AS pg, eh_cat_horarios AS ch
            WHERE pg.id_empleado = $3 AND pg.id_horario = ch.id AND
                (fecha_horario BETWEEN $1 AND $2)
            `, [fechaInicio, fechaFinal, id_empleado]);
            if (HORARIO.rowCount != 0) {
                return res.jsonp(HORARIO.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'Registros no encontrados.' });
            }
        });
    }
    // METODO PARA BUSCAR HORARIOS DEL EMPLEADO EN DETERMINADA FECHA  **USADO
    VerificarHorariosExistentes2(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { fechaInicio, fechaFinal, ids } = req.body;
            console.log("ver body", req.body);
            const HORARIO = yield database_1.default.query(`
            SELECT DISTINCT pg.id_horario, ch.hora_trabajo, ch.codigo, ch.default_, pg.id_empleado
            FROM eu_asistencia_general AS pg, eh_cat_horarios AS ch
            WHERE pg.id_empleado = ANY($3) AND pg.id_horario = ch.id AND
                (fecha_horario BETWEEN $1 AND $2)
            `, [fechaInicio, fechaFinal, ids]);
            if (HORARIO.rowCount != 0) {
                return res.jsonp(HORARIO.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'Registros no encontrados.' });
            }
        });
    }
    // METODO PARA CONSULTAR HORARIO DEL USUARIO POR DIAS-HORAS Y NUMERO DE HORAS DE TRABAJO EN EL MISMO DIA (MD)
    ObtenerHorarioHorasMD(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let { codigo, fecha_inicio, hora_inicio, hora_final } = req.body;
            // CONSULTA DE HORARIO DEL USUARIO INGRESO = SALIDA
            let CASO_1 = yield database_1.default.query(`
            SELECT * FROM vista_horario_entrada AS he
            JOIN vista_horario_salida AS hs ON he.codigo = hs.codigo AND he.fecha_entrada = hs.fecha_salida 
                AND he.id_horario = hs.id_horario AND salida_otro_dia = 0 AND he.codigo = $1
				AND he.fecha_entrada = $2
                AND (($3 BETWEEN hora_inicio AND hora_final) AND ($4 BETWEEN hora_inicio AND hora_final))
            `, [codigo, fecha_inicio, hora_inicio, hora_final])
                .then((result) => { return result.rows; });
            if (CASO_1.length === 0) {
                // CONSULTA DE HORARIO DEL USUARIO INGRESO != SALIDA (SEGUNDO DIA)
                let CASO_2 = yield database_1.default.query(`
                SELECT * FROM vista_horario_entrada AS he
                JOIN vista_horario_salida AS hs ON he.codigo = hs.codigo 
                    AND hs.fecha_salida = (he.fecha_entrada + interval '1 day')
                    AND he.id_horario = hs.id_horario AND salida_otro_dia = 1 AND he.codigo = $1
                    AND ($2 = he.fecha_entrada OR $2 = hs.fecha_salida)
                `, [codigo, fecha_inicio])
                    .then((result) => { return result.rows; });
                if (CASO_2.length === 0) {
                    // CONSULTA DE HORARIO DEL USUARIO INGRESO != SALIDA (TERCER DIA)
                    let CASO_3 = yield database_1.default.query(`
                    SELECT * FROM vista_horario_entrada AS he
                    JOIN vista_horario_salida AS hs ON he.codigo = hs.codigo 
			            AND hs.fecha_salida = (he.fecha_entrada + interval '2 day')
                        AND he.id_horario = hs.id_horario AND salida_otro_dia = 2 AND he.codigo = $1
                        AND ($2 = he.fecha_entrada OR $2 = hs.fecha_salida OR $2= (he.fecha_entrada + interval '1 day'))
                `, [codigo, fecha_inicio])
                        .then((result) => { return result.rows; });
                    if (CASO_3.length === 0) {
                        return res.status(404).jsonp({ message: 'No se han encontrado registros.' });
                    }
                    else {
                        return res.status(200).jsonp({ message: 'CASO_3', respuesta: CASO_3 });
                    }
                }
                else {
                    return res.status(200).jsonp({ message: 'CASO_2', respuesta: CASO_2 });
                }
            }
            else {
                return res.status(200).jsonp({ message: 'CASO_1', respuesta: CASO_1 });
            }
        });
    }
    // METODO PARA CONSULTAR HORARIO DEL USUARIO POR DIAS-HORAS Y NUMERO DE HORAS DE TRABAJO EN DIAS DIFERENTES (DD)
    ObtenerHorarioHorasDD(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let { codigo, fecha_inicio, fecha_final } = req.body;
            // CONSULTA DE HORARIO DEL USUARIO INGRESO = SALIDA
            let CASO_4 = yield database_1.default.query(`
            SELECT * FROM vista_horario_entrada AS he
            JOIN vista_horario_salida AS hs ON he.codigo = hs.codigo 
			    AND hs.fecha_salida = (he.fecha_entrada + interval '1 day')
                AND he.id_horario = hs.id_horario AND salida_otro_dia = 1 AND he.codigo = $1
				AND $2 = he.fecha_entrada AND $3 = hs.fecha_salida
            `, [codigo, fecha_inicio, fecha_final])
                .then((result) => { return result.rows; });
            if (CASO_4.length === 0) {
                // CONSULTA DE HORARIOS MAYORES O IGUALES A 48 HORAS
                let CASO_5 = yield database_1.default.query(`
                SELECT * FROM vista_horario_entrada AS he
                JOIN vista_horario_salida AS hs ON he.codigo = hs.codigo 
			        AND hs.fecha_salida = (he.fecha_entrada + interval '2 day')
                    AND he.id_horario = hs.id_horario AND salida_otro_dia = 2 AND he.codigo = $1
                    AND ($2 = he.fecha_entrada OR $2 = (he.fecha_entrada + interval '1 day')) 
                    AND ($3 = hs.fecha_salida OR $3 = (he.fecha_entrada + interval '1 day'))
                `, [codigo, fecha_inicio, fecha_final])
                    .then((result) => { return result.rows; });
                if (CASO_5.length === 0) {
                    return res.status(404).jsonp({ message: 'No se han encontrado registros.' });
                }
                else {
                    return res.status(200).jsonp({ message: 'CASO_5', respuesta: CASO_5 });
                }
            }
            else {
                return res.status(200).jsonp({ message: 'CASO_4', respuesta: CASO_4 });
            }
        });
    }
    // METODO PARA BUSCAR HORAS DE ALIMENTACION EN EL MISMO DIA (MD)
    ObtenerComidaHorarioHorasMD(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let { codigo, fecha_inicio, hora_inicio, hora_final } = req.body;
            // CONSULTA DE HORARIO DEL USUARIO INGRESO = SALIDA
            let CASO_1 = yield database_1.default.query(`
            SELECT * FROM vista_comida_inicio AS ci
            JOIN vista_comida_fin AS cf ON ci.codigo = cf.codigo AND ci.fecha_entrada = cf.fecha_salida 
                AND ci.id_horario = cf.id_horario AND salida_otro_dia = 0 AND ci.codigo = $1
                AND ci.fecha_entrada = $2
                AND (($3 BETWEEN hora_inicio AND hora_final) OR ($4 BETWEEN hora_inicio AND hora_final))
            `, [codigo, fecha_inicio, hora_inicio, hora_final])
                .then((result) => { return result.rows; });
            if (CASO_1.length === 0) {
                // CONSULTA DE HORARIO DEL USUARIO INGRESO != SALIDA (SEGUNDO DIA)
                let CASO_2 = yield database_1.default.query(`
                SELECT * FROM vista_comida_inicio AS ci
                JOIN vista_comida_fin AS cf ON ci.codigo = cf.codigo 
                    AND cf.fecha_salida = (ci.fecha_entrada + interval '1 day')
                    AND ci.id_horario = cf.id_horario AND salida_otro_dia = 1 AND ci.codigo = $1
                    AND ($2 = ci.fecha_entrada OR $2 = cf.fecha_salida)
                `, [codigo, fecha_inicio])
                    .then((result) => { return result.rows; });
                if (CASO_2.length === 0) {
                    return res.status(404).jsonp({ message: 'No se han encontrado registros.' });
                }
                else {
                    return res.status(200).jsonp({ message: 'CASO_2', respuesta: CASO_2 });
                }
            }
            else {
                return res.status(200).jsonp({ message: 'CASO_1', respuesta: CASO_1 });
            }
        });
    }
    // METODO PARA CONSULTAR MINUTOS DE ALIMENTACION EN DIAS DIFERENTES (DD)
    ObtenerComidaHorarioHorasDD(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let { codigo, fecha_inicio, fecha_final } = req.body;
            // CONSULTA DE HORARIO DEL USUARIO INGRESO != SALIDA
            let CASO_4 = yield database_1.default.query(`
            SELECT * FROM vista_comida_inicio AS ci
            JOIN vista_comida_fin AS cf ON ci.codigo = cf.codigo 
                AND cf.fecha_salida = (ci.fecha_entrada + interval '1 day')
                AND ci.id_horario = cf.id_horario AND salida_otro_dia = 1 AND ci.codigo = $1
                AND $2 = ci.fecha_entrada AND $3 = cf.fecha_salida
            `, [codigo, fecha_inicio, fecha_final])
                .then((result) => { return result.rows; });
            if (CASO_4.length === 0) {
                return res.status(404).jsonp({ message: 'No se han encontrado registros.' });
            }
            else {
                return res.status(200).jsonp({ message: 'CASO_4', respuesta: CASO_4 });
            }
        });
    }
    // VERIFICAR EXISTENCIA DE PLANIFICACION PARA VARIOS EMPLEADOS
    VerificarFechasHorario(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { fechaInicio, fechaFinal, id_horario, ids } = req.body; // 'ids' es un array de id_empleado
            // Consulta para verificar planificaciones duplicadas
            const HORARIOS = yield database_1.default.query(`
        SELECT DISTINCT id_empleado FROM eu_asistencia_general 
        WHERE id_empleado = ANY($3) AND id_horario = $4 AND
            (fecha_horario BETWEEN $1 AND $2)
        `, [fechaInicio, fechaFinal, ids, id_horario]);
            if (HORARIOS.rowCount != 0) {
                // Devolver solo los id_empleado que tienen registros duplicados
                const duplicados = HORARIOS.rows.map((row) => row.id_empleado);
                return res.jsonp({ duplicados });
            }
            else {
                return res.status(404).jsonp({ text: 'Registros no encontrados' });
            }
        });
    }
    // VERIFICAR EXISTENCIA DE PLANIFICACION  **USADO
    VerificarFechasHorario2(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { fechaInicio, fechaFinal, id_horario } = req.body;
            const { id_empleado } = req.params;
            const HORARIO = yield database_1.default.query(`
            SELECT id FROM eu_asistencia_general 
            WHERE id_empleado = $3 AND id_horario = $4 AND
                (fecha_horario BETWEEN $1 AND $2) LIMIT 4
            `, [fechaInicio, fechaFinal, id_empleado, id_horario]);
            if (HORARIO.rowCount != 0) {
                return res.jsonp(HORARIO.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'Registros no encontrados' });
            }
        });
    }
    BuscarFechasMultiples(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { usuarios_validos, eliminar_horarios, fec_inicio, fec_final } = req.body;
                const resultados = []; // Arreglo para almacenar los resultados
                for (const obj of usuarios_validos) {
                    for (const eh of eliminar_horarios) {
                        // Llamar a BuscarFechas y almacenar el resultado en una variable
                        const filas = yield this.BuscarFechas(fec_inicio, fec_final, eh.id, obj.id);
                        // Verificar si se encontraron filas y agregarlas al arreglo
                        if (filas && filas.length > 0) {
                            resultados.push(...filas); // Agregar las filas al arreglo de resultados
                        }
                    }
                }
                // Aquí podrías hacer algo con el arreglo de resultados, por ejemplo, devolverlo en la respuesta
                return res.json(resultados);
            }
            catch (error) {
                console.error('Error al registrar la planificación horaria:', error);
                return res.status(500).json({ message: 'Error al registrar la planificación horaria' });
            }
        });
    }
    // METODO PARA BUSCAR ID POR FECHAS PLAN GENERAL   **USADO
    BuscarFechas(fec_inicio, fec_final, id_horario, id_empleado) {
        return __awaiter(this, void 0, void 0, function* () {
            const FECHAS = yield database_1.default.query(`
            SELECT id FROM eu_asistencia_general 
            WHERE (fecha_horario BETWEEN $1 AND $2) AND id_horario = $3 AND id_empleado = $4
            `, [fec_inicio, fec_final, id_horario, id_empleado]);
            return FECHAS.rows;
        });
    }
}
exports.EMPLEADO_HORARIOS_CONTROLADOR = new EmpleadoHorariosControlador();
exports.default = exports.EMPLEADO_HORARIOS_CONTROLADOR;
