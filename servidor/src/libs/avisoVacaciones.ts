import { enviarMail, email, servidor, puerto, Credenciales }
    from './settingsMail';
import pool from '../database';


const HORA_ENVIO_VACACION_AUTOMATICO = 23;
const HORA_ENVIO_AVISO_CINCO_DIAS = 0;
const HORA_ENVIO_AVISO_DOS_DIAS = 1;

function sumaDias(fecha: Date, dias: number) {
    fecha.setDate(fecha.getDate() + dias);
    return fecha;
}

function sumaYear(fecha: Date, anio: number) {
    fecha.setFullYear(fecha.getFullYear() + anio);
    return fecha;
}

function DescripcionPeriodo() {
    var f = new Date();
    let peri = 'Periodo ' + f.getFullYear() + ' - ' + (f.getFullYear() + 1);
    return peri
}

async function RegimenEmpleado(idRegimen: number): Promise<any> {
    let consulta = await pool.query(
        `
        SELECT * FROM ere_cat_regimenes WHERE id = $1
        `
        , [idRegimen]);
    return consulta.rows[0];
}

// funcion para calcular cuantos años lleva esa persona trabajando en la empresa
async function AniosEmpleado(idEmpleado: number): Promise<number> {

    var f = new Date();
    f.setUTCHours(f.getHours());
    let anioHoy = f.toJSON().split("-")[0];

    let anioInicio: string = await pool.query(
        `
        SELECT pv.fecha_inicio 
        FROM eu_empleado_contratos co, mv_periodo_vacacion pv 
        WHERE co.id_empleado = $1 AND pv.id_empleado_contrato = co.id 
        ORDER BY pv.fecha_inicio ASC limit 1
        `
        , [idEmpleado]).then((result: any) => {
            return JSON.stringify(result.rows[0].fec_inicio);
        });
    let anioPresente: string = await pool.query(
        `
        SELECT pv.fecha_final 
        FROM eu_empleado_contratos co, mv_periodo_vacacion pv
        WHERE co.id_empleado = $1 AND pv.id_empleado_contrato = co.id 
            AND CAST(pv.fecha_final AS VARCHAR) like $2 || \'%\'
        `
        , [idEmpleado, anioHoy]).then((result: any) => {
            return JSON.stringify(result.rows[0].fec_final);
        });
    const total = parseInt(anioPresente.slice(1, 5)) - parseInt(anioInicio.slice(1, 5));

    return total;
}

async function ObtenerIdEmpleado(idContrato: number): Promise<any> {
    let id_empleado =
        await pool.query(
            `
            SELECT e.id 
            FROM eu_empleado_contratos co, eu_empleados e 
            WHERE co.id = $1 AND co.id_empleado = e.id AND e.estado = 1 LIMIT 1
            `
            , [idContrato])
            .then(async (result: any) => {
                let id = await result.rows.map((obj: any) => { return obj.id });
                return id[0];
            });
    return id_empleado;
}

// CREA los nuevos peridodos automaticamente modelando los datos necesarios
async function CrearNuevoPeriodo(Obj: any, descripcion: string, dia: Date, anio: Date) {
    // console.log(Obj);

    var id_empleado = await ObtenerIdEmpleado(Obj.id_empl_contrato);
    // console.log('id_empleado ===>', id_empleado);
    var regimen = await RegimenEmpleado(Obj.id_regimen);
    // console.log('DataRegimen ===>', regimen);
    var year = await AniosEmpleado(id_empleado);
    // console.log('Calculos años ===>', year);

    var antiguedad = 0;
    if (year >= regimen.anio_antiguedad) {
        antiguedad = regimen.dia_incr_antiguedad
    }

    // console.log(nuevo);
    await pool.query(
        `
        INSERT INTO mv_periodo_vacacion (id_empleado_contrato, descripcion, dia_vacacion, dia_antiguedad, estado, 
            fecha_inicio, fecha_final, dia_perdido, horas_vacaciones, minutos_vacaciones) 
        VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10 )
        `
        ,
        [Obj.id_empl_contrato, descripcion, regimen.dia_anio_vacacion, antiguedad, 1, dia, anio, Obj.dia_perdido,
        Obj.horas_vacaciones, Obj.minutos_vacaciones])
        .then(() => {
            console.log('Registros insertados');
        }).catch((err: any) => {
            console.log('Error al insertar registro ===>', err);
        });
}

async function PeriVacacionHoy(fechaHoy: string) {
    // consulta para q devuelva los periodos de vacaciones q finalizan el dia de hoy ******* y si esta o no activo el empleado ===> Activo = 1; Inactivo = 2;
    // let expira_peri_hoy = await pool.query('select pv.id, pv.id_empl_contrato, pv.dia_vacacion, pv.dia_antiguedad, pv.fec_inicio, pv.fec_final, pv.dia_perdido, pv.horas_vacaciones, pv.min_vacaciones, co.id_regimen from mv_periodo_vacacion pv, eu_empleado_contratos co, eu_empleados e where CAST(pv.fec_final AS VARCHAR) like $1 || \'%\' AND pv.estado = 1 AND co.id = pv.id_empl_contrato AND co.id_empleado = e.id AND e.estado = 1', [fechaHoy]);    
    let expira_peri_hoy = await pool.query(
        `
        SELECT pv.id, pv.id_empleado_contrato, pv.dia_vacacion, pv.dia_antiguedad, pv.fecha_final, pv.dia_perdido, 
        pv.horas_vacaciones, pv.minutos_vacaciones, co.id_regimen 
        FROM mv_periodo_vacacion pv, eu_empleado_contratos co, eu_empleados e 
        WHERE CAST(pv.fecha_final AS VARCHAR) like $1 || \'%\' AND co.id = pv.id_empleado_contrato 
            AND co.id_empleado = e.id AND e.estado = 1
        `
        , [fechaHoy]);
    return expira_peri_hoy.rows;
}

// METODO PARA VERIFICAR SI FINALIZO SU PERIODO DE VACACIONES Y CREAR UN NUEVO PERIODO AUTOMATICAMENTE.
export const Peri_Vacacion_Automatico = function () {
    setInterval(async () => {
        var f = new Date();
        console.log(f.getHours());

        if (f.getHours() === HORA_ENVIO_VACACION_AUTOMATICO) {

            f.setUTCHours(f.getHours()) //para igualar la zona horaria al imprimir la fecha en formato JSON

            var fechaHoy = f.toJSON().split("T")[0];
            let periodos = await PeriVacacionHoy(fechaHoy);

            if (periodos.length > 0) {
                var descripcion = DescripcionPeriodo();
                var diaIncrementado = sumaDias(f, 1);

                var f1 = new Date();
                f1.setUTCHours(f1.getHours())
                var d1 = sumaDias(f1, 1);
                var yearIncrementado = sumaYear(d1, 1);

                periodos.forEach((obj: any) => {
                    CrearNuevoPeriodo(obj, descripcion, diaIncrementado, yearIncrementado);
                });
            }

        }
    }, 3600000)
}

// Metodo para verificar si debe tomar vacaciones. y enviar un aviso al correo electrónico.  Tiempo de aviso 5 dias antes. 
export const beforeFiveDays = function () {
    setInterval(async () => {

        const date = new Date();
        console.log(date.toLocaleDateString());
        console.log(date.toLocaleTimeString());
        const hora = date.getHours();
        console.log(hora);

        const diaIncrementado = sumaDias(date, 5).toLocaleDateString().split("T")[0];
        console.log(diaIncrementado);

        if (hora === HORA_ENVIO_AVISO_CINCO_DIAS) {

            const avisoVacacion = await pool.query(
                `
                SELECT pv.fecha_inicio, pv.fecha_final, e.nombre, e.apellido, e.correo 
                FROM mv_periodo_vacacion AS pv, eu_empleado_contratos AS ec, eu_empleados AS e 
                WHERE pv.id_empleado_contrato = ec.id AND ec.id_empleado = e.id 
                    AND pv.fecha_inicio = $1
                `
                , [diaIncrementado]);
            console.log(avisoVacacion.rows);
            if (avisoVacacion.rowCount > 0) {
                // Enviar mail a todos los que nacieron en la fecha seleccionada
                avisoVacacion.rows.forEach((obj: any) => {
                    Credenciales(0);

                    let data = {
                        to: obj.correo,
                        from: email,
                        subject: 'AVISO TOMA DE VACACIONES',
                        html:
                            `
                            <h2> <b> ¡Tienes 5 días para tomar vacaciones! </b> </h2>
                            <p> 
                                <b>${obj.nombre.split(" ")[0]} ${obj.apellido.split(" ")[0]}</b> se le da un aviso de que 
                                en 5 días, usted debe tomar vacaciones como esta prestablecido desde el día 
                                <b> ${obj.fecha_inicio.toLocaleDateString().split("T")[0]} </b> hasta el dia 
                                <b>${obj.fecha_final.toLocaleDateString().split("T")[0]}</b>.
                            </p>
                            `
                    };
                    console.log(data)
                    let port = 465;

                    if (puerto != null && puerto != '') {
                        port = parseInt(puerto);
                    }

                    enviarMail(servidor, port)
                })
            }
        }
    }, 3600000);
}

// Metodo para verificar si debe tomar vacaciones. y enviar un aviso al correo electrónico.  Tiempo de aviso 2 dias antes. 
export const beforeTwoDays = function () {
    setInterval(async () => {

        const date = new Date();
        const hora = date.getHours();
        const diaIncrementado = sumaDias(date, 2).toLocaleDateString().split("T")[0];

        if (hora === HORA_ENVIO_AVISO_DOS_DIAS) {
            const avisoVacacion = await pool.query(
                `
                SELECT pv.fecha_inicio, pv.fecha_final, e.nombre, e.apellido, e.correo 
                FROM mv_periodo_vacacion AS pv, eu_empleado_contratos AS ec, eu_empleados AS e 
                WHERE pv.id_empleado_contrato = ec.id AND ec.id_empleado = e.id 
                    AND pv.fecha_inicio = $1
                `
                , [diaIncrementado]);
            console.log(avisoVacacion.rows);
            if (avisoVacacion.rowCount > 0) {
                // Enviar mail a todos los que nacieron en la fecha seleccionada
                avisoVacacion.rows.forEach((obj: any) => {

                    Credenciales(0);
                    let data = {
                        to: obj.correo,
                        from: email,
                        subject: 'AVISO TOMA DE VACACIONES',
                        html:
                            `
                            <h2> <b> ¡Tienes 2 días para tomar vacaciones! </b> </h2>
                            <p> <b>${obj.nombre.split(" ")[0]} ${obj.apellido.split(" ")[0]}</b> se le da un aviso de que 
                                en 2 días, usted debe tomar vacaciones como esta prestablecido desde el dia 
                                <b> ${obj.fecha_inicio.toLocaleDateString().split("T")[0]} </b> hasta el dia 
                                <b>${obj.fecha_final.toLocaleDateString().split("T")[0]}</b>.
                            </p>
                            `
                    };
                    console.log(data)
                    let port = 465;

                    if (puerto != null && puerto != '') {
                        port = parseInt(puerto);
                    }
                    enviarMail(servidor, port)
                })
            }
        }
    }, 3600000);
}