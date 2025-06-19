import { Request, Response } from 'express';
import pool from '../../database';
import { DateTime } from 'luxon';

class ReportesTiempoLaboradoControlador {

    // METODO DE BUSQUEDA DE DATOS DE TIEMPO LABORADO    **USADO
    public async ReporteTiempoLaborado(req: Request, res: Response) {
        let { desde, hasta } = req.params;
        let datos: any[] = req.body;
        let n: Array<any> = await Promise.all(datos.map(async (suc: any) => {
            suc.empleados = await Promise.all(suc.empleados.map(async (o: any) => {
                const listaTimbres = await BuscarTiempoLaborado(desde, hasta, o.id);
                o.tLaborado = await AgruparTimbres(listaTimbres);
                await Promise.all(o.tLaborado.map(async (t: any) => {
                    const [minAlimentacion, minLaborados, minAtrasos, minSalidasAnticipadas, minPlanificados] = await calcularTiempoLaborado(t);
                    t.minAlimentacion = minAlimentacion;
                    t.minLaborados = minLaborados;
                    t.minAtrasos = minAtrasos;
                    t.minSalidasAnticipadas = minSalidasAnticipadas;
                    t.minPlanificados = minPlanificados;
                }))
                return o;
            }));
            return suc;
        }));

        let nuevo = n.map((e: any) => {
            e.empleados = e.empleados.filter((t: any) => { return t.tLaborado.length > 0 })
            return e
        }).filter(e => { return e.empleados.length > 0 })

        if (nuevo.length === 0) return res.status(400).jsonp({ message: 'No se ha encontrado registros.' })

        return res.status(200).jsonp(nuevo)
    }


}

// FUNCION PARA BUSCAR DATOS DE TIEMPO LABORADO    **USADO
const BuscarTiempoLaborado = async function (fec_inicio: string, fec_final: string, id_empleado: string | number) {
    return await pool.query(
        `
        SELECT CAST(ag.fecha_horario AS VARCHAR), CAST(ag.fecha_hora_horario AS VARCHAR), CAST(ag.fecha_hora_timbre AS VARCHAR),
            ag.id_empleado, ag.estado_timbre, ag.tipo_accion AS accion, ag.minutos_alimentacion, ag.tipo_dia, ag.id_horario, ec.controlar_asistencia,
            ag.estado_origen, ag.tolerancia 
        FROM eu_asistencia_general AS ag, eu_empleado_contratos AS ec, cargos_empleado as car
        WHERE CAST(ag.fecha_hora_horario AS VARCHAR) BETWEEN $1 || '%' 
            AND ($2::timestamp + '1 DAY') || '%' AND ag.id_empleado = $3  AND ag.id_empleado = $3
            AND ag.tipo_accion IN ('E','I/A', 'F/A', 'S') 
            AND car.id_cargo = ag.id_empleado_cargo
            AND ec.id = car.id_contrato
        ORDER BY ag.id_empleado, ag.fecha_hora_horario ASC
        `
        , [fec_inicio, fec_final, id_empleado])
        .then(res => {
            return res.rows;
        })
}

// METODO PARA AGRUPAR TIMBRES    **USADO
const AgruparTimbres = async function agruparTimbresPorClave(timbres: Timbre[]) {
    const timbresAgrupadosFecha: { [key: string]: Timbre[] } = {};
    const timbresAgrupados: any[] = [];

    timbres.forEach((timbre) => {
        const clave = `${timbre.fecha_horario}-${timbre.id_horario}`;
        if (!timbresAgrupadosFecha[clave]) {
            timbresAgrupadosFecha[clave] = [];
        }
        timbresAgrupadosFecha[clave].push(timbre);
    });

    for (let key in timbresAgrupadosFecha) {
        const cantidadTimbres = timbresAgrupadosFecha[key].length;
        switch (cantidadTimbres) {
            case 4:
                for (let i = 0; i < timbresAgrupadosFecha[key].length; i += 4) {
                    timbresAgrupados.push({
                        tipo: 'EAS',
                        dia: timbresAgrupadosFecha[key][i].tipo_dia,
                        origen: timbresAgrupadosFecha[key][i].estado_origen,
                        entrada: timbresAgrupadosFecha[key][i],
                        inicioAlimentacion: timbresAgrupadosFecha[key][i + 1],
                        finAlimentacion: timbresAgrupadosFecha[key][i + 2],
                        salida: i + 3 < timbresAgrupadosFecha[key].length ? timbresAgrupadosFecha[key][i + 3] : null,
                        control: timbresAgrupadosFecha[key][i].controlar_asistencia,
                        tolerancia: timbresAgrupadosFecha[key][i].tolerancia,
                    });
                }
                break;
            case 2:
                for (let i = 0; i < timbresAgrupadosFecha[key].length; i += 2) {
                    timbresAgrupados.push({
                        tipo: 'ES',
                        dia: timbresAgrupadosFecha[key][i].tipo_dia,
                        origen: timbresAgrupadosFecha[key][i].estado_origen,
                        entrada: timbresAgrupadosFecha[key][i],
                        salida: i + 1 < timbresAgrupadosFecha[key].length ? timbresAgrupadosFecha[key][i + 1] : null,
                        control: timbresAgrupadosFecha[key][i].controlar_asistencia,
                        tolerancia: timbresAgrupadosFecha[key][i].tolerancia,
                    });
                }
                break;
        }
    }

    return timbresAgrupados;
}

// CONSULTAR PARAMETRO DE TOLERANCIA    **USADO
async function consultarParametroTolerancia (parametro: number) {
    const resultado = await pool.query(
        `
        SELECT descripcion
        FROM ep_detalle_parametro
        WHERE id_parametro = $1
        `, [parametro]
    );
    return resultado.rows[0]?.descripcion || null;
}

// CALCULAR DIREFERENCIA DE TIEMPO EN MINUTOS    **USADO
function calcularDiferenciaEnMinutos(fecha1: string, fecha2: string) {
    const dt1 = DateTime.fromSQL(fecha1);
    const dt2 = DateTime.fromSQL(fecha2);
    const diff = dt2.diff(dt1, ['hours','minutes','seconds']);
    return diff.as('minutes');
}

// CALCULAR TIEMPO LABORADO     **USADO
async function calcularTiempoLaborado (tLaborado: any) {
  if (['L', 'FD'].includes(tLaborado.origen)) return [0, 0, 0, 0, 0];

  const { entrada, salida, inicioAlimentacion, finAlimentacion, tolerancia, tipo } = tLaborado;
  const parametroTolerancia = await consultarParametroTolerancia(3);

  let minutosAlimentacion = 0;
  let minutosLaborados = 0;
  let minutosAtrasos = 0;
  let minutosSalidasAnticipadas = 0;
  let minutosPlanificados = 0;

  const hayTimbresEntradaYSalida = entrada.fecha_hora_timbre && salida.fecha_hora_timbre;

  if (entrada.fecha_hora_timbre) {
    minutosAtrasos = calcularAtraso(
      entrada.fecha_hora_horario,
      entrada.fecha_hora_timbre,
      tolerancia,
      parametroTolerancia
    );
  }

  if (salida.fecha_hora_timbre) {
    minutosSalidasAnticipadas = calcularSalidaAnticipada(
      salida.fecha_hora_timbre,
      salida.fecha_hora_horario
    );
  }

  if (hayTimbresEntradaYSalida) {
    minutosLaborados = calcularDiferenciaEnMinutos(
      entrada.fecha_hora_timbre,
      salida.fecha_hora_timbre
    );
  }

  minutosPlanificados = calcularDiferenciaEnMinutos(
    entrada.fecha_hora_horario,
    salida.fecha_hora_horario
  );

  if (tipo !== 'ES') {
    const minAlimentacionBase = inicioAlimentacion.minutos_alimentacion;

    minutosAlimentacion = calcularTiempoAlimentacion(
      inicioAlimentacion.fecha_hora_timbre,
      finAlimentacion.fecha_hora_timbre,
      minAlimentacionBase
    );

    if (minutosLaborados > 0) {
      minutosLaborados -= minutosAlimentacion;
    }
  }

  return [
    minutosAlimentacion,
    minutosLaborados,
    minutosAtrasos,
    minutosSalidasAnticipadas,
    minutosPlanificados,
  ];
};

// METODO PARA CALCULAR ATRASOS   *USADO
function calcularAtraso(
  horaHorario: string,
  horaTimbre: string,
  tolerancia: number,
  parametroTolerancia: string
): number {
  const diferencia = Math.max(calcularDiferenciaEnMinutos(horaHorario, horaTimbre), 0);

  if (parametroTolerancia === '1') return diferencia;

  if (diferencia > tolerancia) {
    return parametroTolerancia === '2-1' ? diferencia : diferencia - tolerancia;
  }

  return 0;
}

// METODO PARA CALCULAR SALIDAS ANTICIPADAS   **USADO
function calcularSalidaAnticipada(
  horaTimbre: string,
  horaHorario: string
): number {
  return Math.max(calcularDiferenciaEnMinutos(horaTimbre, horaHorario), 0);
}

// METODO PARA CALCULAR TIEMPO ALIMENTACION    **USADO
function calcularTiempoAlimentacion(
  inicioTimbre: string | null,
  finTimbre: string | null,
  minutosPorDefecto: number
): number {
  if (inicioTimbre && finTimbre) {
    return calcularDiferenciaEnMinutos(inicioTimbre, finTimbre);
  }
  return minutosPorDefecto;
}

interface Timbre {
    id_horario: string;
    fecha_horario: string;
    fecha_hora_horario: string;
    fecha_hora_timbre: string | null;
    codigo: string;
    estado_timbre: string | null;
    accion: string;
    tipo_dia: string;
    estado_origen: string;
    min_alimentacion: number;
    tolerancia: number;
    controlar_asistencia: boolean
}

const REPORTES_TIEMPO_LABORADO_CONTROLADOR = new ReportesTiempoLaboradoControlador();

export default REPORTES_TIEMPO_LABORADO_CONTROLADOR;

