import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filtroCodigo',
  standalone: false,
})

export class FiltroCodigoPipe implements PipeTransform {

  transform(value: any, arg: any): any {

    if (arg === undefined || arg === null || arg.length < 1) return value;
 
     const RESULTADO_BUSQUEDAS: any = [];
 
     for (const resultados of value) {
 
       if (resultados.codigo && resultados.codigo.toLowerCase().indexOf(arg.toLowerCase()) > -1) {
         RESULTADO_BUSQUEDAS.push(resultados);
       };
 
     };
 
     return RESULTADO_BUSQUEDAS;
   }
}
