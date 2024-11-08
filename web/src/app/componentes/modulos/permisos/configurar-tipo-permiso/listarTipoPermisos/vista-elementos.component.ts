// IMPORTACION DE LIBRERIAS
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';
import { PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { DateTime } from 'luxon';
import { Router } from '@angular/router';

import * as FileSaver from 'file-saver';
import * as xlsx from 'xlsx';
const pdfMake = require('src/assets/build/pdfmake.js');
const pdfFonts = require('src/assets/build/vfs_fonts.js');
pdfMake.vfs = pdfFonts.pdfMake.vfs;

import { MetodosComponent } from 'src/app/componentes/generales/metodoEliminar/metodos.component';

import { TipoPermisosService } from 'src/app/servicios/modulos/modulo-permisos/catTipoPermisos/tipo-permisos.service';
import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';
import { EmpleadoService } from 'src/app/servicios/usuarios/empleado/empleadoRegistro/empleado.service';
import { EmpresaService } from 'src/app/servicios/configuracion/parametrizacion/catEmpresa/empresa.service';
import { MainNavService } from 'src/app/componentes/generales/main-nav/main-nav.service';

@Component({
  selector: 'app-vista-elementos',
  templateUrl: './vista-elementos.component.html',
  styleUrls: ['./vista-elementos.component.css']
})

export class VistaElementosComponent implements OnInit {

  tipoPermiso: any = [];
  filtroDescripcion = '';

  // ITEMS DE PAGINACION DE LA TABLA
  numero_pagina: number = 1;
  tamanio_pagina: number = 5;
  pageSizeOptions = [5, 10, 20, 50];

  empleado: any = [];
  idEmpleado: number;

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null

  // CONTROL DE CAMPOS Y VALIDACIONES DEL FORMULARIO
  nombreF = new FormControl('', [Validators.minLength(2)]);

  // ASIGNACION DE VALIDACIONES A INPUTS DEL FORMULARIO
  public BuscarTipoPermisoForm = new FormGroup({
    nombreForm: this.nombreF,
  });

  // CONSULTAR MODULOS ACTIVOS
  get habilitarPermiso(): boolean { return this.funciones.permisos; }

  constructor(
    public restEmpre: EmpresaService,
    public ventana: MatDialog,
    public restE: EmpleadoService,
    private rest: TipoPermisosService,
    private toastr: ToastrService,
    private router: Router,
    private validar: ValidacionesService,
    private funciones: MainNavService,
  ) {
    this.idEmpleado = parseInt(localStorage.getItem('empleado') as string);
  }

  ngOnInit(): void {
    if (this.habilitarPermiso === false) {
      let mensaje = {
        access: false,
        title: `Ups!!! al parecer no tienes activado en tu plan el Módulo de Permisos. \n`,
        message: '¿Te gustaría activarlo? Comunícate con nosotros.',
        url: 'www.casapazmino.com.ec'
      }
      return this.validar.RedireccionarHomeAdmin(mensaje);
    }
    else {
      this.user_name = localStorage.getItem('usuario');
      this.ip = localStorage.getItem('ip');

      this.ObtenerEmpleados(this.idEmpleado);
      this.ObtenerTipoPermiso();
      this.ObtenerColores();
      this.ObtenerLogo();
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

  // EVENTOS DE PAGINACION
  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1;
  }

  // METODO DE BUSQUEDA DE TIPOS DE PERMISOS
  ObtenerTipoPermiso() {
    this.tipoPermiso = [];
    this.rest.BuscarTipoPermiso().subscribe(datos => {
      this.tipoPermiso = datos;
    });
  }

  // METODO PARA LIMPIAR FORMULARIO
  LimpiarCampos() {
    this.BuscarTipoPermisoForm.setValue({
      nombreForm: '',
    });
    this.ObtenerTipoPermiso();
  }

  // FUNCION PARA ELIMINAR REGISTRO SELECCIONADO
  Eliminar(id_permiso: number) {
    const datos = {
      user_name: this.user_name,
      ip: this.ip
    };

    this.rest.EliminarRegistro(id_permiso, datos).subscribe(res => {
      this.toastr.error('Registro eliminado.', '', {
        timeOut: 6000,
      });
      this.ObtenerTipoPermiso();
    });
  }

  // FUNCION PARA CONFIRMAR SI SE ELIMINA O NO UN REGISTRO
  ConfirmarDelete(datos: any) {
    this.ventana.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.Eliminar(datos.id);
        } else {
          this.router.navigate(['/verTipoPermiso']);
        }
      });
  }

  // METODO PARA VER FORMULARIO REGISTRAR TIPO PERMISO
  ver_lista: boolean = true;
  ver_registrar: boolean = false;
  VerFormularioRegistrar() {
    this.ver_lista = false;
    this.ver_registrar = true;
  }

  // METODO PARA VER DATOS DE TIPO DE PERMISO
  ver_datos: boolean = false;
  permiso_id: number
  VerDatosPermiso(id: number) {
    this.ver_datos = true;
    this.ver_lista = false;
    this.permiso_id = id;
  }

  // METODO PARA VER FOMULARIO EDITAR
  ver_editar: boolean = false;
  pagina: string = '';
  VerFormularioEditar(id: number) {
    this.ver_editar = true;
    this.ver_lista = false;
    this.pagina = 'lista-permisos';
    this.permiso_id = id;
  }

  /** ************************************************************************************************** **
   ** **                                  METODO PARA EXPORTAR A PDF                                  ** **
   ** ************************************************************************************************** **/
  generarPdf(action = 'open') {
    const documentDefinition = this.DefinirInformacionPDF();

    switch (action) {
      case 'open': pdfMake.createPdf(documentDefinition).open(); break;
      case 'print': pdfMake.createPdf(documentDefinition).print(); break;
      case 'download': pdfMake.createPdf(documentDefinition).download(); break;

      default: pdfMake.createPdf(documentDefinition).open(); break;
    }

  }

  DefinirInformacionPDF() {

    return {

      // ENCABEZADO DE LA PAGINA
      pageOrientation: 'landscape',
      watermark: { text: this.frase, color: 'blue', opacity: 0.1, bold: true, italics: false },
      header: { text: 'Impreso por:  ' + this.empleado[0].nombre + ' ' + this.empleado[0].apellido, margin: 10, fontSize: 9, opacity: 0.3, alignment: 'right' },

      // PIE DE PAGINA
      footer: function (currentPage: any, pageCount: any, fecha: any, hora: any) {
        var f = DateTime.now();
        fecha = f.toFormat('yyyy-MM-dd');
        hora = f.toFormat('HH:mm:ss');
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
        tableHeader: { fontSize: 9, bold: true, alignment: 'center', fillColor: this.p_color },
        itemsTable: { fontSize: 8, alignment: 'center', }
      }
    };
  }

  obtenerFecha(fecha: String) {
    if (fecha !== null) {
      return fecha.substring(0, 10);
    } else {
      return '';
    }
  }

  DescuentoSelect: any = ['Vacaciones', 'Ninguno'];
  AccesoEmpleadoSelect: any = ['Si', 'No'];
  presentarDataPDFTipoPermisos() {
    return {
      columns: [
        { width: '*', text: '' },
        {
          width: 'auto',
          table: {
            widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
            body: [
              [
                { text: 'Código', style: 'tableHeader' },
                { text: 'Permiso', style: 'tableHeader' },
                { text: 'Días de permiso', style: 'tableHeader' },
                { text: 'Horas de permiso', style: 'tableHeader' },
                { text: 'Solicita Empleado', style: 'tableHeader' },
                { text: 'Días para solicitar', style: 'tableHeader' },
                { text: 'Descuento', style: 'tableHeader' },
                { text: 'Incluye almuerzo', style: 'tableHeader' },
                { text: 'Legalizar', style: 'tableHeader' },
                { text: 'Requiere justificación', style: 'tableHeader' },
                { text: 'Días para Justificar', style: 'tableHeader' },
                { text: 'Requiere certificado', style: 'tableHeader' },
                { text: 'Restricción por fecha', style: 'tableHeader' },
                { text: 'Fecha de restricción', style: 'tableHeader' },

              ],
              ...this.tipoPermiso.map((obj: any) => {
                var descuento = this.DescuentoSelect[obj.tipo_descuento - 1];
                var acceso = this.AccesoEmpleadoSelect[obj.solicita_empleado - 1];
                var fecha = this.obtenerFecha(obj.fecha_fin);
                return [
                  { text: obj.id, style: 'itemsTable' },
                  { text: obj.descripcion, style: 'itemsTable' },
                  { text: obj.dias_maximo_permiso, style: 'itemsTable' },
                  { text: obj.horas_maximo_permiso, style: 'itemsTable' },
                  { text: acceso, style: 'itemsTable' },
                  { text: obj.dias_anticipar_permiso, style: 'itemsTable' },
                  { text: descuento, style: 'itemsTable' },
                  { text: obj.incluir_minutos_comida == true ? 'Sí' : 'No', style: 'itemsTable' },
                  { text: obj.legalizar == true ? 'Sí' : 'No', style: 'itemsTable' },
                  { text: obj.justificar == true ? 'Sí' : 'No', style: 'itemsTable' },
                  { text: obj.dias_justificar, style: 'itemsTable' },
                  { text: obj.documento == true ? 'Sí' : 'No', style: 'itemsTable' },
                  { text: obj.fecha_restriccion == true ? 'Sí' : 'No', style: 'itemsTable' },
                  { text: fecha, style: 'itemsTable' },
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

  /** ************************************************************************************************* **
   ** **                                 METODO PARA EXPORTAR A EXCEL                                ** **
   ** ************************************************************************************************* **/
  exportToExcel() {
    const wsr: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.tipoPermiso);
    const wb: xlsx.WorkBook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, wsr, 'TipoPermisos');
    xlsx.writeFile(wb, "TipoPermisos" + new Date().getTime() + '.xlsx');
  }

  /** ************************************************************************************************** **
   ** **                               METODO PARA EXPORTAR A CSV                                     ** **
   ** ************************************************************************************************** **/

  exportToCVS() {
    const wse: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.tipoPermiso);
    const csvDataH = xlsx.utils.sheet_to_csv(wse);
    const data: Blob = new Blob([csvDataH], { type: 'text/csv;charset=utf-8;' });
    FileSaver.saveAs(data, "TipoPermisosCSV" + new Date().getTime() + '.csv');
  }

  /** ************************************************************************************************* **
   ** **                              PARA LA EXPORTACION DE ARCHIVOS XML                             ** **
   ** ************************************************************************************************* **/

  urlxml: string;
  data: any = [];
  exportToXML() {
    var objeto;
    var arregloTipoPermisos: any = [];
    this.tipoPermiso.forEach((obj: any) => {
      var descuento = this.DescuentoSelect[obj.tipo_descuento - 1];
      var acceso = this.AccesoEmpleadoSelect[obj.solicita_empleado - 1];
      var fecha = this.obtenerFecha(obj.fecha_fin);
      objeto = {
        "tipo_permiso": {
          '@id': obj.id,
          "descripcion": obj.descripcion,
          "numfecha_dia_maximo": obj.dias_maximo_permiso,
          "num_hora_maximo": obj.horas_maximo_permiso,
          "acce_empleado": acceso,
          "num_dia_ingreso": obj.dias_anticipar_permiso,
          "tipo_descuento": descuento,
          "almu_incluir": obj.incluir_minutos_comida,
          "legalizar": obj.legalizar,
          "gene_justificacion": obj.justificar,
          "num_dia_justifica": obj.dias_justificar,
          "documento": obj.documento,
          "fec_validar": obj.fecha_restriccion,
          "fecha": fecha,
        }
      }
      arregloTipoPermisos.push(objeto)
    });

    this.rest.CrearXML(arregloTipoPermisos).subscribe(res => {
      this.data = res;
      console.log("prueba data", res)
      this.urlxml = `${environment.url}/departamento/download/` + this.data.name;
      window.open(this.urlxml, "_blank");
    });
  }

}
