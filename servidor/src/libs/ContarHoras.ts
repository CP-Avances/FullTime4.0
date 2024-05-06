import pool from '../database';

const HORA_EJECUTA_PROCESO = 12;

async function ListaTimbresDiarioToEmpleado(hoy: any) {
    // aqui falta definir si es entrada, salida, entrada de almuerzo y salida de almuerzo === o crear mas funciones para cada uno
    return await pool.query(
        `
        SELECT codigo, CAST(fecha_hora_timbre AS VARCHAR) 
        FROM eu_timbres 
        WHERE CAST(fecha_hora_timbre AS VARCHAR) like $1 || \'%\'
        `
        , [hoy])
        .then(result => {
            return result.rows.map(obj => {
                return {
                    codigo: obj.codigo,
                    fec_hora_timbre: obj.fecha_hora_timbre
                }
            })
        });
}

/**********************************************
 * 
 *      METODO PARA REGISTRAR ASISTENCIA.
 * 
 ***********************************************/

export const RegistrarAsistenciaByTimbres = async function () {
    setInterval(async () => {

        var f = new Date();
        let hora = f.getHours();
        console.log(f.toString());
        console.log('======================================');

        if (hora === HORA_EJECUTA_PROCESO) {
            f.setUTCHours(f.getHours());

            f.setDate(f.getDate() - 5);// para realizar pruebas

            let hoy = f.toJSON().split("T")[0];
            // let rango_dias = ObtenerRango();
            // console.log(rango_dias);
            let timbresEmpleado = await ListaTimbresDiarioToEmpleado(hoy)
            console.log(timbresEmpleado);

        }
        console.log('======================================');


    }, 1000000);
}

