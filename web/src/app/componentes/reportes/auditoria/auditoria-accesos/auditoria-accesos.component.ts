// IMPORTAR LIBRERIAS
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { ToastrService } from 'ngx-toastr';
import { DateTime } from 'luxon';
// IMPORTAR SERVICIOS
import { ValidacionesService } from '../../../../servicios/generales/validaciones/validaciones.service';
import { ParametrosService } from 'src/app/servicios/configuracion/parametrizacion/parametrosGenerales/parametros.service';
import { AuditoriaService } from 'src/app/servicios/reportes/auditoria/auditoria.service';
import { ReportesService } from 'src/app/servicios/reportes/reportes.service';
import { EmpresaService } from 'src/app/servicios/configuracion/parametrizacion/catEmpresa/empresa.service';

@Component({
  standalone: false,
  selector: 'app-auditoria-accesos',
  templateUrl: './auditoria-accesos.component.html',
  styleUrl: './auditoria-accesos.component.css'
})

export class AuditoriaAccesosComponent implements OnInit {

  // ITEMS DE PAGINACION DE LA TABLA
  @ViewChild('paginatorDetalle') paginatorDetalle: MatPaginator;
  pageSizeOptions = [5, 10, 20, 50];
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;

  // VARIABLES  
  formato_fecha: string = 'dd/MM/yyyy';
  formato_hora: string = 'HH:mm:ss';
  idioma_fechas: string = 'es';
  verDetalle: boolean = false;
  datosPdF: any = []

  // CRITERIOS DE BUSQUEDA POR FECHAS
  get rangoFechas() { return this.reporteService.rangoFechas };

  constructor(
    private reporteService: ReportesService,
    private restAuditoria: AuditoriaService,
    private restEmpre: EmpresaService,
    private toastr: ToastrService,
    public validar: ValidacionesService, // SERVICIO CONTROL DE VALIDACONES
    public parametro: ParametrosService,
  ) {
    this.ObtenerLogo();
    this.ObtenerColores();
  }

  ngOnInit(): void {
    this.BuscarParametro();
  }

  // METODO PARA BUSCAR DATOS DE PARAMETROS
  BuscarParametro() {
    let datos: any = [];
    let detalles = { parametros: '1, 2' };
    this.parametro.ListarVariosDetallesParametros(detalles).subscribe(
      res => {
        datos = res;
        datos.forEach((p: any) => {
          // id_tipo_parametro Formato fecha = 1
          if (p.id_parametro === 1) {
            this.formato_fecha = p.descripcion;
          }
          // id_tipo_parametro Formato hora = 2
          else if (p.id_parametro === 2) {
            this.formato_hora = p.descripcion;
          }
        })
      });
  }

  // VALIDACIONES DE OPCIONES DE REPORTE
  ValidarReporte(action: any) {
    if (this.rangoFechas.fec_inico === '' || this.rangoFechas.fec_final === '') return this.toastr.error('Ingresar fechas de búsqueda.');
    this.ObtenerAuditoriaAcceso(action);
  }

  // METODO PARA MODELAR DATOS EN LAS TABLAS AUDITORIA
  async ObtenerAuditoriaAcceso(accion: any) {
    this.datosPdF = [];
    const buscarDatos = {
      desde: this.rangoFechas.fec_inico,
      hasta: this.rangoFechas.fec_final,
    };
    this.restAuditoria.ConsultarAuditoriaAccesos(buscarDatos).subscribe(
      (response: any) => {
        this.datosPdF = response.datos;
        if (this.datosPdF.length != 0) {
          this.FormatearDatos();
          console.log('auditoria ', this.datosPdF);
          switch (accion) {
            case 'ver':
              this.VerDatos();
              break;
            default:
              this.GenerarPDF(this.datosPdF, accion);
              break;
          }
        } else {
          this.toastr.error("No existen registros de auditoría.")
        }
      },
      error => {
        this.toastr.error("No existen registros de auditoría.")
      }
    );
  }

  // METODO PARA FORMATEAR DATOS
  FormatearDatos() {
    this.datosPdF.forEach((a: any) => {
      a.fecha_ = this.validar.FormatearFecha(a.fecha, this.formato_fecha, this.validar.dia_abreviado, this.idioma_fechas);
      a.hora_ = this.validar.FormatearHora(a.hora, this.formato_hora);
    })
  }

  /** ****************************************************************************************** **
  **                              COLORES Y LOGO PARA EL REPORTE                                **
  ** ****************************************************************************************** **/
  logo: any = String;
  ObtenerLogo() {
    this.restEmpre.LogoEmpresaImagenBase64(localStorage.getItem('empresa') as string).subscribe(res => {
      this.logo = 'data:image/jpeg;base64,' + res.imagen;
    });
  }

  // METODO PARA OBTENER COLORES Y MARCA DE AGUA DE EMPRESA
  p_color: any;
  s_color: any;
  frase: any;
  ObtenerColores() {
    this.restEmpre.ConsultarDatosEmpresa(parseInt(localStorage.getItem('empresa') as string)).subscribe(res => {
      this.p_color = res[0].color_principal;
      this.s_color = res[0].color_secundario;
      this.frase = res[0].marca_agua;
    });
  }

  /** ****************************************************************************************** **
   ** **                                             PDF                                      ** **
   ** ****************************************************************************************** **/
  async GenerarPDF(data: any, action: any) {
    const pdfMake = await this.validar.ImportarPDF();
    let documentDefinition: any;
    documentDefinition = this.DefinirInformacionPDF(data);
    let doc_name = `Auditoría.pdf`;
    switch (action) {
      case 'open': pdfMake.createPdf(documentDefinition).open(); break;
      case 'print': pdfMake.createPdf(documentDefinition).print(); break;
      case 'download': pdfMake.createPdf(documentDefinition).download(doc_name); break;
      default: pdfMake.createPdf(documentDefinition).open(); break;
    }
  }

  DefinirInformacionPDF(data: any) {
    return {
      pageSize: 'A4',
      pageOrientation: 'landscape',
      pageMargins: [40, 50, 40, 50],
      watermark: { text: this.frase, color: 'blue', opacity: 0.1, bold: true, italics: false },
      header: { text: 'Impreso por:  ' + localStorage.getItem('fullname_print'), margin: 10, fontSize: 9, opacity: 0.3, alignment: 'right' },
      footer: function (currentPage: any, pageCount: any, fecha: any) {
        let f = DateTime.now();
        fecha = f.toFormat('yyyy-MM-dd');
        let time = f.toFormat('HH:mm:ss');
        return {
          margin: 10,
          columns: [
            { text: 'Fecha: ' + fecha + ' Hora: ' + time, opacity: 0.3 },
            {
              text: [
                {
                  text: '© Pag ' + currentPage.toString() + ' de ' + pageCount,
                  alignment: 'right', opacity: 0.3
                }
              ],
            }
          ],
          fontSize: 10
        }
      },
      content: [
        { image: this.logo, width: 100, margin: [10, -25, 0, 5] },
        { text: (localStorage.getItem('name_empresa') as string).toUpperCase(), bold: true, fontSize: 14, alignment: 'center', margin: [0, -30, 0, 5] },
        { text: `REPORTE DE AUDITORÍA DE ACCESOS AL SISTEMA`, bold: true, fontSize: 12, alignment: 'center', margin: [0, 0, 0, 0] },
        ...this.EstructurarDatosPDF(data).map((obj: any) => {
          return obj
        })
      ],
      styles: {
        tableHeader: { fontSize: 8, bold: true, alignment: 'center', fillColor: this.p_color, valign: 'middle' },
        itemsTable: { fontSize: 8 },
        itemsTableInfo: { fontSize: 10, margin: [0, 3, 0, 3], fillColor: this.s_color },
        itemsTableCentrado: { fontSize: 8, alignment: 'center' },
        tableMargin: { margin: [0, 0, 0, 0] },
        tableMarginCabecera: { margin: [0, 15, 0, 0] },
      }
    };
  }

  EstructurarDatosPDF(data: any[]): Array<any> {
    let n: any = []
    let totalAuditoria = 0;
    // AÑADIR LA CABECERA CON INFORMACION DE LA PLATAFORMA
    n.push({
      style: 'tableMarginCabecera',
      table: {
        widths: ['*', '*'],
        headerRows: 1,
        body: [
          [
            {
              border: [true, true, false, false],
              bold: true,
              text: 'PLATAFORMA: ' + data[0].plataforma,
              style: 'itemsTableInfo'
            },
            {
              border: [false, true, true, false],
              text: 'N° Registros: ' + data.length,
              style: 'itemsTableInfo',
            },
          ]
        ]
      }
    });
    // AÑADIR LA TABLA DE DATOS
    n.push({
      style: 'tableMargin',
      table: {
        widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', '*'],
        headerRows: 2,
        body: [
          [
            { text: 'ITEM', rowSpan: 2, style: 'tableHeader', valign: 'middle' },
            { text: 'PLATAFORMA', rowSpan: 2, style: 'tableHeader', valign: 'middle' },
            { text: 'USUARIO', rowSpan: 2, style: 'tableHeader', valign: 'middle' },
            { text: 'IP', rowSpan: 1, colSpan: 2, style: 'tableHeader' },
            {},
            { text: 'ACCESO', rowSpan: 2, style: 'tableHeader', valign: 'middle' },
            { text: 'FECHA', rowSpan: 2, style: 'tableHeader', valign: 'middle' },
            { text: 'HORA', rowSpan: 2, style: 'tableHeader', valign: 'middle' },
            { text: 'OBSERVACIONES', rowSpan: 2, style: 'tableHeader', valign: 'middle' },
          ],
          [
            {},
            {},
            {},
            { text: 'IP PÚBLICA', rowSpan: 1, style: 'tableHeader' },
            { text: 'IP LOCAL', rowSpan: 1, style: 'tableHeader' },
            {},
            {},
            {},
            {},

          ],
          ...data.map((audi) => {
            totalAuditoria += 1;
            return [
              { style: 'itemsTableCentrado', text: totalAuditoria },
              { style: 'itemsTable', text: audi.plataforma },
              { style: 'itemsTableCentrado', text: audi.user_name },
              { style: 'itemsTableCentrado', text: audi.ip_addres },
              { style: 'itemsTableCentrado', text: audi.ip_addres_local },
              { style: 'itemsTableCentrado', text: audi.acceso },
              { style: 'itemsTable', text: audi.fecha_ },
              { style: 'itemsTable', text: audi.hora_ },
              { style: 'itemsTable', text: audi.observaciones, fontSize: 6, noWrap: false, overflow: 'hidden', margin: [4, 0, 9, 0] },
            ]
          })
        ]
      },
      layout: {
        fillColor: function (rowIndex: any) {
          return (rowIndex % 2 === 0) ? '#E5E7E9' : null;
        }
      }
    });
    return n;
  }

  // METODO PARA REGRESAR A LA PAGINA ANTERIOR
  Regresar() {
    this.verDetalle = false;
    this.paginatorDetalle.firstPage();
  }

  // METODO DE CONTROL DE PAGINACION
  ManejarPaginaDet(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1;
  }

  //ENVIAR DATOS A LA VENTANA DE DETALLE
  VerDatos() {
    this.verDetalle = true;
  }

}
