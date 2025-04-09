import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filtrosGrupo',
  standalone: false,
})

export class FiltrosGrupoPipe implements PipeTransform {

  transform(value: any, filtroGrupo: any): any {
    if (filtroGrupo === '' || filtroGrupo === null || filtroGrupo.length < 2) return value;
    
    const RESULTADO_BUSQUEDAS: any = [];

    for (const resultados of value) {

      if (resultados.descripcion && resultados.descripcion.toLowerCase().indexOf(filtroGrupo.toLowerCase()) > -1) {
        RESULTADO_BUSQUEDAS.push(resultados);
      }

    };

    return RESULTADO_BUSQUEDAS;
  }

}
