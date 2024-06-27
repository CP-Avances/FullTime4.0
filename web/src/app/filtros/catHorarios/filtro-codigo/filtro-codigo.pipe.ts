import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filtroCodigo'
})
export class FiltroCodigoPipe implements PipeTransform {

  transform(value: any, filtroCodigo: any): any {
    if (filtroCodigo === '' || filtroCodigo.length < 2) return value;
    const RESULTADO_HORARIOS: any = [];
    for (const horario of value) {
      if (horario.codigo && horario.codigo.toString().toLowerCase().indexOf(filtroCodigo.toString().toLowerCase()) > -1) {
        RESULTADO_HORARIOS.push(horario);
      }
    };
    return RESULTADO_HORARIOS;
  }
}
