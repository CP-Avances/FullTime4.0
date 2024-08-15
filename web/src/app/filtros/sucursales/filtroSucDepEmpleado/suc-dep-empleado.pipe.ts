import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sucDepEmpleado'
})
export class SucDepEmpleadoPipe implements PipeTransform {

  transform(value: any, args: any) {
    if (args === '' || args.length < 2) return value;
    const RESULTADO_BUSQUEDAS: any[] = [];
    for (const resultados of value) {
      if (resultados.departamento && resultados.departamento.toLowerCase().indexOf(args.toLowerCase()) > -1) {
        RESULTADO_BUSQUEDAS.push(resultados);
      }
      else if (resultados.name_dep && resultados.name_dep.toLowerCase().indexOf(args.toLowerCase()) > -1) {
        RESULTADO_BUSQUEDAS.push(resultados);
      }
    };
    return RESULTADO_BUSQUEDAS;

  }

}
