import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'nombreCompleto',
  standalone: false,
})

export class NombreCompletoPipe implements PipeTransform {

  transform(value: any[], arg: any): any[] {
    if (!arg || arg.length < 2) return value;

    const RESULTADO_BUSQUEDAS: any[] = [];
    const palabrasBusqueda = arg.toLowerCase().split(' ');  // DIVIDE EL ARGUMENTO EN PALABRAS

    for (const resultados of value) {
      const nombreCompleto = `${resultados.nombre || ''} ${resultados.apellido || ''}`.toLowerCase();

      // VERIFICA SI CADA PALABRA ESTÁ PRESENTE EN EL NOMBRE O APELLIDO DEL USUARIO
      const coincide = palabrasBusqueda.every((palabra: any) => nombreCompleto.includes(palabra));

      if (coincide) {
        RESULTADO_BUSQUEDAS.push(resultados);
      }
    }

    return RESULTADO_BUSQUEDAS;
  }

}
