import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'modalidadLaboral'
})
export class ModalidadLaboralPipe implements PipeTransform {

  transform(value: any, arg: any): any {
   
    if (arg === undefined || arg === null || arg.length < 2) return value;

    const resultadoModalidad: any = [];

    for (const modalidad of value) {
      if (modalidad.descripcion && modalidad.descripcion.toLowerCase().indexOf(arg.toLowerCase()) > -1) {
        resultadoModalidad.push(modalidad);
      };
    };
    return resultadoModalidad;
    
  }


}
