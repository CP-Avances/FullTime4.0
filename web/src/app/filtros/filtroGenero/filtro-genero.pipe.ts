import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filtroGenero',
  standalone: false,
})

export class FiltroGeneroPipe implements PipeTransform {

  transform(value: any, filtroGenero: any): any {
    if (filtroGenero === '' || filtroGenero === null || filtroGenero.length < 2) return value;
    
    const RESULTADO_BUSQUEDAS: any = [];

    for (const resultados of value) {

      if (resultados.genero && resultados.genero.toLowerCase().indexOf(filtroGenero.toLowerCase()) > -1) {
        RESULTADO_BUSQUEDAS.push(resultados);
      }

    };

    return RESULTADO_BUSQUEDAS;
  }

}
