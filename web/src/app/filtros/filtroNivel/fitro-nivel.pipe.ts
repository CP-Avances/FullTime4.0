import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fitroNivel'
})

export class FitroNivelPipe implements PipeTransform {

  transform(value: any, filtradoNivel: any): any {

    if (filtradoNivel === '' || filtradoNivel.length < 2) return value;

    const RESULTADO_BUSQUEDAS: any = [];

    for (const resultados of value) {

      if (resultados.nivel && resultados.nivel.toLowerCase().indexOf(filtradoNivel.toLowerCase()) > -1) {
        RESULTADO_BUSQUEDAS.push(resultados);
      }

    };

    return RESULTADO_BUSQUEDAS;
  }

}
