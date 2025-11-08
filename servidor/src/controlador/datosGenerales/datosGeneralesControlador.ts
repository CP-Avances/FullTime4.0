import { Request, Response } from 'express';
import { QueryResult } from 'pg';
import pool from '../../database';

class DatosGeneralesControlador {

    // METODO PARA LEER DATOS DEL USUARIO      **USADO
    public async BuscarDataGeneral(req: Request, res: Response) {
        let estado = req.params.estado;
        let informacion = await pool.query(
            `
            SELECT ig.*, u.usuario, u.id_empleado
            FROM informacion_general AS ig
            LEFT JOIN eu_usuarios AS u ON ig.id = u.id_empleado
            WHERE ig.estado = $1
            ORDER BY ig.name_suc ASC;
            `
            , [estado]
        ).then((result: any) => { return result.rows });

        if (informacion.length === 0) return res.status(404).jsonp({ message: 'No se han encontrado registros.' })

        return res.status(200).jsonp(informacion);
    }

    // METODO PARA BUSCAR DATOS DE USUARIOS QUE RECIBEN COMUNICADOS    **USADO
    public async DatosGeneralesComunicados(req: Request, res: Response) {
        let estado = req.params.estado;
        let resultados = await pool.query(
            `
            SELECT ig.*, cn.comunicado_mail, cn.comunicado_notificacion 
            FROM informacion_general AS ig, eu_configurar_alertas AS cn 
            WHERE ig.id = cn.id_empleado AND ig.estado = $1
                AND (cn.comunicado_mail = true OR cn.comunicado_notificacion = true)                
            `
            , [estado]
        ).then((result: any) => { return result.rows });

        if (resultados.length === 0) return res.status(404).jsonp({ message: 'No se han encontrado registros.' })

        return res.status(200).jsonp(resultados);
    }


    // METODO PARA LEER DATOS PERFIL **USADO
    public async BuscarDataGeneralRol(req: Request, res: Response) {
        let estado = req.params.estado;
        let informacion = await pool.query(
            `
                SELECT * FROM informacion_general AS ig, eu_usuario_departamento AS ud
                WHERE ig.estado = $1 AND 
	   		        ig.jefe = false AND
			        ud.id_empleado = ig.id AND
	                ud.administra = false
                ORDER BY ig.name_suc ASC
                `
            , [estado]
        ).then((result: any) => { return result.rows });

        if (informacion.length === 0) return res.status(404).jsonp({ message: 'No se han encontrado registros.' })

        return res.status(200).jsonp(informacion);
    }

    // METODO DE BUSQUEDA DE DATOS ACTUALES DEL USUARIO   **USADO
    public async DatosActuales(req: Request, res: Response) {
        const { empleado_id } = req.params;
        const DATOS = await pool.query(
            `
            SELECT * FROM contrato_cargo_vigente WHERE id_empleado = $1
            `
            , [empleado_id]);
        if (DATOS.rowCount != 0) {
            return res.jsonp(DATOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'error' });
        }
    }

    // METODO DE BUSQUEDA DE USUARIOS QUE NO HAN SIDO ASIGNADOS A UNA UBICACION    **USADO
    public async DatosGeneralesUbicacion(req: Request, res: Response) {
        let estado = req.params.estado;
        let { ubicacion } = req.body;

        console.log("ver ubicacion: ", ubicacion);
        // CONSULTA DE BUSQUEDA DE SUCURSALES
        let respuesta = await pool.query(
            `
            SELECT ig.*
                FROM informacion_general ig
                LEFT JOIN mg_empleado_ubicacion eu
                ON eu.id_empleado = ig.id AND eu.id_ubicacion = $2
                WHERE ig.estado = $1
                AND eu.id_empleado IS NULL
            ORDER BY ig.id ASC;
            `
            , [estado, ubicacion]
        ).then((result: any) => { return result.rows });

        if (respuesta.length === 0) return res.status(404)
            .jsonp({ message: 'No se han encontrado registros.' })

        return res.status(200).jsonp(respuesta);
    }

    // METODO PARA LISTAR ID ACTUALES DE USUARIOS   **USADO
    public async ListarIdDatosActualesEmpleado(req: Request, res: Response) {
        const DATOS = await pool.query(
            `
            SELECT dae.id_empleado AS id
            FROM contrato_cargo_vigente AS dae
            ORDER BY dae.id_empleado ASC
            `
        );
        if (DATOS.rowCount != 0) {
            return res.jsonp(DATOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'error' });
        }
    }

    // METODO PARA LEER DATOS DEL USUARIO CON DATOS DEL REGIMEN LABORAL    **USADO
    public async BuscarDataGeneralPeriodos(req: Request, res: Response) {
        let estado = req.params.estado;
        let informacion = await pool.query(
            `
                SELECT ig.*, u.usuario, r.dia_hora_estandar
                FROM informacion_general AS ig
                LEFT JOIN eu_usuarios AS u ON ig.id = u.id_empleado
                LEFT JOIN ere_cat_regimenes AS r ON r.id = ig.id_regimen
                WHERE ig.estado = $1
                ORDER BY ig.name_suc ASC;
            `
            , [estado]
        ).then((result: any) => { return result.rows });

        if (informacion.length === 0) return res.status(404).jsonp({ message: 'No se han encontrado registros.' })

        return res.status(200).jsonp(informacion);
    }


}

const DATOS_GENERALES_CONTROLADOR = new DatosGeneralesControlador();

export default DATOS_GENERALES_CONTROLADOR;


