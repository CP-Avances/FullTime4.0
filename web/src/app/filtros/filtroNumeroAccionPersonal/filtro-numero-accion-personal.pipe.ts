import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filtroNumeroAccionPersonal',
  standalone: false
})
export class FiltroNumeroAccionPersonalPipe implements PipeTransform {

  transform(value: any, FiltroNumeroAccionPersonalPipe: any): any {
    if (FiltroNumeroAccionPersonalPipe === '' || FiltroNumeroAccionPersonalPipe === null || FiltroNumeroAccionPersonalPipe.length < 2) return value;
    
    const RESULTADO_BUSQUEDAS: any = [];
    for (const resultados of value) {

      if (resultados.numero_accion_personal && resultados.numero_accion_personal.toLowerCase().indexOf(FiltroNumeroAccionPersonalPipe.toLowerCase()) > -1) {
        RESULTADO_BUSQUEDAS.push(resultados);
      }

    };

     return RESULTADO_BUSQUEDAS;
  }

}
