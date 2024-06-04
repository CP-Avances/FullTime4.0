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
class AuditoriaControlador {
    /*
    public async BuscarDatosAuditoria(req: Request, res: Response) : Promise<Response>{
      
        const { tabla, desde, hasta, action } = req.body
        const DATOS = await pool.query(
            `
            SELECT *
            FROM audit.auditoria
            WHERE table_name = $1 AND action= $4 AND fecha_hora BETWEEN $2 AND $3
            ORDER BY fecha_hora::date DESC
            `
            , [tabla, desde, hasta, action]);
        if (DATOS.rowCount > 0) {


            return res.jsonp(DATOS.rows )
            //return res.status(200).jsonp({ text: 'No se encuentran registros', status:'404' });

        }
        else {
            return res.status(404).jsonp({ message: 'error', status:'404' });
        }
    }
*/
    BuscarDatosAuditoria(req, res) {
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
            if (DATOS.rowCount > 0) {
                return res.jsonp(DATOS.rows);
            }
            else {
                return res.status(404).jsonp({ message: 'No se encuentran registros', status: '404' });
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
