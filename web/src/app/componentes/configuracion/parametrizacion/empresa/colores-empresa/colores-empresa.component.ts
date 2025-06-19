import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, OnInit, Inject } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatRadioChange } from '@angular/material/radio';
import { ToastrService } from 'ngx-toastr';
import { Location } from '@angular/common';
import { DateTime } from 'luxon';
import { Router } from '@angular/router';

import { EmpresaService } from 'src/app/servicios/configuracion/parametrizacion/catEmpresa/empresa.service';
import { EmpleadoService } from 'src/app/servicios/usuarios/empleado/empleadoRegistro/empleado.service';
import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';

@Component({
  selector: 'app-colores-empresa',
  standalone: false,
  templateUrl: './colores-empresa.component.html',
  styleUrls: ['./colores-empresa.component.css']
})

export class ColoresEmpresaComponent implements OnInit {
  ips_locales: any = '';

  verFrase: boolean = false;
  ingresarOtro = false;

  // DATOS DE FORMULARIO DE REGISTRO DE MARCA DE AGUA
  fraseReporte = new FormControl('');
  nuevaF = new FormControl('');

  public fraseForm = new FormGroup({
    fraseReporteF: this.fraseReporte,
    nuevaForm: this.nuevaF
  });

  idEmpleado: number;
  empleado: any = [];
  p_color: any;
  s_color: any;
  frase: any;

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  constructor(
    private toastr: ToastrService,
    private rest: EmpresaService,
    public restE: EmpleadoService,
    public router: Router,
    public ventana: MatDialogRef<ColoresEmpresaComponent>,
    public validar: ValidacionesService,
    public location: Location,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.idEmpleado = parseInt(localStorage.getItem('empleado') as string);
  }

  ngOnInit(): void {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');
    this.validar.ObtenerIPsLocales().then((ips) => {
      this.ips_locales = ips;
    });
    this.ObtenerEmpleados(this.idEmpleado);
    this.ObtenerLogo();
    this.VerFormularios();
    this.ObtenerColores();
  }

  // METODO PARA MOSTRAR VENTANA DE COLORES O MARCA DE AGUA
  VerFormularios() {
    this.verFrase = true;
    this.ImprimirFrase();
  }

  // METODO PARA VER LA INFORMACION DEL EMPLEADO
  ObtenerEmpleados(idemploy: any) {
    this.empleado = [];
    this.restE.BuscarUnEmpleado(idemploy).subscribe(data => {
      this.empleado = data;
    })
  }

  // METODO PARA OBTENER EL LOGO DE LA EMPRESA
  logo: any = String;
  ObtenerLogo() {
    this.rest.LogoEmpresaImagenBase64(localStorage.getItem('empresa') as string).subscribe(res => {
      this.logo = 'data:image/jpeg;base64,' + res.imagen;
    });
  }

  // METODO PARA OBTENER DATOS DE EMPRESA COLORES - MARCA DE AGUA
  empresas: any = [];
  ObtenerColores() {
    this.empresas = [];
    this.rest.ConsultarDatosEmpresa(this.data.datos.id).subscribe(res => {
      this.empresas = res;
      this.p_color = this.empresas[0].color_principal;
      this.s_color = this.empresas[0].color_secundario;
      this.frase = this.empresas[0].marca_agua;
    });
  }

  // METODO PARA MOSTRAR INFORMACION DE MARCA DE AGUA
  ImprimirFrase() {
    if (this.data.datos.marca_agua === 'FullTime' || this.data.datos.marca_agua === 'Confidencial') {
      this.fraseReporte.setValue(this.data.datos.marca_agua);
    }
    else if (this.data.datos.marca_agua === '' || this.data.datos.marca_agua === null) {
      this.fraseReporte.setValue('');
    }
    else {
      this.fraseReporte.setValue('Otro');
    }
  }

  // METODO PARA PERMITIR INGRESO DE FRASE MARCA DE AGUA
  IngresarFrase() {
    this.ingresarOtro = true;
  }

  // METODO PARA CAMBIAR DE OPCIONES DE FRASE
  CambiarFrase(ob: MatRadioChange) {
    this.ingresarOtro = false;
    this.fraseForm.patchValue({
      nuevaForm: ''
    })
    this.frase = ob.value
  }

  // METODO PARA VISUSALIZAR PDF
  VerArchivo(form: any) {
    if (form.fraseReporteF === 'Otro') {
      if (form.nuevaForm != '') {
        this.frase = form.nuevaForm;
        this.GenerarPdf('open');
      }
      else {
        this.toastr.info('Por favor ingrese una frase o seleccione una de las opciones listadas.', '', {
          timeOut: 6000,
        });
      }
    }
    else {
      this.GenerarPdf('open');
    }
  }

  // METODO PARA ACTUALIZAR FRASE MARCA DE AGUA EN BASE DE DATOS
  ActualizarFrase() {
    let datos = {
      marca_agua: this.frase,
      id: this.data.datos.id,
      user_name: this.user_name,
      ip: this.ip, ip_local: this.ips_locales
    }
    this.rest.ActualizarMarcaAgua(datos).subscribe(data => {
      this.toastr.success('Frase registrada exitosamente.', '', {
        timeOut: 6000,
      });
      this.ObtenerColores();
      this.ventana.close({ actualizar: true });
    })
  }

  // METODO PARA REGISTRAR DATOS
  GuardarFrase(form: any) {
    if (form.fraseReporteF === 'Otro') {
      if (form.nuevaForm != '') {
        this.frase = form.nuevaForm;
        this.ActualizarFrase();
      }
      else {
        this.toastr.info('Por favor ingrese una frase o seleccione otra de las opciones listadas.', '', {
          timeOut: 6000,
        });
      }
    }
    else {
      this.ActualizarFrase();
    }
  }

  /** ************************************************************************************************** **
   ** **                                 METODO PARA EXPORTAR A PDF                                   ** **
   ** ************************************************************************************************** **/
  // GENERACION DE REPORTE DE PDF
  async GenerarPdf(action = 'open') {
    const pdfMake = await this.validar.ImportarPDF();
    const documentDefinition = this.DefinirInformacionPDF();
    switch (action) {
      case 'open': pdfMake.createPdf(documentDefinition).open(); break;
      case 'print': pdfMake.createPdf(documentDefinition).print(); break;
      case 'download': pdfMake.createPdf(documentDefinition).download('Formato_Reportes'); break;
      default: pdfMake.createPdf(documentDefinition).open(); break;
    }
  }

  // DEFINICION DE PDF CABECERA - PIE DE PAGINA - ESTRUCTURA DE REPORTE
  DefinirInformacionPDF() {
    return {
      // ENCABEZADO DE LA PAGINA
      pageSize: 'A4',
      pageOrientation: 'landscape',
      watermark: { text: this.frase, color: 'blue', opacity: 0.1, bold: true, italics: false },
      header: { text: 'Impreso por:  ' + this.empleado[0].nombre + ' ' + this.empleado[0].apellido, margin: 5, fontSize: 9, opacity: 0.3, alignment: 'right' },

      // PIE DE PAGINA
      footer: function (currentPage: any, pageCount: any, fecha: any, hora: any) {
        var f = DateTime.now();
        fecha = f.toFormat('yyyy-MM-dd');
        hora = f.toFormat('HH:mm:ss');
        return {
          margin: 10,
          columns: [
            'Fecha: ' + fecha + ' Hora: ' + hora,
            {
              text: [
                {
                  text: '© Pag ' + currentPage.toString() + ' of ' + pageCount,
                  alignment: 'right', color: 'blue', opacity: 0.5
                }
              ],
            }
          ], fontSize: 10, color: '#A4B8FF',
        }
      },
      content: [
        { image: this.logo, width: 100, margin: [10, -25, 0, 5] },
        { text: localStorage.getItem('name_empresa')?.toUpperCase(), bold: true, fontSize: 14, alignment: 'center', margin: [0, -30, 0, 5] },
        { text: 'FORMATO REPORTES', bold: true, fontSize: 12, alignment: 'center', margin: [0, 0, 0, 0] },
        this.PresentarDataPDFEmpresas(),
      ],
      styles: {
        tableHeader: { fontSize: 9, bold: true, alignment: 'center', fillColor: this.p_color },
        tableHeaderS: { fontSize: 9, bold: true, alignment: 'center', fillColor: this.s_color },
        itemsTable: { fontSize: 8 },
        itemsTableC: { fontSize: 8, alignment: 'center' },
        tableMargin: { margin: [0, 5, 0, 0] },
      }
    };
  }

  // ESTRUCTURA DE PDF
  PresentarDataPDFEmpresas() {
    return {
      columns: [
        { width: '*', text: '' },
        {
          width: 'auto',
          style: 'tableMargin',
          table: {
            widths: ['auto', '*', 'auto', '*', 'auto', 'auto', 'auto', '*', 'auto'],
            body: [
              [
                { text: 'ID', style: 'tableHeader' },
                { text: 'NOMBRE', style: 'tableHeader' },
                { text: 'RUC', style: 'tableHeader' },
                { text: 'DIRECCIÓN', style: 'tableHeader' },
                { text: 'TELÉFONO', style: 'tableHeader' },
                { text: 'EMAIL', style: 'tableHeader' },
                { text: 'TIPO EMPRESA', style: 'tableHeader' },
                { text: 'REPRESENTANTE', style: 'tableHeader' },
                { text: 'RESUMEN', style: 'tableHeaderS' }
              ],
              ...this.empresas.map((obj: any) => {
                return [
                  { text: obj.id, style: 'itemsTableC' },
                  { text: obj.nombre, style: 'itemsTable' },
                  { text: obj.ruc, style: 'itemsTableC' },
                  { text: obj.direccion, style: 'itemsTable' },
                  { text: obj.telefono, style: 'itemsTableC' },
                  { text: obj.correo_empresa, style: 'itemsTable' },
                  { text: obj.tipo_empresa, style: 'itemsTable' },
                  { text: obj.representante, style: 'itemsTable' },
                  { text: 'Generalidades', style: 'itemsTable' },
                ];
              })
            ]
          }
        },
        { width: '*', text: '' },
      ]
    };
  }

  // METODO PARA CERRAR VENTANA
  CerrarVentana() {
    this.ventana.close({ actualizar: false });
  }

}
