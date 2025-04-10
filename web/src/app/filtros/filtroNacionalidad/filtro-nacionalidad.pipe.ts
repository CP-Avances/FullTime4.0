import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filtroNacionalidad',
  standalone: false,
})

export class FiltroNacionalidadPipe implements PipeTransform {

  transform(value: any, filtroNacionalidad: any): any {
    if (filtroNacionalidad === '' || filtroNacionalidad === null || filtroNacionalidad.length < 2) return value;
    
    const RESULTADO_BUSQUEDAS: any = [];

    for (const resultados of value) {

      if (resultados.nombre && resultados.nombre.toLowerCase().indexOf(filtroNacionalidad.toLowerCase()) > -1) {
        RESULTADO_BUSQUEDAS.push(resultados);
      }

    };

    return RESULTADO_BUSQUEDAS;
  }

}
