import pool from '../database';

// funcion para contabilizar el tiempo utilizado de los permisos 
export const conteoPermisos = function () {
    setInterval(async () => {

        var f = new Date();
        console.log(f.toLocaleDateString() + ' ' + f.toLocaleTimeString());

        let hora: number = parseInt(f.toLocaleTimeString().split(':')[0]);
        let fecha: string = f.toJSON().split('T')[0]
        console.log(hora);
        console.log(fecha);
        f.setUTCHours(hora); // le resta las 5 horas de la zona horaria
        console.log(f.toJSON());

        if (hora === 0) {
            let permiso = await pool.query(
                `
                SELECT p.descripcion, p.fecha_inicio, p.fecha_final, p.hora_numero, p.id_periodo_vacacion, 
                    e.id AS id_empleado 
                FROM mp_solicitud_permiso p, eu_empleado_contratos con, eu_empleados e, eu_empleado_cargos AS ce 
                WHERE CAST(p.fec_final AS VARCHAR) LIKE $1 || \'%\' AND p.estado like \'Aceptado\' 
                    AND ce.id = p.id_empleado_cargo AND con.id_empleado = e.id AND con.id = ce.id_contrato
                ORDER BY p.fecha_final DESC
                `
                , [fecha]);
            if (permiso.rowCount != 0) {
                console.log(permiso.rows);

                permiso.rows.forEach(async (obj) => {
                    let timbre = await pool.query(
                        `
                        SELECT fecha_hora_timbre FROM eu_timbres WHERE codigo = $1
                        `
                        , [obj.id_empleado]);
                    console.log(timbre.rows);

                });
            }
        }

    }, 100000);
}
