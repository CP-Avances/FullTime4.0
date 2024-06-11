import { Request, Response } from 'express';
import pool from '../../database';
import zlib from 'zlib';

import pako from 'pako';

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

    
        public async BuscarDatosAuditoria(req: Request, res: Response): Promise<Response> {
            const { tabla, desde, hasta, action } = req.body
            // Convertir las cadenas de tablas y acciones en arrays
            const tablasArray = tabla.split(',').map((t: any) => t.trim().replace(/'/g, ''));
            const actionsArray = action.split(',').map((a: any) => a.trim().replace(/'/g, ''));
            // Construir cláusulas dinámicas IN
            const tableNameClause = `table_name IN (${tablasArray.map((_: any, i: any) => `$${i + 1}`).join(', ')})`;
            const actionClause = `action IN (${actionsArray.map((_: any, i: any) => `$${tablasArray.length + i + 1}`).join(', ')})`;
            const params = [...tablasArray, ...actionsArray, desde,  `${hasta} 23:59:59`];
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
    
            const DATOS = await pool.query(query, params);
            if (DATOS.rowCount > 0) {
                return res.jsonp(DATOS.rows);
            } else {
                return res.status(404).jsonp({ message: 'No se encuentran registros', status: '404' });
            }
        } 



    public async BuscarDatosAuditoria1(req: Request, res: Response): Promise<void | Response> {
        const { tabla, desde, hasta, action } = req.body;

        const tablasArray = tabla.split(',').map((t: any) => t.trim().replace(/'/g, ''));
        const actionsArray = action.split(',').map((a: any) => a.trim().replace(/'/g, ''));

        const tableNameClause = `table_name IN (${tablasArray.map((_: any, i: any) => `$${i + 1}`).join(', ')})`;
        const actionClause = `action IN (${actionsArray.map((_: any, i: any) => `$${tablasArray.length + i + 1}`).join(', ')})`;

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

        const DATOS = await pool.query(query, params);

        if (DATOS.rowCount > 0) {
            // Comprimir los datos antes de enviarlos
            const compressedData = pako.gzip(JSON.stringify(DATOS.rows));

            res.setHeader('Content-Encoding', 'gzip');
            return res.end(compressedData);
        } else {
            return res.status(404).jsonp({ message: 'No se encuentran registros', status: '404' });
        }
    }

    // version sincrona
    public async BuscarDatosAuditoriasincomprobacion(req: Request, res: Response): Promise<void | Response> {
        const { tabla, desde, hasta, action } = req.body;

        const tablasArray = tabla.split(',').map((t: any) => t.trim().replace(/'/g, ''));
        const actionsArray = action.split(',').map((a: any) => a.trim().replace(/'/g, ''));

        const tableNameClause = `table_name IN (${tablasArray.map((_: any, i: any) => `$${i + 1}`).join(', ')})`;
        const actionClause = `action IN (${actionsArray.map((_: any, i: any) => `$${tablasArray.length + i + 1}`).join(', ')})`;

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

        const DATOS = await pool.query(query, params);

        if (DATOS.rowCount > 0) {
            // Convertir los datos en JSON
            const jsonData = JSON.stringify(DATOS.rows);
            // Dividir los datos en partes más pequeñas
            const chunkSize = 1000; // Tamaño de cada parte
            const chunks = [];
            for (let i = 0; i < jsonData.length; i += chunkSize) {
                chunks.push(jsonData.slice(i, i + chunkSize));
            }
            // Comprimir y enviar cada parte por separado
            res.setHeader('Content-Encoding', 'gzip');

            for (const chunk of chunks) {
                const compressedData = pako.gzip(chunk);
                res.write(compressedData);
            }
            // Establecer encabezado Content-Encoding y finalizar la respuesta
            return res.end();
        } else {
            return res.status(404).jsonp({ message: 'No se encuentran registros', status: '404' });
        }
    }



    public async BuscarDatosAuditoriaconpartes(req: Request, res: Response): Promise<void | Response> {
        const { tabla, desde, hasta, action } = req.body;
    
        const tablasArray = tabla.split(',').map((t: any) => t.trim().replace(/'/g, ''));
        const actionsArray = action.split(',').map((a: any) => a.trim().replace(/'/g, ''));
    
        const tableNameClause = `table_name IN (${tablasArray.map((_: any, i: any) => `$${i + 1}`).join(', ')})`;
        const actionClause = `action IN (${actionsArray.map((_: any, i: any) => `$${tablasArray.length + i + 1}`).join(', ')})`;
    
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
    
        const DATOS = await pool.query(query, params);
    
        if (DATOS.rowCount > 0) {
            // Convertir los datos en JSON
            const jsonData = JSON.stringify(DATOS.rows);
            // Dividir los datos en partes más pequeñas
            const chunkSize = 1000; // Tamaño de cada parte
            const chunks = [];
            for (let i = 0; i < jsonData.length; i += chunkSize) {
                chunks.push(jsonData.slice(i, i + chunkSize));
            }
    
            // Verificar si el cliente admite la transferencia de fragmentos
            const acceptEncoding = req.headers['accept-encoding'];
            const supportsChunkedEncoding = acceptEncoding && acceptEncoding.includes('gzip');
    
            if (supportsChunkedEncoding) {
                // Comprimir y enviar cada parte por separado
                res.setHeader('Content-Encoding', 'gzip');
                for (const chunk of chunks) {
                    const compressedData = pako.gzip(chunk);
                    res.write(compressedData);
                }
                // Establecer encabezado Content-Encoding y finalizar la respuesta
                return res.end();
            } else {
                // Enviar los datos completos sin dividirlos en partes
                const compressedData = pako.gzip(jsonData);
                res.setHeader('Content-Encoding', 'gzip');
                return res.end(compressedData);
            }
        } else {
            return res.status(404).jsonp({ message: 'No se encuentran registros', status: '404' });
        }
    }
    







    public async BuscarDatosAuditoriaConzip(req: Request, res: Response): Promise<void | Response> {
        const { tabla, desde, hasta, action } = req.body;

        const tablasArray = tabla.split(',').map((t: any) => t.trim().replace(/'/g, ''));
        const actionsArray = action.split(',').map((a: any) => a.trim().replace(/'/g, ''));

        const tableNameClause = `table_name IN (${tablasArray.map((_: any, i: any) => `$${i + 1}`).join(', ')})`;
        const actionClause = `action IN (${actionsArray.map((_: any, i: any) => `$${tablasArray.length + i + 1}`).join(', ')})`;

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

        const DATOS = await pool.query(query, params);

        if (DATOS.rowCount > 0) {
            // Comprimir los datos antes de enviarlos
            zlib.gzip(JSON.stringify(DATOS.rows), (err, compressedData) => {
                if (err) {
                    return res.status(500).jsonp({ message: 'Error comprimiendo datos', status: '500' });
                }
                res.setHeader('Content-Encoding', 'gzip');
                return res.end(compressedData);
            });
        } else {
            return res.status(404).jsonp({ message: 'No se encuentran registros', status: '404' });
        }
    }

    // INSERTAR REGISTRO DE AUDITORIA
    public async InsertarAuditoria(data: Auditoria) {
        try {
            const { tabla, usuario, accion, datosOriginales, datosNuevos, ip, observacion } = data;
            let plataforma = "APLICACION WEB"
            await pool.query(
                `
                INSERT INTO audit.auditoria (plataforma, table_name, user_name, fecha_hora,
                    action, original_data, new_data, ip_address, observacion) 
                VALUES ($1, $2, $3, now(), $4, $5, $6, $7, $8)
                `
                ,
                [plataforma, tabla, usuario, accion, datosOriginales, datosNuevos, ip, observacion]);
        } catch (error) {
            throw error;
        }
    }

}

interface Auditoria {
    tabla: string,
    usuario: string,
    accion: string,
    datosOriginales: string,
    datosNuevos: string,
    ip: string,
    observacion: string | null
}

export const AUDITORIA_CONTROLADOR = new AuditoriaControlador();

export default AUDITORIA_CONTROLADOR;