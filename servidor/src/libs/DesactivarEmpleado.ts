import moment from 'moment';
import pool from '../database';

const HORA_EJECUTA = 23

// METODO PARA CAMBIAR EL ESTADO DE ACCESO DE USUARIOS SEGUN FECHA DE FINALIZACION DE CONTRATO
export const DesactivarFinContratoEmpleado = function () {

    setInterval(async () => {

        var f = moment();

        let hora: number = parseInt(moment(f).format('HH'));
        let fecha: string = moment(f).format('YYYY-MM-DD');

        if (hora === HORA_EJECUTA) {

            let idsEmpleados_FinContrato = await pool.query(
                `
                SELECT DISTINCT id_empleado 
                FROM eu_empleado_contratos 
                WHERE CAST(fecha_salida AS VARCHAR) LIKE $1 || \'%\' 
                ORDER BY id_empleado DESC
                `
                , [fecha])
                .then(result => {
                    return result.rows
                });

            if (idsEmpleados_FinContrato.length > 0) {

                idsEmpleados_FinContrato.forEach(async (obj) => {
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