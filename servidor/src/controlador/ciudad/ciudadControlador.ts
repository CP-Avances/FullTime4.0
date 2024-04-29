import { Request, Response } from 'express';
import AUDITORIA_CONTROLADOR from '../auditoria/auditoriaControlador';
import pool from '../../database';

class CiudadControlador {

    // BUSCAR DATOS RELACIONADOS A LA CIUDAD
    public async ListarInformacionCiudad(req: Request, res: Response) {
        const { id_ciudad } = req.params;
        const CIUDAD = await pool.query(
            `
            SELECT p.continente, p.nombre AS pais, p.id AS id_pais, pro.nombre AS provincia
            FROM cg_paises AS p, cg_provincias AS pro, ciudades AS c
            WHERE c.id = $1 AND c.id_provincia = pro.id AND p.id = pro.id_pais
            `
            , [id_ciudad]
        );
        if (CIUDAD.rowCount > 0) {
            return res.jsonp(CIUDAD.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros' });
        }
    }

    // BUSCAR LISTA DE CIUDADES
    public async ListarCiudades(req: Request, res: Response) {
        const CIUDAD = await pool.query(
            `
            SELECT * FROM ciudades
            `
        );
        if (CIUDAD.rowCount > 0) {
            return res.jsonp(CIUDAD.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros' });
        }
    }

    // BUSCAR LISTA DE CIUDADES PROVINCIA
    public async ListarCiudadesProvincia(req: Request, res: Response) {

        const { id_provincia } = req.params;

        const CIUDAD = await pool.query(
            `
            SELECT * FROM ciudades WHERE id_provincia = $1
            `
            , [id_provincia]);

        if (CIUDAD.rowCount > 0) {
            return res.jsonp(CIUDAD.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros' });
        }
    }

    // REGISTRAR CIUDAD
    public async CrearCiudad(req: Request, res: Response): Promise<void> {
        try {
            const { id_provincia, descripcion, user_name, ip } = req.body;

            // INICIAR TRANSACCION
            await pool.query('BEGIN');

            await pool.query(
                `
                INSERT INTO ciudades (id_provincia, descripcion) VALUES ($1, $2)
                `
                , [id_provincia, descripcion]);
            
            // AUDITORIA
            await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                tabla: 'ciudades',
                usuario: user_name,
                accion: 'I',
                datosOriginales: '',
                datosNuevos: `{id_provincia: ${id_provincia}, descripcion: ${descripcion}}`,
                ip,
                observacion: null
            });

            // FINALIZAR TRANSACCION
            await pool.query('COMMIT');
            res.jsonp({ message: 'Registro guardado.' });
        } catch (error) {
            // FINALIZAR TRANSACCION
            await pool.query('ROLLBACK');
            res.status(500).jsonp({ message: 'Error al guardar el registro.' });
        }
    }

    // METODO PARA LISTAR NOMBRE DE CIUDADES - PROVINCIAS
    public async ListarNombreCiudad(req: Request, res: Response) {
        const CIUDAD = await pool.query(
            `
            SELECT c.id, c.descripcion AS nombre, p.nombre AS provincia, p.id AS id_prov
            FROM ciudades c, cg_provincias p
            WHERE c.id_provincia = p.id
            ORDER BY provincia, nombre ASC
            `
        );
        if (CIUDAD.rowCount > 0) {
            return res.jsonp(CIUDAD.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros' });
        }
    }

    // METODO PARA ELIMINAR REGISTRO
    public async EliminarCiudad(req: Request, res: Response): Promise<Response> {
        try {
            // TODO ANALIZAR COMO OBTENER USER_NAME E IP DESDE EL FRONT
            const { user_name, ip } = req.body;
            const id = req.params.id;

            // INICIAR TRANSACCION
            await pool.query('BEGIN');

            // CONSULTAR DATOS ORIGINALES
            const ciudad = await pool.query('SELECT * FROM ciudades WHERE id = $1', [id]);
            const [datosOriginales] = ciudad.rows;

            if (!datosOriginales) {
                // AUDITORIA
                await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                    tabla: 'ciudades',
                    usuario: user_name,
                    accion: 'D',
                    datosOriginales: '',
                    datosNuevos: '',
                    ip,
                    observacion: `Error al eliminar la ciudad con id ${id}`
                });

                // FINALIZAR TRANSACCION
                await pool.query('COMMIT');
                return res.status(404).jsonp({ message: 'Error al eliminar el registro.' });
            }

            await pool.query(
                `
                DELETE FROM ciudades WHERE id = $1
                `
                , [id]);

            // AUDITORIA
            await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                tabla: 'ciudades',
                usuario: user_name,
                accion: 'D',
                datosOriginales: JSON.stringify(datosOriginales),
                datosNuevos: '',
                ip,
                observacion: null
            });

            // FINALIZAR TRANSACCION
            await pool.query('COMMIT');
            return res.jsonp({ message: 'Registro eliminado.' });
        } catch (error) {
            // REVERTIR TRANSACCION
            await pool.query('ROLLBACK');
            return res.status(500).jsonp({ message: 'Error al eliminar el registro.' });
        }
    }

    // METODO PARA CONSULTAR DATOS DE UNA CIUDAD
    public async ConsultarUnaCiudad(req: Request, res: Response): Promise<any> {
        const { id } = req.params;
        const CIUDAD = await pool.query(
            `
            SELECT * FROM ciudades WHERE id = $1
            `
            , [id]);
        if (CIUDAD.rowCount > 0) {
            return res.jsonp(CIUDAD.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros.' });
        }
    }

}

export const CIUDAD_CONTROLADOR = new CiudadControlador();

export default CIUDAD_CONTROLADOR;