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
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const moment_1 = __importDefault(require("moment"));
const accesoCarpetas_1 = require("../../../libs/accesoCarpetas");
class ContratoEmpleadoControlador {
    // REGISTRAR CONTRATOS
    CrearContrato(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_empleado, fec_ingreso, fec_salida, vaca_controla, asis_controla, id_regimen, id_tipo_contrato } = req.body;
            const response = yield database_1.default.query(`
            INSERT INTO empl_contratos (id_empleado, fec_ingreso, fec_salida, vaca_controla, 
            asis_controla, id_regimen, id_tipo_contrato) 
            VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *
            `, [id_empleado, fec_ingreso, fec_salida, vaca_controla, asis_controla, id_regimen,
                id_tipo_contrato]);
            const [contrato] = response.rows;
            if (contrato) {
                return res.status(200).jsonp(contrato);
            }
            else {
                return res.status(404).jsonp({ message: 'error' });
            }
        });
    }
    // METODO PARA GUARDAR DOCUMENTO
    GuardarDocumentoContrato(req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            // FECHA DEL SISTEMA
            var fecha = (0, moment_1.default)();
            var anio = fecha.format('YYYY');
            var mes = fecha.format('MM');
            var dia = fecha.format('DD');
            let id = req.params.id;
            const response = yield database_1.default.query(`
            SELECT codigo FROM empleados AS e, empl_contratos AS c WHERE c.id = $1 AND c.id_empleado = e.id
            `, [id]);
            const [empleado] = response.rows;
            let documento = empleado.codigo + '_' + anio + '_' + mes + '_' + dia + '_' + ((_a = req.file) === null || _a === void 0 ? void 0 : _a.originalname);
            yield database_1.default.query(`
            UPDATE empl_contratos SET documento = $2 WHERE id = $1
            `, [id, documento]);
            res.jsonp({ message: 'Documento actualizado.' });
        });
    }
    // METODO PARA VER DOCUMENTO
    ObtenerDocumento(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const docs = req.params.docs;
            const id = req.params.id;
            let separador = path_1.default.sep;
            let ruta = (yield (0, accesoCarpetas_1.ObtenerRutaContrato)(id)) + separador + docs;
            res.sendFile(path_1.default.resolve(ruta));
        });
    }
    // METODO PARA LISTAR CONTRATOS POR ID DE EMPLEADO
    BuscarContratoEmpleado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_empleado } = req.params;
            const CONTRATO_EMPLEADO_REGIMEN = yield database_1.default.query(`
            SELECT ec.id, ec.fec_ingreso, ec.fec_salida FROM empl_contratos AS ec
            WHERE ec.id_empleado = $1 ORDER BY ec.id ASC
            `, [id_empleado]);
            if (CONTRATO_EMPLEADO_REGIMEN.rowCount > 0) {
                return res.jsonp(CONTRATO_EMPLEADO_REGIMEN.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'Registro no encontrado.' });
            }
        });
    }
    // EDITAR DATOS DE CONTRATO
    EditarContrato(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const { fec_ingreso, fec_salida, vaca_controla, asis_controla, id_regimen, id_tipo_contrato } = req.body;
            yield database_1.default.query(`
            UPDATE empl_contratos SET fec_ingreso = $1, fec_salida = $2, vaca_controla = $3,
            asis_controla = $4, id_regimen = $5, id_tipo_contrato = $6 
            WHERE id = $7
            `, [fec_ingreso, fec_salida, vaca_controla, asis_controla, id_regimen,
                id_tipo_contrato, id]);
            res.jsonp({ message: 'Registro actualizado exitosamente.' });
        });
    }
    // ELIMINAR DOCUMENTO CONTRATO BASE DE DATOS - SERVIDOR
    EliminarDocumento(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let { documento, id } = req.body;
            let separador = path_1.default.sep;
            const response = yield database_1.default.query(`
            UPDATE empl_contratos SET documento = null WHERE id = $1 RETURNING *
            `, [id]);
            const [contrato] = response.rows;
            if (documento != 'null' && documento != '' && documento != null) {
                let ruta = (yield (0, accesoCarpetas_1.ObtenerRutaContrato)(contrato.id_empleado)) + separador + documento;
                fs_1.default.unlinkSync(ruta);
            }
            res.jsonp({ message: 'Documento actualizado.' });
        });
    }
    // ELIMINAR DOCUMENTO CONTRATO DEL SERVIDOR
    EliminarDocumentoServidor(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let { documento, id } = req.body;
            let separador = path_1.default.sep;
            if (documento != 'null' && documento != '' && documento != null) {
                let ruta = (yield (0, accesoCarpetas_1.ObtenerRutaContrato)(id)) + separador + documento;
                fs_1.default.unlinkSync(ruta);
            }
            res.jsonp({ message: 'Documento actualizado.' });
        });
    }
    // METODO PARA BUSCAR ID ACTUAL
    EncontrarIdContratoActual(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_empleado } = req.params;
            const CONTRATO = yield database_1.default.query(`
            SELECT MAX(ec.id) FROM empl_contratos AS ec, empleados AS e 
            WHERE ec.id_empleado = e.id AND e.id = $1
            `, [id_empleado]);
            if (CONTRATO.rowCount > 0) {
                if (CONTRATO.rows[0]['max'] != null) {
                    return res.jsonp(CONTRATO.rows);
                }
                else {
                    return res.status(404).jsonp({ text: 'Registro no encontrado' });
                }
            }
            else {
                return res.status(404).jsonp({ text: 'Registro no encontrado' });
            }
        });
    }
    // METODO PARA BUSCAR DATOS DE CONTRATO POR ID 
    EncontrarDatosUltimoContrato(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const CONTRATO = yield database_1.default.query(`
            SELECT ec.id, ec.id_empleado, ec.id_regimen, ec.fec_ingreso, ec.fec_salida, ec.vaca_controla,
                ec.asis_controla, ec.documento, ec.id_tipo_contrato, cr.descripcion, 
                cr.mes_periodo, mt.descripcion AS nombre_contrato 
            FROM empl_contratos AS ec, cg_regimenes AS cr, modal_trabajo AS mt 
            WHERE ec.id = $1 AND ec.id_regimen = cr.id AND mt.id = ec.id_tipo_contrato
            `, [id]);
            if (CONTRATO.rowCount > 0) {
                return res.jsonp(CONTRATO.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'Registro no encontrado.' });
            }
        });
    }
    // METODO PARA BUSCAR FECHAS DE CONTRATOS    --**VERIFICADO
    EncontrarFechaContrato(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_empleado } = req.body;
            const FECHA = yield database_1.default.query(`
            SELECT ca.id_contrato, ec.fec_ingreso
            FROM datos_contrato_actual AS ca, empl_contratos AS ec
            WHERE ca.id = $1 AND ec.id = ca.id_contrato
            `, [id_empleado]);
            if (FECHA.rowCount > 0) {
                return res.jsonp(FECHA.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'Registro no encontrado.' });
            }
        });
    }
    /** **************************************************************************** **
     ** **          METODOS PARA LA TABLA MODAL_TRABAJO O TIPO DE CONTRATOS       ** **
     ** **************************************************************************** **/
    // LISTAR TIPOS DE MODALIDAD DE TRABAJO
    ListarTiposContratos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const CONTRATOS = yield database_1.default.query(`
            SELECT * FROM modal_trabajo
            `);
            if (CONTRATOS.rowCount > 0) {
                return res.jsonp(CONTRATOS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    // REGISTRAR MODALIDAD DE TRABAJO
    CrearTipoContrato(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { descripcion } = req.body;
            const response = yield database_1.default.query(`
            INSERT INTO modal_trabajo (descripcion) VALUES ($1) RETURNING *
            `, [descripcion]);
            const [contrato] = response.rows;
            if (contrato) {
                return res.status(200).jsonp(contrato);
            }
            else {
                return res.status(404).jsonp({ message: 'error' });
            }
        });
    }
    ListarContratos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const CONTRATOS = yield database_1.default.query('SELECT * FROM empl_contratos');
            if (CONTRATOS.rowCount > 0) {
                return res.jsonp(CONTRATOS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    ObtenerUnContrato(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            const CONTRATOS = yield database_1.default.query('SELECT * FROM empl_contratos WHERE id = $1', [id]);
            if (CONTRATOS.rowCount > 0) {
                return res.jsonp(CONTRATOS.rows[0]);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    EncontrarIdContrato(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_empleado } = req.params;
            const CONTRATO = yield database_1.default.query('SELECT ec.id FROM empl_contratos AS ec, empleados AS e WHERE ec.id_empleado = e.id AND e.id = $1 ORDER BY ec.fec_ingreso DESC ', [id_empleado]);
            if (CONTRATO.rowCount > 0) {
                return res.jsonp(CONTRATO.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'Registro no encontrado' });
            }
        });
    }
    EncontrarFechaContratoId(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_contrato } = req.body;
            const FECHA = yield database_1.default.query('SELECT contrato.fec_ingreso FROM empl_contratos AS contrato ' +
                'WHERE contrato.id = $1', [id_contrato]);
            if (FECHA.rowCount > 0) {
                return res.jsonp(FECHA.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'Registro no encontrado' });
            }
        });
    }
}
const CONTRATO_EMPLEADO_CONTROLADOR = new ContratoEmpleadoControlador();
exports.default = CONTRATO_EMPLEADO_CONTROLADOR;
