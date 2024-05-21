import { Request, Response } from 'express';
import pool from '../../database';
import AUDITORIA_CONTROLADOR from '../auditoria/auditoriaControlador';

class AutorizaDepartamentoControlador {

    // METODO PARA BUSCAR USUARIO AUTORIZA
    public async EncontrarAutorizacionEmple(req: Request, res: Response) {
        const { id_empleado } = req.params;
        const AUTORIZA = await pool.query(
            `
            SELECT da.id, da.id_departamento, da.id_empleado_cargo, da.estado, da.autorizar, da.preautorizar, 
                cd.nombre AS nom_depar, ce.id AS id_empresa, ce.nombre AS nom_empresa, s.id AS id_sucursal, 
                s.nombre AS nom_sucursal
            FROM ed_autoriza_departamento AS da, ed_departamentos AS cd, e_empresa AS ce, 
                e_sucursales AS s
            WHERE da.id_departamento = cd.id AND cd.id_sucursal = s.id AND ce.id = s.id_empresa
                AND da.id_empleado = $1
            `
            , [id_empleado]);
        if (AUTORIZA.rowCount > 0) {
            return res.jsonp(AUTORIZA.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros.' });
        }
    }

    // METODO PARA BUSCAR USUARIO AUTORIZA
    public async EncontrarAutorizacionUsuario(req: Request, res: Response) {
        const { id_empleado } = req.params;
        const AUTORIZA = await pool.query(
            `
            SELECT cd.id AS id_depa_confi, n.id_departamento, n.departamento AS depa_autoriza, n.nivel, da.estado, 
                da.autorizar, da.preautorizar, da.id_empleado_cargo, e.id_contrato, e.id_departamento AS depa_pertenece, 
                cd.nombre, ce.id AS id_empresa, ce.nombre AS nom_empresa, s.id AS id_sucursal, s.nombre AS nom_sucursal 
            FROM ed_autoriza_departamento AS da, ed_departamentos AS cd, e_empresa AS ce, 
                e_sucursales AS s, datos_actuales_empleado AS e, ed_niveles_departamento AS n 
            WHERE da.id_departamento = cd.id 
                AND cd.id_sucursal = s.id 
                AND ce.id = s.id_empresa 
                AND da.id_empleado = $1 
                AND e.id_cargo = da.id_empleado_cargo
                AND n.id_departamento_nivel = cd.id
            `
            , [id_empleado]);
        if (AUTORIZA.rowCount > 0) {
            return res.jsonp(AUTORIZA.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros.' });
        }
    }



    // METODO PARA REGISTRAR AUTORIZACION
    public async CrearAutorizaDepartamento(req: Request, res: Response): Promise<Response> {
        try {
            const { id_departamento, id_empl_cargo, estado, id_empleado, autorizar, preautorizar, user_name, ip } = req.body;

            // INICIAR TRANSACCION
            await pool.query('BEGIN');

            await pool.query(
                `
                INSERT INTO ed_autoriza_departamento (id_departamento, id_empl_cargo, estado, id_empleado, autorizar, preautorizar)
                VALUES ($1, $2, $3, $4, $5, $6)
                `
                , [id_departamento, id_empl_cargo, estado, id_empleado, autorizar, preautorizar]);
            
            // INSERTAR REGISTRO DE AUDITORIA
            await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                tabla: 'ed_autoriza_departamento',
                usuario: user_name,
                accion: 'I',
                datosOriginales: '',
                datosNuevos: `{id_departamento: ${id_departamento}, id_empl_cargo: ${id_empl_cargo}, estado: ${estado}, id_empleado: ${id_empleado}, autorizar: ${autorizar}, preautorizar: ${preautorizar}}`,
                ip,
                observacion: null
            });

            // FINALIZAR TRANSACCION
            await pool.query('COMMIT');
            return res.jsonp({ message: 'Registro guardado.' });
        } catch (error) {
            // CANCELAR TRANSACCION
            await pool.query('ROLLBACK');
            return res.status(500).jsonp({ message: 'Error al guardar registro.' }); 
        }
    }

    // METODO PARA ACTUALIZAR REGISTRO
    public async ActualizarAutorizaDepartamento(req: Request, res: Response): Promise<Response> {
        try {
            const { id_departamento, id_empl_cargo, estado, id, autorizar, preautorizar, user_name, ip } = req.body;

            // INICIAR TRANSACCION
            await pool.query('BEGIN');

            // OBTENER DATOS ANTES DE ACTUALIZAR
            const response = await pool.query('SELECT * FROM ed_autoriza_departamento WHERE id = $1', [id]);
            const [datos] = response.rows;

            if (!datos) {
                await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                    tabla: 'ed_autoriza_departamento',
                    usuario: user_name,
                    accion: 'U',
                    datosOriginales: '',
                    datosNuevos: '',
                    ip,
                    observacion: `Error al actualizar registro con id: ${id}`
                });

                // FINALIZAR TRANSACCION
                await pool.query('COMMIT');
                return res.status(404).jsonp({ message: 'Registro no encontrado.' });
            }

            await pool.query(`
                UPDATE ed_autoriza_departamento SET id_departamento = $1, id_empleado_cargo = $2, estado = $3, autorizar = $5, 
                    preautorizar = $6
                WHERE id = $4
                `
                , [id_departamento, id_empl_cargo, estado, id, autorizar, preautorizar]);


            // INSERTAR REGISTRO DE AUDITORIA
            await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                tabla: 'ed_autoriza_departamento',
                usuario: user_name,
                accion: 'U',
                datosOriginales: JSON.stringify(datos),
                datosNuevos: `{id_departamento: ${id_departamento}, id_empl_cargo: ${id_empl_cargo}, estado: ${estado}, autorizar: ${autorizar}, preautorizar: ${preautorizar}}`,
                ip,
                observacion: null
            });

            // FINALIZAR TRANSACCION
            await pool.query('COMMIT');

            return res.jsonp({ message: 'Registro actualizado.' });
        } catch (error) {
            // CANCELAR TRANSACCION
            await pool.query('ROLLBACK');
            return res.status(500).jsonp({ message: 'Error al actualizar registro.' });
        }
    }

    // METODO PARA ELIMINAR REGISTROS
    public async EliminarAutorizacionDepartamento(req: Request, res: Response): Promise<Response> {
        try {
            const id = req.params.id;
            const { user_name, ip } = req.body;

            // INICIAR TRANSACCION
            await pool.query('BEGIN');

            // OBTENER DATOS ANTES DE ELIMINAR
            const response = await pool.query('SELECT * FROM ed_autoriza_departamento WHERE id = $1', [id]);
            const [datos] = response.rows;

            if (!datos) {
                await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                    tabla: 'ed_autoriza_departamento',
                    usuario: user_name,
                    accion: 'D',
                    datosOriginales: '',
                    datosNuevos: '',
                    ip,
                    observacion: `Error al eliminar registro con id: ${id}`
                });

                // FINALIZAR TRANSACCION
                await pool.query('COMMIT');
                return res.status(404).jsonp({ message: 'Registro no encontrado.' });
            }

            await pool.query(
                `
                DELETE FROM ed_autoriza_departamento WHERE id = $1
                `
                , [id]);
            
            // INSERTAR REGISTRO DE AUDITORIA
            await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                tabla: 'ed_autoriza_departamento',
                usuario: user_name,
                accion: 'D',
                datosOriginales: JSON.stringify(datos),
                datosNuevos: '',
                ip,
                observacion: null
            });

            // FINALIZAR TRANSACCION
            await pool.query('COMMIT');
            return res.jsonp({ message: 'Registro eliminado.' });
        } catch (error) {
            // CANCELAR TRANSACCION
            await pool.query('ROLLBACK');
            return res.status(500).jsonp({ message: 'Error al eliminar registro.' });
        }
    }

    public async ListarAutorizaDepartamento(req: Request, res: Response) {
        const AUTORIZA = await pool.query(
            `
            SELECT * FROM ed_autoriza_departamento
            `
        );
        if (AUTORIZA.rowCount > 0) {
            return res.jsonp(AUTORIZA.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros' });
        }
    }


    // METODO PARA OBTENER LISTA DE USUARIOS QUE APRUEBAN SOLICITUDES     --**VERIFICADO
    public async ObtenerlistaEmpleadosAutorizan(req: Request, res: Response): Promise<any> {
        const { id_depa } = req.params;
        const EMPLEADOS = await pool.query(
            `
            SELECT d.id_departamento, v.nombre, v.apellido, d.autorizar, d.preautorizar, d.estado, v.depa_trabaja, v.cargo 
            FROM ed_autoriza_departamento AS d 
            INNER JOIN VistaAutorizanCargo AS v ON d.id_departamento = v.id_depar 
                AND d.id_empleado_cargo = v.id_cargo 
            WHERE d.id_departamento = $1
            `
            , [id_depa]);
        if (EMPLEADOS.rowCount > 0) {
            return res.jsonp(EMPLEADOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'Registros no encontrados' });
        }
    }

    public async ObtenerQuienesAutorizan(req: Request, res: Response): Promise<any> {
        const { id_depar } = req.params;
        const EMPLEADOS = await pool.query(
            `
            SELECT * FROM VistaAutorizanCargo WHERE id_depar = $1
            `
            , [id_depar]);
        if (EMPLEADOS.rowCount > 0) {
            return res.jsonp(EMPLEADOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'Registros no encontrados' });
        }
    }

    public async ObtenerListaAutorizaDepa(req: Request, res: Response): Promise<any> {
        const { id_depar } = req.params;
        const { estado } = req.body;
        const EMPLEADOS = await pool.query(
            `
            SELECT n.id_departamento, cg.nombre, n.id_departamento_nivel, n.departamento_nombre_nivel, n.nivel,
                da.estado, dae.id_contrato, da.id_empleado_cargo, da.id_empleado, 
                (dae.nombre || ' ' || dae.apellido) as fullname, dae.cedula, dae.correo, c.permiso_mail, 
                c.permiso_notificacion, c.vacacion_mail, c.vacacion_notificacion, c.hora_extra_mail, 
                c.hora_extra_notificacion  
            FROM ed_niveles_departamento AS n, ed_autoriza_departamento AS da, datos_actuales_empleado AS dae, 
                eu_configurar_alertas AS c, ed_departamentos AS cg 
            WHERE n.id_departamento = $1
                AND da.id_departamento = n.id_departamento_nivel 
                AND dae.id_cargo = da.id_empleado_cargo 
                AND dae.id_contrato = c.id_empleado 
                AND cg.id = $1
                AND dae.estado = $2
            ORDER BY nivel ASC
            `
            , [id_depar, estado]);

        if (EMPLEADOS.rowCount > 0) {
            return res.jsonp(EMPLEADOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'Registros no encontrados' });
        }
    }

}

export const AUTORIZA_DEPARTAMENTO_CONTROLADOR = new AutorizaDepartamentoControlador();

export default AUTORIZA_DEPARTAMENTO_CONTROLADOR;