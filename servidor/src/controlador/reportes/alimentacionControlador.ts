import { Request, Response } from 'express';
import pool from '../../database';

class AlimentacionControlador {

    // METODO PARA BUSCAR DATOS DE ALIMENTACION   **USADO
    public async ReporteTimbresAlimentacion(req: Request, res: Response) {
        console.log("LLEGA HASTA AQUI EN EL BACKEND")
        let { desde, hasta } = req.params;
        let datos: any[] = req.body;
        let n: Array<any> = await Promise.all(datos.map(async (obj: any) => {
            obj.empleados = await Promise.all(obj.empleados.map(async (o: any) => {
                const listaTimbres = await BuscarAlimentacion(desde, hasta, o.id);
                o.alimentacion = await AgruparTimbres(listaTimbres);
                return o;
            }));
            return obj;
        }));

        let nuevo = n.map((e: any) => {
            e.empleados = e.empleados.filter((t: any) => { return t.alimentacion.length > 0 })
            return e
        }).filter(e => { return e.empleados.length > 0 })

        if (nuevo.length === 0) return res.status(400).jsonp({ message: 'No se ha encontrado registro de timbres de alimentación.' })

        console.log(JSON.stringify(nuevo));
        return res.status(200).jsonp(nuevo)
    }

}

export const ALIMENTACION_CONTROLADOR = new AlimentacionControlador();

export default ALIMENTACION_CONTROLADOR;

// FUNCION PARA BUSCAR DATOS DE ALIMENTACION
const BuscarAlimentacion = async function (fec_inicio: string, fec_final: string, id_empleado: string | number) {
    return await pool.query(
        `
        SELECT CAST(fecha_horario AS VARCHAR), CAST(fecha_hora_horario AS VARCHAR), CAST(fecha_hora_timbre AS VARCHAR),
            id_empleado, estado_timbre, tipo_accion AS accion, minutos_alimentacion 
        FROM eu_asistencia_general 
        WHERE CAST(fecha_hora_horario AS VARCHAR) BETWEEN $1 || '%' 
            AND ($2::timestamp + '1 DAY') || '%' AND id_empleado = $3 
            AND tipo_accion IN ('I/A', 'F/A') 
        ORDER BY id_empleado, fecha_hora_horario ASC
        `
        , [fec_inicio, fec_final, id_empleado])
        .then(res => {
            return res.rows;
        })
}

// METODO PARA AGRUPAR TIMBRES
// METODO PARA AGRUPAR TIMBRES (empareja por acción, sin validar hora)
const AgruparTimbres = async function (listaTimbres: any) {
  const timbresAgrupados: any[] = [];
  let abierto: any = null;

  for (let i = 0; i < listaTimbres.length; i++) {
    const t = listaTimbres[i];
    if (!t) continue;

    if (t.accion === 'I/A') {
      // si había uno abierto, lo cerramos como incompleto y abrimos el nuevo
      if (abierto) timbresAgrupados.push({ inicioAlimentacion: abierto, finAlimentacion: null });
      abierto = t;
    } else if (t.accion === 'F/A') {
      if (abierto) {
        // emparejar directamente con el siguiente F/A, sin validar hora
        timbresAgrupados.push({ inicioAlimentacion: abierto, finAlimentacion: t });
        abierto = null;
      } else {
        // F/A sin I/A previo: se ignora para mantener tu comportamiento original
      }
    }
  }

  // si quedó un I/A sin su F/A
  if (abierto) timbresAgrupados.push({ inicioAlimentacion: abierto, finAlimentacion: null });

  return timbresAgrupados;
};
