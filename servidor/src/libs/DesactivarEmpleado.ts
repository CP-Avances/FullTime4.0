import moment from 'moment';
import pool from '../database';

const HORA_EJECUTA = 23

// METODO PARA CAMBIAR EL ESTADO DE ACCESO DE USUARIOS SEGUN FECHA DE FINALIZACION DE CONTRATO
export const DesactivarFinContratoEmpleado = function () {

    setInterval(async () => {
        // OBTENER HORA Y FECHA
        var f = moment();
        let hora: number = parseInt(moment(f).format('HH'));
        let fecha: string = moment(f).format('YYYY-MM-DD');

        if (hora === HORA_EJECUTA) {

            let EMPLEADOS = await pool.query(
                `
                SELECT DISTINCT cv.id_empleado 
                FROM contrato_cargo_vigente AS cv, eu_empleado_contratos AS ec 
                WHERE CAST(ec.fecha_salida AS VARCHAR) LIKE $1 || '%' 
                    AND ec.id = cv.id_contrato
                ORDER BY id_empleado DESC
                `
                , [fecha])
                .then(result => {
                    return result.rows
                });

            if (EMPLEADOS.length > 0) {

                EMPLEADOS.forEach(async (obj) => {
                    await pool.query(
                        `
                        UPDATE eu_empleados SET estado = 2 WHERE id = $1
                        `
                        , [obj.id_empleado]) // 2 => DESACTIVADO O INACTIVO
                        .then(result => { });

                    await pool.query(
                        `
                        UPDATE eu_usuarios SET estado = false, app_habilita = false 
                        WHERE id_empleado = $1
                        `
                        , [obj.id_empleado]) // false => YA NO TIENE ACCESO
                        .then(result => { });
                })
            }
        }

    }, 3600000)
}