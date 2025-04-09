import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filtrosGrado',
  standalone: false,
})

export class FiltrosGradoPipe implements PipeTransform {

  transform(value: any, filtroGrado: any): any {
    if (filtroGrado === '' || filtroGrado === null || filtroGrado.length < 2) return value;
    
    const RESULTADO_BUSQUEDAS: any = [];

    for (const resultados of value) {

      if (resultados.descripcion && resultados.descripcion.toLowerCase().indexOf(filtroGrado.toLowerCase()) > -1) {
        RESULTADO_BUSQUEDAS.push(resultados);
      }

    };

    return RESULTADO_BUSQUEDAS;
  }

}
