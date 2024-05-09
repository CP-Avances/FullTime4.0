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
exports.DETALLE_CATALOGO_HORARIO_CONTROLADOR = void 0;
const xlsx_1 = __importDefault(require("xlsx"));
const database_1 = __importDefault(require("../../../database"));
const fs_1 = __importDefault(require("fs"));
class DetalleCatalogoHorarioControlador {
    // METODO PARA BUSCAR DETALLE DE UN HORARIO   --**VERIFICADO
    ListarUnDetalleHorario(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_horario } = req.params;
            const HORARIO = yield database_1.default.query(`
            SELECT dh.*, cg.minutos_comida
            FROM eh_detalle_horarios AS dh, eh_cat_horarios AS cg
            WHERE dh.id_horario = cg.id AND dh.id_horario = $1
            ORDER BY orden ASC
            `, [id_horario])
                .then((result) => {
                if (result.rowCount === 0)
                    return [];
                return result.rows.map((o) => {
                    switch (o.tipo_accion) {
                        case 'E':
                            o.tipo_accion_show = 'Entrada';
                            o.tipo_accion = 'E';
                            break;
                        case 'I/A':
                            o.tipo_accion_show = 'Inicio alimentación';
                            o.tipo_accion = 'I/A';
                            break;
                        case 'F/A':
                            o.tipo_accion_show = 'Fin alimentación';
                            o.tipo_accion = 'F/A';
                            break;
                        case 'S':
                            o.tipo_accion_show = 'Salida';
                            o.tipo_accion = 'S';
                            break;
                        default:
                            o.tipo_accion_show = 'Desconocido';
                            o.tipo_accion = 'D';
                            break;
                    }
                    return o;
                });
            });
            if (HORARIO.length > 0) {
                return res.jsonp(HORARIO);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    // METODO PARA ELIMINAR REGISTRO
    EliminarRegistros(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            yield database_1.default.query(`
            DELETE FROM eh_detalle_horarios WHERE id = $1
            `, [id]);
            res.jsonp({ message: 'Registro eliminado.' });
        });
    }
    // METODO PARA REGISTRAR DETALLES
    CrearDetalleHorarios(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { orden, hora, minu_espera, id_horario, tipo_accion, segundo_dia, tercer_dia, min_antes, min_despues } = req.body;
            yield database_1.default.query(`
            INSERT INTO eh_detalle_horarios (orden, hora, tolerancia, id_horario, tipo_accion, segundo_dia, tercer_dia, 
                minutos_antes, minutos_despues) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            `, [orden, hora, minu_espera, id_horario, tipo_accion, segundo_dia, tercer_dia, min_antes, min_despues]);
            res.jsonp({ message: 'Registro guardado.' });
        });
    }
    // METODO PARA ACTUALIZAR DETALLE DE HORARIO
    ActualizarDetalleHorarios(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { orden, hora, minu_espera, id_horario, tipo_accion, segundo_dia, tercer_dia, min_antes, min_despues, id } = req.body;
            yield database_1.default.query(`
            UPDATE eh_detalle_horarios SET orden = $1, hora = $2, tolerancia = $3, id_horario = $4,
                tipo_accion = $5, segundo_dia = $6, tercer_dia = $7, minutos_antes = $8, minutos_despues= $9 
            WHERE id = $10
            `, [orden, hora, minu_espera, id_horario, tipo_accion, segundo_dia, tercer_dia, min_antes, min_despues, id]);
            res.jsonp({ message: 'Registro actualizado.' });
        });
    }
    ListarDetalleHorarios(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const HORARIO = yield database_1.default.query(`
            SELECT * FROM eh_detalle_horarios
            `);
            if (HORARIO.rowCount > 0) {
                return res.jsonp(HORARIO.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    /** Verificar que el nombre del horario exista dentro del sistema */
    VerificarDatosDetalles(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let list = req.files;
            let cadena = list.uploads[0].path;
            let filename = cadena.split("\\")[1];
            var filePath = `./plantillas/${filename}`;
            const workbook = xlsx_1.default.readFile(filePath);
            const sheet_name_list = workbook.SheetNames; // Array de hojas de calculo
            const plantillaD = xlsx_1.default.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
            var contarHorario = 0;
            var contarDatos = 0;
            var contador = 1;
            /** Detalle de Horarios */
            plantillaD.forEach((data) => __awaiter(this, void 0, void 0, function* () {
                const { nombre_horario, orden, hora, tipo_accion, minutos_espera } = data;
                // Verificar que los datos obligatorios existan
                if (nombre_horario != undefined && orden != undefined && hora != undefined &&
                    tipo_accion != undefined) {
                    contarDatos = contarDatos + 1;
                }
                // Verificar que exita el nombre del horario
                if (nombre_horario != undefined) {
                    const HORARIO = yield database_1.default.query(`
                    SELECT * FROM eh_cat_horarios WHERE UPPER(nombre) = $1
                    `, [nombre_horario.toUpperCase()]);
                    if (HORARIO.rowCount != 0) {
                        contarHorario = contarHorario + 1;
                    }
                }
                //Verificar que todos los datos sean correctos
                console.log('datos', contarHorario, contarDatos);
                if (contador === plantillaD.length) {
                    if (contarHorario === plantillaD.length && contarDatos === plantillaD.length) {
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
    CrearDetallePlantilla(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let list = req.files;
            let cadena = list.uploads[0].path;
            let filename = cadena.split("\\")[1];
            var filePath = `./plantillas/${filename}`;
            const workbook = xlsx_1.default.readFile(filePath);
            const sheet_name_list = workbook.SheetNames; // Array de hojas de calculo
            const plantillaD = xlsx_1.default.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
            /** Detalle de Horarios */
            plantillaD.forEach((data) => __awaiter(this, void 0, void 0, function* () {
                var { nombre_horario, orden, hora, tipo_accion, minutos_espera } = data;
                var nombre = nombre_horario;
                const idHorario = yield database_1.default.query(`
                SELECT id FROM eh_cat_horarios WHERE UPPER(nombre) = $1
                `, [nombre.toUpperCase()]);
                var id_horario = idHorario.rows[0]['id'];
                if (minutos_espera != undefined) {
                    yield database_1.default.query(`
                    INSERT INTO eh_detalle_horarios (orden, hora, tolerancia, id_horario, tipo_accion) 
                    VALUES ($1, $2, $3, $4, $5)
                    `, [orden, hora, minutos_espera, id_horario, tipo_accion.split("=")[0]]);
                    res.jsonp({ message: 'correcto' });
                }
                else {
                    minutos_espera = 0;
                    yield database_1.default.query(`
                    INSERT INTO eh_detalle_horarios (orden, hora, tolerancia, id_horario, tipo_accion) VALUES ($1, $2, $3, $4, $5)
                    `, [orden, hora, minutos_espera, id_horario, tipo_accion.split("=")[0]]);
                    res.jsonp({ message: 'correcto' });
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
exports.DETALLE_CATALOGO_HORARIO_CONTROLADOR = new DetalleCatalogoHorarioControlador();
exports.default = exports.DETALLE_CATALOGO_HORARIO_CONTROLADOR;
