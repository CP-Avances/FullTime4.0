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
        const plantillaPlanificacionHorariaHeaders: any = excel.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]], { header: 1 });
       
        // OBTENER FECHA DE LA PLANTILLA
        const segundaColumna = plantillaPlanificacionHorariaHeaders[0][1];

        let [diaSemana, fecha] = segundaColumna.split(', ');
        let [dia, mes, ano] = fecha.split('/');
        let fechaFormateada: string = `${dia}/${mes}/${ano}`;
        let fechaInicial: string;
        let fechaFinal: string;

        try {
            let fechaEntrada = moment.utc(`${fechaFormateada}`, 'DD/MM/YYYY').toDate();

            // RESTAR 1 DIA A LA FECHA DE ENTRADA
            fechaInicial = moment.utc(fechaEntrada).subtract(1, 'days').format('YYYY-MM-DD');

            // SUMAR 1 MES A LA FECHA DE ENTRADA
            fechaFinal = moment.utc(fechaEntrada).add(1, 'months').format('YYYY-MM-DD');
  
        } catch (error) {
            res.json({error: 'Fecha no valida'});
            return;
        }

        // FILTRAR PLANTILLA PLANIFICACION HORARIA PARA ELIMINAR LOS REGISTROS VACIOS
        const plantillaPlanificacionHorariaFiltrada = plantillaPlanificacionHoraria.filter((data: any) => {
            return Object.keys(data).length > 1;
        });

        // ESTRUCTURAR PLANTILLA PLANIFICACION HORARIA
        let plantillaPlanificacionHorariaEstructurada = plantillaPlanificacionHorariaFiltrada.map((data: any) => {
            let nuevoObjeto: { usuario: string, dias: { [key: string]: { horarios: { valor: string, observacion?: string }[] } } } = { usuario: data.USUARIO, dias: {} };
            
            // AGREGAR COLUMNAS DE LA PLANTILLA COMO DIAS AL HORARIO
            for (let propiedad in data) {
                if (propiedad !== 'USUARIO') {
                    let [diaSemana, fecha] = propiedad.split(', ');
                    let [dia, mes, ano] = fecha.split('/');
                    let fechaFormateada = `${ano}-${mes}-${dia}`;
                    nuevoObjeto.dias[fechaFormateada] = { horarios: data[propiedad].split(',').map((horario: string) => ({ codigo: horario })) };
                }
            }
         
            return nuevoObjeto;
        });

        
        // VERIFICAR USUARIO, HORARIOS Y SOBREPOSICION DE HORARIOS
        for (const [index, data] of plantillaPlanificacionHorariaEstructurada.entries() ) {
            let { usuario } = data;

            usuario = usuario.toString();

            // VERIFICAR DATO REQUERIDO USUARIO
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

            if (!usuarioVerificado[0]) {
                data.observacion = usuarioVerificado[2];
                continue;
            } else {
                data.codigo_usuario = usuarioVerificado[1].codigo;
                data.id_usuario = usuarioVerificado[1].id;
                data.id_empl_cargo = usuarioVerificado[1].id_cargo;
                data.nombre_usuario = `${usuarioVerificado[1].nombre} ${usuarioVerificado[1].apellido}`;
                data.hora_trabaja = ConvertirHorasAMinutos(usuarioVerificado[1].hora_trabaja);
            }

            // VERIFICAR HORARIOS
            const datosVerificacionHorarios: DatosVerificacionHorarios = {
                dias: data.dias,
                fecha_inicio: fechaInicial,
                fecha_final: fechaFinal,
                id_usuario: data.id_usuario,
                hora_trabaja: data.hora_trabaja
            };

            data.dias = await VerificarHorarios(datosVerificacionHorarios);

            // VERIFICAR SOBREPOSICION DE HORARIOS DE LA PLANTILLA
            const datosVerificacionSobreposicionHorarios: DatosVerificacionSuperposicionHorarios = {
                dias: data.dias,
                codigo_usuario: data.codigo_usuario,
                fecha_inicio: fechaInicial,
                fecha_final: fechaFinal
            };

            data.dias = await VerificarSuperposicionHorarios(datosVerificacionSobreposicionHorarios); 
        }


        const fechaInicioMes = moment.utc(fechaInicial).add(1, 'days').format('YYYY-MM-DD');
        const fechaFinalMes = moment.utc(fechaFinal).subtract(1, 'days').format('YYYY-MM-DD');

        res.json({planificacionHoraria: plantillaPlanificacionHorariaEstructurada, fechaInicioMes, fechaFinalMes});
    }

    //METODO PARA REGISTRAR LA PLANIFICACION HORARIA EN LA BASE DE DATOS
    public async RegistrarPlanificacionHoraria(req: Request, res: Response) {
       
       try {
        const planificacionHoraria = req.body;

        const horarioDefaultLibre = await ConsultarHorarioDefault('DEFAULT-LIBRE');
        const horarioDefaultFeriado = await ConsultarHorarioDefault('DEFAULT-FERIADO');

        // CREAR PLANIFICACION HORARIA
        for (const data of planificacionHoraria) {
            for (const [dia, { horarios }] of Object.entries(data.dias as { [key: string]: { horarios: any[] } })) {
                for (const horario of horarios) {

                    let planificacion: Planificacion;
                    
                    let entrada: Plan;
                    let inicioAlimentacion: Plan | null = null;
                    let finAlimentacion: Plan | null = null;
                    let salida: Plan;



                    if (horario.observacion === 'OK') {

                        const origen = horario.tipo === 'N' ? horario.tipo : (horario.tipo === 'FD' ? 'DFD' : 'DL');
                        
                        entrada = {
                            codigo: data.codigo_usuario,
                            id_empl_cargo: data.id_empl_cargo,
                            id_horario: horario.id,
                            fec_horario: horario.dia,
                            fec_hora_horario: horario.entrada.fec_hora_horario,
                            tolerancia: horario.entrada.minu_espera == null ? 0 : horario.entrada.minu_espera,
                            id_det_horario: horario.entrada.id,
                            tipo_entr_salida: 'E',
                            tipo_dia: horario.tipo,
                            salida_otro_dia: horario.entrada.segundo_dia ? 1 : (horario.entrada.tercer_dia ? 2 : 0),
                            min_antes: horario.entrada.min_antes,
                            min_despues: horario.entrada.min_despues,
                            estado_origen: origen,
                            min_alimentacion: horario.min_alimentacion
                        };


                        if (horario.inicioAlimentacion) {
                            inicioAlimentacion = {
                                codigo: data.codigo_usuario,
                                id_empl_cargo: data.id_empl_cargo,
                                id_horario: horario.id,
                                fec_horario: horario.dia,
                                fec_hora_horario: horario.inicioAlimentacion.fec_hora_horario,
                                tolerancia: horario.inicioAlimentacion.minu_espera == null ? 0 : horario.inicioAlimentacion.minu_espera,
                                id_det_horario: horario.inicioAlimentacion.id,
                                tipo_entr_salida: 'I/A',
                                tipo_dia: horario.tipo,
                                salida_otro_dia: horario.inicioAlimentacion.segundo_dia ? 1 : (horario.inicioAlimentacion.tercer_dia ? 2 : 0),
                                min_antes: horario.inicioAlimentacion.min_antes,
                                min_despues: horario.inicioAlimentacion.min_despues,
                                estado_origen: origen,
                                min_alimentacion: horario.min_alimentacion
                            };
                        }

                        if (horario.finAlimentacion) {
                            finAlimentacion = {
                                codigo: data.codigo_usuario,
                                id_empl_cargo: data.id_empl_cargo,
                                id_horario: horario.id,
                                fec_horario: horario.dia,
                                fec_hora_horario: horario.finAlimentacion.fec_hora_horario,
                                tolerancia: horario.finAlimentacion.minu_espera == null ? 0 : horario.finAlimentacion.minu_espera,
                                id_det_horario: horario.finAlimentacion.id,
                                tipo_entr_salida: 'F/A',
                                tipo_dia: horario.tipo,
                                salida_otro_dia: horario.finAlimentacion.segundo_dia ? 1 : (horario.finAlimentacion.tercer_dia ? 2 : 0),
                                min_antes: horario.finAlimentacion.min_antes,
                                min_despues: horario.finAlimentacion.min_despues,
                                estado_origen: origen,
                                min_alimentacion: horario.min_alimentacion
                            };
                        }

                        salida = {
                            codigo: data.codigo_usuario,
                            id_empl_cargo: data.id_empl_cargo,
                            id_horario: horario.id,
                            fec_horario: horario.dia,
                            fec_hora_horario: horario.salida.fec_hora_horario,
                            tolerancia: horario.salida.minu_espera == null ? 0 : horario.salida.minu_espera,
                            id_det_horario: horario.salida.id,
                            tipo_entr_salida: 'S',
                            tipo_dia: horario.tipo,
                            salida_otro_dia: horario.salida.segundo_dia ? 1 : (horario.salida.tercer_dia ? 2 : 0),
                            min_antes: horario.salida.min_antes,
                            min_despues: horario.salida.min_despues,
                            estado_origen: origen,
                            min_alimentacion: horario.min_alimentacion
                        };

                        planificacion = {
                            entrada, 
                            inicioAlimentacion, 
                            finAlimentacion, 
                            salida
                        };

                        await CrearPlanificacionHoraria(planificacion);
                        
                    } else if (horario.observacion === 'DEFAULT-LIBRE')  {

                        console.log('DEFAULT-LIBRE', horario.dia, horario.observacion);

                        // VERIFICIAR SI YA ESTA REGISTRADO EL HORARIO DEFAULT-LIBRE PARA EL USUARIO EN ESA FECHA
                        const horarioRegistrado = await pool.query(`
                            SELECT * FROM plan_general WHERE codigo = $1 AND fec_horario = $2 AND id_horario = $3
                        `, [data.codigo_usuario, horario.dia, horarioDefaultLibre.entrada.id_horario]);

                        if (horarioRegistrado.rowCount > 0) {
                            continue;
                        }


                        const fecha_horario_entrada = `${horario.dia} ${horarioDefaultLibre.entrada.hora}`;
                        const fecha_horario_salida = `${horario.dia} ${horarioDefaultLibre.salida.hora}`;

                        entrada = {
                            codigo: data.codigo_usuario,
                            id_empl_cargo: data.id_empl_cargo,
                            id_horario: horarioDefaultLibre.entrada.id_horario,
                            fec_horario: horario.dia,
                            fec_hora_horario: fecha_horario_entrada,
                            tolerancia: horarioDefaultLibre.entrada.minu_espera == null ? 0 : horarioDefaultLibre.entrada.minu_espera,
                            id_det_horario: horarioDefaultLibre.entrada.id_det_horario,
                            tipo_entr_salida: 'E',
                            tipo_dia: horarioDefaultLibre.entrada.default_,
                            salida_otro_dia: horarioDefaultLibre.entrada.segundo_dia ? 1 : (horarioDefaultLibre.entrada.tercer_dia ? 2 : 0),
                            min_antes: horarioDefaultLibre.entrada.min_antes,
                            min_despues: horarioDefaultLibre.entrada.min_despues,
                            estado_origen: 'DL',
                            min_alimentacion: horarioDefaultLibre.entrada.min_almuerzo
                        };


                        salida = {
                            codigo: data.codigo_usuario,
                            id_empl_cargo: data.id_empl_cargo,
                            id_horario: horarioDefaultLibre.salida.id_horario,
                            fec_horario: horario.dia,
                            fec_hora_horario: fecha_horario_salida,
                            tolerancia: horarioDefaultLibre.salida.minu_espera == null ? 0 : horarioDefaultLibre.salida.minu_espera,
                            id_det_horario: horarioDefaultLibre.salida.id_det_horario,
                            tipo_entr_salida: 'S',
                            tipo_dia: horarioDefaultLibre.salida.default_,
                            salida_otro_dia: horarioDefaultLibre.salida.segundo_dia ? 1 : (horarioDefaultLibre.salida.tercer_dia ? 2 : 0),
                            min_antes: horarioDefaultLibre.salida.min_antes,
                            min_despues: horarioDefaultLibre.salida.min_despues,
                            estado_origen: 'DL',
                            min_alimentacion: horarioDefaultLibre.salida.min_almuerzo
                        };

                        planificacion = {
                            entrada, 
                            inicioAlimentacion, 
                            finAlimentacion, 
                            salida
                        };

                        await CrearPlanificacionHoraria(planificacion);

                    } else if (horario.observacion === 'DEFAULT-FERIADO') {

                        // VERIFICIAR SI YA ESTA REGISTRADO EL HORARIO DEFAULT-FERIADO PARA EL USUARIO EN ESA FECHA
                        const horarioRegistrado = await pool.query(`
                            SELECT * FROM plan_general WHERE codigo = $1 AND fec_horario = $2 AND id_horario = $3
                        `, [data.codigo_usuario, horario.dia, horarioDefaultFeriado.entrada.id_horario]);

                        if (horarioRegistrado.rowCount > 0) {
                            continue;
                        }


                        const fecha_horario_entrada = `${horario.dia} ${horarioDefaultFeriado.entrada.hora}`;
                        const fecha_horario_salida = `${horario.dia} ${horarioDefaultFeriado.salida.hora}`;

                        entrada = {
                            codigo: data.codigo_usuario,
                            id_empl_cargo: data.id_empl_cargo,
                            id_horario: horarioDefaultFeriado.entrada.id_horario,
                            fec_horario: horario.dia,
                            fec_hora_horario: fecha_horario_entrada,
                            tolerancia: horarioDefaultFeriado.entrada.minu_espera == null ? 0 : horarioDefaultFeriado.entrada.minu_espera,
                            id_det_horario: horarioDefaultFeriado.entrada.id_det_horario,
                            tipo_entr_salida: 'E',
                            tipo_dia: horarioDefaultFeriado.entrada.default_,
                            salida_otro_dia: horarioDefaultFeriado.entrada.segundo_dia ? 1 : (horarioDefaultFeriado.entrada.tercer_dia ? 2 : 0),
                            min_antes: horarioDefaultFeriado.entrada.min_antes,
                            min_despues: horarioDefaultFeriado.entrada.min_despues,
                            estado_origen: 'DFD',
                            min_alimentacion: horarioDefaultFeriado.entrada.min_almuerzo
                        };


                        salida = {
                            codigo: data.codigo_usuario,
                            id_empl_cargo: data.id_empl_cargo,
                            id_horario: horarioDefaultFeriado.salida.id_horario,
                            fec_horario: horario.dia,
                            fec_hora_horario: fecha_horario_salida,
                            tolerancia: horarioDefaultFeriado.salida.minu_espera == null ? 0 : horarioDefaultFeriado.salida.minu_espera,
                            id_det_horario: horarioDefaultFeriado.salida.id_det_horario,
                            tipo_entr_salida: 'S',
                            tipo_dia: horarioDefaultFeriado.salida.default_,
                            salida_otro_dia: horarioDefaultFeriado.salida.segundo_dia ? 1 : (horarioDefaultFeriado.salida.tercer_dia ? 2 : 0),
                            min_antes: horarioDefaultFeriado.salida.min_antes,
                            min_despues: horarioDefaultFeriado.salida.min_despues,
                            estado_origen: 'DFD',
                            min_alimentacion: horarioDefaultFeriado.salida.min_almuerzo
                        };

                        planificacion = {
                            entrada, 
                            inicioAlimentacion, 
                            finAlimentacion, 
                            salida
                        };

                        await CrearPlanificacionHoraria(planificacion);

                    }
                }
            }
        }

        return res.status(200).jsonp({ message: 'correcto' })
        
       } catch (error) {
        return res.status(400).jsonp({ message: error });
        
       }

    }

}

// FUNCION PARA VERIFICAR EXISTENCIA DE USUARIO EN LA BASE DE DATOS
async function VerificarUsuario(cedula: string): Promise<[boolean, any, string]> {
    try {
        let observacion = '';
        let usuarioValido = false;
    
        const usuario = await pool.query(`
            SELECT e.*, dae.id_cargo, ec.hora_trabaja 
            FROM empleados e 
            LEFT JOIN datos_actuales_empleado dae ON e.cedula = dae.cedula 
            LEFT JOIN empl_cargos ec ON dae.id_cargo = ec.id 
            WHERE LOWER(e.cedula) = $1
        `, [cedula.toLowerCase()]);
    
        if (usuario.rowCount === 0) {
            observacion = 'Usuario no valido';
        } else if (usuario.rows[0].id_cargo === null) {
            observacion = 'No tiene un cargo asignado';
        } else {
            usuarioValido = true;
        }
    
        return [usuarioValido, usuario.rows[0], observacion];
    } catch (error) {
        throw error;
    }
}

async function VerificarHorarios(datos: DatosVerificacionHorarios) :Promise<any> {

    try {
        let { dias, fecha_inicio, fecha_final, id_usuario, hora_trabaja } = datos;
        // CONSULTAR FERIADOS
        const feriados = await ConsultarFeriados(fecha_inicio, fecha_final, id_usuario);
    
        for (const [dia, { horarios }] of Object.entries(dias as { [key: string]: { horarios: any[] } })) {
            let horariosNoValidos: string[] = [];
            let horasTotales = 0;
            
            // VERIFICAR HORARIO DUPLICADO SI EXISTE PONER EN HORARIO OBSERVACION 'HORARIO DUPLICADO'
            const horariosDuplicados = horarios.filter((horario, index) => horarios.findIndex((h) => h.codigo === horario.codigo) !== index);
            if (horariosDuplicados.length > 0) {
                dias[dia].observacion = `Horarios duplicados`;
                dias[dia].observacion2 = `Códigos de horarios duplicados: ${horariosDuplicados.map((horario) => horario.codigo).join(', ')}`;
                continue;
            }
    
            // VERIFICAR SI LA EL DIAS[DIA] ES FERIADO
            let esFeriado = feriados ? feriados.find((feriado: any) => feriado.fecha === dia) : false;
    
            for (let i = 0; i < horarios.length; i++) {
                const horario = horarios[i];
                horario.codigo = horario.codigo.toString();
                const horarioVerificado = await VerificarHorario(horario.codigo); 
    
                if (!horarioVerificado[0]) {
                    horariosNoValidos.push(horario);
            
                    // AÑADIR OBSERVACION A HORARIO
                    dias[dia].horarios[i].observacion = `Horario no valido`;
                    
                } else {
                    // ANADIR PROPIEDADES DE HORARIOVERIFICADO A DIAS[DIA].HORARIOS[I]
                    dias[dia].horarios[i].id = horarioVerificado[1].id;
                    dias[dia].horarios[i].nombre = horarioVerificado[1].nombre;
                    dias[dia].horarios[i].dia = dia;
                    dias[dia].horarios[i].hora_trabaja = horarioVerificado[1].hora_trabajo;
                    dias[dia].horarios[i].tipo = horarioVerificado[1].default_;
                    dias[dia].horarios[i].min_alimentacion = horarioVerificado[1].min_almuerzo;
                    
                    
                    // SI ES FERIADO Y TIPO DE HORARIO ES LABORABLE AÑADIR OBSERVACION
                    if (esFeriado && dias[dia].horarios[i].tipo === 'N') {   
                        dias[dia].horarios[i].observacion = `Horario no valido para día feriado`;
                        dias[dia].observacion3 = `Este día no permite horarios laborables`;
                        dias[dia].horarios[i].default = 'DEFAULT-FERIADO';    
                        horariosNoValidos.push(horario);
                    } else {
                        dias[dia].horarios[i].observacion = 'OK';
                        horasTotales += ConvertirHorasAMinutos(horarioVerificado[1].hora_trabajo);
                    }
                     
                }
            }
            
            dias[dia].observacion = horariosNoValidos.length > 0 ? `Horarios no validos` : 'OK';
            
            // VERIFICAR HORAS TOTALES DE HORARIOS
            if (horasTotales > hora_trabaja) {
                const horas = ConvertirMinutosAHoras(horasTotales);
                dias[dia].observacion4 = `Jornada superada: ${horas} tiempo total`;
            }
            
        }
        return dias;
    } catch (error) {
        throw error;
    }
}

// FUNCION PARA VERIFICAR EXISTENCIA DE HORARIO EN LA BASE DE DATOS
async function VerificarHorario(codigo: any): Promise<[boolean,any]>{
    try {
        const horario = await pool.query('SELECT * FROM cg_horarios WHERE LOWER(codigo) = $1',
         [codigo.toLowerCase()]);
    
        // SI EXISTE HORARIO VERIFICAR SI horario.hora_trabajo este en formato hh:mm:ss
        const existe = horario.rowCount > 0;
    
        if(existe){
            const formatoHora = /^\d{2}:[0-5][0-9]:[0-5][0-9]$/;
            return [formatoHora.test(horario.rows[0].hora_trabajo), horario.rows[0]];
        }
        
        return [existe, null];
    } catch (error) {
        throw error;
    }
}

// FUNCION PARA VERIFICAR SOBREPOSICION DE HORARIOS
async function VerificarSuperposicionHorarios(datos: DatosVerificacionSuperposicionHorarios): Promise<any>{

    try {
        let { dias, codigo_usuario, fecha_inicio, fecha_final } = datos;
    
        let horariosModificados: any[] = [];
        let horariosPlanificacion: any[] = [];
        let rangosSimilares: any = {};
    
        // OBTENER TODOS LOS HORARIOS DE LA PLANIFICACION HORARIA DE LA PLANTILLA QUE EN dias[dia].OBSERVACION = 'OK'
        for (const [dia, { horarios }] of Object.entries(dias as { [key: string]: { horarios: any[] } })) {
            if (dias[dia].observacion === 'OK') {
                for (let i = 0; i < horarios.length; i++) {
                    const horario = horarios[i];
                    if (horario.observacion === 'OK') {
                        const detalles = await pool.query('SELECT * FROM deta_horarios WHERE id_horario = $1', [horario.id]);
    
                        horario.entrada = detalles.rows.find((detalle: any) => detalle.tipo_accion === 'E');
                        horario.salida = detalles.rows.find((detalle: any) => detalle.tipo_accion === 'S');
    
                        horario.inicioAlimentacion = detalles.rows.find((detalle: any) => detalle.tipo_accion === 'I/A');
                        horario.finAlimentacion = detalles.rows.find((detalle: any) => detalle.tipo_accion === 'F/A');
    
                       
                        let fechaEntrada = moment.utc(`${horario.dia} ${horario.entrada.hora}`, 'YYYY-MM-DD HH:mm:ss').toDate();
                        horario.entrada.fecha = fechaEntrada;
                        horario.entrada.fec_hora_horario = `${horario.dia} ${horario.entrada.hora}`;
    
                        let fechaSalida = moment.utc(`${horario.dia} ${horario.salida.hora}`, 'YYYY-MM-DD HH:mm:ss').toDate();
                        if (horario.salida.segundo_dia) {
                            fechaSalida = moment.utc(fechaSalida).add(1, 'days').toDate();
                        } else if (horario.salida.tercer_dia) {
                            fechaSalida = moment.utc(fechaSalida).add(2, 'days').toDate();
                        }
                        horario.salida.fecha = fechaSalida;
                        horario.salida.fec_hora_horario = `${horario.dia} ${horario.salida.hora}`;
    
                        if(horario.inicioAlimentacion){
                            horario.inicioAlimentacion.fec_hora_horario = `${horario.dia} ${horario.inicioAlimentacion.hora}`;
                        }
            
                        if(horario.finAlimentacion){
                            horario.finAlimentacion.fec_hora_horario = `${horario.dia} ${horario.finAlimentacion.hora}`;
                        }
                        
                        horariosModificados.push(horario);
                    }
                }
            }
        }
    
        // LISTAR PLANIFICACIONES QUE TIENE REGISTRADAS EL USUARIO
        const planificacion = await ListarPlanificacionHoraria(codigo_usuario, fecha_inicio, fecha_final);
    
        // SI EXISTE PLANIFICACION AÑADIR A HORARIOSMODIFICADOS
        if (planificacion) {
            for (let i = 0; i < planificacion.length; i++) {
                const horario = planificacion[i];
    
                const detalles = await pool.query('SELECT * FROM deta_horarios WHERE id_horario = $1', [horario.id]);
    
                horario.entrada = detalles.rows.find((detalle: any) => detalle.tipo_accion === 'E');
                horario.salida = detalles.rows.find((detalle: any) => detalle.tipo_accion === 'S');
    
                let fecha = moment.utc(horario.fecha).format('YYYY-MM-DD');
                horario.dia = fecha;
    
                let fechaEntrada = moment.utc(`${fecha} ${horario.entrada.hora}`, 'YYYY-MM-DD HH:mm:ss').toDate();
                horario.entrada.fecha = fechaEntrada;
                      
                let fechaSalida = moment.utc(`${fecha} ${horario.salida.hora}`, 'YYYY-MM-DD HH:mm:ss').toDate();
                if (horario.salida.segundo_dia) {
                    fechaSalida = moment.utc(fechaSalida).add(1, 'days').toDate();
                } else if (horario.salida.tercer_dia) {
                    fechaSalida = moment.utc(fechaSalida).add(2, 'days').toDate();
                }
                horario.salida.fecha = fechaSalida;
    
                horario.codigo = horario.codigo_dia;
    
                horariosPlanificacion.push(horario);
            }
        }
        
        if (horariosModificados.length > 0) {
            // VERIFICAR SOBREPOSICIÓN DE HORARIOS
            for (let i = 0; i < horariosModificados.length; i++) {
                const horario1 = horariosModificados[i];
        
                // VERIFICAR SOBREPOSICIÓN ENTRE HORARIOSMODIFICADOS
                for (let j = i + 1; j < horariosModificados.length; j++) {
                    const horario2 = horariosModificados[j];
                    if (SeSuperponen(horario1, horario2)) {
                        ActualizarObservacionesYRangosSimilares(horario1, horario2, rangosSimilares, true);
                    }
                }
        
                // VERIFICAR SOBREPOSICIÓN CON HORARIOSPLANIFICACION
                for (let j = 0; j < horariosPlanificacion.length; j++) {
                    const horario2 = horariosPlanificacion[j];
                    if (SeSuperponen(horario1, horario2)) {
                        ActualizarObservacionesYRangosSimilares(horario1, horario2, rangosSimilares, false);
                    }
                }
            }
        
            // ACTUALIZAR DIAS[DIA].OBSERVACION
            for (const dia in rangosSimilares) {
                dias[dia].observacion = `Rangos similares`;
            }
        }
        
        return dias;
    } catch (error) {
        throw error;
    }
}

// FUNCIÓN PARA VERIFICAR SI DOS HORARIOS SE SOBREPONEN
function SeSuperponen(horario1: any, horario2: any) {
    return (horario2.entrada.fecha >= horario1.entrada.fecha && horario2.entrada.fecha <= horario1.salida.fecha) ||
           (horario2.salida.fecha <= horario1.salida.fecha && horario2.salida.fecha >= horario1.entrada.fecha) ||
           (horario1.entrada.fecha >= horario2.entrada.fecha && horario1.entrada.fecha <= horario2.salida.fecha) ||
           (horario1.salida.fecha <= horario2.salida.fecha && horario1.salida.fecha >= horario2.entrada.fecha);
}

// FUNCIÓN PARA ACTUALIZAR OBSERVACIONES Y RANGOS SIMILARES
function ActualizarObservacionesYRangosSimilares(horario1: any, horario2: any, rangosSimilares: any, horariosModificados: boolean) {
    if(horario1.dia === horario2.dia && horario1.codigo === horario2.codigo) {
        horario1.observacion = `Ya existe planificación`;
    } else {
        horario1.observacion = `Se superpone con el horario ${horario2.codigo} del dia ${horario1.dia}`;
    }
    rangosSimilares[horario1.dia] = rangosSimilares[horario1.dias] ? [...rangosSimilares[horario1.dia], horario1.codigo, horario2.codigo] : [horario1.codigo, horario2.codigo];
    if (horariosModificados) {
        horario2.observacion = `Se superpone con el horario ${horario1.codigo} del dia ${horario1.dia}`;
        rangosSimilares[horario2.dia] = rangosSimilares[horario2.dias] ? [...rangosSimilares[horario2.dia], horario1.codigo, horario2.codigo] : [horario1.codigo, horario2.codigo];
    }

}


// METODO PARA LISTAR LAS PLANIFICACIONES QUE TIENE REGISTRADAS EL USUARIO   --**VERIFICADO
async function ListarPlanificacionHoraria(codigo: string, fecha_inicio: string, fecha_final: string): Promise<any> {

    try {

        const horario = await pool.query(`
            SELECT p_g.codigo AS codigo_e, fec_horario AS fecha, id_horario AS id, 
            CASE WHEN ((tipo_dia = 'L' OR tipo_dia = 'FD') AND (NOT estado_origen = 'HL' AND NOT estado_origen = 'HFD')) THEN tipo_dia ELSE horario.codigo END AS codigo_dia 
            FROM plan_general p_g 
            INNER JOIN empleados empleado ON empleado.codigo = p_g.codigo AND p_g.codigo = $3 
            INNER JOIN cg_horarios horario ON horario.id = p_g.id_horario 
            WHERE fec_horario BETWEEN $1 AND $2 
            GROUP BY codigo_e, fecha, codigo_dia, p_g.id_horario 
            ORDER BY p_g.codigo, fecha, p_g.id_horario
        `, [fecha_inicio, fecha_final, codigo]);

        if (horario.rowCount > 0) {
            return horario.rows;
        }
        else {
            return null;
        }
    }
    catch (error) {
        throw error;
    }
}

// FUNCION PARA CONSULTAR FERIADOS
async function ConsultarFeriados(fecha_inicio: string, fecha_final: string, id_usuario: number): Promise<any>{
    try {
        
        const FERIADO = await pool.query(
            `
            SELECT TO_CHAR(f.fecha, 'YYYY-MM-DD') AS fecha, cf.id_ciudad, c.descripcion, s.nombre
            FROM cg_feriados AS f, ciud_feriados AS cf, ciudades AS c, sucursales AS s, datos_actuales_empleado AS de
            WHERE cf.id_feriado = f.id AND (f.fecha BETWEEN $1 AND $2) AND c.id = cf.id_ciudad 
                AND s.id_ciudad = cf.id_ciudad AND de.id_sucursal = s.id AND de.id = $3
            `
            , [fecha_inicio, fecha_final, id_usuario]);

        if (FERIADO.rowCount > 0) {
            return FERIADO.rows;
        }
        else {
            null
        }
    }
    catch (error) {
        throw error;
    }
}

// FUNCION PARA CONSULTAR HORARIOS DEFAULT Y SUS DETALLES
async function ConsultarHorarioDefault(codigo:string): Promise<any> {
    try {
        const horario: any = await pool.query(
        `
        SELECT h.id AS id_horario, h.nombre, h.hora_trabajo, h.default_, h.min_almuerzo, d.id AS id_det_horario, d.*
        FROM cg_horarios AS h
        INNER JOIN deta_horarios AS d ON h.id = d.id_horario
        WHERE h.codigo = $1
        `, [codigo]
        );
        
        if (horario.rowCount > 0) {
            //SEPARAR LOS TIPOS DE ACCIONES DE LOS HORARIOS
            let horarioEstructurado: any;
            const entrada = horario.rows.find((o: any) => o.tipo_accion === 'E');
            const salida = horario.rows.find((o: any) => o.tipo_accion === 'S');

            horarioEstructurado = {
                entrada: { ...entrada },
                salida: { ...salida }
            };

            return horarioEstructurado;

        }
        else {
            return null;
        }

    } catch (error) {
        throw error;
    }
}

// FUNCION PARA CREAR PLANIFICACION HORARIA
async function CrearPlanificacionHoraria(planificacionHoraria: Planificacion) : Promise<any>{
    try {
        
        // DESESCTRUCTURAR PLANIFICACION HORARIA
        let {
            entrada, 
            inicioAlimentacion, 
            finAlimentacion, 
            salida
        } = planificacionHoraria;

        // INICIAR TRANSACCION
        await pool.query('BEGIN');

        // CREAR ENTRADA
        await pool.query(
            `
            INSERT INTO plan_general (codigo, id_empl_cargo, id_horario, fec_horario, fec_hora_horario, 
                tolerancia, id_det_horario, tipo_entr_salida, tipo_dia, salida_otro_dia, min_antes, min_despues, 
                estado_origen, min_alimentacion)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
            `, [entrada.codigo, entrada.id_empl_cargo, entrada.id_horario, entrada.fec_horario, entrada.fec_hora_horario, entrada.tolerancia, 
                entrada.id_det_horario, entrada.tipo_entr_salida, entrada.tipo_dia, entrada.salida_otro_dia, entrada.min_antes, entrada.min_despues, 
                entrada.estado_origen, entrada.min_alimentacion]
        );

        // CREAR INICIO ALIMENTACION
        if (inicioAlimentacion) {
            await pool.query(
                `
                INSERT INTO plan_general (codigo, id_empl_cargo, id_horario, fec_horario, fec_hora_horario, 
                    tolerancia, id_det_horario, tipo_entr_salida, tipo_dia, salida_otro_dia, min_antes, min_despues, 
                    estado_origen, min_alimentacion)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
                `, [inicioAlimentacion.codigo, inicioAlimentacion.id_empl_cargo, inicioAlimentacion.id_horario, inicioAlimentacion.fec_horario, inicioAlimentacion.fec_hora_horario, inicioAlimentacion.tolerancia, 
                    inicioAlimentacion.id_det_horario, inicioAlimentacion.tipo_entr_salida, inicioAlimentacion.tipo_dia, inicioAlimentacion.salida_otro_dia, inicioAlimentacion.min_antes, inicioAlimentacion.min_despues, 
                    inicioAlimentacion.estado_origen, inicioAlimentacion.min_alimentacion]
            );
        }

        // CREAR FIN ALIMENTACION
        if (finAlimentacion) {
            await pool.query(
                `
                INSERT INTO plan_general (codigo, id_empl_cargo, id_horario, fec_horario, fec_hora_horario, 
                    tolerancia, id_det_horario, tipo_entr_salida, tipo_dia, salida_otro_dia, min_antes, min_despues, 
                    estado_origen, min_alimentacion)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
                `, [finAlimentacion.codigo, finAlimentacion.id_empl_cargo, finAlimentacion.id_horario, finAlimentacion.fec_horario, finAlimentacion.fec_hora_horario, finAlimentacion.tolerancia, 
                    finAlimentacion.id_det_horario, finAlimentacion.tipo_entr_salida, finAlimentacion.tipo_dia, finAlimentacion.salida_otro_dia, finAlimentacion.min_antes, finAlimentacion.min_despues, 
                    finAlimentacion.estado_origen, finAlimentacion.min_alimentacion]
            );
        }

        // CREAR SALIDA
        await pool.query(
            `
            INSERT INTO plan_general (codigo, id_empl_cargo, id_horario, fec_horario, fec_hora_horario, 
                tolerancia, id_det_horario, tipo_entr_salida, tipo_dia, salida_otro_dia, min_antes, min_despues, 
                estado_origen, min_alimentacion)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
            `, [salida.codigo, salida.id_empl_cargo, salida.id_horario, salida.fec_horario, salida.fec_hora_horario, salida.tolerancia, 
                salida.id_det_horario, salida.tipo_entr_salida, salida.tipo_dia, salida.salida_otro_dia, salida.min_antes, salida.min_despues, 
                salida.estado_origen, salida.min_alimentacion]
        );

        // FINALIZAR TRANSACCION
        await pool.query('COMMIT');
        
    } catch (error) {
        await pool.query('ROLLBACK');
        throw error;
    }
}

function ConvertirHorasAMinutos(hora: string): number {
    const partes = hora.split(':');
    const horas = parseInt(partes[0], 10);
    const minutos = parseInt(partes[1], 10);
    return horas * 60 + minutos;
}

function ConvertirMinutosAHoras(minutos: number): string {
    const horas = Math.floor(minutos / 60);
    const minutosRestantes = minutos % 60;
    return `${horas}:${minutosRestantes < 10 ? '0' + minutosRestantes : minutosRestantes}:00`;
}

interface DatosVerificacionHorarios {
    dias: any,
    fecha_inicio: string,
    fecha_final: string,
    id_usuario: number,
    hora_trabaja: number
}

interface DatosVerificacionSuperposicionHorarios {
    dias: any,
    codigo_usuario: string,
    fecha_inicio: string,
    fecha_final: string
}

interface Plan {
    codigo: string,
    id_empl_cargo: number,
    id_horario: number,
    fec_horario: string,
    fec_hora_horario: string,
    tolerancia: number,
    id_det_horario: number,
    tipo_entr_salida: string,
    tipo_dia: string,
    salida_otro_dia: number,
    min_antes: number,
    min_despues: number,
    estado_origen: string,
    min_alimentacion: number
}

interface Planificacion {
    entrada: Plan,
    inicioAlimentacion: Plan | null,
    finAlimentacion: Plan | null,
    salida: Plan
}

export const PLANIFICACION_HORARIA_CONTROLADOR = new PlanificacionHorariaControlador();

export default PLANIFICACION_HORARIA_CONTROLADOR;