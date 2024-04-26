import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filtroDescripcion'
})
export class FiltroDescripcionPipe implements PipeTransform {

  transform(value: any, filtroDescripcion: any): any {
    if (filtroDescripcion === '' || filtroDescripcion.length < 2) return value;
    const RESULTADO_HORARIOS: any = [];
    for (const horario of value) {
      if (horario.DESCRIPCION === undefined) horario.DESCRIPCION = '';
      if (horario.DESCRIPCION && horario.DESCRIPCION.toString().toLowerCase().indexOf(filtroDescripcion.toString().toLowerCase()) > -1) {
        RESULTADO_HORARIOS.push(horario);
      }
    };
    return RESULTADO_HORARIOS;
  }

}
