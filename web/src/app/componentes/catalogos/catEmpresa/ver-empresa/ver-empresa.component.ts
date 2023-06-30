import { FormControl, FormGroup } from '@angular/forms';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ThemePalette } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';
import * as moment from 'moment';
import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

import { RegistrarSucursalesComponent } from 'src/app/componentes/catalogos/catSucursal/registrar-sucursales/registrar-sucursales.component';
import { EditarSucursalComponent } from 'src/app/componentes/catalogos/catSucursal/editar-sucursal/editar-sucursal.component';
import { ColoresEmpresaComponent } from 'src/app/componentes/catalogos/catEmpresa/colores-empresa/colores-empresa.component';
import { TipoSeguridadComponent } from '../tipo-seguridad/tipo-seguridad.component';
import { MetodosComponent } from 'src/app/componentes/administracionGeneral/metodoEliminar/metodos.component';
import { LogosComponent } from 'src/app/componentes/catalogos/catEmpresa/logos/logos.component';

import { SucursalService } from 'src/app/servicios/sucursales/sucursal.service';
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
import { EmpresaService } from 'src/app/servicios/catalogos/catEmpresa/empresa.service';


@Component({
  selector: 'app-ver-empresa',
  templateUrl: './ver-empresa.component.html',
  styleUrls: ['./ver-empresa.component.css'],
})

export class VerEmpresaComponent implements OnInit {

  idEmpresa: number;
  datosEmpresa: any = [];
  datosSucursales: any = [];

  // ITEMS DE PAGINACION DE LA TABLA
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;
  pageSizeOptions = [5, 10, 20, 50];

  //IMAGEN
  logo: string;
  imagen_default: boolean = true;

  sinCambios: boolean = true;
  conCambios: boolean = true;
  cambiosTodos: boolean = true;

  // DATOS DE FORMULARIO DE COLORES
  principal = new FormControl('');
  secundario = new FormControl('');

  public coloresForm = new FormGroup({
    color_p: this.principal,
    color_s: this.secundario
  });

  idEmpleado: number;
  public empleado: any = [];
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
    public ventana: MatDialog,
    public empresa: EmpresaService,
    public router: Router,
    public restS: SucursalService,
    public restE: EmpleadoService,
    private toastr: ToastrService,
  ) {
    this.idEmpresa = parseInt(localStorage.getItem('empresa') as string,)
    this.idEmpleado = parseInt(localStorage.getItem('empleado') as string);
  }

  ngOnInit(): void {
    this.ObtenerEmpleados(this.idEmpleado);
    this.CargarDatosEmpresa();
    this.ObtenerSucursal();
  }

  // METODO DE CONTROL DE PAGINACION
  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1
  }

  // CARGAR DATOS DE EMPRESA EN FORMULARIO
  nombre_establecimiento: any;
  CargarDatosEmpresa() {
    this.datosEmpresa = [];
    this.empresa.ConsultarDatosEmpresa(this.idEmpresa).subscribe(datos => {
      this.datosEmpresa = datos;
      this.p_color = this.datosEmpresa[0].color_p;
      this.s_color = this.datosEmpresa[0].color_s;
      if (this.datosEmpresa[0].establecimiento === null || this.datosEmpresa[0].establecimiento === '' || this.datosEmpresa[0].establecimiento === undefined) {
        this.nombre_establecimiento = 'establecimientos';
      }
      else {
        this.nombre_establecimiento = this.datosEmpresa[0].establecimiento;
      }
      if (this.datosEmpresa[0].logo != null) {
        this.ObtenerLogotipo();
      }
      if (this.datosEmpresa[0].cambios === true) {
        if (this.datosEmpresa[0].dias_cambio === 0) {
          this.cambiosTodos = false;
          this.conCambios = true;
          this.sinCambios = true;
        }
        else {
          this.conCambios = false;
          this.sinCambios = true;
          this.cambiosTodos = true;
        }
      }
      else {
        this.sinCambios = false;
        this.conCambios = true;
        this.cambiosTodos = true;
      }

      this.ObtenerColores();
    });
  }

  // METODO PARA OBTENER LOGOTIPO DE EMPRESA
  ObtenerLogotipo() {
    this.empresa.LogoEmpresaImagenBase64(String(this.idEmpresa)).subscribe(res => {
      if (res.imagen === 0) {
        this.imagen_default = true
      }
      else {
        this.imagen_default = false;
        this.logo = 'data:image/jpeg;base64,' + res.imagen;
      }
    })
  }

  // METODO PARA MOSTRAR LISTA DE SUCURSALES
  ObtenerSucursal() {
    this.restS.BuscarSucursal().subscribe(data => {
      this.datosSucursales = data;
    });
  }

  // VENTANA PARA EDITAR DATOS DE EMPRESA 
  EditarDatosEmpresa(): void {
    this.router.navigate(['/informacionEmpresa', this.idEmpresa])
  }

  // VENTANA DE EDICION DE ESTABLECIMIENTOS
  AbrirVentanaEditarSucursal(datosSeleccionados: any): void {
    this.ventana.open(EditarSucursalComponent, { width: '650px', data: datosSeleccionados })
      .afterClosed().subscribe((items: any) => {
        if (items.actualizar === true) {
          this.ObtenerSucursal();
        }
      });
  }

  // VENTANA DE REGISTRO DE ESTABLECIMIENTO
  AbrirVentanaRegistrarSucursal() {
    this.ventana.open(RegistrarSucursalesComponent, { width: '650px', data: this.idEmpresa })
      .afterClosed().subscribe((items: any) => {
        this.ObtenerSucursal();
      });
  }

  // VENTANA PARA REVISAR FORMATO DE REPORTES COLORES
  AbrirVentanaReportes(datos_empresa: any, ventana: any) {
    this.ventana.open(ColoresEmpresaComponent, { width: '340px', data: { datos: datos_empresa, ventana: ventana } })
      .afterClosed().subscribe((items: any) => {
        if (items) {
          if (items.actualizar === true) {
            this.ObtenerSucursal();
            this.ObtenerLogotipo();
            this.CargarDatosEmpresa();
          }
        }
      });
  }

  // METODO PARA EDITAR LOGO DE EMPRESA
  EditarLogo() {
    this.ventana.open(LogosComponent, {
      width: '500px', data: { empresa: this.idEmpresa, pagina: 'empresa' }
    }).afterClosed()
      .subscribe((res: any) => {
        this.ObtenerLogotipo();
      })
  }

  // FUNCION PARA ELIMINAR REGISTRO SELECCIONADO 
  Eliminar(id_sucursal: number) {
    this.restS.EliminarRegistro(id_sucursal).subscribe(res => {
      this.toastr.error('Registro eliminado.', '', {
        timeOut: 6000,
      });
      this.ObtenerSucursal();
    });
  }

  // FUNCION PARA CONFIRMAR SI SE ELIMINA O NO UN REGISTRO 
  ConfirmarDelete(datos: any) {
    this.ventana.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.Eliminar(datos.id);
        } else {
          this.router.navigate(['/vistaEmpresa/', this.idEmpresa]);
        }
      });
  }

  // VENTANA DE REGISTRO DE FRASE DE SEGURIDAD
  AbrirVentanaSeguridad(datosSeleccionados: any) {
    this.ventana.open(TipoSeguridadComponent, { width: '340px', data: datosSeleccionados })
      .afterClosed().subscribe((items: any) => {
        this.ObtenerSucursal();
        this.ObtenerLogotipo();
        this.CargarDatosEmpresa();
      });
  }

  // METODO DE REGISTRO DE COLORES
  CambiarColores() {
    this.habilitarprogress = true;
    let datos = {
      color_p: this.p_color,
      color_s: this.s_color,
      id: this.datosEmpresa[0].id
    }
    this.empresa.ActualizarColores(datos).subscribe(data => {
      this.toastr.success('Operación exitosa.', 'Colores de reportes configurados.', {
        timeOut: 6000,
      });
      this.ObtenerColores();
      this.habilitarprogress = false;
    })
  }

  // METODO PARA OBTENER DATOS DE EMPRESA COLORES - MARCA DE AGUA
  public empresas: any = [];
  ObtenerColores() {
    this.empresas = [];
    this.empresa.ConsultarDatosEmpresa(this.datosEmpresa[0].id).subscribe(res => {
      this.empresas = res;
      this.p_color = this.empresas[0].color_p;
      this.s_color = this.empresas[0].color_s;
      this.frase = this.empresas[0].marca_agua;
    });
  }

  // METODO PARA VER LA INFORMACION DEL EMPLEADO 
  ObtenerEmpleados(idemploy: any) {
    this.empleado = [];
    this.restE.BuscarUnEmpleado(idemploy).subscribe(data => {
      this.empleado = data;
    })
  }

  /** ************************************************************************************************** ** 
   ** **                                 METODO PARA EXPORTAR A PDF                                   ** **
   ** ************************************************************************************************** **/

  // GENERACION DE REPORTE DE PDF
  GenerarPdf(action = 'open') {
    const documentDefinition = this.getDocumentDefinicion();
    pdfMake.createPdf(documentDefinition).open();
  }

  // DEFINICION DE PDF CABECERA - PIE DE PAGINA - ESTRUCTURA DE REPORTE
  getDocumentDefinicion() {
    sessionStorage.setItem('Empresas', this.empresas);

    console.log("Empleado Nombre: ", this.empleado[0].nombre);
    return {

      // ENCABEZADO DE LA PAGINA
      pageOrientation: 'landscape',
      watermark: { text: this.frase, color: 'blue', opacity: 0.1, bold: true, italics: false },
      header: { text: 'Impreso por:  ' + this.empleado[0].nombre + ' ' + this.empleado[0].apellido, margin: 5, fontSize: 9, opacity: 0.3, alignment: 'right', color: '#0A54A7' },

      // PIE DE PAGINA
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
              ...this.datosEmpresa.map(obj => {
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

}
