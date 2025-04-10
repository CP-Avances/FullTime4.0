import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filtroFecha',
  standalone: false,
})

export class FiltroFechaPipe implements PipeTransform {

  transform(value: any, arg: any): any {

    if (arg === '' || arg.length < 2) return value;

    const RESULTADO_BUSQUEDAS: any = [];

    for (const resultados of value) {

      if (resultados.fecha && resultados.fecha.toString().toLowerCase().indexOf(arg.toString().toLowerCase()) > -1) {
        RESULTADO_BUSQUEDAS.push(resultados);
      }
      else if (resultados.fec_inicio && resultados.fec_inicio.toString().toLowerCase().indexOf(arg.toString().toLowerCase()) > -1) {
        RESULTADO_BUSQUEDAS.push(resultados);
      }
      else if (resultados.fec_final && resultados.fec_final.toString().toLowerCase().indexOf(arg.toString().toLowerCase()) > -1) {
        RESULTADO_BUSQUEDAS.push(resultados);
      }
      else if (resultados.create_at && resultados.create_at.toString().toLowerCase().indexOf(arg.toString().toLowerCase()) > -1) {
        RESULTADO_BUSQUEDAS.push(resultados);
      };

    };

    return RESULTADO_BUSQUEDAS;
  }

}
