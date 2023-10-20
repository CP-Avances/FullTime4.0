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
const SubMetodosGraficas_1 = require("../../libs/SubMetodosGraficas");
const MetodosHorario_1 = require("../../libs/MetodosHorario");
const moment_1 = __importDefault(require("moment"));
const database_1 = __importDefault(require("../../database"));
class ReportesAsistenciaControlador {
    /**
     * REALIZA UN ARRAY DE SUCURSALES CON DEPARTAMENTOS Y EMPLEADOS DEPENDIENDO DEL ESTADO DEL EMPLEADO
     * SI BUSCA EMPLEADOS ACTIVOS O INACTIVOS.
     * @returns Retorna Array de [Sucursales[Departamentos[empleados[]]]]
     */
    // METODO PARA BUSCAR DATOS DE USUARIO
    DatosGeneralesUsuarios(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let estado = req.params.estado;
            // CONSULTA DE BUSQUEDA DE SUCURSALES
            let suc = yield database_1.default.query(`
            SELECT s.id AS id_suc, s.nombre AS name_suc, c.descripcion AS ciudad 
            FROM sucursales AS s, ciudades AS c 
            WHERE s.id_ciudad = c.id 
            ORDER BY s.id
            `)
                .then((result) => { return result.rows; });
            if (suc.length === 0)
                return res.status(404).jsonp({ message: 'No se han encontrado registros.' });
            let departamentos = yield Promise.all(suc.map((dep) => __awaiter(this, void 0, void 0, function* () {
                dep.departamentos = yield database_1.default.query(`
                SELECT d.id as id_depa, d.nombre as name_dep, s.nombre AS sucursal
                FROM cg_departamentos AS d, sucursales AS s
                WHERE d.id_sucursal = $1 AND d.id_sucursal = s.id
                `, [dep.id_suc])
                    .then((result) => {
                    return result.rows;
                });
                return dep;
            })));
            let depa = departamentos.filter((obj) => {
                return obj.departamentos.length > 0;
            });
            if (depa.length === 0)
                return res.status(404).jsonp({ message: 'No se han encontrado registros.' });
            let lista = yield Promise.all(depa.map((obj) => __awaiter(this, void 0, void 0, function* () {
                obj.departamentos = yield Promise.all(obj.departamentos.map((ele) => __awaiter(this, void 0, void 0, function* () {
                    if (estado === '1') {
                        ele.empleado = yield database_1.default.query(
                        //empl-contratos esta el id_regimen
                        `
                        SELECT DISTINCT e.id, CONCAT(e.nombre, ' ' , e.apellido) name_empleado, e.codigo, 
                            e.cedula, e.correo, ca.id AS id_cargo, tc.cargo,
                            co.id AS id_contrato, d.id AS id_departamento, d.nombre AS departamento, s.id AS id_sucursal, 
                            s.nombre AS sucursal, ca.hora_trabaja, r.id AS id_regimen, r.descripcion AS regimen, c.descripcion AS ciudad, 
                            CASE 
								WHEN e.genero = 1 THEN 'Masculino'
								WHEN e.genero = 2 THEN 'Femenino'
							END AS genero
                        FROM empl_cargos AS ca, empl_contratos AS co, empleados AS e, 
                            tipo_cargo AS tc, cg_departamentos AS d, sucursales AS s, cg_regimenes AS r, ciudades AS c
                        WHERE ca.id = (SELECT da.id_cargo FROM datos_actuales_empleado AS da WHERE 
                            da.id = e.id) 
                            AND tc.id = ca.cargo
                            AND ca.id_departamento = $1
                            AND ca.id_departamento = d.id
                            AND co.id = (SELECT da.id_contrato FROM datos_actuales_empleado AS da WHERE 
                            da.id = e.id)
                            AND co.id_regimen = r.id 
                            AND s.id = d.id_sucursal
                            AND s.id_ciudad = c.id
                            AND e.estado = $2
                        ORDER BY name_empleado ASC
                        `, [ele.id_depa, estado])
                            .then((result) => { return result.rows; });
                    }
                    else {
                        ele.empleado = yield database_1.default.query(`
                        SELECT DISTINCT e.id, CONCAT(e.nombre, ' ' , e.apellido) name_empleado, e.codigo, 
                            e.cedula, e.correo, ca.id AS id_cargo, tc.cargo,
                            co.id AS id_contrato, d.id AS id_departamento, d.nombre AS departamento, s.id AS id_sucursal, 
                            s.nombre AS sucursal, ca.hora_trabaja, e.estado AS estado, r.id AS id_regimen, r.descripcion AS regimen,
                            c.descripcion AS ciudad, 
                            CASE 
								WHEN e.genero = 1 THEN 'Masculino'
								WHEN e.genero = 2 THEN 'Femenino'
							END AS genero
                        FROM empl_cargos AS ca, empl_contratos AS co, empleados AS e,
                            tipo_cargo AS tc, cg_departamentos AS d, sucursales AS s, cg_regimenes AS r, ciudades AS c
                        WHERE ca.id = (SELECT de.cargo_id FROM datos_empleado_cargo AS de WHERE 
                            de.empl_id = e.id) 
                            AND tc.id = ca.cargo
                            AND ca.id_departamento = $1
                            AND ca.id_departamento = d.id
                            AND co.id = (SELECT de.contrato_id FROM datos_empleado_cargo AS de WHERE 
                                de.empl_id = e.id) 
							AND co.id_regimen = r.id
                            AND s.id = d.id_sucursal
                            AND s.id_ciudad = c.id
                            AND e.estado = $2
                        ORDER BY name_empleado ASC
                        `, [ele.id_depa, estado])
                            .then((result) => { return result.rows; });
                    }
                    return ele;
                })));
                return obj;
            })));
            if (lista.length === 0)
                return res.status(404).jsonp({ message: 'No se ha encontrado registros de usuarios.' });
            let respuesta = lista.map((obj) => {
                obj.departamentos = obj.departamentos.filter((ele) => {
                    return ele.empleado.length > 0;
                });
                return obj;
            }).filter((obj) => {
                return obj.departamentos.length > 0;
            });
            if (respuesta.length === 0)
                return res.status(404)
                    .jsonp({ message: 'Usuarios no han configurado recepción de notificaciones de comunicados.' });
            return res.status(200).jsonp(respuesta);
        });
    }
    DatosGeneralesCargo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let estado = req.params.estado;
            // CONSULTA DE BUSQUEDA DE CARGOS
            let cargo = yield database_1.default.query(`
            SELECT tc.id AS id_cargo, tc.cargo AS name_cargo
            FROM tipo_cargo AS tc 
            ORDER BY tc.cargo ASC
            `).then((result) => { return result.rows; });
            if (cargo.length === 0)
                return res.status(404).jsonp({ message: 'No se han encontrado registros.' });
            // CONSULTA DE BUSQUEDA DE EMPLEADOS
            let empleados = yield Promise.all(cargo.map((empl) => __awaiter(this, void 0, void 0, function* () {
                if (estado === '1') {
                    empl.empleados = yield database_1.default.query(`
                SELECT DISTINCT e.id, CONCAT(e.nombre, ' ' , e.apellido) name_empleado, e.codigo, 
                    e.cedula, e.correo, ca.id AS id_cargo, tc.cargo,
                    co.id AS id_contrato, d.id AS id_departamento, d.nombre AS departamento, s.id AS id_sucursal, 
                    s.nombre AS sucursal, ca.hora_trabaja, r.id AS id_regimen, r.descripcion AS regimen, c.descripcion AS ciudad,  
					CASE 
						WHEN e.genero = 1 THEN 'Masculino'
						WHEN e.genero = 2 THEN 'Femenino'
					END AS genero
                FROM empl_cargos AS ca, empl_contratos AS co, empleados AS e, ciudades AS c,
                    tipo_cargo AS tc, cg_departamentos AS d, sucursales AS s, cg_regimenes AS r
                WHERE ca.id = (SELECT da.id_cargo FROM datos_actuales_empleado AS da WHERE 
                    da.id = e.id) 
                    AND tc.id = ca.cargo
                    AND ca.id_departamento = d.id
                    AND co.id = (SELECT da.id_contrato FROM datos_actuales_empleado AS da WHERE 
                    da.id = e.id)
                    AND co.id_regimen = r.id 
                    AND s.id = d.id_sucursal
                    AND s.id_ciudad = c.id
                    AND ca.cargo = $1
                    AND e.estado = $2
                ORDER BY name_empleado ASC
                `, [empl.id_cargo, estado]).then((result) => { return result.rows; });
                }
                else {
                    empl.empleados = yield database_1.default.query(`
                    SELECT DISTINCT e.id, CONCAT(e.nombre, ' ' , e.apellido) name_empleado, e.codigo, 
                        e.cedula, e.correo, e.estado, ca.id AS id_cargo, tc.cargo,
                        d.id AS id_departamento, d.nombre AS departamento, s.id AS id_sucursal, 
                        s.nombre AS sucursal, ca.hora_trabaja, c.descripcion AS ciudad, r.id AS id_regimen, r.descripcion AS regimen,
						 CASE 
								WHEN e.genero = 1 THEN 'Masculino'
								WHEN e.genero = 2 THEN 'Femenino'
							END AS genero
                    FROM empleados e, empl_cargos AS ca, empl_contratos AS co, tipo_cargo AS tc,
                        cg_departamentos AS d, sucursales AS s, ciudades AS c, cg_regimenes AS r
                    WHERE ca.id = (SELECT de.cargo_id FROM datos_empleado_cargo AS de WHERE 
                        de.empl_id = e.id)
                        AND ca.id = (SELECT de.contrato_id FROM datos_empleado_cargo AS de WHERE 
                            de.empl_id = e.id) 
						AND ca.id_empl_contrato = co.id
						AND co.id_regimen = r.id
                        AND ca.id_departamento = d.id
                        AND s.id = d.id_sucursal
                        AND s.id_ciudad = c.id
                        AND tc.id = ca.cargo
                        AND ca.cargo = $1
                        AND e.estado = $2
                    ORDER BY name_empleado ASC
                    `, [empl.id_cargo, estado])
                        .then((result) => { return result.rows; });
                }
                return empl;
            })));
            let respuesta = empleados.filter((obj) => {
                return obj.empleados.length > 0;
            });
            if (respuesta.length === 0)
                return res.status(404).jsonp({ message: 'No se han encontrado registros.' });
            return res.status(200).jsonp(respuesta);
        });
    }
    /**
     * FUNCION que calcula el tiempo de atraso según el timbre realizado por el o los empleados.
     * @returns Retorna un JSON con la informacion de los empleados atrasados en dias laborables.
     */
    ReporteAtrasosMultiple(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let { desde, hasta } = req.params;
            // console.log(desde, hasta);
            let datos = req.body;
            let n = [];
            //false sin acciones || true con acciones
            if (req.acciones_timbres === true) {
                // Resultados de timbres con 6 y 3 acciones
                n = yield Promise.all(datos.map((obj) => __awaiter(this, void 0, void 0, function* () {
                    obj.departamentos = yield Promise.all(obj.departamentos.map((ele) => __awaiter(this, void 0, void 0, function* () {
                        ele.empleado = yield Promise.all(ele.empleado.map((o) => __awaiter(this, void 0, void 0, function* () {
                            let timbres = yield BuscarTimbresEoSReporte(desde, hasta, o.codigo);
                            o.timbres = yield Promise.all(timbres.map((e) => __awaiter(this, void 0, void 0, function* () {
                                return yield ModelarAtrasosReporte(e);
                            })));
                            return o;
                        })));
                        return ele;
                    })));
                    return obj;
                })));
            }
            else {
                // Resultados de timbres sin acciones
                n = yield Promise.all(datos.map((obj) => __awaiter(this, void 0, void 0, function* () {
                    obj.departamentos = yield Promise.all(obj.departamentos.map((ele) => __awaiter(this, void 0, void 0, function* () {
                        ele.empleado = yield Promise.all(ele.empleado.map((o) => __awaiter(this, void 0, void 0, function* () {
                            o.timbres = yield AtrasosTimbresSinAccion(desde, hasta, o.codigo);
                            // console.log('Timbres sin acciones: ',o);
                            return o;
                        })));
                        return ele;
                    })));
                    return obj;
                })));
            }
            let nuevo = n.map((obj) => {
                obj.departamentos = obj.departamentos.map((e) => {
                    e.empleado = e.empleado.map((t) => {
                        t.timbres = t.timbres.filter((a) => { return a != 0; });
                        return t;
                    }).filter((t) => { return t.timbres.length > 0; });
                    // console.log('Empleados: ',e);
                    return e;
                }).filter((e) => { return e.empleado.length > 0; });
                return obj;
            }).filter(obj => { return obj.departamentos.length > 0; });
            if (nuevo.length === 0)
                return res.status(400).jsonp({ message: 'No hay atrasos de empleados en ese periodo' });
            return res.status(200).jsonp(nuevo);
        });
    }
    /**
     * FUNCION que devuelve los dias que el empleado falto a laborar según su horario.
     * @returns Retorna un JSON con la informacion de los empleados que an faltado a laborar.
     */
    ReporteFaltasMultiple(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let { desde, hasta } = req.params;
            // console.log(desde, hasta);
            let datos = req.body;
            let n = [];
            //El reporte funciona para relojs de 6, 3 y sin acciones.        
            n = yield Promise.all(datos.map((obj) => __awaiter(this, void 0, void 0, function* () {
                obj.departamentos = yield Promise.all(obj.departamentos.map((ele) => __awaiter(this, void 0, void 0, function* () {
                    ele.empleado = yield Promise.all(ele.empleado.map((o) => __awaiter(this, void 0, void 0, function* () {
                        let faltas = yield BuscarHorarioEmpleado(desde, hasta, o.codigo);
                        o.faltas = faltas.filter((o) => {
                            return o.registros === 0;
                        }).map((o) => {
                            return { fecha: o.fecha };
                        });
                        return o;
                    })));
                    return ele;
                })));
                return obj;
            })));
            let nuevo = n.map((obj) => {
                obj.departamentos = obj.departamentos.map((e) => {
                    e.empleado = e.empleado.filter((t) => { return t.faltas.length > 0; });
                    return e;
                }).filter((e) => { return e.empleado.length > 0; });
                return obj;
            }).filter(obj => { return obj.departamentos.length > 0; });
            if (nuevo.length === 0)
                return res.status(400).jsonp({ message: 'No hay faltas de empleados en ese periodo' });
            return res.status(200).jsonp(nuevo);
        });
    }
    ReporteFaltasMultipleTabulado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let { desde, hasta } = req.params;
            // console.log(desde, hasta);
            let datos = req.body;
            // console.log(datos);
            //El reporte funciona para relojs de 6, 3 y sin acciones.
            let n = yield Promise.all(datos.map((obj) => __awaiter(this, void 0, void 0, function* () {
                obj.departamentos = yield Promise.all(obj.departamentos.map((ele) => __awaiter(this, void 0, void 0, function* () {
                    ele.empleado = yield Promise.all(ele.empleado.map((o) => __awaiter(this, void 0, void 0, function* () {
                        o.contrato = yield database_1.default.query('SELECT r.descripcion AS contrato FROM cg_regimenes AS r, empl_contratos AS c WHERE c.id_regimen = r.id AND c.id_empleado = $1 ORDER BY c.fec_ingreso DESC LIMIT 1 ', [o.id]).then((result) => { return result.rows[0].contrato; });
                        o.cargo = yield database_1.default.query('SELECT tc.cargo FROM empl_contratos AS co, empl_cargos AS ca, tipo_cargo AS tc WHERE co.id_empleado = $1 AND co.id = ca.id_empl_contrato AND tc.id = ca.cargo ORDER BY ca.fec_inicio DESC LIMIT 1 ', [o.id]).then((result) => { return result.rows[0].cargo; });
                        let faltas = yield BuscarHorarioEmpleado(desde, hasta, o.codigo);
                        o.faltas = faltas.filter((o) => {
                            return o.registros === 0;
                        }).map((o) => {
                            return { fecha: o.fecha };
                        });
                        return o;
                    })));
                    return ele;
                })));
                return obj;
            })));
            let nuevo = n.map((obj) => {
                obj.departamentos = obj.departamentos.map((e) => {
                    e.empleado = e.empleado.filter((t) => { return t.faltas.length > 0; });
                    return e;
                }).filter((e) => { return e.empleado.length > 0; });
                return obj;
            }).filter(obj => { return obj.departamentos.length > 0; });
            if (nuevo.length === 0)
                return res.status(400).jsonp({ message: 'No hay faltas de empleados en ese periodo' });
            return res.status(200).jsonp(nuevo);
        });
    }
    /**
     * FUNCION que compara el horario del empleado con los timbres que realiza en un dia laborar para poder calcular sus horas trabajadas.
     * @returns Retorna empleados con calculos de las horas trabajadas si todos los timbres estan registrados. Aqui no van incluidas horas extras.
     */
    ReporteHorasTrabajaMultiple(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let { desde, hasta } = req.params;
            // console.log(desde, hasta);
            let datos = req.body;
            // console.log(datos);
            let n = [];
            //false sin acciones || true con acciones
            if (req.acciones_timbres === true) {
                // Resultados de timbres con 6 y 3 acciones
                n = yield Promise.all(datos.map((obj) => __awaiter(this, void 0, void 0, function* () {
                    obj.departamentos = yield Promise.all(obj.departamentos.map((ele) => __awaiter(this, void 0, void 0, function* () {
                        ele.empleado = yield Promise.all(ele.empleado.map((o) => __awaiter(this, void 0, void 0, function* () {
                            o.timbres = yield ModelarHorasTrabajaReporte(o.codigo, desde, hasta);
                            return o;
                        })));
                        return ele;
                    })));
                    return obj;
                })));
            }
            else {
                // Resultados de timbres sin acciones
                // console.log('LLEGO A TIMBRES SIN ACCIONES');
                n = yield Promise.all(datos.map((obj) => __awaiter(this, void 0, void 0, function* () {
                    obj.departamentos = yield Promise.all(obj.departamentos.map((ele) => __awaiter(this, void 0, void 0, function* () {
                        ele.empleado = yield Promise.all(ele.empleado.map((o) => __awaiter(this, void 0, void 0, function* () {
                            o.timbres = yield ModelarHorasTrabajaTimbresSinAcciones(o.codigo, desde, hasta);
                            return o;
                        })));
                        return ele;
                    })));
                    return obj;
                })));
            }
            let nuevo = n.map((obj) => {
                obj.departamentos = obj.departamentos.map((e) => {
                    e.empleado = e.empleado.filter((t) => { return t.timbres.length > 0; });
                    return e;
                }).filter((e) => { return e.empleado.length > 0; });
                return obj;
            }).filter(obj => { return obj.departamentos.length > 0; });
            if (nuevo.length === 0)
                return res.status(400).jsonp({ message: 'No hay timbres de empleados en ese periodo' });
            return res.status(200).jsonp(datos);
        });
    }
    /**
     * FUNCION que realiza una semaforizacion segun los dias puntuales de cada uno de los empleados.
     * @returns Retorna los empleados y total de dias puntuales que a llegado segun un rango de fechas.
     */
    ReportePuntualidad(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let { desde, hasta } = req.params;
            let datos = req.body;
            let params_query = req.query;
            // console.log(params_query);  
            //false sin acciones || true con acciones
            if (req.acciones_timbres === true) {
                // Resultados de timbres con 6 y 3 acciones
                let n = yield Promise.all(datos.map((obj) => __awaiter(this, void 0, void 0, function* () {
                    obj.departamentos = yield Promise.all(obj.departamentos.map((ele) => __awaiter(this, void 0, void 0, function* () {
                        ele.empleado = yield Promise.all(ele.empleado.map((o) => __awaiter(this, void 0, void 0, function* () {
                            o.contrato = yield database_1.default.query('SELECT r.descripcion AS contrato FROM cg_regimenes AS r, empl_contratos AS c WHERE c.id_regimen = r.id AND c.id_empleado = $1 ORDER BY c.fec_ingreso DESC LIMIT 1 ', [o.id]).then((result) => { return result.rows[0].contrato; });
                            o.cargo = yield database_1.default.query('SELECT tc.cargo FROM empl_contratos AS co, empl_cargos AS ca, tipo_cargo AS tc WHERE co.id_empleado = $1 AND co.id = ca.id_empl_contrato AND tc.id = ca.cargo ORDER BY ca.fec_inicio DESC LIMIT 1 ', [o.id]).then((result) => { return result.rows[0].cargo; });
                            let timbres = yield BuscarTimbresEoSReporte(desde, hasta, o.codigo);
                            // console.log('Return del timbre: ',timbres);
                            if (timbres.length === 0) {
                                o.puntualidad = 0;
                            }
                            else {
                                let aux = yield Promise.all(timbres.map((e) => __awaiter(this, void 0, void 0, function* () {
                                    return yield ModelarPuntualidad(e);
                                })));
                                var array = [];
                                aux.forEach((u) => {
                                    if (u[0] > 0) {
                                        array.push(u[0]);
                                    }
                                });
                                o.puntualidad = parseInt((0, SubMetodosGraficas_1.SumarValoresArray)(array));
                                // console.log(o);
                            }
                            if (o.puntualidad >= parseInt(params_query.mayor)) {
                                o.color = '#06F313'; // verde
                            }
                            else if (o.puntualidad <= parseInt(params_query.menor)) {
                                o.color = '#EC2E05'; // rojo
                            }
                            else {
                                o.color = '#F38306'; // naranja
                            }
                            return o;
                        })));
                        return ele;
                    })));
                    return obj;
                })));
                return res.status(200).jsonp(n);
            }
            else {
                // Resultados de timbres sin acciones
                let n = yield Promise.all(datos.map((obj) => __awaiter(this, void 0, void 0, function* () {
                    obj.departamentos = yield Promise.all(obj.departamentos.map((ele) => __awaiter(this, void 0, void 0, function* () {
                        ele.empleado = yield Promise.all(ele.empleado.map((o) => __awaiter(this, void 0, void 0, function* () {
                            o.contrato = yield database_1.default.query('SELECT r.descripcion AS contrato FROM cg_regimenes AS r, empl_contratos AS c WHERE c.id_regimen = r.id AND c.id_empleado = $1 ORDER BY c.fec_ingreso DESC LIMIT 1 ', [o.id]).then(result => { return result.rows[0].contrato; });
                            o.cargo = yield database_1.default.query('SELECT tc.cargo FROM empl_contratos AS co, empl_cargos AS ca, tipo_cargo AS tc WHERE co.id_empleado = $1 AND co.id = ca.id_empl_contrato AND tc.id = ca.cargo ORDER BY ca.fec_inicio DESC LIMIT 1 ', [o.id]).then(result => { return result.rows[0].cargo; });
                            let timbres = yield BuscarTimbresSinAccionesDeEntrada(desde, hasta, o.codigo);
                            o.puntualidad = (timbres.length === 0) ? 0 : parseInt((0, SubMetodosGraficas_1.SumarValoresArray)(timbres));
                            if (o.puntualidad >= parseInt(params_query.mayor)) {
                                o.color = '#06F313'; // verde
                            }
                            else if (o.puntualidad <= parseInt(params_query.menor)) {
                                o.color = '#EC2E05'; // rojo
                            }
                            else {
                                o.color = '#F38306'; // naranja
                            }
                            return o;
                        })));
                        return ele;
                    })));
                    return obj;
                })));
                return res.status(200).jsonp(n);
            }
        });
    }
    ReporteTimbresTabuladosIncompletos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let { desde, hasta } = req.params;
            let datos = req.body;
            let n = [];
            //false sin acciones || true con acciones
            if (req.acciones_timbres === true) {
                // Resultados de timbres con 6 y 3 acciones
                n = yield Promise.all(datos.map((obj) => __awaiter(this, void 0, void 0, function* () {
                    obj.departamentos = yield Promise.all(obj.departamentos.map((ele) => __awaiter(this, void 0, void 0, function* () {
                        ele.empleado = yield Promise.all(ele.empleado.map((o) => __awaiter(this, void 0, void 0, function* () {
                            o.contrato = yield database_1.default.query('SELECT r.descripcion AS contrato FROM cg_regimenes AS r, empl_contratos AS c WHERE c.id_regimen = r.id AND c.id_empleado = $1 ORDER BY c.fec_ingreso DESC LIMIT 1 ', [o.id]).then(result => { return result.rows[0].contrato; });
                            o.cargo = yield database_1.default.query('SELECT tc.cargo FROM empl_contratos AS co, empl_cargos AS ca, tipo_cargo AS tc WHERE co.id_empleado = $1 AND co.id = ca.id_empl_contrato AND tc.id = ca.cargo ORDER BY ca.fec_inicio DESC LIMIT 1 ', [o.id]).then(result => { return result.rows[0].cargo; });
                            o.timbres = yield TimbresIncompletos(new Date(desde), new Date(hasta), o.codigo);
                            console.log('Timbres: ', o);
                            return o;
                        })));
                        return ele;
                    })));
                    return obj;
                })));
            }
            else {
                // Resultados de timbres sin acciones
                n = yield Promise.all(datos.map((obj) => __awaiter(this, void 0, void 0, function* () {
                    obj.departamentos = yield Promise.all(obj.departamentos.map((ele) => __awaiter(this, void 0, void 0, function* () {
                        ele.empleado = yield Promise.all(ele.empleado.map((o) => __awaiter(this, void 0, void 0, function* () {
                            o.contrato = yield database_1.default.query('SELECT r.descripcion AS contrato FROM cg_regimenes AS r, empl_contratos AS c WHERE c.id_regimen = r.id AND c.id_empleado = $1 ORDER BY c.fec_ingreso DESC LIMIT 1 ', [o.id]).then(result => { return result.rows[0].contrato; });
                            o.cargo = yield database_1.default.query('SELECT tc.cargo FROM empl_contratos AS co, empl_cargos AS ca, tipo_cargo AS tc WHERE co.id_empleado = $1 AND co.id = ca.id_empl_contrato AND tc.id = ca.cargo ORDER BY ca.fec_inicio DESC LIMIT 1 ', [o.id]).then(result => { return result.rows[0].cargo; });
                            o.timbres = yield TimbresSinAccionesIncompletos(new Date(desde), new Date(hasta), o.codigo);
                            console.log('Timbres: ', o);
                            return o;
                        })));
                        return ele;
                    })));
                    return obj;
                })));
            }
            let nuevo = n.map((obj) => {
                obj.departamentos = obj.departamentos.map((e) => {
                    e.empleado = e.empleado.filter((t) => { return t.timbres.length > 0; });
                    return e;
                }).filter((e) => { return e.empleado.length > 0; });
                return obj;
            }).filter(obj => { return obj.departamentos.length > 0; });
            if (nuevo.length === 0)
                return res.status(400).jsonp({ message: 'No hay atrasos de empleados en ese periodo' });
            return res.status(200).jsonp(nuevo);
        });
    }
    ReporteTimbresTabulado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let { desde, hasta } = req.params;
            let datos = req.body;
            let n = [];
            //false sin acciones || true con acciones
            if (req.acciones_timbres === true) {
                // Resultados de timbres con 6 y 3 acciones
                n = yield Promise.all(datos.map((obj) => __awaiter(this, void 0, void 0, function* () {
                    obj.departamentos = yield Promise.all(obj.departamentos.map((ele) => __awaiter(this, void 0, void 0, function* () {
                        ele.empleado = yield Promise.all(ele.empleado.map((o) => __awaiter(this, void 0, void 0, function* () {
                            o.contrato = yield database_1.default.query('SELECT r.descripcion AS contrato FROM cg_regimenes AS r, empl_contratos AS c WHERE c.id_regimen = r.id AND c.id_empleado = $1 ORDER BY c.fec_ingreso DESC LIMIT 1 ', [o.id]).then(result => { return result.rows[0].contrato; });
                            o.cargo = yield database_1.default.query('SELECT tc.cargo FROM empl_contratos AS co, empl_cargos AS ca, tipo_cargo AS tc WHERE co.id_empleado = $1 AND co.id = ca.id_empl_contrato AND tc.id = ca.cargo ORDER BY ca.fec_inicio DESC LIMIT 1 ', [o.id]).then(result => { return result.rows[0].cargo; });
                            o.timbres = yield TimbresTabulados(desde, hasta, o.codigo);
                            return o;
                        })));
                        return ele;
                    })));
                    return obj;
                })));
            }
            else {
                // Resultados de timbres sin acciones
                n = yield Promise.all(datos.map((obj) => __awaiter(this, void 0, void 0, function* () {
                    obj.departamentos = yield Promise.all(obj.departamentos.map((ele) => __awaiter(this, void 0, void 0, function* () {
                        ele.empleado = yield Promise.all(ele.empleado.map((o) => __awaiter(this, void 0, void 0, function* () {
                            o.contrato = yield database_1.default.query('SELECT r.descripcion AS contrato FROM cg_regimenes AS r, empl_contratos AS c WHERE c.id_regimen = r.id AND c.id_empleado = $1 ORDER BY c.fec_ingreso DESC LIMIT 1 ', [o.id]).then(result => { return result.rows[0].contrato; });
                            o.cargo = yield database_1.default.query('SELECT tc.cargo FROM empl_contratos AS co, empl_cargos AS ca, tipo_cargo AS tc WHERE co.id_empleado = $1 AND co.id = ca.id_empl_contrato AND tc.id = ca.cargo ORDER BY ca.fec_inicio DESC LIMIT 1 ', [o.id]).then(result => { return result.rows[0].cargo; });
                            o.timbres = yield TimbresSinAccionesTabulados(desde, hasta, o.codigo);
                            return o;
                        })));
                        return ele;
                    })));
                    return obj;
                })));
            }
            let nuevo = n.map((obj) => {
                obj.departamentos = obj.departamentos.map((e) => {
                    e.empleado = e.empleado.filter((t) => { return t.timbres.length > 0; });
                    return e;
                }).filter((e) => { return e.empleado.length > 0; });
                return obj;
            }).filter(obj => { return obj.departamentos.length > 0; });
            if (nuevo.length === 0)
                return res.status(400).jsonp({ message: 'No hay atrasos de empleados en ese periodo' });
            return res.status(200).jsonp(nuevo);
        });
    }
    ReporteTimbresMultiple(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let { desde, hasta } = req.params;
            let datos = req.body;
            //El reporte funciona para relojs de 6, 3 y sin acciones.        
            let n = yield Promise.all(datos.map((obj) => __awaiter(this, void 0, void 0, function* () {
                obj.departamentos = yield Promise.all(obj.departamentos.map((ele) => __awaiter(this, void 0, void 0, function* () {
                    ele.empleado = yield Promise.all(ele.empleado.map((o) => __awaiter(this, void 0, void 0, function* () {
                        o.timbres = yield BuscarTimbres(desde, hasta, o.codigo);
                        console.log('Timbres: ', o);
                        return o;
                    })));
                    return ele;
                })));
                return obj;
            })));
            let nuevo = n.map((obj) => {
                obj.departamentos = obj.departamentos.map((e) => {
                    e.empleado = e.empleado.filter((t) => { return t.timbres.length > 0; });
                    // console.log('Empleados: ',e);
                    return e;
                }).filter((e) => { return e.empleado.length > 0; });
                return obj;
            }).filter(obj => { return obj.departamentos.length > 0; });
            if (nuevo.length === 0)
                return res.status(400).jsonp({ message: 'No hay timbres de empleados en ese periodo' });
            return res.status(200).jsonp(nuevo);
        });
    }
    ReporteTimbresMultipleRegimenCargo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('datos recibidos', req.body);
            let { desde, hasta } = req.params;
            let datos = req.body;
            let n = yield Promise.all(datos.map((obj) => __awaiter(this, void 0, void 0, function* () {
                obj.empleados = yield Promise.all(obj.empleados.map((o) => __awaiter(this, void 0, void 0, function* () {
                    o.timbres = yield BuscarTimbres(desde, hasta, o.codigo);
                    console.log('Timbres: ', o);
                    return o;
                })));
                return obj;
            })));
            let nuevo = n.map((e) => {
                e.empleados = e.empleados.filter((t) => { return t.timbres.length > 0; });
                return e;
            }).filter(e => { return e.empleados.length > 0; });
            if (nuevo.length === 0)
                return res.status(400).jsonp({ message: 'No hay timbres de empleados en ese periodo' });
            return res.status(200).jsonp(nuevo);
        });
    }
    ReporteTimbresIncompletos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let { desde, hasta } = req.params;
            let datos = req.body;
            let n = yield Promise.all(datos.map((obj) => __awaiter(this, void 0, void 0, function* () {
                obj.departamentos = yield Promise.all(obj.departamentos.map((ele) => __awaiter(this, void 0, void 0, function* () {
                    ele.empleado = yield Promise.all(ele.empleado.map((o) => __awaiter(this, void 0, void 0, function* () {
                        o.timbres = yield BuscarTimbresIncompletos(desde, hasta, o.codigo);
                        console.log('Timbres: ', o);
                        return o;
                    })));
                    return ele;
                })));
                return obj;
            })));
            let nuevo = n.map((obj) => {
                obj.departamentos = obj.departamentos.map((e) => {
                    e.empleado = e.empleado.filter((t) => { return t.timbres.length > 0; });
                    return e;
                }).filter((e) => { return e.empleado.length > 0; });
                return obj;
            }).filter(obj => { return obj.departamentos.length > 0; });
            if (nuevo.length === 0)
                return res.status(400).jsonp({ message: 'No hay timbres de empleados en ese periodo' });
            return res.status(200).jsonp(nuevo);
        });
    }
    ReporteTimbresIncompletosRegimenCargo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('datos recibidos', req.body);
            let { desde, hasta } = req.params;
            let datos = req.body;
            let n = yield Promise.all(datos.map((obj) => __awaiter(this, void 0, void 0, function* () {
                obj.empleados = yield Promise.all(obj.empleados.map((o) => __awaiter(this, void 0, void 0, function* () {
                    o.timbres = yield BuscarTimbresIncompletos(desde, hasta, o.codigo);
                    console.log('Timbres: ', o);
                    return o;
                })));
                return obj;
            })));
            let nuevo = n.map((e) => {
                e.empleados = e.empleados.filter((t) => { return t.timbres.length > 0; });
                return e;
            }).filter(e => { return e.empleados.length > 0; });
            if (nuevo.length === 0)
                return res.status(400).jsonp({ message: 'No hay timbres de empleados en ese periodo' });
            return res.status(200).jsonp(nuevo);
        });
    }
    // REPORTE DE TIMBRES REALIZADOS EN EL SISTEMA
    ReporteTimbreSistema(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let { desde, hasta } = req.params;
            let datos = req.body;
            //El reporte funciona para relojs de 6, 3 y sin acciones.        
            let n = yield Promise.all(datos.map((obj) => __awaiter(this, void 0, void 0, function* () {
                obj.departamentos = yield Promise.all(obj.departamentos.map((ele) => __awaiter(this, void 0, void 0, function* () {
                    ele.empleado = yield Promise.all(ele.empleado.map((o) => __awaiter(this, void 0, void 0, function* () {
                        o.timbres = yield BuscarTimbreSistemas(desde, hasta, o.codigo);
                        console.log('Timbres: ', o);
                        return o;
                    })));
                    return ele;
                })));
                return obj;
            })));
            let nuevo = n.map((obj) => {
                obj.departamentos = obj.departamentos.map((e) => {
                    e.empleado = e.empleado.filter((t) => { return t.timbres.length > 0; });
                    // console.log('Empleados: ',e);
                    return e;
                }).filter((e) => { return e.empleado.length > 0; });
                return obj;
            }).filter(obj => { return obj.departamentos.length > 0; });
            if (nuevo.length === 0)
                return res.status(400).jsonp({ message: 'No hay timbres de empleados en ese periodo' });
            return res.status(200).jsonp(nuevo);
        });
    }
    // REPORTE DE TIMBRES REALIZADOS EN EL SISTEMA PARA REGIMEN Y CARGO
    ReporteTimbreSistemaRegimenCargo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let { desde, hasta } = req.params;
            let datos = req.body;
            let n = yield Promise.all(datos.map((obj) => __awaiter(this, void 0, void 0, function* () {
                obj.empleados = yield Promise.all(obj.empleados.map((o) => __awaiter(this, void 0, void 0, function* () {
                    o.timbres = yield BuscarTimbreSistemas(desde, hasta, o.codigo);
                    console.log('Timbres: ', o);
                    return o;
                })));
                return obj;
            })));
            let nuevo = n.map((e) => {
                e.empleados = e.empleados.filter((t) => { return t.timbres.length > 0; });
                return e;
            }).filter(e => { return e.empleados.length > 0; });
            if (nuevo.length === 0)
                return res.status(400).jsonp({ message: 'No hay timbres de empleados en ese periodo' });
            return res.status(200).jsonp(nuevo);
        });
    }
    // REPORTE DE TIMBRES REALIZADOS EN EL RELOJ VIRTUAL
    ReporteTimbreRelojVirtual(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let { desde, hasta } = req.params;
            let datos = req.body;
            //El reporte funciona para relojs de 6, 3 y sin acciones.        
            let n = yield Promise.all(datos.map((obj) => __awaiter(this, void 0, void 0, function* () {
                obj.departamentos = yield Promise.all(obj.departamentos.map((ele) => __awaiter(this, void 0, void 0, function* () {
                    ele.empleado = yield Promise.all(ele.empleado.map((o) => __awaiter(this, void 0, void 0, function* () {
                        o.timbres = yield BuscarTimbreRelojVirtual(desde, hasta, o.codigo);
                        console.log('Timbres: ', o);
                        return o;
                    })));
                    return ele;
                })));
                return obj;
            })));
            let nuevo = n.map((obj) => {
                obj.departamentos = obj.departamentos.map((e) => {
                    e.empleado = e.empleado.filter((t) => { return t.timbres.length > 0; });
                    // console.log('Empleados: ',e);
                    return e;
                }).filter((e) => { return e.empleado.length > 0; });
                return obj;
            }).filter(obj => { return obj.departamentos.length > 0; });
            if (nuevo.length === 0)
                return res.status(400).jsonp({ message: 'No hay timbres de empleados en ese periodo' });
            return res.status(200).jsonp(nuevo);
        });
    }
    // REPORTE DE TIMBRES REALIZADOS EN EL RELOJ VIRTUAL PARA REGIMEN Y CARGO
    ReporteTimbreRelojVirtualRegimenCargo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let { desde, hasta } = req.params;
            let datos = req.body;
            let n = yield Promise.all(datos.map((obj) => __awaiter(this, void 0, void 0, function* () {
                obj.empleados = yield Promise.all(obj.empleados.map((o) => __awaiter(this, void 0, void 0, function* () {
                    o.timbres = yield BuscarTimbreRelojVirtual(desde, hasta, o.codigo);
                    console.log('Timbres: ', o);
                    return o;
                })));
                return obj;
            })));
            let nuevo = n.map((e) => {
                e.empleados = e.empleados.filter((t) => { return t.timbres.length > 0; });
                return e;
            }).filter(e => { return e.empleados.length > 0; });
            if (nuevo.length === 0)
                return res.status(400).jsonp({ message: 'No hay timbres de empleados en ese periodo' });
            return res.status(200).jsonp(nuevo);
        });
    }
    // REPORTE DE TIMBRES HORARIO ABIERTO
    ReporteTimbreHorarioAbierto(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let { desde, hasta } = req.params;
            let datos = req.body;
            //El reporte funciona para relojs de 6, 3 y sin acciones.        
            let n = yield Promise.all(datos.map((obj) => __awaiter(this, void 0, void 0, function* () {
                obj.departamentos = yield Promise.all(obj.departamentos.map((ele) => __awaiter(this, void 0, void 0, function* () {
                    ele.empleado = yield Promise.all(ele.empleado.map((o) => __awaiter(this, void 0, void 0, function* () {
                        o.timbres = yield BuscarTimbreHorarioAbierto(desde, hasta, o.codigo);
                        console.log('Timbres: ', o);
                        return o;
                    })));
                    return ele;
                })));
                return obj;
            })));
            let nuevo = n.map((obj) => {
                obj.departamentos = obj.departamentos.map((e) => {
                    e.empleado = e.empleado.filter((t) => { return t.timbres.length > 0; });
                    // console.log('Empleados: ',e);
                    return e;
                }).filter((e) => { return e.empleado.length > 0; });
                return obj;
            }).filter(obj => { return obj.departamentos.length > 0; });
            if (nuevo.length === 0)
                return res.status(400).jsonp({ message: 'No hay timbres de empleados en ese periodo' });
            return res.status(200).jsonp(nuevo);
        });
    }
    // REPORTE DE TIMBRES HORARIO ABIERTO
    ReporteTimbreHorarioAbiertoRegimenCargo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('datos recibidos', req.body);
            let { desde, hasta } = req.params;
            let datos = req.body;
            let n = yield Promise.all(datos.map((obj) => __awaiter(this, void 0, void 0, function* () {
                obj.empleados = yield Promise.all(obj.empleados.map((o) => __awaiter(this, void 0, void 0, function* () {
                    o.timbres = yield BuscarTimbreHorarioAbierto(desde, hasta, o.codigo);
                    console.log('Timbres: ', o);
                    return o;
                })));
                return obj;
            })));
            let nuevo = n.map((e) => {
                e.empleados = e.empleados.filter((t) => { return t.timbres.length > 0; });
                return e;
            }).filter(e => { return e.empleados.length > 0; });
            if (nuevo.length === 0)
                return res.status(400).jsonp({ message: 'No hay timbres de empleados en ese periodo' });
            return res.status(200).jsonp(nuevo);
        });
    }
    ReporteTimbresAbiertos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { data, desde, hasta } = req.query;
            try {
                const array = JSON.parse(data);
                if (array.length === 0)
                    return res.status(400).jsonp({ message: 'no existe datos de consulta' });
                const resultado = yield Promise.all(array.map((o) => __awaiter(this, void 0, void 0, function* () {
                    return {
                        id: o.id,
                        codigo: o.codigo,
                        fullname: o.fullname,
                        cedula: o.cedula,
                        timbres: yield database_1.default.query('SELECT CAST(fec_hora_timbre AS VARCHAR), accion, observacion, latitud, longitud, CAST(fec_hora_timbre_servidor AS VARCHAR), dispositivo_timbre FROM timbres WHERE codigo = $1 AND accion = \'HA\' AND fec_hora_timbre BETWEEN $2 AND $3 ORDER BY fec_hora_timbre DESC ', [o.codigo, new Date(desde), new Date(hasta)])
                            .then(result => { return result.rows; })
                    };
                })));
                const nuevo = resultado.filter((obj) => { return obj.timbres.length > 0; });
                return res.status(200).jsonp(nuevo);
            }
            catch (error) {
                return res.status(500).jsonp({ message: error });
            }
        });
    }
}
const REPORTE_A_CONTROLADOR = new ReportesAsistenciaControlador();
exports.default = REPORTE_A_CONTROLADOR;
const AtrasosTimbresSinAccion = function (fec_inicio, fec_final, codigo) {
    return __awaiter(this, void 0, void 0, function* () {
        /*
          const orden = 1;
          // console.log('ATRASOS - TIMBRES SIN ACCION: ', fec_inicio, fec_final, codigo );
          let horarioEntrada = await pool.query('SELECT dt.hora, dt.minu_espera, CAST(eh.fec_inicio AS VARCHAR), CAST(eh.fec_final AS VARCHAR), ' +
              'eh.lunes, eh.martes, eh.miercoles, eh.jueves, eh.viernes, eh.sabado, eh.domingo ' +
              'FROM empl_horarios AS eh, cg_horarios AS ch, deta_horarios AS dt ' +
              'WHERE dt.orden = $1 AND eh.fec_inicio BETWEEN $2 AND $3 AND eh.fec_final BETWEEN $2 AND $3 AND eh.codigo = $4 ' +
              'AND eh.id_horarios = ch.id AND ch.id = dt.id_horario', [orden, new Date(fec_inicio), new Date(fec_final), codigo])
              .then(result => { return result.rows })
      
          if (horarioEntrada.length === 0) return [0];
          // console.log('HORARIOS: ',horarioEntrada);
          let nuevo: Array<any> = [];
      
          let aux = await Promise.all(horarioEntrada.map(async (obj) => {
      
              let fechas = ModelarFechas(obj.fec_inicio, obj.fec_final, obj);
              const hora_seg = HHMMtoSegundos(obj.hora) + (obj.minu_espera * 60);
      
              let timbres = await Promise.all(fechas.map(async (o) => {
                  var f_inicio = o.fecha + ' ' + SegundosToHHMM(hora_seg);
                  var f_final = o.fecha + ' ' + SegundosToHHMM(hora_seg + HHMMtoSegundos('02:00:00'));
                  // console.log( f_inicio, ' || ', f_final, ' || ', codigo);
                  const query = 'SELECT CAST(fec_hora_timbre AS VARCHAR) from timbres where fec_hora_timbre >= TO_TIMESTAMP(\'' + f_inicio + '\'' + ', \'YYYY-MM-DD HH:MI:SS\') ' +
                      'and fec_hora_timbre <= TO_TIMESTAMP(\'' + f_final + '\'' + ', \'YYYY-MM-DD HH:MI:SS\') and id_empleado = ' + codigo + ' order by fec_hora_timbre'
                  // console.log(query);
                  return await pool.query(query)
                      .then(res => {
                          if (res.rowCount === 0) {
                              return 0
                          } else {
                              const f_timbre = res.rows[0].fec_hora_timbre.split(' ')[0];
                              const h_timbre = res.rows[0].fec_hora_timbre.split(' ')[1];
                              const t_tim = HHMMtoSegundos(h_timbre);
                              // console.log(f_timbre);
                              let diferencia = (t_tim - hora_seg) / 3600;
                              return {
                                  fecha: DiaSemana(new Date(f_timbre)) + ' ' + f_timbre,
                                  horario: obj.hora,
                                  timbre: h_timbre,
                                  atraso_dec: diferencia.toFixed(2),
                                  atraso_HHMM: SegundosToHHMM(t_tim - hora_seg),
                              };
                          }
                      })
              }));
      
              return timbres
          }))
      
          aux.forEach(obj => {
              if (obj.length > 0) {
                  obj.forEach(o => {
                      if (o !== 0) {
                          nuevo.push(o)
                      }
                  })
              }
          })
          // console.log('Este es el resul: ',nuevo);
          return nuevo
          */
        return [];
    });
};
const BuscarTimbresEoSReporte = function (fec_inicio, fec_final, codigo) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield database_1.default.query('SELECT CAST(fec_hora_timbre AS VARCHAR), codigo FROM timbres WHERE CAST(fec_hora_timbre AS VARCHAR) between $1 || \'%\' AND $2 || \'%\' AND accion in (\'EoS\', \'E\') AND codigo = $3 ORDER BY fec_hora_timbre ASC ', [fec_inicio, fec_final, codigo])
            .then(res => {
            return res.rows;
        });
    });
};
const BuscarTimbresSinAccionesDeEntrada = function (fec_inicio, fec_final, codigo) {
    return __awaiter(this, void 0, void 0, function* () {
        /*
            const orden = 1;
            let horarioEntrada = await pool.query('SELECT dt.hora, dt.minu_espera, CAST(eh.fec_inicio AS VARCHAR), CAST(eh.fec_final AS VARCHAR), ' +
                'eh.lunes, eh.martes, eh.miercoles, eh.jueves, eh.viernes, eh.sabado, eh.domingo ' +
                'FROM empl_horarios AS eh, cg_horarios AS ch, deta_horarios AS dt ' +
                'WHERE dt.orden = $1 AND eh.fec_inicio BETWEEN $2 AND $3 AND eh.fec_final BETWEEN $2 AND $3 AND eh.codigo = $4 ' +
                'AND eh.id_horarios = ch.id AND ch.id = dt.id_horario', [orden, new Date(fec_inicio), new Date(fec_final), codigo])
                .then(result => { return result.rows })
        
            if (horarioEntrada.length === 0) return [];
        
            let aux = await Promise.all(horarioEntrada.map(async (obj) => {
        
                let fechas = ModelarFechas(obj.fec_inicio, obj.fec_final, obj);
                const hora_seg = HHMMtoSegundos(obj.hora) + (obj.minu_espera * 60);
        
                let timbres = await Promise.all(fechas.map(async (o) => {
                    var f_inicio = o.fecha + ' ' + SegundosToHHMM(hora_seg - HHMMtoSegundos('02:00:00'));
                    var f_final = o.fecha + ' ' + SegundosToHHMM(hora_seg);
                    // console.log( f_inicio, ' || ', f_final, ' || ', codigo);
                    const query = 'SELECT CAST(fec_hora_timbre AS VARCHAR) FROM timbres WHERE fec_hora_timbre >= TO_TIMESTAMP(\'' + f_inicio + '\'' + ', \'YYYY-MM-DD HH:MI:SS\') ' +
                        'and fec_hora_timbre <= TO_TIMESTAMP(\'' + f_final + '\'' + ', \'YYYY-MM-DD HH:MI:SS\') AND id_empleado = ' + codigo + ' ORDER BY fec_hora_timbre'
                    return await pool.query(query).then(res => { return res.rows })
                }));
        
                return timbres.filter(o => {
                    return o.length >= 1
                }).map((e: any) => {
                    // console.warn('Filtrado:',e);
                    return 1
                })
            }))
        
            let nuevo: Array<number> = [];
        
            aux.filter(o => {
                return o.length >= 1
            }).forEach((o: Array<any>) => {
                o.forEach(e => {
                    nuevo.push(e)
                })
            })
        
            return nuevo*/
        return [];
    });
};
const BuscarTimbres = function (fec_inicio, fec_final, codigo) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield database_1.default.query('SELECT CAST(fec_hora_timbre AS VARCHAR), id_reloj, accion, observacion, ' +
            'latitud, longitud, CAST(fec_hora_timbre_servidor AS VARCHAR) ' +
            'FROM timbres WHERE CAST(fec_hora_timbre AS VARCHAR) BETWEEN $1 || \'%\' ' +
            'AND ($2::timestamp + \'1 DAY\') || \'%\' AND codigo = $3 ' +
            'ORDER BY fec_hora_timbre ASC', [fec_inicio, fec_final, codigo])
            .then(res => {
            return res.rows;
        });
    });
};
const BuscarTimbresIncompletos = function (fec_inicio, fec_final, codigo) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield database_1.default.query('SELECT CAST(fec_hora_horario AS VARCHAR), codigo, estado_timbre, tipo_entr_salida AS accion, tipo_dia, estado_origen ' +
            'FROM plan_general WHERE CAST(fec_hora_horario AS VARCHAR) BETWEEN $1 || \'%\' ' +
            'AND ($2::timestamp + \'1 DAY\') || \'%\' AND codigo = $3 ' +
            'AND fec_hora_timbre IS null AND tipo_dia NOT IN (\'L\', \'FD\')' +
            'ORDER BY fec_hora_horario ASC', [fec_inicio, fec_final, codigo])
            .then(res => {
            return res.rows;
        });
    });
};
// CONSULTA TIMBRES REALIZADOS EN EL SISTEMA CODIGO 98
const BuscarTimbreSistemas = function (fec_inicio, fec_final, codigo) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield database_1.default.query('SELECT CAST(fec_hora_timbre AS VARCHAR), id_reloj, accion, observacion, ' +
            'latitud, longitud, CAST(fec_hora_timbre_servidor AS VARCHAR) ' +
            'FROM timbres WHERE CAST(fec_hora_timbre AS VARCHAR) BETWEEN $1 || \'%\' ' +
            'AND ($2::timestamp + \'1 DAY\') || \'%\' AND codigo = $3 AND id_reloj = \'98\' ' +
            'AND NOT accion = \'HA\' ' +
            'ORDER BY fec_hora_timbre ASC', [fec_inicio, fec_final, codigo])
            .then(res => {
            return res.rows;
        });
    });
};
// CONSULTA TIMBRES REALIZADOS EN EL RELOJ VIRTUAL CODIGO 97
const BuscarTimbreRelojVirtual = function (fec_inicio, fec_final, codigo) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield database_1.default.query('SELECT CAST(fec_hora_timbre AS VARCHAR), id_reloj, accion, observacion, ' +
            'latitud, longitud, CAST(fec_hora_timbre_servidor AS VARCHAR) ' +
            'FROM timbres WHERE CAST(fec_hora_timbre AS VARCHAR) BETWEEN $1 || \'%\' ' +
            'AND ($2::timestamp + \'1 DAY\') || \'%\' AND codigo = $3 AND id_reloj = \'97\' ' +
            'AND NOT accion = \'HA\' ' +
            'ORDER BY fec_hora_timbre ASC', [fec_inicio, fec_final, codigo])
            .then(res => {
            return res.rows;
        });
    });
};
// CONSULTA TIMBRES REALIZADOS EN EL RELOJ VIRTUAL CODIGO 97
const BuscarTimbreHorarioAbierto = function (fec_inicio, fec_final, codigo) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield database_1.default.query('SELECT CAST(fec_hora_timbre AS VARCHAR), id_reloj, accion, observacion, ' +
            'latitud, longitud, CAST(fec_hora_timbre_servidor AS VARCHAR) ' +
            'FROM timbres WHERE CAST(fec_hora_timbre AS VARCHAR) BETWEEN $1 || \'%\' ' +
            'AND ($2::timestamp + \'1 DAY\') || \'%\' AND codigo = $3 AND accion = \'HA\' ' +
            'ORDER BY fec_hora_timbre ASC', [fec_inicio, fec_final, codigo])
            .then(res => {
            return res.rows;
        });
    });
};
const ModelarAtrasosReporte = function (obj) {
    return __awaiter(this, void 0, void 0, function* () {
        let array = yield database_1.default.query('SELECT dh.hora, dh.minu_espera FROM empl_horarios AS eh, cg_horarios AS h, deta_horarios AS dh ' +
            'WHERE eh.codigo = $1 AND h.id = eh.id_horarios AND dh.id_horario = h.id AND eh.fec_inicio <= $2 ' +
            'AND eh.fec_final >= $2 AND dh.orden = 1', [obj.codigo, new Date(obj.fec_hora_timbre.split(' ')[0])])
            .then(res => { return res.rows; });
        if (array.length === 0)
            return 0;
        console.log('Hora entrada y minuto Atrasos', array);
        return array.map(ele => {
            let retraso = false;
            var timbre = (0, SubMetodosGraficas_1.HHMMtoSegundos)(obj.fec_hora_timbre.split(' ')[1]);
            var hora_seg = (0, SubMetodosGraficas_1.HHMMtoSegundos)(ele.hora) + ele.minu_espera * 60;
            console.log('Timbre: ', timbre, hora_seg);
            retraso = (timbre > hora_seg) ? true : false;
            if (retraso === false)
                return 0;
            let diferencia = (timbre - hora_seg) / 3600;
            if (diferencia > 4)
                return 0;
            return {
                fecha: DiaSemana(new Date(obj.fec_hora_timbre.split(' ')[0])) + ' ' + obj.fec_hora_timbre.split(' ')[0],
                horario: ele.hora,
                timbre: obj.fec_hora_timbre.split(' ')[1],
                atraso_dec: diferencia.toFixed(2),
                atraso_HHMM: (0, SubMetodosGraficas_1.SegundosToHHMM)(timbre - hora_seg),
            };
        })[0];
    });
};
function DiaSemana(dia) {
    let dias = ['dom', 'lun', 'mar', 'mie', 'jue', 'vie', 'sab'];
    return dias[dia.getUTCDay()];
}
const BuscarTimbresReporte = function (fecha, codigo) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield database_1.default.query('SELECT CAST(fec_hora_timbre AS VARCHAR), accion, observacion FROM timbres WHERE CAST(fec_hora_timbre AS VARCHAR) like $1 || \'%\' AND codigo = $2 AND accion in (\'EoS\',\'AES\',\'S\',\'E\',\'E/A\',\'S/A\') ORDER BY fec_hora_timbre ASC ', [fecha, codigo])
            .then(res => {
            return res.rows;
        });
    });
};
const BuscarTimbresSinAccionesReporte = function (fecha, codigo) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield database_1.default.query('SELECT CAST(fec_hora_timbre AS VARCHAR), observacion FROM timbres WHERE CAST(fec_hora_timbre AS VARCHAR) like $1 || \'%\' AND codigo = $2 ORDER BY fec_hora_timbre ASC ', [fecha, codigo])
            .then(res => {
            return res.rows;
        });
    });
};
const ModelarHorasTrabajaReporte = function (codigo, fec_inicio, fec_final) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(codigo, fec_inicio, fec_final);
        let array = yield database_1.default.query('SELECT dh.hora, dh.orden, dh.id_horario, CAST(eh.fec_inicio AS VARCHAR), CAST(eh.fec_final AS VARCHAR) FROM empl_horarios AS eh, cg_horarios AS h, deta_horarios AS dh ' +
            'WHERE eh.codigo = $1 AND h.id = eh.id_horarios AND dh.id_horario = h.id AND CAST(eh.fec_inicio AS VARCHAR) between $2 || \'%\' AND $3 || \'%\' ' +
            'AND CAST(eh.fec_final AS VARCHAR) between $2 || \'%\' AND $3 || \'%\' ORDER BY eh.fec_inicio', [codigo, fec_inicio, fec_final])
            .then(res => { return res.rows; });
        if (array.length === 0)
            return [];
        console.log('ARRAY MODELAR HORAS TRABAJADAS: ', array);
        var nuevoArray = [];
        var arrayTemporal = [];
        for (var i = 0; i < array.length; i++) {
            arrayTemporal = nuevoArray.filter((res) => {
                return res["Fecha"] == array[i]["fec_inicio"] + ' ' + array[i]["fec_final"];
            });
            if (arrayTemporal.length > 0) {
                nuevoArray[nuevoArray.indexOf(arrayTemporal[0])]["Horario"].push(array[i]);
            }
            else {
                nuevoArray.push({ "Fecha": array[i]["fec_inicio"] + ' ' + array[i]["fec_final"], "Horario": [array[i]] });
            }
        }
        nuevoArray.sort(compareFechas);
        let res_timbre = yield Promise.all(nuevoArray.map((obj) => __awaiter(this, void 0, void 0, function* () {
            var fec_aux = new Date(obj.Fecha.split(' ')[0]);
            var fecha1 = (0, moment_1.default)(obj.Fecha.split(' ')[0]);
            var fecha2 = (0, moment_1.default)(obj.Fecha.split(' ')[1]);
            var diasDiferencia = fecha2.diff(fecha1, 'days');
            let res = [];
            for (let i = 0; i <= diasDiferencia; i++) {
                let horario_res = {
                    fecha: fec_aux.toJSON().split('T')[0],
                    timbres: yield BuscarTimbresReporte(fec_aux.toJSON().split('T')[0], codigo),
                    horario: obj.Horario.sort(compareOrden)
                };
                if (horario_res.timbres.length > 0) {
                    res.push(horario_res);
                }
                fec_aux.setDate(fec_aux.getDate() + 1);
            }
            return res;
        })));
        let respuesta = res_timbre.filter((obj) => {
            return obj.length > 0;
        });
        let arr_respuesta = [];
        respuesta.forEach((arr) => {
            arr.forEach((o) => {
                let obj = {
                    fecha: o.fecha,
                    horarios: [],
                    total_timbres: '',
                    total_horario: '',
                    total_diferencia: '',
                };
                let arr_EoS = [];
                let arr_AES = [];
                let arr_horario_EoS = [];
                let arr_horario_AES = [];
                o.horario.forEach((h) => {
                    let obj2 = {
                        hora_horario: h.hora,
                        hora_diferencia: '',
                        hora_timbre: '',
                        accion: '',
                        observacion: ''
                    };
                    let diferencia = 0;
                    let dif = 0;
                    switch (h.orden) {
                        case 1:
                            var arr3 = o.timbres.filter((t) => { return t.accion === 'EoS' || t.accion === 'E'; });
                            if (arr3.length === 0) {
                                obj2.accion = 'EoS';
                                obj2.hora_timbre = h.hora;
                                obj2.observacion = 'Entrada';
                                dif = (0, SubMetodosGraficas_1.HHMMtoSegundos)(h.hora) - (0, SubMetodosGraficas_1.HHMMtoSegundos)(obj2.hora_timbre);
                            }
                            else {
                                obj2.accion = arr3[0].accion;
                                obj2.observacion = arr3[0].observacion;
                                obj2.hora_timbre = arr3[0].fec_hora_timbre.split(' ')[1];
                                dif = (0, SubMetodosGraficas_1.HHMMtoSegundos)(h.hora) - (0, SubMetodosGraficas_1.HHMMtoSegundos)(obj2.hora_timbre);
                            }
                            diferencia = (dif < 0) ? dif * (-1) : dif;
                            obj2.hora_diferencia = (dif < 0) ? '-' + (0, SubMetodosGraficas_1.SegundosToHHMM)(diferencia) : (0, SubMetodosGraficas_1.SegundosToHHMM)(diferencia);
                            arr_horario_EoS.push((0, SubMetodosGraficas_1.HHMMtoSegundos)(obj2.hora_horario));
                            arr_EoS.push((0, SubMetodosGraficas_1.HHMMtoSegundos)(obj2.hora_timbre));
                            break;
                        case 2:
                            var arr4 = o.timbres.filter((t) => { return t.accion === 'AES' || t.accion === 'I/A'; });
                            if (arr4.length === 0) {
                                obj2.accion = 'AES';
                                obj2.hora_timbre = h.hora;
                                obj2.observacion = 'Salida Almuerzo';
                                dif = (0, SubMetodosGraficas_1.HHMMtoSegundos)(obj2.hora_timbre) - (0, SubMetodosGraficas_1.HHMMtoSegundos)(h.hora);
                            }
                            else {
                                obj2.accion = arr4[0].accion;
                                obj2.observacion = arr4[0].observacion;
                                obj2.hora_timbre = arr4[0].fec_hora_timbre.split(' ')[1];
                                dif = (0, SubMetodosGraficas_1.HHMMtoSegundos)(obj2.hora_timbre) - (0, SubMetodosGraficas_1.HHMMtoSegundos)(h.hora);
                            }
                            diferencia = (dif < 0) ? dif * (-1) : dif;
                            obj2.hora_diferencia = (dif < 0) ? '-' + (0, SubMetodosGraficas_1.SegundosToHHMM)(diferencia) : (0, SubMetodosGraficas_1.SegundosToHHMM)(diferencia);
                            arr_horario_AES.push((0, SubMetodosGraficas_1.HHMMtoSegundos)(obj2.hora_horario));
                            arr_AES.push((0, SubMetodosGraficas_1.HHMMtoSegundos)(obj2.hora_timbre));
                            break;
                        case 3:
                            var arr1 = o.timbres.filter((t) => { return t.accion === 'AES' || t.accion === 'F/A'; });
                            if (arr1.length === 0) {
                                obj2.accion = 'AES';
                                obj2.hora_timbre = h.hora;
                                obj2.observacion = 'Entrada Almuerzo';
                                dif = (0, SubMetodosGraficas_1.HHMMtoSegundos)(h.hora) - (0, SubMetodosGraficas_1.HHMMtoSegundos)(obj2.hora_timbre);
                            }
                            else {
                                obj2.accion = arr1[arr1.length - 1].accion;
                                obj2.observacion = arr1[arr1.length - 1].observacion;
                                obj2.hora_timbre = arr1[arr1.length - 1].fec_hora_timbre.split(' ')[1];
                                dif = (0, SubMetodosGraficas_1.HHMMtoSegundos)(h.hora) - (0, SubMetodosGraficas_1.HHMMtoSegundos)(obj2.hora_timbre);
                            }
                            diferencia = (dif < 0) ? dif * (-1) : dif;
                            obj2.hora_diferencia = (dif < 0) ? '-' + (0, SubMetodosGraficas_1.SegundosToHHMM)(diferencia) : (0, SubMetodosGraficas_1.SegundosToHHMM)(diferencia);
                            arr_horario_AES.push((0, SubMetodosGraficas_1.HHMMtoSegundos)(obj2.hora_horario));
                            arr_AES.push((0, SubMetodosGraficas_1.HHMMtoSegundos)(obj2.hora_timbre));
                            break;
                        case 4:
                            var arr2 = o.timbres.filter((t) => { return t.accion === 'EoS' || t.accion === 'S'; });
                            if (arr2.length === 0) {
                                obj2.accion = 'EoS';
                                obj2.hora_timbre = h.hora;
                                obj2.observacion = 'Salida';
                                dif = (0, SubMetodosGraficas_1.HHMMtoSegundos)(obj2.hora_timbre) - (0, SubMetodosGraficas_1.HHMMtoSegundos)(h.hora);
                            }
                            else {
                                obj2.accion = arr2[arr2.length - 1].accion;
                                obj2.observacion = arr2[arr2.length - 1].observacion;
                                obj2.hora_timbre = arr2[arr2.length - 1].fec_hora_timbre.split(' ')[1];
                                dif = (0, SubMetodosGraficas_1.HHMMtoSegundos)(obj2.hora_timbre) - (0, SubMetodosGraficas_1.HHMMtoSegundos)(h.hora);
                            }
                            diferencia = (dif < 0) ? dif * (-1) : dif;
                            obj2.hora_diferencia = (dif < 0) ? '-' + (0, SubMetodosGraficas_1.SegundosToHHMM)(diferencia) : (0, SubMetodosGraficas_1.SegundosToHHMM)(diferencia);
                            arr_horario_EoS.push((0, SubMetodosGraficas_1.HHMMtoSegundos)(obj2.hora_horario));
                            arr_EoS.push((0, SubMetodosGraficas_1.HHMMtoSegundos)(obj2.hora_timbre));
                            break;
                        default:
                            break;
                    }
                    obj.horarios.push(obj2);
                });
                var resta_hor_EoS = parseFloat(arr_horario_EoS[1]) - parseFloat(arr_horario_EoS[0]);
                var resta_hor_AES = parseFloat(arr_horario_AES[1]) - parseFloat(arr_horario_AES[0]);
                let resta_hor = resta_hor_EoS - resta_hor_AES;
                obj.total_horario = (0, SubMetodosGraficas_1.SegundosToHHMM)(resta_hor);
                let resta_tim_EoS = parseFloat(arr_EoS[1]) - parseFloat(arr_EoS[0]);
                let resta_tim_AES = parseFloat(arr_AES[1]) - parseFloat(arr_AES[0]);
                let resta_tim = resta_tim_EoS - resta_tim_AES;
                obj.total_timbres = (0, SubMetodosGraficas_1.SegundosToHHMM)(resta_tim);
                let dif_total = resta_tim - resta_hor;
                let diferencia_Total = 0;
                diferencia_Total = (dif_total < 0) ? dif_total * (-1) : dif_total;
                obj.total_diferencia = (dif_total < 0) ? '-' + (0, SubMetodosGraficas_1.SegundosToHHMM)(diferencia_Total) : (0, SubMetodosGraficas_1.SegundosToHHMM)(diferencia_Total);
                arr_respuesta.push(obj);
            });
        });
        nuevoArray = [];
        res_timbre = [];
        respuesta = [];
        array = [];
        return arr_respuesta;
    });
};
const ModelarHorasTrabajaTimbresSinAcciones = function (codigo, fec_inicio, fec_final) {
    return __awaiter(this, void 0, void 0, function* () {
        let array = yield database_1.default.query('SELECT dh.hora, dh.orden, dh.id_horario, CAST(eh.fec_inicio AS VARCHAR), CAST(eh.fec_final AS VARCHAR) FROM empl_horarios AS eh, cg_horarios AS h, deta_horarios AS dh ' +
            'WHERE eh.codigo = $1 AND h.id = eh.id_horarios AND dh.id_horario = h.id AND CAST(eh.fec_inicio AS VARCHAR) between $2 || \'%\' AND $3 || \'%\' ' +
            'AND CAST(eh.fec_final AS VARCHAR) between $2 || \'%\' AND $3 || \'%\' ORDER BY eh.fec_inicio', [codigo, fec_inicio, fec_final])
            .then(res => { return res.rows; });
        if (array.length === 0)
            return [];
        // console.log('ARRAY MODELAR HORAS TRABAJADAS: ',array);
        var nuevoArray = [];
        var arrayTemporal = [];
        for (var i = 0; i < array.length; i++) {
            arrayTemporal = nuevoArray.filter((res) => {
                return res["Fecha"] == array[i]["fec_inicio"] + ' ' + array[i]["fec_final"];
            });
            if (arrayTemporal.length > 0) {
                nuevoArray[nuevoArray.indexOf(arrayTemporal[0])]["Horario"].push(array[i]);
            }
            else {
                nuevoArray.push({ "Fecha": array[i]["fec_inicio"] + ' ' + array[i]["fec_final"], "Horario": [array[i]] });
            }
        }
        nuevoArray.sort(compareFechas);
        let res_timbre = yield Promise.all(nuevoArray.map((obj) => __awaiter(this, void 0, void 0, function* () {
            var fec_aux = new Date(obj.Fecha.split(' ')[0]);
            var fecha1 = (0, moment_1.default)(obj.Fecha.split(' ')[0]);
            var fecha2 = (0, moment_1.default)(obj.Fecha.split(' ')[1]);
            var diasDiferencia = fecha2.diff(fecha1, 'days');
            let res = [];
            for (let i = 0; i <= diasDiferencia; i++) {
                let horario_res = {
                    fecha: fec_aux.toJSON().split('T')[0],
                    timbres: yield BuscarTimbresSinAccionesReporte(fec_aux.toJSON().split('T')[0], codigo),
                    horario: obj.Horario.sort(compareOrden)
                };
                if (horario_res.timbres.length > 0) {
                    res.push(horario_res);
                }
                fec_aux.setDate(fec_aux.getDate() + 1);
            }
            return res;
        })));
        let respuesta = res_timbre.filter((obj) => {
            return obj.length > 0;
        });
        // console.log('Respuesta timbres sin acciones:',respuesta);
        let arr_respuesta = [];
        respuesta.forEach((arr) => {
            arr.forEach((o) => {
                let obj = {
                    fecha: o.fecha,
                    horarios: [],
                    total_timbres: '',
                    total_horario: '',
                    total_diferencia: '',
                };
                let arr_EoS = [];
                let arr_AES = [];
                let arr_horario_EoS = [];
                let arr_horario_AES = [];
                o.horario.forEach((h) => {
                    let obj2 = {
                        hora_horario: h.hora,
                        hora_diferencia: '',
                        hora_timbre: '',
                        accion: '',
                        observacion: ''
                    };
                    let diferencia = 0;
                    let dif = 0;
                    switch (h.orden) {
                        case 1:
                            var arr3 = o.timbres.filter((t) => {
                                const hora_timbre = (0, SubMetodosGraficas_1.HHMMtoSegundos)(t.fec_hora_timbre.split(' ')[1]);
                                const h_inicio = (0, SubMetodosGraficas_1.HHMMtoSegundos)(h.hora) - (0, SubMetodosGraficas_1.HHMMtoSegundos)('01:30:00');
                                const h_final = (0, SubMetodosGraficas_1.HHMMtoSegundos)(h.hora) + (0, SubMetodosGraficas_1.HHMMtoSegundos)('01:59:00');
                                return (h_inicio <= hora_timbre && h_final >= hora_timbre);
                            });
                            obj2.hora_timbre = (arr3.length === 0) ? '' : arr3[0].fec_hora_timbre.split(' ')[1];
                            obj2.observacion = (arr3.length === 0) ? 'Entrada' : arr3[0].observacion;
                            obj2.accion = 'EoS';
                            dif = (obj2.hora_timbre === '') ? 0 : (0, SubMetodosGraficas_1.HHMMtoSegundos)(h.hora) - (0, SubMetodosGraficas_1.HHMMtoSegundos)(obj2.hora_timbre);
                            diferencia = (dif < 0) ? dif * (-1) : dif;
                            obj2.hora_diferencia = (dif < 0) ? '-' + (0, SubMetodosGraficas_1.SegundosToHHMM)(diferencia) : (0, SubMetodosGraficas_1.SegundosToHHMM)(diferencia);
                            arr_horario_EoS.push((0, SubMetodosGraficas_1.HHMMtoSegundos)(obj2.hora_horario));
                            arr_EoS.push((0, SubMetodosGraficas_1.HHMMtoSegundos)(obj2.hora_timbre));
                            break;
                        case 2:
                            var arr4 = o.timbres.filter((t) => {
                                const hora_timbre = (0, SubMetodosGraficas_1.HHMMtoSegundos)(t.fec_hora_timbre.split(' ')[1]);
                                const h_inicio = (0, SubMetodosGraficas_1.HHMMtoSegundos)(h.hora) - (0, SubMetodosGraficas_1.HHMMtoSegundos)('00:59:00');
                                const h_final = (0, SubMetodosGraficas_1.HHMMtoSegundos)(h.hora) + (0, SubMetodosGraficas_1.HHMMtoSegundos)('00:59:00');
                                return (h_inicio <= hora_timbre && h_final >= hora_timbre);
                            });
                            obj2.hora_timbre = (arr4.length === 0) ? '' : arr4[0].fec_hora_timbre.split(' ')[1];
                            obj2.observacion = (arr4.length === 0) ? 'Salida Almuerzo' : arr4[0].observacion;
                            obj2.accion = 'AES';
                            dif = (obj2.hora_timbre === '') ? 0 : (0, SubMetodosGraficas_1.HHMMtoSegundos)(obj2.hora_timbre) - (0, SubMetodosGraficas_1.HHMMtoSegundos)(h.hora);
                            diferencia = (dif < 0) ? dif * (-1) : dif;
                            obj2.hora_diferencia = (dif < 0) ? '-' + (0, SubMetodosGraficas_1.SegundosToHHMM)(diferencia) : (0, SubMetodosGraficas_1.SegundosToHHMM)(diferencia);
                            arr_horario_AES.push((0, SubMetodosGraficas_1.HHMMtoSegundos)(obj2.hora_horario));
                            arr_AES.push((0, SubMetodosGraficas_1.HHMMtoSegundos)(obj2.hora_timbre));
                            break;
                        case 3:
                            var arr1 = o.timbres.filter((t) => {
                                const hora_timbre = (0, SubMetodosGraficas_1.HHMMtoSegundos)(t.fec_hora_timbre.split(' ')[1]);
                                const h_inicio = (0, SubMetodosGraficas_1.HHMMtoSegundos)(h.hora) - (0, SubMetodosGraficas_1.HHMMtoSegundos)('00:59:00');
                                const h_final = (0, SubMetodosGraficas_1.HHMMtoSegundos)(h.hora) + (0, SubMetodosGraficas_1.HHMMtoSegundos)('00:59:00');
                                return (h_inicio <= hora_timbre && h_final >= hora_timbre);
                            });
                            obj2.hora_timbre = (arr1.length === 0) ? '' : arr1[0].fec_hora_timbre.split(' ')[1];
                            obj2.observacion = (arr1.length === 0) ? 'Entrada Almuerzo' : arr1[0].observacion;
                            obj2.accion = 'AES';
                            dif = (obj2.hora_timbre === '') ? 0 : (0, SubMetodosGraficas_1.HHMMtoSegundos)(h.hora) - (0, SubMetodosGraficas_1.HHMMtoSegundos)(obj2.hora_timbre);
                            diferencia = (dif < 0) ? dif * (-1) : dif;
                            obj2.hora_diferencia = (dif < 0) ? '-' + (0, SubMetodosGraficas_1.SegundosToHHMM)(diferencia) : (0, SubMetodosGraficas_1.SegundosToHHMM)(diferencia);
                            arr_horario_AES.push((0, SubMetodosGraficas_1.HHMMtoSegundos)(obj2.hora_horario));
                            arr_AES.push((0, SubMetodosGraficas_1.HHMMtoSegundos)(obj2.hora_timbre));
                            break;
                        case 4:
                            var arr2 = o.timbres.filter((t) => {
                                const hora_timbre = (0, SubMetodosGraficas_1.HHMMtoSegundos)(t.fec_hora_timbre.split(' ')[1]);
                                const h_inicio = (0, SubMetodosGraficas_1.HHMMtoSegundos)(h.hora) - (0, SubMetodosGraficas_1.HHMMtoSegundos)('01:59:00');
                                const h_final = (0, SubMetodosGraficas_1.HHMMtoSegundos)(h.hora) + (0, SubMetodosGraficas_1.HHMMtoSegundos)('01:30:00');
                                return (h_inicio <= hora_timbre && h_final >= hora_timbre);
                            });
                            obj2.hora_timbre = (arr2.length === 0) ? '' : arr2[0].fec_hora_timbre.split(' ')[1];
                            obj2.observacion = (arr2.length === 0) ? 'Salida' : arr2[0].observacion;
                            obj2.accion = 'EoS';
                            dif = (obj2.hora_timbre === '') ? 0 : (0, SubMetodosGraficas_1.HHMMtoSegundos)(obj2.hora_timbre) - (0, SubMetodosGraficas_1.HHMMtoSegundos)(h.hora);
                            diferencia = (dif < 0) ? dif * (-1) : dif;
                            obj2.hora_diferencia = (dif < 0) ? '-' + (0, SubMetodosGraficas_1.SegundosToHHMM)(diferencia) : (0, SubMetodosGraficas_1.SegundosToHHMM)(diferencia);
                            arr_horario_EoS.push((0, SubMetodosGraficas_1.HHMMtoSegundos)(obj2.hora_horario));
                            arr_EoS.push((0, SubMetodosGraficas_1.HHMMtoSegundos)(obj2.hora_timbre));
                            break;
                        default:
                            break;
                    }
                    obj.horarios.push(obj2);
                });
                // RESTA DE TIEMPO DE LOS HORARIOS.
                var resta_hor_EoS = parseFloat(arr_horario_EoS[1]) - parseFloat(arr_horario_EoS[0]);
                var resta_hor_AES = parseFloat(arr_horario_AES[1]) - parseFloat(arr_horario_AES[0]);
                // console.log('RESTA HORARIOS: ',resta_hor_EoS, resta_hor_AES);
                let resta_hor = (resta_hor_EoS === 0 || resta_hor_AES === 0) ? 0 : resta_hor_EoS - resta_hor_AES;
                obj.total_horario = (0, SubMetodosGraficas_1.SegundosToHHMM)(resta_hor);
                // RESTA DE TIEMPO DE LOS TIMBRES
                let resta_tim_EoS = parseFloat(arr_EoS[1]) - parseFloat(arr_EoS[0]);
                let resta_tim_AES = parseFloat(arr_AES[1]) - parseFloat(arr_AES[0]);
                // console.log('RESTA TIMBRES: ',resta_tim_EoS, resta_tim_AES);
                let resta_tim = (resta_tim_EoS === 0 || resta_tim_AES === 0) ? 0 : resta_tim_EoS - resta_tim_AES;
                obj.total_timbres = (0, SubMetodosGraficas_1.SegundosToHHMM)(resta_tim);
                let dif_total = (resta_tim === 0 || resta_hor === 0) ? 0 : resta_tim - resta_hor;
                let diferencia_Total = (dif_total < 0) ? dif_total * (-1) : dif_total;
                obj.total_diferencia = (dif_total < 0) ? '-' + (0, SubMetodosGraficas_1.SegundosToHHMM)(diferencia_Total) : (0, SubMetodosGraficas_1.SegundosToHHMM)(diferencia_Total);
                arr_respuesta.push(obj);
            });
        });
        nuevoArray = [];
        res_timbre = [];
        respuesta = [];
        array = [];
        return arr_respuesta;
    });
};
function BuscarHorarioEmpleado(fec_inicio, fec_final, codigo) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield database_1.default.query('SELECT * FROM empl_horarios WHERE ($1 BETWEEN fec_inicio AND fec_final ' +
            'OR $2 BETWEEN fec_inicio AND fec_final) AND codigo = $3 ORDER BY fec_inicio', [fec_inicio, fec_final, codigo]).then(result => { return result.rows; });
        if (res.length === 0)
            return res;
        let array = [];
        res.forEach(obj => {
            (0, MetodosHorario_1.HorariosParaInasistencias)(obj).forEach(o => {
                array.push(o);
            });
        });
        console.log('obj----faltas', array);
        let timbres = yield Promise.all(array.map((o) => __awaiter(this, void 0, void 0, function* () {
            o.registros = yield database_1.default.query('SELECT count(*) FROM timbres WHERE CAST(fec_hora_timbre AS VARCHAR) like $1 || \'%\' ', [o.fecha])
                .then(result => {
                if (result.rowCount === 0)
                    return 0;
                return parseInt(result.rows[0].count);
            });
            return o;
        })));
        return timbres;
    });
}
const ModelarPuntualidad = function (obj) {
    return __awaiter(this, void 0, void 0, function* () {
        let array = yield database_1.default.query('SELECT DISTINCT eh.id, dh.hora FROM empl_horarios AS eh, cg_horarios AS h, deta_horarios AS dh ' +
            'WHERE eh.codigo = $1 AND h.id = eh.id_horarios AND dh.id_horario = h.id AND eh.fec_inicio <= $2 ' +
            'AND eh.fec_final >= $2 AND dh.orden = 1', [obj.codigo, new Date(obj.fec_hora_timbre.split(' ')[0])])
            .then(res => { return res.rows; });
        if (array.length === 0)
            return [0];
        // console.log('Hora entrada',array);
        return array.map(ele => {
            let puntual = false;
            var timbre = (0, SubMetodosGraficas_1.HHMMtoSegundos)(obj.fec_hora_timbre.split(' ')[1]) / 3600;
            var hora = (0, SubMetodosGraficas_1.HHMMtoSegundos)(ele.hora) / 3600;
            (timbre <= hora) ? puntual = true : puntual = false;
            if (puntual === false)
                return 0;
            let diferencia = hora - timbre;
            if (diferencia > 4)
                return 0; // para diferenciar las horas de salida
            return 1; // un dia puntual
        });
    });
};
const TimbresTabulados = function (fec_inicio, fec_final, codigo) {
    return __awaiter(this, void 0, void 0, function* () {
        let timbres = yield database_1.default.query('SELECT CAST(fec_hora_timbre AS VARCHAR), accion FROM timbres WHERE CAST(fec_hora_timbre AS VARCHAR) between $1 || \'%\' AND $2 || \'%\' AND codigo = $3 ORDER BY fec_hora_timbre ASC ', [fec_inicio, fec_final, codigo])
            .then(res => {
            return res.rows;
        });
        if (timbres.length === 0)
            return [];
        var nuevoArray = [];
        var arrayTemporal = [];
        for (var i = 0; i < timbres.length; i++) {
            arrayTemporal = nuevoArray.filter((res) => {
                return res["Fecha"] == timbres[i]["fec_hora_timbre"].split(' ')[0];
            });
            if (arrayTemporal.length > 0) {
                nuevoArray[nuevoArray.indexOf(arrayTemporal[0])]["Timbres"].push(timbres[i]);
            }
            else {
                nuevoArray.push({ "Fecha": timbres[i]["fec_hora_timbre"].split(' ')[0], "Timbres": [timbres[i]] });
            }
        }
        function compare(a, b) {
            var uno = new Date(a.Fecha);
            var dos = new Date(b.Fecha);
            if (uno < dos)
                return -1;
            if (uno > dos)
                return 1;
            return 0;
        }
        nuevoArray.sort(compare);
        let arrayModelado = [];
        nuevoArray.forEach((obj) => {
            console.log('NUEVO ARRAY TABULADO: ', obj);
            if (obj.Timbres[0].accion === 'EoS' || obj.Timbres[0].accion === 'AES' || obj.Timbres[0].accion === 'PES') {
                let e = {
                    fecha: obj.Fecha,
                    entrada: obj.Timbres.filter((ele) => { return ele.accion === 'EoS'; }).map((ele) => { return ele.fec_hora_timbre.split(' ')[1]; })[0],
                    salida: obj.Timbres.filter((ele) => { return ele.accion === 'EoS'; }).map((ele) => { return ele.fec_hora_timbre.split(' ')[1]; })[1],
                    sal_Alm: obj.Timbres.filter((ele) => { return ele.accion === 'AES'; }).map((ele) => { return ele.fec_hora_timbre.split(' ')[1]; })[0],
                    ent_Alm: obj.Timbres.filter((ele) => { return ele.accion === 'AES'; }).map((ele) => { return ele.fec_hora_timbre.split(' ')[1]; })[1],
                    desconocido: obj.Timbres.filter((ele) => { return ele.accion != 'EoS' && ele.accion != 'AES'; }).map((ele) => { return ele.fec_hora_timbre.split(' ')[1]; })[0]
                };
                arrayModelado.push(e);
            }
            else {
                let e = {
                    fecha: obj.Fecha,
                    entrada: obj.Timbres.filter((ele) => { return ele.accion === 'E'; }).map((ele) => { return ele.fec_hora_timbre.split(' ')[1]; })[0],
                    salida: obj.Timbres.filter((ele) => { return ele.accion === 'S'; }).map((ele) => { return ele.fec_hora_timbre.split(' ')[1]; })[0],
                    sal_Alm: obj.Timbres.filter((ele) => { return ele.accion === 'I/A'; }).map((ele) => { return ele.fec_hora_timbre.split(' ')[1]; })[0],
                    ent_Alm: obj.Timbres.filter((ele) => { return ele.accion === 'F/A'; }).map((ele) => { return ele.fec_hora_timbre.split(' ')[1]; })[0],
                    desconocido: obj.Timbres.filter((ele) => { return ele.accion != 'E' && ele.accion != 'S' && ele.accion != 'I/A' && ele.accion != 'F/A'; }).map((ele) => { return ele.fec_hora_timbre.split(' ')[1]; })[0]
                };
                arrayModelado.push(e);
            }
        });
        return arrayModelado;
    });
};
const TimbresIncompletos = function (fec_inicio, fec_final, codigo) {
    return __awaiter(this, void 0, void 0, function* () {
        let horarios = yield database_1.default.query('SELECT eh.fec_inicio, eh.fec_final, eh.lunes, eh.martes, eh.miercoles, eh.id_horarios, ' +
            'eh.jueves, eh.viernes, eh.sabado, eh.domingo, eh.codigo FROM empl_horarios AS eh ' +
            'WHERE (($1 BETWEEN eh.fec_inicio AND eh.fec_final) OR ($2 BETWEEN eh.fec_inicio AND eh.fec_final)) ' +
            'AND eh.codigo = $3 ORDER BY eh.fec_inicio ASC', [fec_inicio, fec_final, codigo]).then(result => {
            console.log('RESPUESTA TIMBRE ENCONTRADO:1 ', result.rows);
            return result.rows;
        });
        if (horarios.length === 0)
            return [];
        let hora_deta = yield Promise.all(horarios.map((obj) => __awaiter(this, void 0, void 0, function* () {
            console.log('RESPUESTA TIMBRE ENCONTRADO:------------------------------------ ', obj);
            obj.dias_laborados = (0, MetodosHorario_1.HorariosParaInasistencias)(obj);
            // obj.dias_laborados = ModelarFechas(obj.fec_inicio, obj.fec_final, obj)
            obj.deta_horarios = yield database_1.default.query('SELECT DISTINCT dh.hora, dh.orden, dh.tipo_accion FROM empl_horarios AS eh, cg_horarios AS h, deta_horarios AS dh ' +
                'WHERE eh.id_horarios = h.id AND h.id = dh.id_horario AND eh.codigo = $1 AND h.id = $2 ' +
                'ORDER BY dh.orden ASC', [obj.codigo, obj.id_horarios]).then(result => {
                return result.rows;
            });
            console.log('RESPUESTA TIMBRE ENCONTRADO:2 ', obj);
            return obj;
        })));
        if (hora_deta.length === 0)
            return [];
        let modelado = yield Promise.all(hora_deta.map((obj) => __awaiter(this, void 0, void 0, function* () {
            obj.dias_laborados = yield Promise.all(obj.dias_laborados.map((obj1) => __awaiter(this, void 0, void 0, function* () {
                return {
                    fecha: obj1.fecha,
                    timbres_hora: yield database_1.default.query('SELECT CAST(fec_hora_timbre AS VARCHAR) AS timbre, ' +
                        'accion FROM timbres WHERE codigo = $1 AND CAST(fec_hora_timbre AS VARCHAR) ' +
                        'like $2 || \'%\' AND accion in (\'EoS\',\'AES\', \'S\',\'E\',\'E/A\',\'S/A\')', [obj.codigo, obj1.fecha]).then(result => { return result.rows; })
                };
            })));
            obj.dias_laborados = obj.dias_laborados.map((o) => {
                if (o.timbres_hora.length === 0) {
                    o.timbres_hora = obj.deta_horarios.map((h) => {
                        return {
                            fecha_timbre: o.fecha,
                            tipo: h.tipo_accion,
                            hora: h.hora
                        };
                    });
                    return o;
                }
                else {
                    o.timbres_hora = obj.deta_horarios.map((h) => {
                        var h_inicio = (0, SubMetodosGraficas_1.HHMMtoSegundos)(h.hora) - (0, SubMetodosGraficas_1.HHMMtoSegundos)('01:00:00');
                        var h_final = (0, SubMetodosGraficas_1.HHMMtoSegundos)(h.hora) + (0, SubMetodosGraficas_1.HHMMtoSegundos)('01:00:00');
                        let respuesta = o.timbres_hora.filter((t) => {
                            let hora_timbre = (0, SubMetodosGraficas_1.HHMMtoSegundos)(t.timbre.split(' ')[1]);
                            return h_inicio <= hora_timbre && h_final >= hora_timbre;
                        });
                        console.log('RESPUESTA TIMBRE ENCONTRADO: ', respuesta);
                        if (respuesta.length === 0) {
                            return {
                                fecha_timbre: o.fecha,
                                tipo: h.tipo_accion,
                                hora: h.hora
                            };
                        }
                        return 0;
                    }).filter((h) => { return h != 0; });
                    return o;
                }
            });
            console.log('RESPUESTA TIMBRE ENCONTRADO: ', obj);
            return obj;
        })));
        // modelado.forEach(obj => { console.log(obj.dias_laborados);})
        let res = [];
        modelado.forEach(obj => {
            obj.dias_laborados.filter((o) => {
                return o.timbres_hora.length > 0;
            }).map((o) => {
                res.push(o);
                return o;
            });
        });
        return res;
    });
};
const TimbresSinAccionesTabulados = function (fec_inicio, fec_final, codigo) {
    return __awaiter(this, void 0, void 0, function* () {
        let horarioEntrada = yield database_1.default.query('SELECT dt.hora, tipo_accion, CAST(eh.fec_inicio AS VARCHAR), CAST(eh.fec_final AS VARCHAR), ' +
            'eh.lunes, eh.martes, eh.miercoles, eh.jueves, eh.viernes, eh.sabado, eh.domingo ' +
            'FROM empl_horarios AS eh, cg_horarios AS ch, deta_horarios AS dt ' +
            'WHERE eh.fec_inicio BETWEEN $1 AND $2 AND eh.fec_final BETWEEN $1 AND $2 AND eh.codigo = $3 AND eh.id_horarios = ch.id AND ch.id = dt.id_horario ' +
            'ORDER BY eh.fec_inicio ASC, dt.hora ASC', [new Date(fec_inicio), new Date(fec_final), codigo])
            .then(result => { return result.rows; });
        // console.log('HORARIO: ',horarioEntrada);    
        if (horarioEntrada.length === 0)
            return [];
        let aux = yield Promise.all(horarioEntrada.map((obj) => __awaiter(this, void 0, void 0, function* () {
            let fechas = (0, SubMetodosGraficas_1.ModelarFechas)(obj.fec_inicio, obj.fec_final, obj);
            const hora_seg = (0, SubMetodosGraficas_1.HHMMtoSegundos)(obj.hora);
            let timbres = yield Promise.all(fechas.map((o) => __awaiter(this, void 0, void 0, function* () {
                var f_inicio = o.fecha + ' ' + (0, SubMetodosGraficas_1.SegundosToHHMM)(hora_seg - (0, SubMetodosGraficas_1.HHMMtoSegundos)('00:59:00'));
                var f_final = o.fecha + ' ' + (0, SubMetodosGraficas_1.SegundosToHHMM)(hora_seg + (0, SubMetodosGraficas_1.HHMMtoSegundos)('00:59:00'));
                // console.log( f_inicio, ' || ', f_final, ' || ', codigo);
                const query = 'SELECT CAST(fec_hora_timbre AS VARCHAR) from timbres where fec_hora_timbre >= TO_TIMESTAMP(\'' + f_inicio + '\'' + ', \'YYYY-MM-DD HH24:MI:SS\') ' +
                    'and fec_hora_timbre <= TO_TIMESTAMP(\'' + f_final + '\'' + ', \'YYYY-MM-DD HH24:MI:SS\') and codigo = ' + codigo + ' order by fec_hora_timbre';
                return yield database_1.default.query(query).then(res => {
                    let x = res.rows.map((elemento) => {
                        elemento.accion = obj.tipo_accion;
                        return elemento;
                    });
                    if (x.length === 0)
                        return res.rows;
                    return [x[x.length - 1]];
                });
            })));
            return timbres.filter(o => {
                return o.length >= 1;
            }).map((e) => {
                return e;
            });
        })));
        let timbres = [];
        aux.filter(o => {
            return o.length >= 1;
        }).forEach((o) => {
            o.forEach((e) => {
                e.forEach(t => {
                    timbres.push(t);
                });
            });
        });
        if (timbres.length === 0)
            return [];
        var nuevoArray = [];
        var arrayTemporal = [];
        for (var i = 0; i < timbres.length; i++) {
            arrayTemporal = nuevoArray.filter((res) => {
                return res["Fecha"] == timbres[i]["fec_hora_timbre"].split(' ')[0];
            });
            if (arrayTemporal.length > 0) {
                nuevoArray[nuevoArray.indexOf(arrayTemporal[0])]["Timbres"].push(timbres[i]);
            }
            else {
                nuevoArray.push({ "Fecha": timbres[i]["fec_hora_timbre"].split(' ')[0], "Timbres": [timbres[i]] });
            }
        }
        function compare(a, b) {
            var uno = new Date(a.Fecha);
            var dos = new Date(b.Fecha);
            if (uno < dos)
                return -1;
            if (uno > dos)
                return 1;
            return 0;
        }
        nuevoArray.sort(compare);
        let arrayModelado = [];
        nuevoArray.forEach((obj) => {
            console.log('NUEVO ARRAY TABULADO: ', obj);
            let e = {
                fecha: obj.Fecha,
                entrada: obj.Timbres.filter((ele) => { return ele.accion === 'E'; }).map((ele) => { return ele.fec_hora_timbre.split(' ')[1]; })[0],
                sal_Alm: obj.Timbres.filter((ele) => { return ele.accion === 'I/A'; }).map((ele) => { return ele.fec_hora_timbre.split(' ')[1]; })[0],
                ent_Alm: obj.Timbres.filter((ele) => { return ele.accion === 'F/A'; }).map((ele) => { return ele.fec_hora_timbre.split(' ')[1]; })[0],
                salida: obj.Timbres.filter((ele) => { return ele.accion === 'S'; }).map((ele) => { return ele.fec_hora_timbre.split(' ')[1]; })[0],
                desconocido: obj.Timbres.filter((ele) => { return ele.accion != 'E' && ele.accion != 'S' && ele.accion != 'I/A' && ele.accion != 'F/A'; }).map((ele) => { return ele.fec_hora_timbre.split(' ')[1]; })[0]
            };
            console.log(e);
            arrayModelado.push(e);
        });
        return arrayModelado;
    });
};
const TimbresSinAccionesIncompletos = function (fec_inicio, fec_final, codigo) {
    return __awaiter(this, void 0, void 0, function* () {
        let horarioEntrada = yield database_1.default.query('SELECT dt.hora, tipo_accion, CAST(eh.fec_inicio AS VARCHAR), CAST(eh.fec_final AS VARCHAR), ' +
            'eh.lunes, eh.martes, eh.miercoles, eh.jueves, eh.viernes, eh.sabado, eh.domingo ' +
            'FROM empl_horarios AS eh, cg_horarios AS ch, deta_horarios AS dt ' +
            'WHERE eh.fec_inicio BETWEEN $1 AND $2 AND eh.fec_final BETWEEN $1 AND $2 AND eh.codigo = $3 AND eh.id_horarios = ch.id AND ch.id = dt.id_horario ' +
            'ORDER BY eh.fec_inicio ASC, dt.hora ASC', [fec_inicio, fec_final, codigo])
            .then(result => { return result.rows; });
        // console.log('HORARIO: ',horarioEntrada);    
        if (horarioEntrada.length === 0)
            return [];
        let aux = yield Promise.all(horarioEntrada.map((obj) => __awaiter(this, void 0, void 0, function* () {
            let fechas = (0, SubMetodosGraficas_1.ModelarFechas)(obj.fec_inicio, obj.fec_final, obj);
            const hora_seg = (0, SubMetodosGraficas_1.HHMMtoSegundos)(obj.hora);
            const timbres = yield Promise.all(fechas.map((o) => __awaiter(this, void 0, void 0, function* () {
                var f_inicio = o.fecha + ' ' + (0, SubMetodosGraficas_1.SegundosToHHMM)(hora_seg - (0, SubMetodosGraficas_1.HHMMtoSegundos)('00:59:00'));
                var f_final = o.fecha + ' ' + (0, SubMetodosGraficas_1.SegundosToHHMM)(hora_seg + (0, SubMetodosGraficas_1.HHMMtoSegundos)('00:59:00'));
                // console.log( f_inicio, ' || ', f_final, ' || ', codigo);
                const query = 'SELECT CAST(fec_hora_timbre AS VARCHAR) from timbres where fec_hora_timbre >= TO_TIMESTAMP(\'' + f_inicio + '\'' + ', \'YYYY-MM-DD HH24:MI:SS\') ' +
                    'and fec_hora_timbre <= TO_TIMESTAMP(\'' + f_final + '\'' + ', \'YYYY-MM-DD HH24:MI:SS\') and codigo = ' + codigo + ' order by fec_hora_timbre';
                return yield database_1.default.query(query).then(res => {
                    if (res.rowCount === 0) {
                        return {
                            fecha_timbre: o.fecha,
                            tipo: obj.tipo_accion,
                            hora: obj.hora
                        };
                    }
                    return 0;
                });
            })));
            return timbres.filter(o => {
                return o !== 0;
            }).map((e) => {
                return e;
            });
        })));
        let tim = [];
        aux.forEach((o) => {
            o.forEach((e) => {
                tim.push(e);
            });
        });
        var nuevoArray = [];
        var arrayTemporal = [];
        for (var i = 0; i < tim.length; i++) {
            arrayTemporal = nuevoArray.filter((res) => {
                return res["fecha"] == tim[i]["fecha_timbre"];
            });
            if (arrayTemporal.length > 0) {
                nuevoArray[nuevoArray.indexOf(arrayTemporal[0])]["timbres_hora"].push(tim[i]);
            }
            else {
                nuevoArray.push({ "fecha": tim[i]["fecha_timbre"], "timbres_hora": [tim[i]] });
            }
        }
        nuevoArray.sort(compareFechas);
        return nuevoArray;
    });
};
function compareFechas(a, b) {
    var uno = new Date(a.fecha);
    var dos = new Date(b.fecha);
    if (uno < dos)
        return -1;
    if (uno > dos)
        return 1;
    return 0;
}
function compareOrden(a, b) {
    if (a.orden < b.orden)
        return -1;
    if (a.orden > b.orden)
        return 1;
    return 0;
}
