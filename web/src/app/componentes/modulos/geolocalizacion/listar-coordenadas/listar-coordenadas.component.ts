// SECCION DE LIBRERIAS
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';
import { PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import * as moment from 'moment';

import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
import * as xlsx from 'xlsx';
import * as FileSaver from 'file-saver';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

import { EmpleadoUbicacionService } from 'src/app/servicios/empleadoUbicacion/empleado-ubicacion.service';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
import { EmpresaService } from 'src/app/servicios/catalogos/catEmpresa/empresa.service';
import { MainNavService } from 'src/app/componentes/administracionGeneral/main-nav/main-nav.service';

import { CrearCoordenadasComponent } from '../crear-coordenadas/crear-coordenadas.component';
import { EditarCoordenadasComponent } from '../editar-coordenadas/editar-coordenadas.component';
import { MetodosComponent } from 'src/app/componentes/administracionGeneral/metodoEliminar/metodos.component';

@Component({
  selector: 'app-listar-coordenadas',
  templateUrl: './listar-coordenadas.component.html',
  styleUrls: ['./listar-coordenadas.component.css']
})

export class ListarCoordenadasComponent implements OnInit {

  // ITEMS DE PAGINACION DE LA TABLA
  numero_pagina: number = 1;
  tamanio_pagina: number = 5;
  pageSizeOptions = [5, 10, 20, 50];
  
  tipoPermiso: any = [];
  empleado: any = [];
  idEmpleado: number;

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  // CONTROL DE CAMPOS Y VALIDACIONES DEL FORMULARIO
  descripcionF = new FormControl('', [Validators.minLength(2)]);

  // ASIGNACION DE VALIDACIONES A INPUTS DEL FORMULARIO
  public CoordenadasForm = new FormGroup({
    descripcionForm: this.descripcionF,
  });

  get habilitarGeolocalizacion(): boolean { return this.funciones.geolocalizacion; }

  constructor(
    public restEmpre: EmpresaService,
    public ventana: MatDialog,
    public restE: EmpleadoService,
    private restU: EmpleadoUbicacionService,
    private toastr: ToastrService,
    private router: Router,
    private validar: ValidacionesService,
    private funciones: MainNavService,

  ) {
    this.idEmpleado = parseInt(localStorage.getItem('empleado') as string);
  }

  ngOnInit(): void {
    if (this.habilitarGeolocalizacion === false) {
      let mensaje = {
        access: false,
        title: `Ups!!! al parecer no tienes activado en tu plan el Módulo de Geolocalización. \n`,
        message: '¿Te gustaría activarlo? Comunícate con nosotros.',
        url: 'www.casapazmino.com.ec'
      }
      return this.validar.RedireccionarHomeAdmin(mensaje);
    }
    else {
      this.user_name = localStorage.getItem('usuario');
      this.ip = localStorage.getItem('ip');
      this.ObtenerCoordenadas();
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

  // EVENTO PARA MANEJAR PAGINACIÓN EN TABLAS
  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1;
  }

  // METODO PARA LISTAR UBICACIONES GEOGRÁFICAS
  coordenadas: any = [];
  ObtenerCoordenadas() {
    this.coordenadas = [];
    this.restU.ListarCoordenadas().subscribe(datos => {
      this.coordenadas = datos;
    }, error => { });
  }

  // METODO PARA LIMPIAR CAMPO DE BUSQUEDA
  LimpiarCampos() {
    this.CoordenadasForm.setValue({
      descripcionForm: '',
    });
    this.ObtenerCoordenadas();
  }

  // METODO PARA ABRIR VENTANA CREACIÓN DE REGISTRO
  CrearParametro(): void {
    this.ventana.open(CrearCoordenadasComponent,
      { width: '400px' }).afterClosed().subscribe(item => {
        if(item){
          this.VerDetallesCoordenadas(item);
        }
      });
  }

  // METODO PARA ABRIR VENTANA EDICIÓN DE REGISTRO
  AbrirEditar(datos: any): void {
    this.ventana.open(EditarCoordenadasComponent,
      { width: '400px', data: { ubicacion: datos, actualizar: false } }).afterClosed().subscribe(item => {
        if(item){
          this.VerDetallesCoordenadas(item);
        }
      });
  }

  // FUNCION PARA ELIMINAR REGISTRO SELECCIONADO
  Eliminar(id: number) {
    const datos = {
      user_name: this.user_name,
      ip: this.ip
    };
    this.restU.EliminarCoordenadas(id,datos).subscribe((res: any) => {
      if (res.message === 'false') {
        this.toastr.warning('No es posible eliminar registro.', 'Verificar dependencias.', {
          timeOut: 6000,
        });
      }
      else {
        this.toastr.error('Registro eliminado.', '', {
          timeOut: 6000,
        });
        this.ObtenerCoordenadas();
      }
    });
  }

  // FUNCION PARA CONFIRMAR SI SE ELIMINA O NO UN REGISTRO
  ConfirmarDelete(datos: any) {
    this.ventana.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.Eliminar(datos.id);
        } else {
          this.router.navigate(['/coordenadas']);
        }
      });
  }

  // METODO PARA VER DETALLE DE COORDENADAS
  ver_lista: boolean = true;
  ver_detalles: boolean = false;
  coordenada_id: number;
  VerDetallesCoordenadas(id: number) {
    this.ver_lista = false;
    this.ver_detalles = true;
    this.coordenada_id = id;
  }

  /** ************************************************************************************************** **
   ** **                              METODO PARA EXPORTAR A PDF                                      ** **
   ** ************************************************************************************************** **/
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
    sessionStorage.setItem('Parametros', this.coordenadas);
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
        { image: this.logo, width: 150, margin: [10, -25, 0, 5] },
        { text: 'Lista de coordenadas geográficas', bold: true, fontSize: 20, alignment: 'center', margin: [0, -30, 0, 10] },
        this.presentarDataPDFTipoPermisos(),
      ],
      styles: {
        tableHeader: { fontSize: 9, bold: true, alignment: 'center', fillColor: this.p_color },
        itemsTable: { fontSize: 8, alignment: 'center', }
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
            widths: ['auto', 'auto', 'auto', 'auto'],
            body: [
              [
                { text: 'Código', style: 'tableHeader' },
                { text: 'Descripción', style: 'tableHeader' },
                { text: 'Latitud', style: 'tableHeader' },
                { text: 'Longitud', style: 'tableHeader' },
              ],
              ...this.coordenadas.map((obj: any) => {
                return [
                  { text: obj.id, style: 'itemsTable' },
                  { text: obj.descripcion, style: 'itemsTable' },
                  { text: obj.latitud, style: 'itemsTable' },
                  { text: obj.longitud, style: 'itemsTable' },
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
   ** **                                  METODO PARA EXPORTAR A EXCEL                                ** **
   ** ************************************************************************************************** **/
  exportToExcel() {
    const wsr: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.coordenadas);
    const wb: xlsx.WorkBook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, wsr, 'ParametrosGenerales');
    xlsx.writeFile(wb, "CoordenadasGeograficasEXCEL" + new Date().getTime() + '.xlsx');
  }

  /** ************************************************************************************************** **
   ** **                                    METODO PARA EXPORTAR A CSV                                ** **
   ** ************************************************************************************************** **/

  exportToCVS() {
    const wse: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.coordenadas);
    const csvDataH = xlsx.utils.sheet_to_csv(wse);
    const data: Blob = new Blob([csvDataH], { type: 'text/csv;charset=utf-8;' });
    FileSaver.saveAs(data, "CoordenadasGeograficasCSV" + new Date().getTime() + '.csv');
  }

  /** ************************************************************************************************* **
   ** **                               PARA LA EXPORTACION DE ARCHIVOS XML                            ** **
   ** ************************************************************************************************* **/

  urlxml: string;
  data: any = [];
  exportToXML() {
    var objeto: any;
    var arregloCoordenadas: any = [];
    this.coordenadas.forEach((obj: any) => {
      objeto = {
        "tipo_permiso": {
          '@id': obj.id,
          "descripcion": obj.descripcion,
          "latitud": obj.latitud,
          "longitud": obj.longitud,
        }
      }
      arregloCoordenadas.push(objeto)
    });

    this.restU.CrearXML(arregloCoordenadas).subscribe(res => {
      this.data = res;
      this.urlxml = `${environment.url}/ubicacion/download/` + this.data.name;
      window.open(this.urlxml, "_blank");
    });
  }

}
