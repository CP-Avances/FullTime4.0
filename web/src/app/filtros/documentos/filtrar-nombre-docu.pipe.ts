import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filtrarNombreDocu'
})
export class FiltrarNombreDocuPipe implements PipeTransform {

  transform(value: any, filtroNombre: any): any {
    if (filtroNombre === '' || filtroNombre.length < 2) return value;
    const RESULTADO_BUSQUEDAS: any = [];
    for (const resultados of value) {
      if (resultados.doc_nombre && resultados.doc_nombre.toLowerCase().indexOf(filtroNombre.toLowerCase()) > -1) {
        RESULTADO_BUSQUEDAS.push(resultados);
      }
    };
    return RESULTADO_BUSQUEDAS;
  }

}
