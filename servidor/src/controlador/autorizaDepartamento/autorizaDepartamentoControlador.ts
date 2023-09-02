import { Request, Response } from 'express';
import pool from '../../database';

class AutorizaDepartamentoControlador {

    // METODO PARA BUSCAR USUARIO AUTORIZA
    public async EncontrarAutorizacionEmple(req: Request, res: Response) {
        const { id_empleado } = req.params;
        const AUTORIZA = await pool.query(
            `
            SELECT da.id, da.id_departamento, da.id_empl_cargo, da.estado, da.autorizar, da.preautorizar, cd.nombre AS nom_depar,
                ce.id AS id_empresa, ce.nombre AS nom_empresa, s.id AS id_sucursal, 
                s.nombre AS nom_sucursal
            FROM depa_autorizaciones AS da, cg_departamentos AS cd, cg_empresa AS ce, 
                sucursales AS s
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
            SELECT cd.id AS id_depa_confi, n.id_departamento, n.departamento AS depa_autoriza, n.nivel, da.estado, da.autorizar, da.preautorizar, 
            da.id_empl_cargo, e.id_contrato, e.id_departamento AS depa_pertenece, cd.nombre, 
            ce.id AS id_empresa, ce.nombre AS nom_empresa, s.id AS id_sucursal, s.nombre AS nom_sucursal 
            FROM depa_autorizaciones AS da, cg_departamentos AS cd, cg_empresa AS ce, 
            sucursales AS s, datos_actuales_empleado AS e, nivel_jerarquicodep AS n 
            WHERE da.id_departamento = cd.id 
            AND cd.id_sucursal = s.id 
            AND ce.id = s.id_empresa 
            AND da.id_empleado = $1 
            AND e.id_cargo = da.id_empl_cargo
            AND n.id_dep_nivel = cd.id
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
    public async CrearAutorizaDepartamento(req: Request, res: Response): Promise<void> {
        const { id_departamento, id_empl_cargo, estado, id_empleado, autorizar, preautorizar } = req.body;
        await pool.query(
            `
            INSERT INTO depa_autorizaciones (id_departamento, id_empl_cargo, estado, id_empleado, autorizar, preautorizar)
            VALUES ($1, $2, $3, $4, $5, $6)
            `
            , [id_departamento, id_empl_cargo, estado, id_empleado, autorizar, preautorizar]);
        res.jsonp({ message: 'Registro guardado.' });
    }

    // METODO PARA ACTUALIZAR REGISTRO
    public async ActualizarAutorizaDepartamento(req: Request, res: Response): Promise<void> {
        const { id_departamento, id_empl_cargo, estado, id, autorizar, preautorizar } = req.body;
        await pool.query(
            `
            UPDATE depa_autorizaciones SET id_departamento = $1, id_empl_cargo = $2, estado = $3, autorizar = $5, preautorizar = $6
            WHERE id = $4
            `
            , [id_departamento, id_empl_cargo, estado, id, autorizar, preautorizar]);
        res.jsonp({ message: 'Registro actualizado.' });
    }

    // METODO PARA ELIMINAR REGISTROS
    public async EliminarAutorizacionDepartamento(req: Request, res: Response): Promise<void> {
        const id = req.params.id;
        await pool.query(
            `
            DELETE FROM depa_autorizaciones WHERE id = $1
            `
            , [id]);
        res.jsonp({ message: 'Registro eliminado.' });
    }



    public async ListarAutorizaDepartamento(req: Request, res: Response) {
        const AUTORIZA = await pool.query('SELECT * FROM depa_autorizaciones');
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
            FROM depa_autorizaciones AS d 
            INNER JOIN VistaAutorizanCargo AS v ON d.id_departamento = v.id_depar 
                AND d.id_empl_cargo = v.id_cargo 
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
        const EMPLEADOS = await pool.query('SELECT * FROM VistaAutorizanCargo WHERE id_depar = $1', [id_depar]);
        if (EMPLEADOS.rowCount > 0) {
            return res.jsonp(EMPLEADOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'Registros no encontrados' });
        }
    }

    public async ObtenerListaAutorizaDepa(req: Request, res: Response): Promise<any> {
        const { id_depar } = req.params;
        const EMPLEADOS = await pool.query(
            `
            SELECT n.id_departamento, cg.nombre, n.id_dep_nivel, n.dep_nivel_nombre, n.nivel,
                da.estado, dae.id_contrato, da.id_empl_cargo, da.id_empleado, (dae.nombre || ' ' || dae.apellido) as fullname, 
                dae.cedula, dae.correo, c.permiso_mail, c.permiso_noti, c.vaca_mail, c.vaca_noti, c.hora_extra_mail, 
                c.hora_extra_noti  
            FROM nivel_jerarquicodep AS n, depa_autorizaciones AS da, datos_actuales_empleado AS dae, 
                config_noti AS c, cg_departamentos AS cg 
            WHERE n.id_departamento = $1
                AND da.id_departamento = n.id_dep_nivel 
                AND dae.id_cargo = da.id_empl_cargo 
                AND dae.id_contrato = c.id_empleado 
                AND cg.id = $1
            ORDER BY nivel ASC
            `
            , [id_depar]);

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