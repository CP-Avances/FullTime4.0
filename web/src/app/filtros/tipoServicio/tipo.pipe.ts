import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'tipo',
  standalone: false,
})

export class TipoPipe implements PipeTransform {

  transform(value: any, filtroTipo: any): any {

    if (filtroTipo === '' || filtroTipo.length < 1) return value;

    const RESULTADO_BUSQUEDAS: any = [];

    for (const resultados of value) {

      if (resultados.tipo && resultados.tipo.toLowerCase().indexOf(filtroTipo.toLowerCase()) > -1) {
        RESULTADO_BUSQUEDAS.push(resultados);
      }

    };

    return RESULTADO_BUSQUEDAS;
    
  }

}
