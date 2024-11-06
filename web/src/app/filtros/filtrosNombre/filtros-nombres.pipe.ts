import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filtrosNombres'
})

export class FiltrosNombresPipe implements PipeTransform {

  transform(value: any, filtroNombre: any): any {
    if (filtroNombre === '' || filtroNombre === null || filtroNombre.length < 2) return value;
    
    const RESULTADO_BUSQUEDAS: any = [];

    for (const resultados of value) {

      if (resultados.nombre && resultados.nombre.toLowerCase().indexOf(filtroNombre.toLowerCase()) > -1) {
        RESULTADO_BUSQUEDAS.push(resultados);
      }

    };

    return RESULTADO_BUSQUEDAS;
  }

}
