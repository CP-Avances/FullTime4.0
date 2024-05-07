// IMPORTACION DE LIBRERIAS
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';
import { PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import * as moment from 'moment';

import * as xlsx from 'xlsx';
import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
import * as FileSaver from 'file-saver';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

import { MetodosComponent } from 'src/app/componentes/administracionGeneral/metodoEliminar/metodos.component';

import { AccionPersonalService } from 'src/app/servicios/accionPersonal/accion-personal.service';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
import { EmpresaService } from 'src/app/servicios/catalogos/catEmpresa/empresa.service';
import { MainNavService } from 'src/app/componentes/administracionGeneral/main-nav/main-nav.service';

@Component({
  selector: 'app-listar-tipo-accion',
  templateUrl: './listar-tipo-accion.component.html',
  styleUrls: ['./listar-tipo-accion.component.css']
})

export class ListarTipoAccionComponent implements OnInit {

  filtroNombre = '';

  // ITEMS DE PAGINACION DE LA TABLA
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;
  pageSizeOptions = [5, 10, 20, 50];

  empleado: any = [];
  idEmpleado: number;

  // CONTROL DE CAMPOS Y VALIDACIONES DEL FORMULARIO
  nombreF = new FormControl('', [Validators.minLength(2)]);

  // ASIGNACION DE VALIDACIONES A INPUTS DEL FORMULARIO
  public BuscarTipoAccionForm = new FormGroup({
    nombreForm: this.nombreF,
  });

  get habilitarAccion(): boolean { return this.funciones.accionesPersonal; }

  constructor(
    public restEmpre: EmpresaService,
    public ventana: MatDialog,
    public restE: EmpleadoService,
    private rest: AccionPersonalService,
    private toastr: ToastrService,
    private router: Router,
    private validar: ValidacionesService,
    private funciones: MainNavService,
  ) {
    this.idEmpleado = parseInt(localStorage.getItem('empleado') as string);
  }

  ngOnInit(): void {
    if (this.habilitarAccion === false) {
      let mensaje = {
        access: false,
        title: `Ups!!! al parecer no tienes activado en tu plan el Módulo de Acciones de Personal. \n`,
        message: '¿Te gustaría activarlo? Comunícate con nosotros.',
        url: 'www.casapazmino.com.ec'
      }
      return this.validar.RedireccionarHomeAdmin(mensaje);
    }
    else {
      this.ObtenerTipoAccionesPersonal();
      this.ObtenerEmpleados(this.idEmpleado);
      this.ObtenerLogo();
      this.ObtenerColores();
    }
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

  // METODO PARA MANEJAR PAGINACION
  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1;
  }

  // METODO PARA OBTENER TIPOS DE ACCIONES
  tipo_acciones: any = [];
  ObtenerTipoAccionesPersonal() {
    this.rest.ConsultarTipoAccionPersonal().subscribe(datos => {
      this.tipo_acciones = datos;
    });
  }

  // FUNCION PARA ELIMINAR REGISTROS
  Eliminar(id_accion: number) {
    this.rest.EliminarRegistro(id_accion).subscribe(res => {
      this.toastr.error('Registro eliminado.', '', {
        timeOut: 6000,
      });
      this.ObtenerTipoAccionesPersonal();
    });
  }

  // FUNCION PARA CONFIRMAR ELIMINAR REGISTROS
  ConfirmarDelete(datos: any) {
    this.ventana.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.Eliminar(datos.id);
        } else {
          this.router.navigate(['/acciones-personal']);
        }
      });
  }

  // METODO PARA LIMPIAR FORMULARIO
  LimpiarCampos() {
    this.BuscarTipoAccionForm.setValue({
      nombreForm: '',
    });
    this.ObtenerTipoAccionesPersonal();
  }


  // METODO PARA ABRIR EL FORMULARIO REGISTRAR
  ver_registrar: boolean = false;
  ver_lista: boolean = true;
  AbrirRegistrar() {
    this.ver_registrar = true;
    this.ver_lista = false;
  }

  // METODO PARA ABRIR EL FORMULARIO EDITAR
  ver_editar: boolean = false;
  accion: any;
  pagina: string = '';
  AbrirEditar(datos: any) {
    this.ver_lista = false;
    this.ver_editar = true;
    this.accion = datos;
    this.pagina = 'listar-tipos-acciones';
  }

  // METODO PARA ABRIR DATOS DE TIPO DE ACCION
  ver_datos: boolean = false;
  accion_id: number;
  AbrirDatosAccion(id: number) {
    this.ver_lista = false;
    this.ver_datos = true;
    this.accion_id = id;
  }

  /****************************************************************************************************** 
 *                                         METODO PARA EXPORTAR A PDF
 ******************************************************************************************************/
  generarPdf(action = 'open') {
    const documentDefinition = this.getDocumentDefinicion();

    switch (action) {
      case 'open': pdfMake.createPdf(documentDefinition).open(); break;
      case 'print': pdfMake.createPdf(documentDefinition).print(); break;
      case 'download': pdfMake.createPdf(documentDefinition).download(); break;

      default: pdfMake.createPdf(documentDefinition).open(); break;
    }

  }

  getDocumentDefinicion() {
    sessionStorage.setItem('TipoPermisos', this.tipo_acciones);
    return {

      // ENCABEZADO DE LA PAGINA
      pageOrientation: 'landscape',
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
        { image: this.logo, width: 150, margin: [10, -25, 0, 5] },
        { text: 'Lista de Tipos de Permisos', bold: true, fontSize: 20, alignment: 'center', margin: [0, -30, 0, 10] },
        this.presentarDataPDFTipoPermisos(),
      ],
      styles: {
        tableHeader: { fontSize: 12, bold: true, alignment: 'center', fillColor: this.p_color },
        itemsTable: { fontSize: 10, alignment: 'center', }
      }
    };
  }

  presentarDataPDFTipoPermisos() {
    return {
      columns: [
        { width: '*', text: '' },
        {
          width: 'auto',
          table: {
            widths: ['auto', 'auto', 'auto', 'auto', 'auto'],
            body: [
              [
                { text: 'Código', style: 'tableHeader' },
                { text: 'Tipo de acción de personal', style: 'tableHeader' },
                { text: 'Descripción', style: 'tableHeader' },
                { text: 'Base Legal', style: 'tableHeader' },
                { text: 'Tipo', style: 'tableHeader' },
              ],
              ...this.tipo_acciones.map(obj => {
                return [
                  { text: obj.id, style: 'itemsTable' },
                  { text: obj.nombre, style: 'itemsTable' },
                  { text: obj.descripcion, style: 'itemsTable' },
                  { text: obj.base_legal, style: 'itemsTable' },
                  { text: (obj.tipo_permiso == true ? 'Permiso' : obj.tipo_vacacion == true ? 'Vacación' : 'Situación propuesta'), style: 'itemsTable' },
                ];
              })
            ]
          },
          // ESTILO DE COLORES FORMATO ZEBRA
          layout: {
            fillColor: function (i: any) {
              return (i % 2 === 0) ? '#CCD1D1' : null;
            }
          }
        },
        { width: '*', text: '' },
      ]
    };
  }

  /** ************************************************************************************************** ** 
   ** **                                     METODO PARA EXPORTAR A EXCEL                             ** **
   ** ************************************************************************************************** **/
  exportToExcel() {
    const wsr: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.tipo_acciones);
    const wb: xlsx.WorkBook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, wsr, 'TipoPermisos');
    xlsx.writeFile(wb, "TipoAccionesPersonalEXCEL" + new Date().getTime() + '.xlsx');
  }

  /** ************************************************************************************************** ** 
   ** **                                   METODO PARA EXPORTAR A CSV                                 ** **
   ** ************************************************************************************************** **/

  exportToCVS() {
    const wse: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.tipo_acciones);
    const csvDataH = xlsx.utils.sheet_to_csv(wse);
    const data: Blob = new Blob([csvDataH], { type: 'text/csv;charset=utf-8;' });
    FileSaver.saveAs(data, "TipoAccionesPersonalCSV" + new Date().getTime() + '.csv');
  }

  /** ************************************************************************************************* **
   ** **                            PARA LA EXPORTACION DE ARCHIVOS XML                               ** **
   ** ************************************************************************************************* **/

  urlxml: string;
  data: any = [];
  exportToXML() {
    var objeto;
    var arregloTipoAcciones: any = [];
    this.tipo_acciones.forEach(obj => {
      objeto = {
        "tipo_accion_personal": {
          '@id': obj.id,
          "nombre": obj.nombre,
          "descripcion": obj.descripcion,
          "base_legal": obj.base_legal,
          "tipo_permiso": obj.tipo_permiso == true ? 'Permiso' : obj.tipo_vacacion == true ? 'Vacación' : 'Situación propuesta'
        }
      }
      arregloTipoAcciones.push(objeto)
    });
    this.rest.CrearXML(arregloTipoAcciones).subscribe(res => {
      this.data = res;
      this.urlxml = `${(localStorage.getItem('empresaURL') as string)}/departamento/download/` + this.data.name;
      window.open(this.urlxml, "_blank");
    });
  }

  //Control Botones
  getCrearTipoAccion(){
    const datosRecuperados = sessionStorage.getItem('paginaRol');
    if (datosRecuperados) {
      var datos = JSON.parse(datosRecuperados);
      return datos.some(item => item.accion === 'Crear Tipo de acción');
    }else{
      return !(parseInt(localStorage.getItem('rol') as string) !== 3);
    }
  }

  getVer(){
    const datosRecuperados = sessionStorage.getItem('paginaRol');
    if (datosRecuperados) {
      var datos = JSON.parse(datosRecuperados);
      return datos.some(item => item.accion === 'Ver' && item.id_funcion === 31);
    }else{
      return !(parseInt(localStorage.getItem('rol') as string) !== 3);
    }
  }

  getEditar(){
    const datosRecuperados = sessionStorage.getItem('paginaRol');
    if (datosRecuperados) {
      var datos = JSON.parse(datosRecuperados);
      return datos.some(item => item.accion === 'Editar' && item.id_funcion === 31);
    }else{
      return !(parseInt(localStorage.getItem('rol') as string) !== 3);
    }
  }

  getEliminar(){
    const datosRecuperados = sessionStorage.getItem('paginaRol');
    if (datosRecuperados) {
      var datos = JSON.parse(datosRecuperados);
      return datos.some(item => item.accion === 'Eliminar' && item.id_funcion === 31);
    }else{
      return !(parseInt(localStorage.getItem('rol') as string) !== 3);
    }
  }

  getDescargarReportes(){
    const datosRecuperados = sessionStorage.getItem('paginaRol');
    if (datosRecuperados) {
      var datos = JSON.parse(datosRecuperados);
      return datos.some(item => item.accion === 'Descargar Reportes' && item.id_funcion === 31);
    }else{
      return !(parseInt(localStorage.getItem('rol') as string) !== 3);
    }
  }
}
