import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filtroModelo'
})
export class FiltroModeloPipe implements PipeTransform {

  transform(value: any, filtroModeloReloj: any): any {
    if (filtroModeloReloj === '' || filtroModeloReloj.length < 2) return value;
    const RESULTADO_BUSQUEDAS: any = [];
    for (const resultados of value) {
      if (resultados.modelo && resultados.modelo.toLowerCase().indexOf(filtroModeloReloj.toLowerCase()) > -1) {
        RESULTADO_BUSQUEDAS.push(resultados);
      }
    };
    return RESULTADO_BUSQUEDAS;
  }

}
