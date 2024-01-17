import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filtroCodigo'
})
export class FiltroCodigoPipe implements PipeTransform {

  transform(value: any, filtroCodigo: any): any {
    if (filtroCodigo === '' || filtroCodigo.length < 2) return value;
    const RESULTADO_HORARIOS: any = [];
    for (const horarios of value) {
      if (horarios.DESCRIPCION && horarios.DESCRIPCION.toLowerCase().indexOf(filtroCodigo.toLowerCase()) > -1) {
        RESULTADO_HORARIOS.push(horarios);
      }
    };
    return RESULTADO_HORARIOS;
  }

}
