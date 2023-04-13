import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filtroNombre'
})
export class FiltroNombrePipe implements PipeTransform {

  transform(value: any, filtroDescripcion: any): any {
    if (filtroDescripcion === '' || filtroDescripcion.length < 2) return value;
    const RESULTADO_FERIADOS: any = [];
    for (const feriados of value) {
      if (feriados.descripcion && feriados.descripcion.toLowerCase().indexOf(filtroDescripcion.toLowerCase()) > -1) {
        RESULTADO_FERIADOS.push(feriados);
      }
    };
    return RESULTADO_FERIADOS;
  }

}
