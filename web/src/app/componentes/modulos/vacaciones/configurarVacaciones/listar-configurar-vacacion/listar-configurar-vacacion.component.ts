import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';

import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';

import { MetodosComponent } from 'src/app/componentes/generales/metodoEliminar/metodos.component';
import { MainNavService } from 'src/app/componentes/generales/main-nav/main-nav.service';
import { ConfigurarVacacionesService } from '../../../../../servicios/modulos/modulo-vacaciones/configurar-vacaciones/configurar-vacaciones.service';

@Component({
  selector: 'app-listar-configurar-vacacion',
  standalone: false,
  templateUrl: './listar-configurar-vacacion.component.html',
  styleUrl: './listar-configurar-vacacion.component.css'
})

export class ListarConfigurarVacacionComponent implements OnInit {

  // VARIABLES USUARIO QUE INICIA SESION
  empleado: any = [];
  idEmpleado: number;

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ips_locales: any = '';
  ip: string | null

  ver_lista: boolean = true;
  configuracion: any = [];

  // CONTROL DE CAMPOS Y VALIDACIONES DEL FORMULARIO
  nombreF = new FormControl('', [Validators.minLength(2)]);

  // ASIGNACION DE VALIDACIONES A INPUTS DEL FORMULARIO
  public BuscarTipoPermisoForm = new FormGroup({
    nombreForm: this.nombreF,
  });

  // ITEMS DE PAGINACION DE LA TABLA
  numero_pagina: number = 1;
  tamanio_pagina: number = 5;
  pageSizeOptions = [5, 10, 20, 50];

  // VERIFICAR ACTIVACION DE MODULO DE VACACIONES
  get habilitarVacaciones(): boolean { return this.funciones.vacaciones; }

  constructor(
    private funciones: MainNavService,
    private validar: ValidacionesService,
    private router: Router,
    public ventana: MatDialog,
    public rest: ConfigurarVacacionesService
  ) {
    this.idEmpleado = parseInt(localStorage.getItem('empleado') as string);
  }

  ngOnInit(): void {
    if (this.habilitarVacaciones === false) {
      let mensaje = {
        access: false,
        title: `Ups! al parecer no tienes activado en tu plan el Módulo de Vacaciones. \n`,
        message: '¿Te gustaría activarlo? Comunícate con nosotros.',
        url: 'www.casapazmino.com.ec'
      }
      return this.validar.RedireccionarHomeAdmin(mensaje);
    }
    else {
      this.user_name = localStorage.getItem('usuario');
      this.ip = localStorage.getItem('ip');
      this.validar.ObtenerIPsLocales().then((ips) => {
        this.ips_locales = ips;
      });

      this.ObtenerConfiguraciones();
    }
  }

  // METODO DE BUSQUEDA DE CONFIGURACIONES DE VACACIONES
  ObtenerConfiguraciones() {
    this.configuracion = [];
    this.rest.BuscarConfiguracionVacaciones().subscribe((datos: any) => {
      this.configuracion = datos;
    });
  }

  // METODO PARA LIMPIAR FORMULARIO
  LimpiarCampos() {
    this.BuscarTipoPermisoForm.setValue({
      nombreForm: '',
    });
    this.ObtenerConfiguraciones();
  }

  // EVENTOS DE PAGINACION
  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1;
  }

  // METODO PARA VER DATOS DE TIPO DE PERMISO
  ver_datos: boolean = false;
  configuracion_id: number
  VerDatosConfiguracion(id: number) {
    this.ver_datos = true;
    this.ver_lista = false;
    this.configuracion_id = id;
  }

  // METODO PARA VER FORMULARIO REGISTRAR TIPO PERMISO
  ver_registrar: boolean = false;
  VerFormularioRegistrar() {
    this.ver_lista = false;
    this.ver_registrar = true;
  }

  // METODO PARA VER FOMULARIO EDITAR
  ver_editar: boolean = false;
  pagina: string = '';
  VerFormularioEditar(id: number) {
    this.ver_editar = true;
    this.ver_lista = false;
    this.pagina = 'configurar-vacaciones';
    this.configuracion_id = id;
  }

  // FUNCION PARA CONFIRMAR SI SE ELIMINA O NO UN REGISTRO
  ConfirmarDelete(datos: any) {
    (document.activeElement as HTMLElement)?.blur();
    this.ventana.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          //this.Eliminar(datos.id);
        } else {
          this.router.navigate(['/configurar-vacacion']);
        }
      });
  }


  /** ************************************************************************************************* **
   ** **                                 METODO PARA EXPORTAR A EXCEL                                ** **
   ** ************************************************************************************************* **/
  exportToExcel() {

  }

  /** ************************************************************************************************** **
   ** **                                  METODO PARA EXPORTAR A PDF                                  ** **
   ** ************************************************************************************************** **/

  async GenerarPdf(action = 'open') {
    const pdfMake = await this.validar.ImportarPDF();
    const documentDefinition = '';
    switch (action) {
      case 'open': pdfMake.createPdf(documentDefinition).open(); break;
      case 'print': pdfMake.createPdf(documentDefinition).print(); break;
      case 'download': pdfMake.createPdf(documentDefinition).download(); break;
      default: pdfMake.createPdf(documentDefinition).open(); break;
    }

  }

  /** ************************************************************************************************** **
   ** **                               METODO PARA EXPORTAR A CSV                                     ** **
   ** ************************************************************************************************** **/

  exportToCVS() {

  }

  /** ************************************************************************************************* **
   ** **                              PARA LA EXPORTACION DE ARCHIVOS XML                             ** **
   ** ************************************************************************************************* **/

  exportToXML() {

  }

}
