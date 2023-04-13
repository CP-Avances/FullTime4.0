import pool from '../database';

const HORA_EJECUTA = 23

export const DesactivarFinContratoEmpleado = function () {

    setInterval(async () => {
        var f = new Date();
        console.log(f.getHours());

        var d = f.toLocaleDateString().split('-')[2];
        var m = f.toLocaleDateString().split('-')[1];
        var a = f.toLocaleDateString().split('-')[0];
        f.setUTCFullYear(parseInt(a));
        f.setUTCMonth(parseInt(m) - 1);
        f.setUTCDate(parseInt(d));
        // f.setUTCMonth(7);
        // f.setUTCDate(31);

        let hora: number = parseInt(f.toLocaleTimeString().split(':')[0]);
        // let hora: number = 9; // =====> solo para probar
        f.setUTCHours(hora);

        let fecha: string = f.toJSON().split('T')[0];
        if (hora === HORA_EJECUTA) {
            console.log(fecha);
            let idsEmpleados_FinContrato = await pool.query('SELECT DISTINCT id_empleado FROM empl_contratos WHERE CAST(fec_salida AS VARCHAR) LIKE $1 || \'%\' ORDER BY id_empleado DESC', [fecha])
                .then(result => {
                    return result.rows
                });

            console.log(idsEmpleados_FinContrato);

            if (idsEmpleados_FinContrato.length > 0) {
                idsEmpleados_FinContrato.forEach(async (obj) => {
                    await pool.query('UPDATE empleados SET estado = 2 WHERE id = $1', [obj.id_empleado]) // 2 => desactivado o inactivo
                        .then(result => {
                            console.log(result.command, 'EMPLEADO ====>', obj.id_empleado);
                        });
                    await pool.query('UPDATE usuarios SET estado = false, app_habilita = false WHERE id_empleado = $1', [obj.id_empleado]) // false => Ya no tiene acceso
                        .then(result => {
                            console.log(result.command, 'USUARIO ====>', obj.id_empleado);
                        });
                })
            }

        }

    }, 3600000)
}