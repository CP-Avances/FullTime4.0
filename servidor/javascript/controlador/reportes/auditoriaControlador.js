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
exports.AUDITORIA_CONTROLADOR = void 0;
const database_1 = __importDefault(require("../../database"));
const stream_1 = require("stream");
class AuditoriaControlador {
    constructor() {
        this.InsertarAuditoriaPorLotes = (data, user_name, ip) => __awaiter(this, void 0, void 0, function* () {
            const batchSize = 1000; // Tamaño del lote, puedes ajustarlo según tus necesidades
            const totalResults = [];
            for (let i = 0; i < data.length; i += batchSize) {
                const batch = data.slice(i, i + batchSize);
                const valores = [];
                const placeholders = [];
                for (let j = 0; j < batch.length; j++) {
                    const auditoria = batch[j];
                    const index = j * 9; // 9 es el número de campos a insertar
                    valores.push("APLICACION WEB", // Asumiendo que la plataforma es siempre "APLICACION WEB"
                    auditoria.tabla, user_name, new Date(), auditoria.accion, auditoria.datosOriginales, auditoria.datosNuevos, ip, auditoria.observacion);
                    // Crear los placeholders para la consulta de inserción masiva
                    placeholders.push(`($${index + 1}, $${index + 2}, $${index + 3}, $${index + 4}, $${index + 5}, $${index + 6}, $${index + 7}, $${index + 8}, $${index + 9})`);
                }
                const query = `
                INSERT INTO audit.auditoria (
                    plataforma, table_name, user_name, fecha_hora,
                    action, original_data, new_data, ip_address, observacion
                ) VALUES ${placeholders.join(', ')}
            `;
                try {
                    // INICIAR TRANSACCIÓN
                    yield database_1.default.query('BEGIN');
                    // Ejecutar la consulta de inserción masiva
                    yield database_1.default.query(query, valores);
                    // FINALIZAR TRANSACCIÓN
                    yield database_1.default.query('COMMIT');
                }
                catch (error) {
                    // REVERTIR TRANSACCIÓN
                    console.error("Detalles del error:", {
                        message: error.message,
                        stack: error.stack,
                        code: error.code,
                        detail: error.detail
                    });
                    yield database_1.default.query('ROLLBACK');
                    throw new Error('Error al insertar auditoría por lotes: ' + error.message);
                }
            }
        });
    }
    BuscarDatosAuditoriaporTablasEmpaquetados(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { tabla, desde, hasta, action } = req.body;
            // Convertir las cadenas de acciones en arrays
            const actionsArray = action.split(',').map((a) => a.trim().replace(/'/g, ''));
            // Construir cláusula dinámica IN para acciones
            const actionClause = `action IN (${actionsArray.map((_, i) => `$${i + 2}`).join(', ')})`;
            // Asegúrate de que las fechas sean correctamente formateadas
            const fechaDesde = new Date(desde).toISOString();
            const fechaHasta = new Date(hasta + 'T23:59:59').toISOString();
            const params = [tabla, ...actionsArray, fechaDesde, fechaHasta];
            const query = `
                SELECT 
                    a.plataforma, a.table_name, a.user_name,CAST(a.fecha_hora AS VARCHAR) , a.action, a.original_data, a.new_data, a.ip_address, a.observacion               
                FROM 
                    audit.auditoria AS a
                WHERE 
                    table_name = $1
                AND 
                    ${actionClause} 
                AND 
                    fecha_hora BETWEEN $${params.length - 1} AND $${params.length}
                ORDER BY 
                    fecha_hora DESC;
            `;
            // console.log('Query:', query);
            //console.log('Params:', params);
            try {
                const result = yield database_1.default.query(query, params);
                if (result.rowCount != 0) {
                    const dataStream = new stream_1.Readable({
                        objectMode: true,
                        read() { }
                    });
                    result.rows.forEach(row => {
                        dataStream.push(JSON.stringify(row));
                    });
                    dataStream.push(null); // Fin del stream
                    res.set('Content-Type', 'application/json');
                    dataStream.pipe(res);
                }
                else {
                    res.status(404).json({ message: 'No se encuentran registros', status: '404' });
                }
            }
            catch (error) {
                res.status(500).json({ message: 'Error en el servidor', error });
            }
        });
    }
    BuscarDatosAuditoriaporTablas(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { tabla, desde, hasta, action } = req.body;
                // Convertir las cadenas de acciones en arrays
                const actionsArray = action.split(',').map((a) => a.trim().replace(/'/g, ''));
                // Construir cláusula dinámica IN para acciones
                const actionClause = `action IN (${actionsArray.map((_, i) => `$${i + 2}`).join(', ')})`;
                // Asegúrate de que las fechas sean correctamente formateadas
                const fechaDesde = new Date(desde).toISOString();
                const fechaHasta = new Date(hasta + 'T23:59:59').toISOString();
                const params = [tabla, ...actionsArray, fechaDesde, fechaHasta];
                const query = `
                SELECT 
                    *
                FROM 
                    audit.auditoria 
                WHERE 
                    table_name = $1
                AND 
                    ${actionClause} 
                AND 
                    fecha_hora BETWEEN $${params.length - 1} AND $${params.length}
                ORDER BY 
                    fecha_hora DESC;
            `;
                console.log('Query:', query);
                console.log('Params:', params);
                const DATOS = yield database_1.default.query(query, params);
                if (DATOS.rowCount != 0) {
                    console.log("contador tab", DATOS.rowCount);
                    return res.jsonp(DATOS.rows);
                }
                else {
                    return res.status(404).jsonp({ message: 'No se encuentran registros', status: '404' });
                }
            }
            catch (error) {
                console.error('Error en BuscarDatosAuditoriaporTablas:', error);
                return res.status(500).jsonp({ message: 'Error interno del servidor', error: error.message });
            }
        });
    }
    BuscarDatosAuditoriaoriginal(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { tabla, desde, hasta, action } = req.body;
            // Convertir las cadenas de tablas y acciones en arrays
            const tablasArray = tabla.split(',').map((t) => t.trim().replace(/'/g, ''));
            const actionsArray = action.split(',').map((a) => a.trim().replace(/'/g, ''));
            // Construir cláusulas dinámicas IN
            const tableNameClause = `table_name IN (${tablasArray.map((_, i) => `$${i + 1}`).join(', ')})`;
            const actionClause = `action IN (${actionsArray.map((_, i) => `$${tablasArray.length + i + 1}`).join(', ')})`;
            const params = [...tablasArray, ...actionsArray, desde, `${hasta} 23:59:59`];
            const query = `
           SELECT 
               *
           FROM 
               audit.auditoria 
           WHERE 
               ${tableNameClause} 
           AND 
               ${actionClause} 
           AND 
               fecha_hora BETWEEN $${params.length - 1} AND $${params.length}
           ORDER BY 
               fecha_hora DESC;
       `;
            const DATOS = yield database_1.default.query(query, params);
            if (DATOS.rowCount != 0) {
                return res.jsonp(DATOS.rows);
            }
            else {
                return res.status(404).jsonp({ message: 'No se encuentran registros', status: '404' });
            }
        });
    }
    BuscarDatosAuditoria(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { tabla, desde, hasta, action } = req.body;
            const tablasArray = tabla.split(',').map((t) => t.trim().replace(/'/g, ''));
            const actionsArray = action.split(',').map((a) => a.trim().replace(/'/g, ''));
            const tableNameClause = `table_name IN (${tablasArray.map((_, i) => `$${i + 1}`).join(', ')})`;
            const actionClause = `action IN (${actionsArray.map((_, i) => `$${tablasArray.length + i + 1}`).join(', ')})`;
            const params = [...tablasArray, ...actionsArray, desde, `${hasta} 23:59:59`];
            const query = `
        SELECT 
            *
        FROM 
            audit.auditoria 
        WHERE 
            ${tableNameClause} 
        AND 
            ${actionClause} 
        AND 
            fecha_hora BETWEEN $${params.length - 1} AND $${params.length}
        ORDER BY 
            fecha_hora DESC;
        `;
            try {
                const result = yield database_1.default.query(query, params);
                if (result.rowCount != 0) {
                    const dataStream = new stream_1.Readable({
                        objectMode: true,
                        read() { }
                    });
                    result.rows.forEach(row => {
                        dataStream.push(JSON.stringify(row));
                    });
                    dataStream.push(null); // Fin del stream
                    res.set('Content-Type', 'application/json');
                    dataStream.pipe(res);
                }
                else {
                    res.status(404).json({ message: 'No se encuentran registros', status: '404' });
                }
            }
            catch (error) {
                res.status(500).json({ message: 'Error en el servidor', error });
            }
        });
    }
    // INSERTAR REGISTRO DE AUDITORIA
    InsertarAuditoria(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { tabla, usuario, accion, datosOriginales, datosNuevos, ip, observacion } = data;
                let plataforma = "APLICACION WEB";
                yield database_1.default.query(`
                INSERT INTO audit.auditoria (plataforma, table_name, user_name, fecha_hora,
                    action, original_data, new_data, ip_address, observacion) 
                VALUES ($1, $2, $3, now(), $4, $5, $6, $7, $8)
                `, [plataforma, tabla, usuario, accion, datosOriginales, datosNuevos, ip, observacion]);
            }
            catch (error) {
                throw error;
            }
        });
    }
}
exports.AUDITORIA_CONTROLADOR = new AuditoriaControlador();
exports.default = exports.AUDITORIA_CONTROLADOR;
