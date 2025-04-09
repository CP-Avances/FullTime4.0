import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'departamentoPadre',
  standalone: false,
})

export class DepartamentoPadrePipe implements PipeTransform {

  transform(value: any, filtroDeparPadre: any): any {

    if (filtroDeparPadre === '' || filtroDeparPadre.length < 2) return value;

    const RESULTADO_DEPARTAMENTOS: any = [];

    for (const departamentos of value) {

      if (departamentos.departamento_padre && departamentos.departamento_padre.toLowerCase().indexOf(filtroDeparPadre.toLowerCase()) > -1) {
        RESULTADO_DEPARTAMENTOS.push(departamentos);
      }

    };

    return RESULTADO_DEPARTAMENTOS;
    
  }

}
