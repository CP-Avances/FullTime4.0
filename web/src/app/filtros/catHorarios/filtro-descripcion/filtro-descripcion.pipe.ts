import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filtroDescripcion'
})
export class FiltroDescripcionPipe implements PipeTransform {

  transform(value: any, filtroDescripcion: any): any {
    if (filtroDescripcion === '' || filtroDescripcion.length < 2) return value;
    const RESULTADO_HORARIOS: any = [];
    for (const horarios of value) {
      if (horarios.DESCRIPCION && horarios.DESCRIPCION.toLowerCase().indexOf(filtroDescripcion.toLowerCase()) > -1) {
        RESULTADO_HORARIOS.push(horarios);
      }
    };
    return RESULTADO_HORARIOS;
  }

}
