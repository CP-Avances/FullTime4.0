import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'empleDepa'
})
export class EmplDepaPipe implements PipeTransform {

  transform(value: any, filtroDepa: any): any {
    
    if (filtroDepa === '' || filtroDepa === undefined || filtroDepa.length < 2) return value;

    const RESULTADO_DEPARTAMENTOS: any = [];
    for (const departamentos of value) {
      if (departamentos.depa_nombre && departamentos.depa_nombre.toLowerCase().indexOf(filtroDepa.toLowerCase()) > -1) {
        RESULTADO_DEPARTAMENTOS.push(departamentos);
      }
    };

    return RESULTADO_DEPARTAMENTOS;

  }

}

