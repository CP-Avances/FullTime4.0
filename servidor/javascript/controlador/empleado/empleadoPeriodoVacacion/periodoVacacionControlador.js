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
const database_1 = __importDefault(require("../../../database"));
const xlsx_1 = __importDefault(require("xlsx"));
const fs_1 = __importDefault(require("fs"));
class PeriodoVacacionControlador {
    // METODO PARA BUSCAR ID DE PERIODO DE VACACIONES
    EncontrarIdPerVacaciones(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_empleado } = req.params;
            const VACACIONES = yield database_1.default.query(`
            SELECT pv.id, pv.id_empl_contrato
            FROM peri_vacaciones AS pv
            WHERE pv.id = (SELECT MAX(pv.id) AS id 
                           FROM peri_vacaciones AS pv, empleados AS e 
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
            const VACACIONES = yield database_1.default.query('SELECT * FROM peri_vacaciones WHERE estado = 1 ORDER BY fec_inicio DESC');
            if (VACACIONES.rowCount > 0) {
                return res.jsonp(VACACIONES.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    CrearPerVacaciones(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_empl_contrato, descripcion, dia_vacacion, dia_antiguedad, estado, fec_inicio, fec_final, dia_perdido, horas_vacaciones, min_vacaciones, codigo } = req.body;
            yield database_1.default.query('INSERT INTO peri_vacaciones (id_empl_contrato, descripcion, dia_vacacion, ' +
                'dia_antiguedad, estado, fec_inicio, fec_final, dia_perdido, horas_vacaciones, min_vacaciones, codigo ) ' +
                'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)', [id_empl_contrato, descripcion, dia_vacacion, dia_antiguedad, estado, fec_inicio, fec_final,
                dia_perdido, horas_vacaciones, min_vacaciones, codigo]);
            res.jsonp({ message: 'Período de Vacación guardado' });
        });
    }
    EncontrarPerVacaciones(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { codigo } = req.params;
            const PERIODO_VACACIONES = yield database_1.default.query('SELECT * FROM peri_vacaciones AS p WHERE p.codigo = $1', [codigo]);
            if (PERIODO_VACACIONES.rowCount > 0) {
                return res.jsonp(PERIODO_VACACIONES.rows);
            }
            res.status(404).jsonp({ text: 'Registro no encontrado' });
        });
    }
    ActualizarPeriodo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_empl_contrato, descripcion, dia_vacacion, dia_antiguedad, estado, fec_inicio, fec_final, dia_perdido, horas_vacaciones, min_vacaciones, id } = req.body;
            yield database_1.default.query('UPDATE peri_vacaciones SET id_empl_contrato = $1, descripcion = $2, dia_vacacion = $3 , dia_antiguedad = $4, estado = $5, fec_inicio = $6, fec_final = $7, dia_perdido = $8, horas_vacaciones = $9, min_vacaciones = $10 WHERE id = $11', [id_empl_contrato, descripcion, dia_vacacion, dia_antiguedad, estado, fec_inicio, fec_final, dia_perdido, horas_vacaciones, min_vacaciones, id]);
            res.jsonp({ message: 'Registro Actualizado exitosamente' });
        });
    }
    /** Verificar que los datos existan para registrar periodo de vacaciones */
    VerificarDatos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let list = req.files;
            let cadena = list.uploads[0].path;
            let filename = cadena.split("\\")[1];
            var filePath = `./plantillas/${filename}`;
            const workbook = xlsx_1.default.readFile(filePath);
            const sheet_name_list = workbook.SheetNames; // Array de hojas de calculo
            const plantilla = xlsx_1.default.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
            var contarDatos = 0;
            var contarCedula = 0;
            var contarContrato = 0;
            var contarPeriodos = 0;
            var contador = 1;
            /** Periodo de vacaciones */
            plantilla.forEach((data) => __awaiter(this, void 0, void 0, function* () {
                // Datos obtenidos de la plantilla
                const { nombre_empleado, apellido_empleado, cedula, descripcion, vacaciones_tomadas, fecha_inicia_periodo, fecha_fin_periodo, dias_vacacion, horas_vacacion, minutos_vacacion, dias_por_antiguedad, dias_perdidos } = data;
                // Verificar si los datos obligatorios existen
                if (cedula != undefined && descripcion != undefined && vacaciones_tomadas != undefined &&
                    fecha_inicia_periodo != undefined && fecha_fin_periodo != undefined && dias_vacacion != undefined &&
                    horas_vacacion != undefined && minutos_vacacion != undefined && dias_por_antiguedad != undefined &&
                    dias_perdidos != undefined) {
                    contarDatos = contarDatos + 1;
                }
                // Verificar si la cédula del empleado existen dentro del sistema
                if (cedula != undefined) {
                    const CEDULA = yield database_1.default.query('SELECT id, codigo FROM empleados WHERE cedula = $1', [cedula]);
                    if (CEDULA.rowCount != 0) {
                        contarCedula = contarCedula + 1;
                        // Verificar si el empleado tiene un contrato
                        const CONTRATO = yield database_1.default.query('SELECT MAX(ec.id) FROM empl_contratos AS ec, empleados AS e WHERE ec.id_empleado = e.id AND e.id = $1', [CEDULA.rows[0]['id']]);
                        if (CONTRATO.rowCount != 0) {
                            contarContrato = contarContrato + 1;
                            // Verificar si el empleado ya tiene registrado un periodo de vacaciones
                            const PERIODO = yield database_1.default.query('SELECT * FROM peri_vacaciones WHERE codigo = $1', CEDULA.rows[0]['codigo']);
                            if (PERIODO.rowCount === 0) {
                                contarPeriodos = contarPeriodos + 1;
                            }
                        }
                    }
                }
                // Verificar que todos los datos sean correctos
                console.log('datos', contarDatos, contarCedula, contarContrato);
                if (contador === plantilla.length) {
                    if (contarDatos === plantilla.length && contarCedula === plantilla.length &&
                        contarContrato === plantilla.length && contarPeriodos === plantilla.length) {
                        return res.jsonp({ message: 'correcto' });
                    }
                    else {
                        return res.jsonp({ message: 'error' });
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
    /** Verificar que no exista cedulas duplicadas en el registro */
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
            //Leer la plantilla para llenar un array con los datos nombre para verificar que no sean duplicados
            plantilla.forEach((data) => __awaiter(this, void 0, void 0, function* () {
                // Datos que se leen de la plantilla ingresada
                const { nombre_empleado, apellido_empleado, cedula, descripcion, vacaciones_tomadas, fecha_inicia_periodo, fecha_fin_periodo, dias_vacacion, horas_vacacion, minutos_vacacion, dias_por_antiguedad, dias_perdidos } = data;
                let datos_array = {
                    cedula: cedula,
                };
                arreglos_datos.push(datos_array);
            }));
            // Vamos a verificar dentro de arreglo_datos que no se encuentren datos duplicados
            for (var i = 0; i <= arreglos_datos.length - 1; i++) {
                for (var j = 0; j <= arreglos_datos.length - 1; j++) {
                    if (arreglos_datos[i].cedula === arreglos_datos[j].cedula) {
                        contarCedulaData = contarCedulaData + 1;
                    }
                }
                contador_arreglo = contador_arreglo + 1;
            }
            // Cuando todos los datos han sido leidos verificamos si todos los datos son correctos
            console.log('nombre_data', contarCedulaData, plantilla.length, contador_arreglo);
            if ((contador_arreglo - 1) === plantilla.length) {
                if (contarCedulaData === plantilla.length) {
                    return res.jsonp({ message: 'correcto' });
                }
                else {
                    return res.jsonp({ message: 'error' });
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
            const sheet_name_list = workbook.SheetNames; // Array de hojas de calculo
            const plantilla = xlsx_1.default.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
            /** Periodo de vacaciones */
            plantilla.forEach((data) => __awaiter(this, void 0, void 0, function* () {
                // Datos obtenidos de la plantilla
                var estado;
                var { nombre_empleado, apellido_empleado, cedula, descripcion, vacaciones_tomadas, fecha_inicia_periodo, fecha_fin_periodo, dias_vacacion, horas_vacacion, minutos_vacacion, dias_por_antiguedad, dias_perdidos } = data;
                // Obtener id del empleado mediante la cédula
                const datosEmpleado = yield database_1.default.query('SELECT id, nombre, apellido, codigo, estado FROM empleados WHERE cedula = $1', [cedula]);
                let id_empleado = datosEmpleado.rows[0]['id'];
                // Obtener el id del contrato actual del empleado indicado
                const CONTRATO = yield database_1.default.query('SELECT MAX(ec.id) FROM empl_contratos AS ec, empleados AS e WHERE ec.id_empleado = e.id AND e.id = $1', [id_empleado]);
                let id_empl_contrato = CONTRATO.rows[0]['max'];
                // Cambiar el estado de vacaciones usadas a valores enteros
                if (vacaciones_tomadas === true) {
                    estado = 1;
                }
                else {
                    estado = 2;
                }
                // Registrar datos de periodo de vacación
                yield database_1.default.query('INSERT INTO peri_vacaciones (id_empl_contrato, descripcion, dia_vacacion, ' +
                    'dia_antiguedad, estado, fec_inicio, fec_final, dia_perdido, horas_vacaciones, ' +
                    'min_vacaciones, codigo ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)', [id_empl_contrato,
                    descripcion, dias_vacacion, dias_por_antiguedad, estado, fecha_inicia_periodo,
                    fecha_fin_periodo, dias_perdidos, horas_vacacion, minutos_vacacion, datosEmpleado.rows[0]['codigo']]);
                return res.jsonp({ message: 'correcto' });
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
