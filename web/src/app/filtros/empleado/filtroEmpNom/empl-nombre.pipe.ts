import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'emplNombre'
})
export class EmplNombrePipe implements PipeTransform {

  /*transform(value: any, arg: any): any {

    if(arg === undefined || arg === null || arg.length < 2 ) return value;

    const resultadoEmpleado: any = [];

    for(const empleado of value){
      if(empleado.nombre && empleado.nombre.toLowerCase().indexOf(arg.toLowerCase()) > -1){
        resultadoEmpleado.push(empleado);
      };
    };
    return resultadoEmpleado;
  }*/

  /*transform(value: any, arg: any): any {

    if(arg === undefined || arg === null || arg.length < 2 ) return value;

    const resultadoEmpleado: any = [];

    for(const empleado of value){
      if(empleado.nombre.toLowerCase().indexOf(arg.toLowerCase()) > -1){
        resultadoEmpleado.push(empleado);
      };
    };
    return resultadoEmpleado;
  }*/

  transform(value: any, arg: any): any {
    if(arg === undefined || arg === null || arg.length < 2 ) return value;

    const RESULTADO_BUSQUEDAS: any = [];
    
    for (const resultados of value) {
      if (resultados.nombre.toLowerCase().indexOf(arg.toLowerCase()) > -1) {
        RESULTADO_BUSQUEDAS.push(resultados);
      }
    };
    return RESULTADO_BUSQUEDAS;
  }

}
