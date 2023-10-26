import { Request, Response } from 'express';
import pool from '../../database';

class AsistenciaControlador {

    public async BuscarAsistencia(req: Request, res: Response) {

        var verificador = 0;
        var codigos = '';

        var EMPLEADO: any;

        const { cedula, codigo, inicio, fin, nombre, apellido } = req.body;

        if (codigo === '') {
            // BUSCAR CODIGO POR CEDULA DEL USUARIO
            EMPLEADO = await pool.query(
                `
                SELECT codigo FROM empleados WHERE cedula = $1
                `,
                [cedula]);

            if (EMPLEADO.rowCount === 0) {
                // BUSCAR CODIGO POR NOMBRE DEL USUARIO
                EMPLEADO = await pool.query(
                    `
                    SELECT codigo FROM empleados WHERE UPPER(nombre) ilike '%${nombre}%'
                    `);

                if (EMPLEADO.rowCount === 0) {
                    // BUSCAR CODIGO POR APELLIDO DEL USUARIO
                    EMPLEADO = await pool.query(
                        `
                        SELECT codigo FROM empleados WHERE UPPER(apellido) ilike '%${apellido}%'
                        `);

                    if (EMPLEADO.rowCount != 0) {
                        // TRATAMIENTO DE CODIGOS

                        var datos: any = [];
                        datos = EMPLEADO.rows;

                        datos.forEach((obj: any) => {
                            //console.log('ver codigos ', obj.codigo)
                            if (codigos === '') {
                                codigos = '\'' + obj.codigo + '\''
                            }
                            else {
                                codigos = codigos + ', \'' + obj.codigo + '\''
                            }
                        })
                    }
                    else {
                        verificador = 1;
                    }
                }
            }
        }
        else {
            codigos = '\'' + codigo + '\''
        }

        //console.log('ver codigo1 ', codigos)
        //console.log('ver empleados 1 ', EMPLEADO.rows)

        if (verificador === 0) {

            //console.log('ver codigo ', codigos)

            const ASISTENCIA = await pool.query(
                "SELECT p_g.*, p_g.fec_hora_horario::time AS hora_horario, p_g.fec_hora_horario::date AS fecha_horario, " +
                "p_g.fec_hora_timbre::date AS fecha_timbre, p_g.fec_hora_timbre::time AS hora_timbre, " +
                "empleado.cedula, empleado.nombre, empleado.apellido " +
                "FROM plan_general p_g " +
                "INNER JOIN empleados empleado on empleado.codigo = p_g.codigo AND p_g.codigo IN (" + codigos + ")" +
                "WHERE p_g.fec_horario BETWEEN $1 AND $2 " +
                "ORDER BY p_g.fec_hora_horario ASC",
                [inicio, fin]);

            if (ASISTENCIA.rowCount === 0) {
                return res.status(404).jsonp({ message: 'vacio' });
            }
            else {
                return res.jsonp({ message: 'OK', respuesta: ASISTENCIA.rows })
            }

        }
        else {
            return res.status(404).jsonp({ message: 'vacio' });
        }

    }

}

export const ASISTENCIA_CONTROLADOR = new AsistenciaControlador();

export default ASISTENCIA_CONTROLADOR;