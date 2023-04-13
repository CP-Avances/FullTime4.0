import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filtroDepartamento'
})
export class FiltroDepartamentoPipe implements PipeTransform {

  transform(value: any, filtroNombre: any): any {
    if (filtroNombre === '' || filtroNombre.length < 2) return value;
    const RESULTADO_DEPARTAMENTOS: any = [];
    for (const departamentos of value) {
      if (departamentos.nombre && departamentos.nombre.toLowerCase().indexOf(filtroNombre.toLowerCase()) > -1) {
        RESULTADO_DEPARTAMENTOS.push(departamentos);
      }
    };
    return RESULTADO_DEPARTAMENTOS;
  }
}

