import { Request, Response } from 'express';
import { ObtenerRutaVacuna } from '../../../libs/accesoCarpetas';
import { QueryResult } from 'pg';
import AUDITORIA_CONTROLADOR from '../../auditoria/auditoriaControlador';
import moment from 'moment';
import pool from '../../../database';
import path from 'path';
import fs from 'fs';

class VacunasControlador {

    // LISTAR REGISTROS DE VACUNACIÓN DEL EMPLEADO POR SU ID
    public async ListarUnRegistro(req: Request, res: Response): Promise<any> {
        const { id_empleado } = req.params;
        const VACUNA = await pool.query(
            `
            SELECT ev.id, ev.id_empleado, ev.id_vacuna, ev.carnet, ev.fecha, tv.nombre, ev.descripcion
            FROM eu_empleado_vacunas AS ev, e_cat_vacuna AS tv 
            WHERE ev.id_vacuna = tv.id AND ev.id_empleado = $1
            ORDER BY ev.id DESC
            `
            , [id_empleado]);
        if (VACUNA.rowCount > 0) {
            return res.jsonp(VACUNA.rows)
        }
        else {
            res.status(404).jsonp({ text: 'Registro no encontrado.' });
        }
    }

    // LISTAR REGISTRO TIPO DE VACUNA
    public async ListarTipoVacuna(req: Request, res: Response) {
        const VACUNA = await pool.query(
            `
            SELECT * FROM e_cat_vacuna
            `
        );
        if (VACUNA.rowCount > 0) {
            return res.jsonp(VACUNA.rows)
        }
        else {
            res.status(404).jsonp({ text: 'Registro no encontrado.' });
        }
    }

    // METODO PARA BUSCAR VACUNA POR FECHA Y TIPO
    public async BuscarVacunaFechaTipo(req: Request, res: Response) {
        const { id_empleado, id_vacuna, fecha } = req.body;
        const VACUNA = await pool.query(
            `
            SELECT * FROM eu_empleado_vacunas WHERE fecha = $1 AND id_vacuna = $2 AND id_empleado = $3
            `
            , [fecha, id_vacuna, id_empleado]
        );
        if (VACUNA.rowCount > 0) {
            return res.jsonp(VACUNA.rows)
        }
        else {
            res.status(404).jsonp({ text: 'Registro no encontrado.' });
        }
    }

    // CREAR REGISTRO DE VACUNACION
    public async CrearRegistro(req: Request, res: Response): Promise<Response> {
        try {
            const { id_empleado, descripcion, fecha, id_tipo_vacuna, user_name, ip } = req.body;

            // INICIAR TRANSACCION
            await pool.query('BEGIN');

            const response: QueryResult = await pool.query(
                `
                INSERT INTO eu_empleado_vacunas (id_empleado, descripcion, fecha, id_vacuna) 
                VALUES ($1, $2, $3, $4) RETURNING *
                `
                , [id_empleado, descripcion, fecha, id_tipo_vacuna]);
    
            const [vacuna] = response.rows;

            // AUDITORIA
            await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                tabla: 'eu_empleado_vacunas',
                usuario: user_name,
                accion: 'I',
                datosOriginales: '',
                datosNuevos: `{id_empleado: ${id_empleado}, descripcion: ${descripcion}, fecha: ${fecha}, id_tipo_vacuna: ${id_tipo_vacuna}}`,
                ip, 
                observacion: null
            });

            // FINALIZAR TRANSACCION|
            await pool.query('COMMIT');
    
            if (vacuna) {
                return res.status(200).jsonp(vacuna)
            }
            else {
                return res.status(404).jsonp({ message: 'error' })
            }
        } catch (error) {
            // REVERTIR TRANSACCION
            await pool.query('ROLLBACK');
            return res.status(500).jsonp({ message: 'Error al guardar registro.' });
        }
    }

    // REGISTRO DE CERTIFICADO O CARNET DE VACUNACION
    public async GuardarDocumento(req: Request, res: Response): Promise<Response> {

        try {
            // FECHA DEL SISTEMA
            var fecha = moment();
            var anio = fecha.format('YYYY');
            var mes = fecha.format('MM');
            var dia = fecha.format('DD');
    
            const { user_name, ip } = req.body;
            let id = req.params.id;
            let id_empleado = req.params.id_empleado;

            // INICIAR TRANSACCION
            await pool.query('BEGIN');
    
            const response: QueryResult = await pool.query(
                `
                SELECT codigo FROM eu_empleados WHERE id = $1
                `
                , [id_empleado]);
    
            const [vacuna] = response.rows;
    
            let documento = vacuna.codigo + '_' + anio + '_' + mes + '_' + dia + '_' + req.file?.originalname;

            // CONSULTAR DATOSORIGINALES
            const vacuna1 = await pool.query('SELECT * FROM eu_empleado_vacunas WHERE id = $1', [id]);
            const [datosOriginales] = vacuna1.rows;

            if (!datosOriginales) {
                await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                    tabla: 'eu_empleado_vacunas',
                    usuario: user_name,
                    accion: 'U',
                    datosOriginales: '',
                    datosNuevos: '',
                    ip, 
                    observacion: `Error al guardar documento de vacuna con id: ${id}`
                });
    
                // FINALIZAR TRANSACCION
                await pool.query('COMMIT');
                return res.status(404).jsonp({ message: 'Registro no encontrado.' });
            }
    
            await pool.query(
                `
                UPDATE eu_empleado_vacunas SET carnet = $2 WHERE id = $1
                `
                , [id, documento]);
            
            // AUDITORIA
            await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                tabla: 'eu_empleado_vacunas',
                usuario: user_name,
                accion: 'U',
                datosOriginales: '',
                datosNuevos: `{carnet: ${documento}}`,
                ip, 
                observacion: null
            });

            // FINALIZAR TRANSACCION
            await pool.query('COMMIT');
    
            return res.jsonp({ message: 'Registro guardado.' });
        } catch (error) {
            // REVERTIR TRANSACCION
            await pool.query('ROLLBACK');
            return res.status(500).jsonp({ message: 'Error al guardar registro.' });
        }
    }

    // ACTUALIZAR REGISTRO DE VACUNACION
    public async ActualizarRegistro(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const { id_empleado, descripcion, fecha, id_tipo_vacuna, user_name, ip } = req.body;

            // INICIAR TRANSACCION
            await pool.query('BEGIN');

            // CONSULTAR DATOSORIGINALES
            const vacuna = await pool.query('SELECT * FROM eu_empleado_vacunas WHERE id = $1', [id]);
            const [datosOriginales] = vacuna.rows;

            if (!datosOriginales) {
                await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                    tabla: 'eu_empleado_vacunas',
                    usuario: user_name,
                    accion: 'U',
                    datosOriginales: '',
                    datosNuevos:'',
                    ip, 
                    observacion: `Error al actualizar vacuna con id: ${id}`
                });
    
                // FINALIZAR TRANSACCION
                await pool.query('COMMIT');
                return res.status(404).jsonp({ message: 'Registro no encontrado.' });
            }

            await pool.query(
                `
                UPDATE eu_empleado_vacunas SET id_empleado = $1, descripcion = $2, fecha = $3, id_vacuna = $4 
                WHERE id = $5
                `
                , [id_empleado, descripcion, fecha, id_tipo_vacuna, id]);
            
            // AUDITORIA
            await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                tabla: 'eu_empleado_vacunas',
                usuario: user_name,
                accion: 'U',
                datosOriginales: JSON.stringify(datosOriginales),
                datosNuevos: `{id_empleado: ${id_empleado}, descripcion: ${descripcion}, fecha: ${fecha}, id_vacuna: ${id_tipo_vacuna}}`,
                ip, 
                observacion: null
            });

            // FINALIZAR TRANSACCION
            await pool.query('COMMIT');
            return res.jsonp({ message: 'Registro actualizado.' });
        } catch (error) {
            // REVERTIR TRANSACCION
            await pool.query('ROLLBACK');
            return res.status(500).jsonp({ message: 'Error al actualizar registro.' });
        }
    }

    // ELIMINAR DOCUMENTO CARNET DE VACUNACION DEL SERVIDOR
    public async EliminarDocumentoServidor(req: Request, res: Response): Promise<void> {
        let { documento, id } = req.body;
        let separador = path.sep;

        if (documento != 'null' && documento != '' && documento != null) {
            let ruta = await ObtenerRutaVacuna(id) + separador + documento;
            // VERIFICAR EXISTENCIA DE CARPETA O ARCHIVO
            fs.access(ruta, fs.constants.F_OK, (err) => {
                if (err) {
                } else {
                    // ELIMINAR DEL SERVIDOR
                    fs.unlinkSync(ruta);
                }
            });
        }
        res.jsonp({ message: 'Documento actualizado.' });
    }

    // ELIMINAR DOCUMENTO CARNET DE VACUNACION
    public async EliminarDocumento(req: Request, res: Response): Promise<Response> {
        try {
            let separador = path.sep;
            let { documento, id, user_name, ip } = req.body;

            // INICIAR TRANSACCION
            await pool.query('BEGIN');

            // CONSULTAR DATOSORIGINALES
            const vacunaconsulta = await pool.query('SELECT * FROM eu_empleado_vacunas WHERE id = $1', [id]);
            const [datosOriginales] = vacunaconsulta.rows;

            if (!datosOriginales) {
                await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                    tabla: 'eu_empleado_vacunas',
                    usuario: user_name,
                    accion: 'U',
                    datosOriginales: '',
                    datosNuevos:'',
                    ip, 
                    observacion: `Error al eliminar documento de vacuna con id: ${id}`
                });
    
                // FINALIZAR TRANSACCION
                await pool.query('COMMIT');
                return res.status(404).jsonp({ message: 'Registro no encontrado.' });
            }
    
            const response: QueryResult = await pool.query(
                `
                UPDATE eu_empleado_vacunas SET carnet = null WHERE id = $1 RETURNING *
                `
                , [id]);
    
            const [vacuna] = response.rows;

            // AUDITORIA
            await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                tabla: 'eu_empleado_vacunas',
                usuario: user_name,
                accion: 'U',
                datosOriginales: JSON.stringify(datosOriginales),
                datosNuevos: `{carnet: null}`,
                ip, 
                observacion: null
            });

            // FINALIZAR TRANSACCION
            await pool.query('COMMIT');
    
            if (documento != 'null' && documento != '' && documento != null) {
                let ruta = await ObtenerRutaVacuna(vacuna.id_empleado) + separador + documento;
                // VERIFICAR EXISTENCIA DE CARPETA O ARCHIVO
                fs.access(ruta, fs.constants.F_OK, (err) => {
                    if (err) {
                    } else {
                        // ELIMINAR DEL SERVIDOR
                        fs.unlinkSync(ruta);
                    }
                });
            }
    
            return res.jsonp({ message: 'Documento eliminado.' });
        } catch (error) {
            // REVERTIR TRANSACCION
            await pool.query('ROLLBACK');
            return res.status(500).jsonp({ message: 'Error al eliminar documento.' });
        }
    }

    // ELIMINAR REGISTRO DE VACUNACION
    public async EliminarRegistro(req: Request, res: Response): Promise<Response> {
        try {
            let separador = path.sep;
            
            const { user_name, ip } = req.body;
            const { id, documento } = req.params;

            // INICIAR TRANSACCION
            await pool.query('BEGIN');

            // CONSULTAR DATOSORIGINALES
            const vacunaconsulta = await pool.query('SELECT * FROM eu_empleado_vacunas WHERE id = $1', [id]);
            const [datosOriginales] = vacunaconsulta.rows;

            if (!datosOriginales) {
                await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                    tabla: 'eu_empleado_vacunas',
                    usuario: user_name,
                    accion: 'D',
                    datosOriginales: '',
                    datosNuevos:'',
                    ip, 
                    observacion: `Error al eliminar vacuna con id: ${id}`
                });
    
                // FINALIZAR TRANSACCION
                await pool.query('COMMIT');
                return res.status(404).jsonp({ message: 'Registro no encontrado.' });
            }

            const response: QueryResult = await pool.query(
                `
                DELETE FROM eu_empleado_vacunas WHERE id = $1 RETURNING *
                `
                , [id]);
    
            const [vacuna] = response.rows;
    
            // AUDITORIA
            await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                tabla: 'eu_empleado_vacunas',
                usuario: user_name,
                accion: 'D',
                datosOriginales: JSON.stringify(datosOriginales),
                datosNuevos:'',
                ip, 
                observacion: null
            });

            // FINALIZAR TRANSACCION
            await pool.query('COMMIT');

            if (documento != 'null' && documento != '' && documento != null) {
                let ruta = await ObtenerRutaVacuna(vacuna.id_empleado) + separador + documento;
                // VERIFICAR EXISTENCIA DE CARPETA O ARCHIVO
                fs.access(ruta, fs.constants.F_OK, (err) => {
                    if (err) {
                    } else {
                        // ELIMINAR DEL SERVIDOR
                        fs.unlinkSync(ruta);
                    }
                });
            }
            return res.jsonp({ message: 'Registro eliminado.' });
        } catch (error) {
            // REVERTIR TRANSACCION
            await pool.query('ROLLBACK');
            return res.status(500).jsonp({ message: 'Error al eliminar registro.' });  
        }
    }

    // CREAR REGISTRO DE TIPO DE VACUNA
    public async CrearTipoVacuna(req: Request, res: Response): Promise<Response> {
        try {
            const { vacuna, user_name, ip } = req.body;

            // INICIAR TRANSACCION
            await pool.query('BEGIN');

            const VERIFICAR_VACUNA: QueryResult = await pool.query(
                `
                SELECT * FROM e_cat_vacuna WHERE UPPER(nombre) = $1
                `
                , [vacuna.toUpperCase()])

            if (VERIFICAR_VACUNA.rows[0] == undefined || VERIFICAR_VACUNA.rows[0] == '') {
                const response: QueryResult = await pool.query(
                    `
                    INSERT INTO e_cat_vacuna (nombre) VALUES ($1) RETURNING *
                    `
                    , [vacuna]);

            // AUDITORIA
            await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                tabla: 'e_cat_vacuna',
                usuario: user_name,
                accion: 'I',
                datosOriginales: '',
                datosNuevos: `{nombre: ${vacuna}}`,
                ip, 
                observacion: null
            });

            // FINALIZAR TRANSACCION
            await pool.query('COMMIT');

            const [vacunaInsertada] = response.rows;

                if (vacunaInsertada) {
                    return res.status(200).jsonp({ message: 'Registro guardado.', status: '200' })
                } else {
                    return res.status(404).jsonp({ message: 'Ups!!! algo slaio mal.', status: '400' })
                }

            } else {
                return res.jsonp({ message: 'Registro de tipo de vacuna ya existe en el sistema.', status: '300' })
            }

        } catch (error) {
            // REVERTIR TRANSACCION
            await pool.query('ROLLBACK');
            return res.status(500).jsonp({ message: 'Error al guardar registro.' });
        }
    }

    // OBTENER CERTIFICADO DE VACUNACION
    public async ObtenerDocumento(req: Request, res: Response): Promise<any> {
        const docs = req.params.docs;
        const id = req.params.id;
        // TRATAMIENTO DE RUTAS
        let separador = path.sep;
        let ruta = await ObtenerRutaVacuna(id) + separador + docs;
        fs.access(ruta, fs.constants.F_OK, (err) => {
            if (err) {
            } else {
                res.sendFile(path.resolve(ruta));
            }
        });
    }

    // LISTAR TODOS LOS REGISTROS DE VACUNACIÓN
    public async ListarRegistro(req: Request, res: Response) {
        const VACUNA = await pool.query(
            `
            SELECT ev.id, ev.id_empleado, ev.id_vacuna, ev.carnet, ev.fecha, tv.nombre, ev.descripcion
            FROM eu_empleado_vacunas AS ev, e_cat_vacuna AS tv 
            WHERE ev.id_vacuna = tv.id
            ORDER BY ev.id DESC
            `
        );
        if (VACUNA.rowCount > 0) {
            return res.jsonp(VACUNA.rows)
        }
        else {
            res.status(404).jsonp({ text: 'Registro no encontrado.' });
        }
    }

}

export const VACUNAS_CONTROLADOR = new VacunasControlador();

export default VACUNAS_CONTROLADOR;