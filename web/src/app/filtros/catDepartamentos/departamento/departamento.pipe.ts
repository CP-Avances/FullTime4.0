import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'departamento',
  standalone: false,
})

export class DepartamentoPipe implements PipeTransform {

  transform(value: any, arg: any): any {

    if (arg === undefined || arg === null || arg.length < 2) return value;

    const RESULTADO_BUSQUEDAS: any = [];

    for (const resultados of value) {

      if (resultados.departamento && resultados.departamento.toLowerCase().indexOf(arg.toLowerCase()) > -1) {
        RESULTADO_BUSQUEDAS.push(resultados);
      }
      else if (resultados.name_dep && resultados.name_dep.toLowerCase().indexOf(arg.toLowerCase()) > -1) {
        RESULTADO_BUSQUEDAS.push(resultados);
      }
      else if (resultados.nomdepar && resultados.nomdepar.toLowerCase().indexOf(arg.toLowerCase()) > -1) {
        RESULTADO_BUSQUEDAS.push(resultados);
      }
      else if (resultados.depa_nombre && resultados.depa_nombre.toLowerCase().indexOf(arg.toLowerCase()) > -1) {
        RESULTADO_BUSQUEDAS.push(resultados);
      };

    };

    return RESULTADO_BUSQUEDAS;
  }

}
