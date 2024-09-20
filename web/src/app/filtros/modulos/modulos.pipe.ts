import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'modulos',
})
export class ModulosPipe implements PipeTransform {

  transform(value: any[], arg: any): any[] {
    if (!arg || arg.length < 2) return value;

    const RESULTADO_BUSQUEDAS: any[] = [];
    const palabrasBusqueda = arg.toLowerCase().split(' ');  // DIVIDE EL ARGUMENTO EN PALABRAS

    for (const resultados of value) {
      const variable = `${resultados.modulo || ''}`.toLowerCase();

      // VERIFICA SI CADA PALABRA ESTA PRESENTE EN LA VARIABLE
      const coincide = palabrasBusqueda.every((palabra: any) => variable.includes(palabra));

      if (coincide) {
        RESULTADO_BUSQUEDAS.push(resultados);
      }
    }

    return RESULTADO_BUSQUEDAS;
  }

}
