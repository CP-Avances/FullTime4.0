import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'emplCargo'
})
export class EmplCargoPipe implements PipeTransform {

  transform(value: any, arg: any): any {

    if (arg === undefined || arg === null || arg.length < 2) return value;

    const resultadoEmpleado: any = [];

    for (const empleado of value) {
      if (empleado.cargo && empleado.cargo.toLowerCase().indexOf(arg.toLowerCase()) > -1) {
        resultadoEmpleado.push(empleado);
      };
    };
    return resultadoEmpleado;
  }

}
