import pool from '../database';


function sumaDias(fecha: Date, dias: number) {
    fecha.setDate(fecha.getDate() + dias);
    return fecha;
}

// funcion para contabilizar el tiempo utilizado de los permisos 
export const conteoPermisos = function() {
    setInterval(async() => {
        
        var f = new Date();
        console.log(f.toLocaleDateString() + ' ' + f.toLocaleTimeString());
        
        let hora: number = parseInt(f.toLocaleTimeString().split(':')[0]);
        let fecha: string = f.toJSON().split('T')[0]
        console.log(hora);
        console.log(fecha);
        f.setUTCHours(hora); // le resta las 5 horas de la zona horaria
        console.log(f.toJSON());

        if( hora === 0) {
            let permiso = await pool.query('SELECT p.descripcion, p.fec_inicio, p.fec_final, p.hora_numero, p.id_peri_vacacion, e.id AS id_empleado FROM permisos p, empl_contratos con, empleados e WHERE CAST(p.fec_final AS VARCHAR) LIKE $1 || \'%\' AND p.estado like \'Aceptado\' AND con.id = p.id_empl_contrato AND con.id_empleado = e.id ORDER BY p.fec_final DESC', [fecha]);
            if (permiso.rowCount > 0) {
                console.log(permiso.rows);
                
                permiso.rows.forEach(async(obj) => {
                    let timbre = await pool.query('SELECT fec_hora_timbre FROM timbres WHERE id_empleado = $1', [obj.id_empleado]);
                    console.log(timbre.rows);
                    
                });
            }
        }
        
    }, 100000);
}

/*
    console.log(date.toJSON()); // 2020-08-17T22:18:30.359Z
    console.log(date.toLocaleDateString()); // 2020-8-17
    console.log(date.toLocaleTimeString()); // 17:18:30
*/