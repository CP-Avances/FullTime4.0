import { Request, Response } from "express";
import path from 'path';
import { ObtenerRutaLeerPlantillas } from '../../libs/accesoCarpetas';
import excel from 'xlsx';
import pool from '../../database';
import moment from "moment";

class PlanificacionHorariaControlador {

    //METODO PARA VERIFICAR LOS DATOS DE LA PLANTILLA DE PLANIFICACION HORARIA
    public async VerificarDatosPlanificacionHoraria(req: Request, res: Response) {
        const documento = req.file?.originalname;

        let separador = path.sep;
        let ruta = ObtenerRutaLeerPlantillas() + separador + documento;
        const workbook = excel.readFile(ruta);
        const sheet_name_list = workbook.SheetNames;
        const plantillaPlanificacionHoraria: any = excel.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
         
        const plantillaPlanificacionHorariaFiltrada = plantillaPlanificacionHoraria.filter((data: any) => {
            return Object.keys(data).length > 1;
        });

        let plantillaPlanificacionHorariaEstructurada = plantillaPlanificacionHorariaFiltrada.map((data: any) => {
            let nuevoObjeto: { usuario: string, dias: { [key: string]: { horarios: { valor: string, observacion?: string }[] } } } = { usuario: data.USUARIO, dias: {} };
        
            for (let propiedad in data) {
                if (propiedad !== 'usuario') {
                    nuevoObjeto.dias[propiedad] = { horarios: data[propiedad].split(',').map((horario: string) => ({ codigo: horario })) };
                }
            }
        
            return nuevoObjeto;
        });
        

        for (const [index, data] of plantillaPlanificacionHorariaEstructurada.entries() ) {
            let { usuario } = data;

            if (!usuario) {
                data.observacion = 'Datos no registrados: USUARIO';
                continue;
            }

            // VERIFICAR USUARIO DUPLICADO
            if (plantillaPlanificacionHorariaEstructurada.filter((d: any) => d.usuario === usuario).length > 1) {
                data.observacion = 'Usuario duplicado';
                continue;
            }

            // VERIFICAR EXISTENCIA DE USUARIO
            const usuarioVerificado = await VerificarUsuario(usuario);
            if (!usuarioVerificado) {
                data.observacion = 'Usuario no valido';
                continue;
            } else {
                data.codigo_usuario = usuarioVerificado.codigo;
            }


            // VERIFICAR HORARIOS
            data.dias = await VerificarHorarios(data.dias);

            // VERIFICAR SOBREPOSICION DE HORARIOS
           await VerificarSobreposicionHorariosPlantilla(data.dias);

           // CONSULTAR PLANIFICACION HORARIA DEL USUARIO EN LA BASE DE DATOS
           

            
        }


    
        res.json({plantillaPlanificacionHoraria: plantillaPlanificacionHorariaEstructurada});
    }

    //METODO PARA CARGAR LA PLANIFICACION HORARIA
    public CargarPlanificacionHoraria(formData: any) {
        return null;
    }

}

// FUNCION PARA VERIFICAR EXISTENCIA DE USUARIO EN LA BASE DE DATOS
async function VerificarUsuario(cedula: string): Promise<any>{
    const usuario = await pool.query('SELECT * FROM empleados WHERE LOWER(cedula) = $1',
     [cedula.toLowerCase()]);

    return usuario.rowCount > 0 ? usuario.rows[0] : null;
    
}

async function VerificarHorarios(dias: any) {
    for (const [dia, { horarios }] of Object.entries(dias as { [key: string]: { horarios: any[] } })) {
        let horariosValidos: any[] = [];
        let horariosNoValidos: string[] = [];
        
        // VERIFICAR HORARIO DUPLICADO SI EXISTE PONER EN HORARIO OBSERVACION 'HORARIO DUPLICADO'
        const horariosDuplicados = horarios.filter((horario, index) => horarios.findIndex((h) => h.CODIGO === horario.CODIGO) !== index);
        if (horariosDuplicados.length > 0) {
            horariosDuplicados.forEach((horario) => horario.observacion = 'Horario duplicado');
            dias[dia].observacion = `Horarios duplicados: ${horariosDuplicados.map(horario => horario.CODIGO).join(', ')}`;
            continue;
        }

        for (let i = 0; i < horarios.length; i++) {
            const HORARIO = horarios[i];
            const horarioVerificado = await VerificarHorario(HORARIO.CODIGO); 
            if (!horarioVerificado[0]) {
                horariosNoValidos.push(HORARIO);
                HORARIO.observacion = 'Horario no valido';
        
                // AÑADIR OBSERVACION A HORARIO
                dias[dia].horarios[i].observacion = 'Horario no valido';
                
            } else {
                // ANADIR PROPIEDADES DE HORARIOVERIFICADO A DIAS[DIA].HORARIOS[I]
                dias[dia].horarios[i].ID = horarioVerificado[1].id;
                dias[dia].horarios[i].NOMBRE = horarioVerificado[1].nombre;
                dias[dia].horarios[i].DIA = dia;
                dias[dia].horarios[i].HORA_TRABAJA = horarioVerificado[1].hora_trabajo;
                dias[dia].horarios[i].TIPO = horarioVerificado[1].default_;
                dias[dia].horarios[i].observacion = 'OK';
                
            }
        }
        
        dias[dia].observacion = horariosNoValidos.length > 0 ? `Horarios no validos: ${horariosNoValidos.join(', ')}` : 'OK';

    }
    return dias;
}

// FUNCION PARA VERIFICAR EXISTENCIA DE HORARIO EN LA BASE DE DATOS
async function VerificarHorario(CODIGO: any): Promise<[boolean,any]>{
    const horario = await pool.query('SELECT * FROM cg_horarios WHERE LOWER(codigo) = $1',
     [CODIGO.toLowerCase()]);

    // SI EXISTE HORARIO VERIFICAR SI horario.hora_trabajo este en formato hh:mm:ss
    const existe = horario.rowCount > 0;

    if(existe){
        const formatoHora = /^\d{2}:[0-5][0-9]:[0-5][0-9]$/;
        return [formatoHora.test(horario.rows[0].hora_trabajo), horario.rows[0]];
    }
    
    return [existe, null];
}

async function VerificarSobreposicionHorariosPlantilla(dias: any): Promise<boolean>{

    let horarios: any[] = [];
    let rangosSimilares: any = {};

    // OBTENER TODOS LOS HORARIOS DE LA PLANIFICACION HORARIA DE LA PLANTILLA QUE EN dias[dia].OBSERVACION = 'OK'
    for (const [dia, { horarios }] of Object.entries(dias as { [key: string]: { horarios: any[] } })) {
        if (dias[dia].observacion === 'OK') {
            for (let i = 0; i < horarios.length; i++) {
                const HORARIO = horarios[i];
                if (HORARIO.observacion === 'OK') {
                    console.log("HORARIO",HORARIO);
                    const detalles = await pool.query('SELECT * FROM deta_horarios WHERE id_horario = $1', [HORARIO.ID]);

                    HORARIO.entrada = detalles.rows.find((detalle: any) => detalle.tipo_accion === 'E');
                    HORARIO.salida = detalles.rows.find((detalle: any) => detalle.tipo_accion === 'S');

                    let [diaSemana, fecha] = HORARIO.DIA.split(', ');
                    let [dia, mes, ano] = fecha.split('/');
                    let fechaFormateada = `${ano}-${mes}-${dia}`;
                    let fechaEntrada = moment(`${fechaFormateada} ${HORARIO.entrada.hora}`, 'YYYY-MM-DD HH:mm:ss').toDate();
                    HORARIO.entrada.fecha = fechaEntrada;
                    let fechaSalida = moment(`${fechaFormateada} ${HORARIO.salida.hora}`, 'YYYY-MM-DD HH:mm:ss').toDate();
                    if (HORARIO.salida.segundo_dia) {
                        fechaSalida = moment(fechaSalida).add(1, 'days').toDate();
                    } else if (HORARIO.salida.tercer_dia) {
                        fechaSalida = moment(fechaSalida).add(2, 'days').toDate();
                    }
                    HORARIO.salida.fecha = fechaSalida;
                    
                    horarios.push(HORARIO);
                }
            }
        }
    }

    
    if (horarios.length > 0) {
        // VERIFICAR SOBREPOSICIÓN DE HORARIOS
        for (let i = 0; i < horarios.length; i++) {
            for (let j = i + 1; j < horarios.length; j++) {
                const horario1 = horarios[i];
                const horario2 = horarios[j];
        
                // VERIFICAR SI LOS HORARIOS SE SOBREPONEN
                if ((horario2.entrada.fecha >= horario1.entrada.fecha && horario2.entrada.fecha <= horario1.salida.fecha) ||
                    (horario2.salida.fecha <= horario1.salida.fecha && horario2.salida.fecha >= horario1.entrada.fecha)) {

                        horario1.observacion = `Se sobrepone con el horario ${horario2.CODIGO} dia ${horario2.DIA}`;
                        horario2.observacion = `Se sobrepone con el horario ${horario1.CODIGO} dia ${horario1.CODIGO}`; // Existe una sobreposición
                        rangosSimilares[horario1.DIA] = rangosSimilares[horario1.DIA] ? [...rangosSimilares[horario1.DIA], horario1.CODIGO, horario2.CODIGO] : [horario1.CODIGO, horario2.CODIGO];
                    }
            }
        }

        // ACTUALIZAR DIAS[DIA].OBSERVACION
        for (const dia in rangosSimilares) {
            dias[dia].observacion = `Rangos similares: ${[...new Set(rangosSimilares[dia])].join(', ')}`;
        }
    }
    
    return dias;
}

export const PLANIFICACION_HORARIA_CONTROLADOR = new PlanificacionHorariaControlador();

export default PLANIFICACION_HORARIA_CONTROLADOR;