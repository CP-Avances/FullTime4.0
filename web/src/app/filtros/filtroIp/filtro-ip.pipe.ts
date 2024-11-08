import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filtroIp'
})

export class FiltroIpPipe implements PipeTransform {

  transform(value: any, filtroIpReloj: any): any {

    if (filtroIpReloj === '' || filtroIpReloj.length < 2) return value;

    const RESULTADO_BUSQUEDAS: any = [];

    for (const resultados of value) {

      if (resultados.ip && resultados.ip.indexOf(filtroIpReloj) > -1) {
        RESULTADO_BUSQUEDAS.push(resultados);
      }

    };
    
    return RESULTADO_BUSQUEDAS;
  }

}
