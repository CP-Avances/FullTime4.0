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
const auditoriaControlador_1 = __importDefault(require("../../auditoria/auditoriaControlador"));
const database_1 = __importDefault(require("../../../database"));
const xlsx_1 = __importDefault(require("xlsx"));
const fs_1 = __importDefault(require("fs"));
class PeriodoVacacionControlador {
    // METODO PARA BUSCAR ID DE PERIODO DE VACACIONES
    EncontrarIdPerVacaciones(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_empleado } = req.params;
            const VACACIONES = yield database_1.default.query(`
        SELECT pv.id, pv.id_empleado_contrato
        FROM mv_periodo_vacacion AS pv
        WHERE pv.id = (SELECT MAX(pv.id) AS id 
                       FROM mv_periodo_vacacion AS pv, eu_empleados AS e 
                       WHERE pv.codigo = e.codigo AND e.id = $1 )
        `, [id_empleado]);
            if (VACACIONES.rowCount > 0) {
                return res.jsonp(VACACIONES.rows);
            }
            res.status(404).jsonp({ text: 'Registro no encontrado' });
        });
    }
    ListarPerVacaciones(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const VACACIONES = yield database_1.default.query(`
        SELECT * FROM mv_periodo_vacacion WHERE estado = 1 ORDER BY fecha_inicio DESC
        `);
            if (VACACIONES.rowCount > 0) {
                return res.jsonp(VACACIONES.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    CrearPerVacaciones(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id_empl_contrato, descripcion, dia_vacacion, dia_antiguedad, estado, fec_inicio, fec_final, dia_perdido, horas_vacaciones, min_vacaciones, codigo, user_name, ip, } = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query("BEGIN");
                yield database_1.default.query(`
          INSERT INTO mv_periodo_vacacion (id_empleado_contrato, descripcion, dia_vacacion,
              dia_antiguedad, estado, fecha_inicio, fecha_final, dia_perdido, horas_vacaciones, minutos_vacaciones, codigo)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        `, [id_empl_contrato, descripcion, dia_vacacion, dia_antiguedad, estado,
                    fec_inicio, fec_final, dia_perdido, horas_vacaciones, min_vacaciones,
                    codigo,]);
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: "mv_periodo_vacacion",
                    usuario: user_name,
                    accion: "I",
                    datosOriginales: "",
                    datosNuevos: `{id_empleado_contrato: ${id_empl_contrato}, descripcion: ${descripcion}, dia_vacacion: ${dia_vacacion}, dia_antiguedad: ${dia_antiguedad}, estado: ${estado}, fecha_inicio: ${fec_inicio}, fecha_final: ${fec_final}, dia_perdido: ${dia_perdido}, horas_vacaciones: ${horas_vacaciones}, minutos_vacaciones: ${min_vacaciones}, codigo: ${codigo}}`,
                    ip,
                    observacion: null,
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query("COMMIT");
                res.jsonp({ message: "Período de Vacación guardado" });
            }
            catch (error) {
                // REVERTIR TRANSACCION
                yield database_1.default.query("ROLLBACK");
                res.status(500).jsonp({ message: "Error al guardar período de vacación." });
            }
        });
    }
    EncontrarPerVacaciones(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { codigo } = req.params;
            const PERIODO_VACACIONES = yield database_1.default.query(`
        SELECT * FROM mv_periodo_vacacion AS p WHERE p.codigo = $1
        `, [codigo]);
            if (PERIODO_VACACIONES.rowCount > 0) {
                return res.jsonp(PERIODO_VACACIONES.rows);
            }
            res.status(404).jsonp({ text: 'Registro no encontrado.' });
        });
    }
    ActualizarPeriodo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id_empl_contrato, descripcion, dia_vacacion, dia_antiguedad, estado, fec_inicio, fec_final, dia_perdido, horas_vacaciones, min_vacaciones, id, user_name, ip, } = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query("BEGIN");
                // CONSULTAR DATOSORIGINALES
                const periodo = yield database_1.default.query("SELECT * FROM mv_periodo_vacacion WHERE id = $1", [id]);
                const [datosOriginales] = periodo.rows;
                if (!datosOriginales) {
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: "mv_periodo_vacacion",
                        usuario: user_name,
                        accion: "U",
                        datosOriginales: "",
                        datosNuevos: "",
                        ip,
                        observacion: `Error al actualizar período de vacaciones con id: ${id}`,
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query("COMMIT");
                    return res.status(404).jsonp({ message: "Error al actualizar período de vacaciones." });
                }
                yield database_1.default.query(`
        UPDATE mv_periodo_vacacion SET id_empleado_contrato = $1, descripcion = $2, dia_vacacion = $3 ,
            dia_antiguedad = $4, estado = $5, fecha_inicio = $6, fecha_final = $7, dia_perdido = $8, 
            horas_vacaciones = $9, minutos_vacaciones = $10 
        WHERE id = $11
        `, [id_empl_contrato, descripcion, dia_vacacion, dia_antiguedad, estado,
                    fec_inicio, fec_final, dia_perdido, horas_vacaciones, min_vacaciones, id,]);
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: "mv_periodo_vacacion",
                    usuario: user_name,
                    accion: "U",
                    datosOriginales: JSON.stringify(datosOriginales),
                    datosNuevos: `{id_empleado_contrato: ${id_empl_contrato}, descripcion: ${descripcion}, dia_vacacion: ${dia_vacacion}, dia_antiguedad: ${dia_antiguedad}, estado: ${estado}, fecha_inicio: ${fec_inicio}, fecha_final: ${fec_final}, dia_perdido: ${dia_perdido}, horas_vacaciones: ${horas_vacaciones}, minutos_vacaciones: ${min_vacaciones}}`,
                    ip,
                    observacion: null,
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query("COMMIT");
                return res.jsonp({ message: "Registro Actualizado exitosamente" });
            }
            catch (error) {
                // REVERTIR TRANSACCION
                yield database_1.default.query("ROLLBACK");
                return res.status(500).jsonp({ message: "Error al actualizar período de vacaciones." });
            }
        });
    }
    /** VERIFICAR QUE LOS DATOS EXISTAN PARA REGISTRAR PERIODO DE VACACIONES */
    VerificarDatos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let list = req.files;
            let cadena = list.uploads[0].path;
            let filename = cadena.split("\\")[1];
            var filePath = `./plantillas/${filename}`;
            const workbook = xlsx_1.default.readFile(filePath);
            const sheet_name_list = workbook.SheetNames; // ARRAY DE HOJAS DE CALCULO
            const plantilla = xlsx_1.default.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
            var contarDatos = 0;
            var contarCedula = 0;
            var contarContrato = 0;
            var contarPeriodos = 0;
            var contador = 1;
            /** PERIODO DE VACACIONES */
            plantilla.forEach((data) => __awaiter(this, void 0, void 0, function* () {
                // DATOS OBTENIDOS DE LA PLANTILLA
                const { nombre_empleado, apellido_empleado, cedula, descripcion, vacaciones_tomadas, fecha_inicia_periodo, fecha_fin_periodo, dias_vacacion, horas_vacacion, minutos_vacacion, dias_por_antiguedad, dias_perdidos, } = data;
                // VERIFICAR SI LOS DATOS OBLIGATORIOS EXISTEN
                if (cedula != undefined &&
                    descripcion != undefined &&
                    vacaciones_tomadas != undefined &&
                    fecha_inicia_periodo != undefined &&
                    fecha_fin_periodo != undefined &&
                    dias_vacacion != undefined &&
                    horas_vacacion != undefined &&
                    minutos_vacacion != undefined &&
                    dias_por_antiguedad != undefined &&
                    dias_perdidos != undefined) {
                    contarDatos = contarDatos + 1;
                }
                // VERIFICAR SI LA CÉDULA DEL EMPLEADO EXISTEN DENTRO DEL SISTEMA
                if (cedula != undefined) {
                    const CEDULA = yield database_1.default.query(`
          SELECT id, codigo FROM eu_empleados WHERE cedula = $1
          `, [cedula]);
                    if (CEDULA.rowCount != 0) {
                        contarCedula = contarCedula + 1;
                        // VERIFICAR SI EL EMPLEADO TIENE UN CONTRATO
                        const CONTRATO = yield database_1.default.query(`
            SELECT MAX(ec.id) FROM eu_empleado_contratos AS ec, eu_empleados AS e 
            WHERE ec.id_empleado = e.id AND e.id = $1
            `, [CEDULA.rows[0]["id"]]);
                        if (CONTRATO.rowCount != 0) {
                            contarContrato = contarContrato + 1;
                            // VERIFICAR SI EL EMPLEADO YA TIENE REGISTRADO UN PERIODO DE VACACIONES
                            const PERIODO = yield database_1.default.query(`
              SELECT * FROM mv_periodo_vacacion WHERE codigo = $1
              `, CEDULA.rows[0]["codigo"]);
                            if (PERIODO.rowCount === 0) {
                                contarPeriodos = contarPeriodos + 1;
                            }
                        }
                    }
                }
                // VERIFICAR QUE TODOS LOS DATOS SEAN CORRECTOS
                if (contador === plantilla.length) {
                    if (contarDatos === plantilla.length &&
                        contarCedula === plantilla.length &&
                        contarContrato === plantilla.length &&
                        contarPeriodos === plantilla.length) {
                        return res.jsonp({ message: "correcto" });
                    }
                    else {
                        return res.jsonp({ message: "error" });
                    }
                }
                contador = contador + 1;
            }));
            // VERIFICAR EXISTENCIA DE CARPETA O ARCHIVO
            fs_1.default.access(filePath, fs_1.default.constants.F_OK, (err) => {
                if (err) {
                }
                else {
                    // ELIMINAR DEL SERVIDOR
                    fs_1.default.unlinkSync(filePath);
                }
            });
        });
    }
    /** VERIFICAR QUE NO EXISTA CEDULAS DUPLICADAS EN EL REGISTRO */
    VerificarPlantilla(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let list = req.files;
            let cadena = list.uploads[0].path;
            let filename = cadena.split("\\")[1];
            var filePath = `./plantillas/${filename}`;
            const workbook = xlsx_1.default.readFile(filePath);
            const sheet_name_list = workbook.SheetNames;
            const plantilla = xlsx_1.default.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
            var contarCedulaData = 0;
            var contador_arreglo = 1;
            var arreglos_datos = [];
            //LEER LA PLANTILLA PARA LLENAR UN ARRAY CON LOS DATOS NOMBRE PARA VERIFICAR QUE NO SEAN DUPLICADOS
            plantilla.forEach((data) => __awaiter(this, void 0, void 0, function* () {
                // DATOS QUE SE LEEN DE LA PLANTILLA INGRESADA
                const { nombre_empleado, apellido_empleado, cedula, descripcion, vacaciones_tomadas, fecha_inicia_periodo, fecha_fin_periodo, dias_vacacion, horas_vacacion, minutos_vacacion, dias_por_antiguedad, dias_perdidos, } = data;
                let datos_array = { cedula: cedula, };
                arreglos_datos.push(datos_array);
            }));
            // VAMOS A VERIFICAR DENTRO DE ARREGLO_DATOS QUE NO SE ENCUENTREN DATOS DUPLICADOS
            for (var i = 0; i <= arreglos_datos.length - 1; i++) {
                for (var j = 0; j <= arreglos_datos.length - 1; j++) {
                    if (arreglos_datos[i].cedula === arreglos_datos[j].cedula) {
                        contarCedulaData = contarCedulaData + 1;
                    }
                }
                contador_arreglo = contador_arreglo + 1;
            }
            // CUANDO TODOS LOS DATOS HAN SIDO LEIDOS VERIFICAMOS SI TODOS LOS DATOS SON CORRECTOS
            if (contador_arreglo - 1 === plantilla.length) {
                if (contarCedulaData === plantilla.length) {
                    return res.jsonp({ message: "correcto" });
                }
                else {
                    return res.jsonp({ message: "error" });
                }
            }
            // VERIFICAR EXISTENCIA DE CARPETA O ARCHIVO
            fs_1.default.access(filePath, fs_1.default.constants.F_OK, (err) => {
                if (err) {
                }
                else {
                    // ELIMINAR DEL SERVIDOR
                    fs_1.default.unlinkSync(filePath);
                }
            });
        });
    }
    CargarPeriodoVacaciones(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let list = req.files;
            let cadena = list.uploads[0].path;
            let filename = cadena.split("\\")[1];
            var filePath = `./plantillas/${filename}`;
            const workbook = xlsx_1.default.readFile(filePath);
            const sheet_name_list = workbook.SheetNames; // ARRAY DE HOJAS DE CALCULO
            const plantilla = xlsx_1.default.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
            const { user_name, ip } = req.body;
            /** PERIODO DE VACACIONES */
            plantilla.forEach((data) => __awaiter(this, void 0, void 0, function* () {
                try {
                    // DATOS OBTENIDOS DE LA PLANTILLA
                    let estado;
                    let { nombre_empleado, apellido_empleado, cedula, descripcion, vacaciones_tomadas, fecha_inicia_periodo, fecha_fin_periodo, dias_vacacion, horas_vacacion, minutos_vacacion, dias_por_antiguedad, dias_perdidos, } = data;
                    // INICIAR TRANSACCION
                    yield database_1.default.query("BEGIN");
                    // OBTENER ID DEL EMPLEADO MEDIANTE LA CÉDULA
                    const datosEmpleado = yield database_1.default.query(`
          SELECT id, nombre, apellido, codigo, estado FROM eu_empleados WHERE cedula = $1
          `, [cedula]);
                    let id_empleado = datosEmpleado.rows[0]["id"];
                    // OBTENER EL ID DEL CONTRATO ACTUAL DEL EMPLEADO INDICADO
                    const CONTRATO = yield database_1.default.query(`
          SELECT MAX(ec.id) FROM eu_empleado_contratos AS ec, eu_empleados AS e 
          WHERE ec.id_empleado = e.id AND e.id = $1
          `, [id_empleado]);
                    let id_empl_contrato = CONTRATO.rows[0]["max"];
                    // CAMBIAR EL ESTADO DE VACACIONES USADAS A VALORES ENTEROS
                    if (vacaciones_tomadas === true) {
                        estado = 1;
                    }
                    else {
                        estado = 2;
                    }
                    // REGISTRAR DATOS DE PERIODO DE VACACIÓN
                    yield database_1.default.query(`
          INSERT INTO mv_periodo_vacacion (id_empleado_contrato, descripcion, dia_vacacion,
              dia_antiguedad, estado, fecha_inicio, fecha_final, dia_perdido, horas_vacaciones,
              minutos_vacaciones, codigo) 
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          `, [
                        id_empl_contrato, descripcion, dias_vacacion, dias_por_antiguedad, estado, fecha_inicia_periodo,
                        fecha_fin_periodo, dias_perdidos, horas_vacacion, minutos_vacacion, datosEmpleado.rows[0]["codigo"],
                    ]);
                    // AUDITORIA
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: "mv_periodo_vacacion",
                        usuario: user_name,
                        accion: "I",
                        datosOriginales: "",
                        datosNuevos: `{id_empleado_contrato: ${id_empl_contrato}, descripcion: ${descripcion}, dia_vacacion: ${dias_vacacion}, dia_antiguedad: ${dias_por_antiguedad}, estado: ${estado}, fecha_inicio: ${fecha_inicia_periodo}, fecha_final: ${fecha_fin_periodo}, dia_perdido: ${dias_perdidos}, horas_vacaciones: ${horas_vacacion}, minutos_vacaciones: ${minutos_vacacion}, codigo: ${datosEmpleado.rows[0]["codigo"]}}`,
                        ip,
                        observacion: null,
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query("COMMIT");
                    return res.jsonp({ message: "correcto" });
                }
                catch (error) {
                    // REVERTIR TRANSACCION
                    yield database_1.default.query("ROLLBACK");
                    return res.status(500).jsonp({ message: "Error al guardar período de vacaciones." });
                }
            }));
            // VERIFICAR EXISTENCIA DE CARPETA O ARCHIVO
            fs_1.default.access(filePath, fs_1.default.constants.F_OK, (err) => {
                if (err) {
                }
                else {
                    // ELIMINAR DEL SERVIDOR
                    fs_1.default.unlinkSync(filePath);
                }
            });
        });
    }
}
const PERIODO_VACACION_CONTROLADOR = new PeriodoVacacionControlador();
exports.default = PERIODO_VACACION_CONTROLADOR;
