import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'nombreApellido'
})
export class NombreApellidoPipe implements PipeTransform {

  transform(value: any, filtroEmpleado: any): any {
    if (filtroEmpleado === '' || filtroEmpleado.length < 1) return value;

    const RESULTADO_BUSQUEDAS: any = [];
     for (const resultados of value) {
       if ((resultados.nombre && resultados.nombre.toLowerCase().indexOf(filtroEmpleado.toLowerCase()) > -1)
         || (resultados.apellido && resultados.apellido.toLowerCase().indexOf(filtroEmpleado.toLowerCase()) > -1)) {
         RESULTADO_BUSQUEDAS.push(resultados);
       }
     };
     return RESULTADO_BUSQUEDAS;
  }

}
