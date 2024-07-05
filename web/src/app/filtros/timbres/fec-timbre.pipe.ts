import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fecTimbre'
})
export class FecTimbrePipe implements PipeTransform {

  transform(value: any, arg: any): any {

    if (arg === undefined || arg === null || arg === '' || arg.length < 2) return value;

    let resultadoTimbres: any = [];

    for (const timbres of value) {
      if (timbres.fecha_hora_timbre && timbres.fecha_hora_timbre.toLowerCase().indexOf(arg.toLowerCase()) > -1) {
        resultadoTimbres.push(timbres);
      };
      if (timbres.accion && timbres.accion.toLowerCase().indexOf(arg.toLowerCase()) > -1) {
        resultadoTimbres.push(timbres);
      };
      if (timbres.id_reloj && String(timbres.id_reloj).toLowerCase().indexOf(arg.toLowerCase()) > -1) {
        resultadoTimbres.push(timbres);
      };
      if (timbres.latitud && timbres.latitud.toLowerCase().indexOf(arg.toLowerCase()) > -1) {
        resultadoTimbres.push(timbres);
      };
      if (timbres.longitud && timbres.longitud.toLowerCase().indexOf(arg.toLowerCase()) > -1) {
        resultadoTimbres.push(timbres);
      };
      if (timbres.observacion && timbres.observacion.toLowerCase().indexOf(arg.toLowerCase()) > -1) {
        resultadoTimbres.push(timbres);
      };
      if (timbres.tecla_funcion && timbres.tecla_funcion.toLowerCase().indexOf(arg.toLowerCase()) > -1) {
        resultadoTimbres.push(timbres);
      };
    };

    const objetos = resultadoTimbres.map((obj: any) => {
      return JSON.stringify(obj);
    });

    const unicos: any = [... new Set(objetos)];

    return unicos.map((obj: any) => {
      return JSON.parse(obj)
    });
  }


}
