import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filtroEstadoCivil',
  standalone: false,
})

export class FiltroEstadoCivilPipe implements PipeTransform {

 
  transform(value: any, filtroEstadoCivil: any): any {
    if (filtroEstadoCivil === '' || filtroEstadoCivil === null || filtroEstadoCivil.length < 2) return value;
    const RESULTADO_BUSQUEDAS: any = [];
    for (const resultados of value) {
      if (resultados.estado_civil && resultados.estado_civil.toLowerCase().indexOf(filtroEstadoCivil.toLowerCase()) > -1) {
        RESULTADO_BUSQUEDAS.push(resultados);
      }
    };
    return RESULTADO_BUSQUEDAS;
  }
}
