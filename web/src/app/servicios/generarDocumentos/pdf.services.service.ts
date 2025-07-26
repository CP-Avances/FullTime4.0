import { Injectable } from '@angular/core';
import { DateTime } from 'luxon';
import { EmpresaService } from '../configuracion/parametrizacion/catEmpresa/empresa.service';
import { EmpleadoService } from '../usuarios/empleado/empleadoRegistro/empleado.service';
import { ValidacionesService } from '../generales/validaciones/validaciones.service';
import { AccionPersonalService } from '../modulos/modulo-acciones-personal/accionPersonal/accion-personal.service';

@Injectable({
  providedIn: 'root'
})
export class PdfServicesService {

  constructor(
    private validar: ValidacionesService,
  ) { }

    async GenerarPdf(action = 'open', numero: any) {
    const pdfMake = await this.validar.ImportarPDF();
    const documentDefinition = this.DefinirInformacionPDF(numero);
    switch (action) {
      case 'open': pdfMake.createPdf(documentDefinition).open(); break;
      case 'print': pdfMake.createPdf(documentDefinition).print(); break;
      case 'download': pdfMake.createPdf(documentDefinition).download('Empleados.pdf'); break;
      default: pdfMake.createPdf(documentDefinition).open(); break;
    }
  }

  DefinirInformacionPDF(numero: any) {}

}
