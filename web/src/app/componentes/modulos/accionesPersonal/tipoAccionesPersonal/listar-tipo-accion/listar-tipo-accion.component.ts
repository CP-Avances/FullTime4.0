// IMPORTACION DE LIBRERIAS
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';
import { PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { DateTime } from 'luxon';
import { Router } from '@angular/router';

import * as xlsx from 'xlsx';
import * as FileSaver from 'file-saver';

import { MetodosComponent } from 'src/app/componentes/generales/metodoEliminar/metodos.component';

import { AccionPersonalService } from 'src/app/servicios/modulos/modulo-acciones-personal/accionPersonal/accion-personal.service';
import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';
import { EmpleadoService } from 'src/app/servicios/usuarios/empleado/empleadoRegistro/empleado.service';
import { EmpresaService } from 'src/app/servicios/configuracion/parametrizacion/catEmpresa/empresa.service';
import { MainNavService } from 'src/app/componentes/generales/main-nav/main-nav.service';

@Component({
  selector: 'app-listar-tipo-accion',
  templateUrl: './listar-tipo-accion.component.html',
  styleUrls: ['./listar-tipo-accion.component.css']
})

export class ListarTipoAccionComponent implements OnInit {

  // ITEMS DE PAGINACION DE LA TABLA
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;
  pageSizeOptions = [5, 10, 20, 50];

  empleado: any = [];
  idEmpleado: number;

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

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
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');

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
    let datos = {
      user_name: this.user_name,
      ip: this.ip
    };
    this.rest.EliminarRegistro(id_accion, datos).subscribe((res: any) => {
      if (res.message === 'error') {
        this.toastr.error('Existen datos relacionados con este registro.', 'No fue posible eliminar.', {
          timeOut: 6000,
        });
      } else {
        this.toastr.error('Registro eliminado.', '', {
          timeOut: 6000,
        });
        this.ObtenerTipoAccionesPersonal();
      }
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


  async GenerarPdf(action = 'open') {
    const pdfMake = await this.validar.ImportarPDF();
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
      pageSize: 'A4',
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
        { image: this.logo, width: 100, margin: [10, -25, 0, 5] },
        { text: localStorage.getItem('name_empresa')?.toUpperCase(), bold: true, fontSize: 14, alignment: 'center', margin: [0, -30, 0, 5] },
        { text: 'LISTA DE TIPOS DE ACCIONES DE PERSONAL', bold: true, fontSize: 12, alignment: 'center', margin: [0, 0, 0, 0] },
        this.presentarDataPDFTipoPermisos(),
      ],
      styles: {
        tableHeader: { fontSize: 9, bold: true, alignment: 'center', fillColor: this.p_color },
        itemsTable: { fontSize: 8, alignment: 'center', },
        tableMarginCabecera: { margin: [0, 10, 0, 0] },
      }
    };
  }

  presentarDataPDFTipoPermisos() {
    return {
      columns: [
        { width: '*', text: '' },
        {
          width: 'auto',
          style: 'tableMarginCabecera',
          table: {
            widths: ['auto', '*', '*', '*', '*'],
            body: [
              [
                { text: 'CÓDIGO', style: 'tableHeader' },
                { text: 'TIPO DE ACCIÓN DE PERSONAL', style: 'tableHeader' },
                { text: 'DESCRIPCIÓN', style: 'tableHeader' },
                { text: 'BASE LEGAL', style: 'tableHeader' },
                { text: 'TIPO', style: 'tableHeader' },
              ],
              ...this.tipo_acciones.map((obj: any) => {
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
    this.tipo_acciones.forEach((obj: any) => {
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
      this.urlxml = `${environment.url}/departamento/download/` + this.data.name;
      window.open(this.urlxml, "_blank");
    });
  }
}
