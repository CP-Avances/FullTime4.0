import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filtroDepartamentoR'
})
export class FiltroDepartamentoRPipe implements PipeTransform {

  transform(value: any, arg: any): any {
    if (arg === '' || arg.length < 2) return value;
    const RESULTADO_BUSQUEDAS: any = [];
    for (const resultados of value) {
      if (resultados.nomdepar && resultados.nomdepar.toLowerCase().indexOf(arg.toLowerCase()) > -1) {
        RESULTADO_BUSQUEDAS.push(resultados);
      }
    };
    return RESULTADO_BUSQUEDAS;
  }

}
