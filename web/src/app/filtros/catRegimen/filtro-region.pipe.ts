import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filtroRegion'
})
export class FiltroRegionPipe implements PipeTransform {

  transform(value: any, filtroRegimenLaboral: any): any {
    if (filtroRegimenLaboral === '' || filtroRegimenLaboral.length < 2) return value;
    const RESULTADO_REGIMEN: any = [];
    for (const regimen of value) {
      if (regimen.descripcion && regimen.descripcion.toLowerCase().indexOf(filtroRegimenLaboral.toLowerCase()) > -1) {
        RESULTADO_REGIMEN.push(regimen);
      }
    };
    return RESULTADO_REGIMEN;
  }

}
