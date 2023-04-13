import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, OnInit, Inject } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';
import { MatRadioChange } from '@angular/material/radio';
import { ToastrService } from 'ngx-toastr';
import { ThemePalette } from '@angular/material/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import * as moment from 'moment';
import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

import { EmpresaService } from 'src/app/servicios/catalogos/catEmpresa/empresa.service';
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';

@Component({
  selector: 'app-colores-empresa',
  templateUrl: './colores-empresa.component.html',
  styleUrls: ['./colores-empresa.component.css']
})

export class ColoresEmpresaComponent implements OnInit {

  ingresarOtro = false;

  // DATOS DE FORMULARIO DE REGISTRO DE MARCA DE AGUA
  fraseReporte = new FormControl('');
  nuevaF = new FormControl('');

  public fraseForm = new FormGroup({
    fraseReporteF: this.fraseReporte,
    nuevaForm: this.nuevaF
  });

  // DATOS DE FORMULARIO DE COLORES
  principal = new FormControl('');
  secundario = new FormControl('');

  public coloresForm = new FormGroup({
    color_p: this.principal,
    color_s: this.secundario
  });

  idEmpleado: number;
  empleado: any = [];
  p_color: any;
  s_color: any;
  frase: any;

  verColores: boolean = false;
  verFrase: boolean = false;

  /**
   * VARIABLES PROGRESS SPINNER
   */
  color: ThemePalette = 'primary';
  mode: ProgressSpinnerMode = 'indeterminate';
  value = 10;
  habilitarprogress: boolean = false;

  constructor(
    private toastr: ToastrService,
    private rest: EmpresaService,
    public restE: EmpleadoService,
    public router: Router,
    public ventana: MatDialogRef<ColoresEmpresaComponent>,
    public location: Location,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.idEmpleado = parseInt(localStorage.getItem('empleado') as string);
  }

  ngOnInit(): void {
    this.ObtenerEmpleados(this.idEmpleado);
    this.ObtenerLogo();
    this.VerFormularios();
    this.obtenerColores();
  }

  // METODO PARA MOSTRAR VENTANA DE COLORES O MARCA DE AGUA
  VerFormularios() {
    if (this.data.ventana === 'colores') {
      this.verColores = true;
    } else {
      this.verFrase = true;
      this.ImprimirFrase();
    }
  }

  // METODO PARA VER LA INFORMACIÓN DEL EMPLEADO 
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

  // METODO DE REGISTRO DE COLORES
  CambiarColores() {
    this.habilitarprogress = true;
    let datos = {
      color_p: this.p_color,
      color_s: this.s_color,
      id: this.data.datos.id
    }
    this.rest.ActualizarColores(datos).subscribe(data => {
      this.toastr.success('Colores de encabezados de reportes registrados.', '', {
        timeOut: 6000,
      });
      this.obtenerColores();
      this.ventana.close({ actualizar: true });
      this.habilitarprogress = false;
    })
  }

  // METODO PARA OBTENER DATOS DE EMPRESA COLORES - MARCA DE AGUA
  empresas: any = [];
  obtenerColores() {
    this.empresas = [];
    this.rest.ConsultarDatosEmpresa(this.data.datos.id).subscribe(res => {
      this.empresas = res;
      this.p_color = this.empresas[0].color_p;
      this.s_color = this.empresas[0].color_s;
      this.frase = this.empresas[0].marca_agua;
    });
  }

  // METODO PARA MOSTRAR INFORMACION DE MARCA DE AGUA
  ImprimirFrase() {
    if (this.data.datos.marca_agua === 'FullTime' || this.data.datos.marca_agua === 'Confidencial') {
      this.fraseReporte.setValue(this.data.datos.marca_agua)
    }
    else if (this.data.datos.marca_agua === '' || this.data.datos.marca_agua === null) {
      this.fraseReporte.setValue('')
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
    this.habilitarprogress = true;
    let datos = {
      marca_agua: this.frase,
      id: this.data.datos.id
    }
    this.rest.ActualizarMarcaAgua(datos).subscribe(data => {
      this.toastr.success('Frase registrada exitosamente.', '', {
        timeOut: 6000,
      });
      this.obtenerColores();
      this.ventana.close({ actualizar: true });
      this.habilitarprogress = false;
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
  GenerarPdf(action = 'open') {
    const documentDefinition = this.getDocumentDefinicion();

    switch (action) {
      case 'open': pdfMake.createPdf(documentDefinition).open(); break;
      case 'print': pdfMake.createPdf(documentDefinition).print(); break;
      case 'download': pdfMake.createPdf(documentDefinition).download(); break;

      default: pdfMake.createPdf(documentDefinition).open(); break;
    }
  }

  // DEFINICION DE PDF CABECERA - PIE DE PAGINA - ESTRUCTURA DE REPORTE
  getDocumentDefinicion() {
    sessionStorage.setItem('Empresas', this.empresas);

    return {

      // ENCABEZADO DE LA PÁGINA
      pageOrientation: 'landscape',
      watermark: { text: this.frase, color: 'blue', opacity: 0.1, bold: true, italics: false },
      header: { text: 'Impreso por:  ' + this.empleado[0].nombre + ' ' + this.empleado[0].apellido, margin: 5, fontSize: 9, opacity: 0.3, alignment: 'right' },

      // PIE DE PÁGINA
      footer: function (currentPage: any, pageCount: any, fecha: any, hora: any) {
        var f = moment();
        fecha = f.format('YYYY-MM-DD');
        hora = f.format('HH:mm:ss');
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
        { image: this.logo, width: 150, margin: [10, -25, 0, 5] },
        { text: 'FORMATO REPORTES', bold: true, fontSize: 20, alignment: 'center', margin: [0, -30, 0, 10] },
        this.PresentarDataPDFEmpresas(),
      ],
      styles: {
        tableHeader: { fontSize: 12, bold: true, alignment: 'center', fillColor: this.p_color },
        tableHeaderS: { fontSize: 12, bold: true, alignment: 'center', fillColor: this.s_color },
        itemsTable: { fontSize: 10 },
        itemsTableC: { fontSize: 10, alignment: 'center' },
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
              ...this.empresas.map(obj => {
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
