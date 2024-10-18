// SECCION DE LIBRERIAS
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';

import * as xlsx from 'xlsx';
import * as moment from 'moment';
import * as xml2js from 'xml2js';
import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
import * as FileSaver from 'file-saver';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

import { ParametrosService } from 'src/app/servicios/parametrosGenerales/parametros.service';
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
import { EmpresaService } from 'src/app/servicios/catalogos/catEmpresa/empresa.service';

@Component({
  selector: 'app-listar-parametro',
  templateUrl: './listar-parametro.component.html',
  styleUrls: ['./listar-parametro.component.css']
})

export class ListarParametroComponent implements OnInit {

  // ITEMS DE PAGINACION DE LA TABLA
  numero_pagina: number = 1;
  tamanio_pagina: number = 5;
  pageSizeOptions = [5, 10, 20, 50];

  empleado: any = [];
  idEmpleado: number;
  tipoPermiso: any = [];

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  // CONTROL DE CAMPOS Y VALIDACIONES DEL FORMULARIO
  descripcionF = new FormControl('', [Validators.minLength(2)]);

  // ASIGNACION DE VALIDACIONES A INPUTS DEL FORMULARIO
  public formulario = new FormGroup({
    descripcionForm: this.descripcionF,
  });

  constructor(
    public restE: EmpleadoService,
    public ventana: MatDialog,
    public restEmpre: EmpresaService,
    private restP: ParametrosService,

  ) {
    this.idEmpleado = parseInt(localStorage.getItem('empleado') as string);
  }

  ngOnInit(): void {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');
    
    this.ObtenerEmpleados(this.idEmpleado);
    this.ObtenerParametros();
    this.ObtenerColores();
    this.ObtenerLogo();
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

  // EVENTO PARA MANEJAR PAGINACIÓN EN TABLAS
  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1;
  }

  // METODO PARA LISTAR PARÁMETROS
  parametros: any = [];
  ObtenerParametros() {
    this.parametros = [];
    this.numero_pagina = 1;
    this.restP.ListarParametros().subscribe(datos => {
      datos.sort((a: any, b: any) => a.id - b.id);
      this.parametros = datos;
      this.ObtenerDetallesParametro();
    });
  }

  // METOOD PARA OBTENER DETALLES DE PARAMETROS
  detalles: any = [];
  ObtenerDetallesParametro() {
    this.detalles = [];
    this.restP.BuscarDetallesParametros().subscribe(datos => {
      datos.sort((a: any, b: any) => a.id - b.id);
      this.detalles = datos;
      this.parametros.forEach((parametro: any) => {
        parametro.detalles = this.detalles.filter((detalle: any) => detalle.id_parametro === parametro.id);
      });
    });
  }

  // METODO PARA LIMPIAR CAMPO DE BUSQUEDA
  LimpiarCampos() {
    this.formulario.setValue({
      descripcionForm: '',
    });
    this.ObtenerParametros();
  }

  // METODO PARA VER DETALLE DE PARAMETROS
  ver_lista: boolean = true;
  ver_detalle: boolean = false;
  parametro_id: string
  VerDetalleParametro(id: number) {
    this.ver_detalle = true;
    this.ver_lista = false;
    this.parametro_id = String(id);
  }

  /** ************************************************************************************************** **
   ** **                                 METODO PARA EXPORTAR A PDF                                   ** **
   ** ************************************************************************************************** **/
  GenerarPdf(action = 'open') {
    const documentDefinition = this.DefinirInformacionPDF();
    switch (action) {
      case 'open': pdfMake.createPdf(documentDefinition).open(); break;
      case 'print': pdfMake.createPdf(documentDefinition).print(); break;
      case 'download': pdfMake.createPdf(documentDefinition).download('Parametros_generales' + '.pdf'); break;
      default: pdfMake.createPdf(documentDefinition).open(); break;
    }

  }

  DefinirInformacionPDF() {
    return {
      // ENCABEZADO DE LA PAGINA
      pageOrientation: 'portrait',
      watermark: { text: this.frase, color: 'blue', opacity: 0.1, bold: true, italics: false },
      header: { text: 'Impreso por:  ' + this.empleado[0].nombre + ' ' + this.empleado[0].apellido, margin: 10, fontSize: 9, opacity: 0.3, alignment: 'right' },

      // PIE DE PAGINA
      footer: function (currentPage: any, pageCount: any, fecha: any, hora: any) {
        var f = moment();
        fecha = f.format('YYYY-MM-DD');
        hora = f.format('HH:mm:ss');
        return {
          margin: 10,
          columns: [
            { text: 'Fecha: ' + fecha + ' Hora: ' + hora, opacity: 0.3 },
            {
              text: [
                {
                  text: '© Pag ' + currentPage.toString() + ' of ' + pageCount,
                  alignment: 'right', opacity: 0.3
                }
              ],
            }
          ], fontSize: 10
        }
      },
      content: [
        { image: this.logo, width: 100, margin: [10, -25, 0, 5] },
        { text: localStorage.getItem('name_empresa')?.toUpperCase(), bold: true, fontSize: 14, alignment: 'center', margin: [0, -30, 0, 5] },
        { text: 'PARÁMETROS GENERALES', bold: true, fontSize: 12, alignment: 'center', margin: [0, 0, 0, 0] },
        ...this.PresentarDataPDF(),
      ],
      styles: {
        tableMarginCabecera: { margin: [0, 10, 0, 0] },
        itemsTableInfo: { fontSize: 9, margin: [0, -1, 0, -1], fillColor: this.p_color },
        tableMargin: { margin: [0, 0, 0, 0] },
        tableHeader: { fontSize: 8, bold: true, alignment: 'center', fillColor: this.s_color },
        itemsTableCentrado: { fontSize: 8, alignment: 'center' },
      }
    };
  }

  // METODO PARA PRESENTAR DATOS DEL DOCUMENTO PDF
  PresentarDataPDF(): Array<any> {
    let n: any = []
    this.parametros.forEach((obj: any) => {
      n.push({
        style: 'tableMarginCabecera',
        table: {
          widths: ['*'],
          headerRows: 1,
          body: [
            [
              { text: `PARÁMETRO: ${obj.descripcion}`, style: 'itemsTableInfo', border: [true, true, true, true] },
            ],
          ]
        },
      });
      if (obj.detalles.length > 0) {
        n.push({
          style: 'tableMargin',
          table: {
            widths: ['auto', '*', '*'],
            headerRows: 1,
            body: [
              [
                { text: 'CÓDIGO', style: 'tableHeader' },
                { text: 'DETALLE', style: 'tableHeader' },
                { text: 'DESCRIPCIÓN', style: 'tableHeader' },
              ],
              ...obj.detalles.map((detalle: any) => {
                return [
                  { text: detalle.id, style: 'itemsTableCentrado' },
                  { text: detalle.descripcion, style: 'itemsTableCentrado' },
                  { text: detalle.observacion, style: 'itemsTableCentrado' },
                ];
              })
            ]
          },
          layout: {
            fillColor: function (rowIndex: any) {
              return (rowIndex % 2 === 0) ? '#E5E7E9' : null;
            }
          }
        });
      }
    });
    return n;
  }


  /** ************************************************************************************************* **
   ** **                                 METODO PARA EXPORTAR A EXCEL                                ** **
   ** ************************************************************************************************* **/

  ExportToExcel() {
    const wsr: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.EstructurarDatosExcel());
    const wb: xlsx.WorkBook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, wsr, 'ParametrosGenerales');
    xlsx.writeFile(wb, "ParametrosGeneralesEXCEL" + '.xlsx');
  }

  EstructurarDatosExcel() {
    let datos: any = [];
    let n: number = 1;
    this.parametros.forEach((obj: any) => {
      obj.detalles.forEach((det: any) => {
        datos.push({
          'N°': n++,
          'PARÁMETRO': obj.descripcion,
          'DETALLE': det.descripcion,
          'DESCRIPCIÓN': det.observacion
        });
      });
    });

    return datos;
  }

  /** ************************************************************************************************* **
   ** **                               METODO PARA EXPORTAR A CSV                                    ** **
   ** ************************************************************************************************* **/

  ExportToCVS() {
    const wse: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.EstructurarDatosCSV());
    const csvDataH = xlsx.utils.sheet_to_csv(wse);
    const data: Blob = new Blob([csvDataH], { type: 'text/csv;charset=utf-8;' });
    FileSaver.saveAs(data, "ParametrosGeneralesCSV" + '.csv');
  }

  EstructurarDatosCSV() {
    let datos: any = [];
    let n: number = 1;
    this.parametros.forEach((obj: any) => {
      obj.detalles.forEach((det: any) => {
        datos.push({
          'n': n++,
          'parametro': obj.descripcion,
          'detalle': det.descripcion,
          'descripcion': det.observacion
        });
      });
    });
    return datos;
  }

  /** ************************************************************************************************* **
   ** **                           PARA LA EXPORTACION DE ARCHIVOS XML                                ** **
   ** ************************************************************************************************* **/

  urlxml: string;
  data: any = [];
  ExportToXML() {
    var objeto: any;
    var arregloHorarios: any = [];
    this.parametros.forEach((obj: any) => {
      let detalles: any = [];
      obj.detalles.forEach((det: any) => {
        detalles.push({
          "$": { "id": det.id },
          "detalle": det.descripcion,
          "descripcion": det.observacion
        });
      });
      objeto = {
        "parametro": {
          "$": { "codigo": obj.id },
          "nombre": obj.descripcion,
          "detalles": { "detalle": detalles }
        }
      }
      arregloHorarios.push(objeto)
    });

    const xmlBuilder = new xml2js.Builder({ rootName: 'ParametrosGenerales' });
    const xml = xmlBuilder.buildObject(arregloHorarios);

    if (xml === undefined) {
      return;
    }

    const blob = new Blob([xml], { type: 'application/xml' });
    const xmlUrl = URL.createObjectURL(blob);

    // ABRIR UNA NUEVA PESTAÑA O VENTANA CON EL CONTENIDO XML
    const newTab = window.open(xmlUrl, '_blank');
    if (newTab) {
      newTab.opener = null; // EVITAR QUE LA NUEVA PESTAÑA TENGA ACCESO A LA VENTANA PADRE
      newTab.focus(); // DAR FOCO A LA NUEVA PESTAÑA
    } else {
      alert('No se pudo abrir una nueva pestaña. Asegúrese de permitir ventanas emergentes.');
    }

    const a = document.createElement('a');
    a.href = xmlUrl;
    a.download = 'ParametrosGenerales.xml';
    // SIMULAR UN CLIC EN EL ENLACE PARA INICIAR LA DESCARGA
    a.click();
  }

  //CONTROL BOTONES
  getCrearParametro(){
    var datosRecuperados = sessionStorage.getItem('paginaRol');
    if(datosRecuperados){
      var datos = JSON.parse(datosRecuperados);
      var encontrado = false;
      const index = datos.findIndex(item => item.accion === 'Crear Parámetro');
      if (index !== -1) {
        encontrado = true;
      }
      return encontrado;
    }else{
      if(parseInt(localStorage.getItem('rol') as string) != 1){
        return false;
      }else{
        return true;
      }
    }
  }

  getEditarParametros(){
    var datosRecuperados = sessionStorage.getItem('paginaRol');
    if(datosRecuperados){
      var datos = JSON.parse(datosRecuperados);
      var encontrado = false;
      const index = datos.findIndex(item => item.accion === 'Editar Parámetro');
      if (index !== -1) {
        encontrado = true;
      }
      return encontrado;
    }else{
      if(parseInt(localStorage.getItem('rol') as string) != 1){
        return false;
      }else{
        return true;
      }
    }
  }

  getEliminarParametros(){
    var datosRecuperados = sessionStorage.getItem('paginaRol');
    if(datosRecuperados){
      var datos = JSON.parse(datosRecuperados);
      var encontrado = false;
      const index = datos.findIndex(item => item.accion === 'Eliminar Parámetro');
      if (index !== -1) {
        encontrado = true;
      }
      return encontrado;
    }else{
      if(parseInt(localStorage.getItem('rol') as string) != 1){
        return false;
      }else{
        return true;
      }
    }
  }

  getDescargarReportesParametros(){
    var datosRecuperados = sessionStorage.getItem('paginaRol');
    if(datosRecuperados){
      var datos = JSON.parse(datosRecuperados);
      var encontrado = false;
      const index = datos.findIndex(item => item.accion === 'Descargar Reportes Parámetro');
      if (index !== -1) {
        encontrado = true;
      }
      return encontrado;
    }else{
      if(parseInt(localStorage.getItem('rol') as string) != 1){
        return false;
      }else{
        return true;
      }
    }
  }

  getVerParametro(){
    var datosRecuperados = sessionStorage.getItem('paginaRol');
    if(datosRecuperados){
      var datos = JSON.parse(datosRecuperados);
      var encontrado = false;
      const index = datos.findIndex(item => item.accion === 'Ver Parámetro');
      if (index !== -1) {
        encontrado = true;
      }
      return encontrado;
    }else{
      if(parseInt(localStorage.getItem('rol') as string) != 1){
        return false;
      }else{
        return true;
      }
    }
  }

  
}
