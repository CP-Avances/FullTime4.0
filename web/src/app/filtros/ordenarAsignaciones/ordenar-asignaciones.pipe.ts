import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'ordenarAsignaciones',
  standalone: false,
})

export class OrdenarAsignacionesPipe implements PipeTransform {

  transform(array: any[], field1: string, field2: string): any[] {
    const first = array[0];
    const rest = array.slice(1);
    const sameSucursal = rest.filter(a => a[field1] === first[field1]);
    const otherSucursal = rest.filter(a => a[field1] !== first[field1]);

    sameSucursal.sort((a: any, b: any) => a[field2] > b[field2] ? 1 : -1);
    otherSucursal.sort((a: any, b: any) => {
      if (a[field1] === b[field1]) {
        return a[field2] > b[field2] ? 1 : -1;
      }
      return a[field1] > b[field1] ? 1 : -1;
    });

    return [first, ...sameSucursal, ...otherSucursal];
  }

}
