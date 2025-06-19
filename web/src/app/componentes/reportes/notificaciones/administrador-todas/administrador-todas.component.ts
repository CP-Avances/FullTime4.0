import { FormControl, FormGroup } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { DateTime } from 'luxon';

import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';
import { NotificacionService } from 'src/app/servicios/reportes/notificaciones/notificacion.service';
import { EmpleadoService } from 'src/app/servicios/usuarios/empleado/empleadoRegistro/empleado.service';
import { EmpresaService } from 'src/app/servicios/configuracion/parametrizacion/catEmpresa/empresa.service';

@Component({
  selector: 'app-administrador-todas',
  standalone: false,
  templateUrl: './administrador-todas.component.html',
  styleUrls: ['./administrador-todas.component.css']
})

export class AdministradorTodasComponent implements OnInit {

  // ITEMS DE PAGINACION DE LA TABLA DE LISTA DE SOLICITUDES PENDIENTES
  pageSizeOptions = [5, 10, 20, 50];
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;

  idEmpleadoLogueado: any;

  fechas: boolean = true;

  // Datos del Formulario de Periodo
  fechaInicialF = new FormControl('');
  fechaFinalF = new FormControl('');

  // Formulario de Periodo
  public fechasForm = new FormGroup({
    inicioForm: this.fechaInicialF,
    finalForm: this.fechaFinalF,
  });

  constructor(
    public restN: NotificacionService,
    public restEmpre: EmpresaService,
    public restE: EmpleadoService,
    public validar: ValidacionesService,
  ) {
    this.idEmpleadoLogueado = parseInt(localStorage.getItem('empleado') as string);
  }

  ngOnInit(): void {
    this.ListarTipos();
    this.ObtenerLogo();
    this.ObtenerColores();
    this.ListarPermisosEnviados();
    this.ListarPermisosRecibidos();
    this.ListarHorasEnviados();
    this.ListarHorasRecibidos();
    this.ListarVacacionesEnviados();
    this.ListarVacacionesRecibidos();
    this.ListarPlanificacionesEnviados();
    this.ListarPlanificacionesEliminadas();
    this.ObtenerEmpleados(this.idEmpleadoLogueado);
  }

  // METODO PARA MOSTRAR UN DETERMINADO NÚMERO DE FILAS EN LA TABLA DE SOLICITUDES PENDIENTES
  ManejarPagina(e: PageEvent) {
    this.numero_pagina = e.pageIndex + 1;
    this.tamanio_pagina = e.pageSize;
  }

  // LISTA DE TIPOS DE NOTIFICACIONES
  tipos: any = [];
  ListarTipos() {
    this.tipos = [
      { id: 1, nombre: 'Permisos' },
      { id: 2, nombre: 'Vacaciones' },
      { id: 3, nombre: 'Horas Extras' },
      //{ id: 4, nombre: 'Planificación Horas Extras' },
      { id: 4, nombre: 'Planificación Servicio Alimentación' },
      //{ id: 5, nombre: 'Solicitud Servicio Alimentación' },
    ]
  }

  // BUSQUEDA DE DATOS DE EMPLEADO LOGUEADO
  empleado: any = [];
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

  LimpiarFechas() {
    this.fechaInicialF.reset();
    this.fechaFinalF.reset();
  }

  /** ************************************************************************************** */
  /**                 LISTA DE DATOS DE NOTIFICACIONES DE PERMISOS                           */
  /** ************************************************************************************** */
  // LISTA DE PERMISOS ENVIADOS
  permisos_enviados: any = [];
  ListarPermisosEnviados() {
    this.permisos_enviados = [];
    this.restN.ObtenerPermisosEnviados(this.idEmpleadoLogueado).subscribe(res => {
      this.permisos_enviados = res;
      console.log('solo_enviados', this.permisos_enviados)
    })
  }

  permisos_recibidos: any = [];
  ListarPermisosRecibidos() {
    this.permisos_recibidos = [];
    this.restN.ObtenerPermisosRecibidos(this.idEmpleadoLogueado).subscribe(res => {
      this.permisos_recibidos = res;
      console.log('solo_enviados', this.permisos_recibidos)
    })
  }



  async GenerarPDF(action = 'open', tipo: number, forma: string) {
    const pdfMake = await this.validar.ImportarPDF();
    var documentDefinition: any;
    if (tipo === 1) {
      documentDefinition = this.DocumentarPermisos(forma);
    }
    else if (tipo === 2) {
      documentDefinition = this.DocumentarVacaciones(forma);
    }
    else if (tipo === 3) {
      documentDefinition = this.DocumentarHorasExtras(forma);
    }
    else if (tipo === 4) {
      documentDefinition = this.DocumentarPlanificaciones(forma);
    }
    switch (action) {
      case 'open': pdfMake.createPdf(documentDefinition).open(); break;
      case 'print': pdfMake.createPdf(documentDefinition).print(); break;
      case 'download': pdfMake.createPdf(documentDefinition).download(); break;
      default: pdfMake.createPdf(documentDefinition).open(); break;
    }
  }

  DocumentarPermisos(forma: string) {
    var titulo = '';
    if (forma === 'E') {
      titulo = 'NOTIFICACIONES ENVIADAS REFERENTES A PERMISOS';
    }
    else if (forma === 'R') {
      titulo = 'NOTIFICACIONES RECIBIDAS REFERENTES A PERMISOS';
    }

    sessionStorage.setItem('Permisos', this.permisos_enviados);
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
                  text: '© Pag ' + currentPage.toString() + ' de ' + pageCount,
                  alignment: 'right', opacity: 0.3
                }
              ],
            }
          ], fontSize: 10
        }
      },
      content: [
        { image: this.logo, width: 150, margin: [10, -25, 0, 5] },
        { text: titulo, bold: true, fontSize: 20, alignment: 'center', margin: [0, 10, 0, 3] },
        this.PresentarPermisos(forma),
      ],
      styles: {
        tableHeader: { fontSize: 12, bold: true, alignment: 'center', fillColor: this.p_color },
        itemsTable: { fontSize: 10 },
        itemsTableC: { fontSize: 10, alignment: 'center' }
      }
    };
  }

  PresentarPermisos(forma: string) {
    if (forma === 'E') {
      var datos = this.permisos_enviados;
    }
    else if (forma === 'R') {
      datos = this.permisos_recibidos;
    }
    return {
      columns: [
        { width: '*', text: '' },
        {
          width: 'auto',
          table: {
            widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
            body: [
              [
                { text: 'Fecha Envío', style: 'tableHeader' },
                { text: 'Nombre', style: 'tableHeader' },
                { text: 'Apellido', style: 'tableHeader' },
                { text: 'Identificación', style: 'tableHeader' },
                { text: 'Permiso', style: 'tableHeader' },
                { text: 'Fecha Inicio', style: 'tableHeader' },
                { text: 'Fecha Final', style: 'tableHeader' },
                { text: 'Estado', style: 'tableHeader' }
              ],
              ...datos.map((obj: any) => {
                return [
                  { text: obj.create_at.split('T')[0], style: 'itemsTableC' },
                  { text: obj.nombre, style: 'itemsTable' },
                  { text: obj.apellido, style: 'itemsTable' },
                  { text: obj.identificacion, style: 'itemsTable' },
                  { text: obj.permiso, style: 'itemsTableC' },
                  { text: obj.fec_inicio.split('T')[0], style: 'itemsTableC' },
                  { text: obj.fec_final.split('T')[0], style: 'itemsTableC' },
                  { text: obj.estado, style: 'itemsTableC' }
                ];
              })
            ]
          }
        },
        { width: '*', text: '' },
      ]
    };
  }

  /** ************************************************************************************** */
  /**                 LISTA DE DATOS DE NOTIFICACIONES DE HORAS EXTRAS                           */
  /** ************************************************************************************** */
  // LISTA DE PERMISOS ENVIADOS
  solicita_horas_enviados: any = [];
  ListarHorasEnviados() {
    this.solicita_horas_enviados = [];
    this.restN.ObtenerHorasExtrasEnviados(this.idEmpleadoLogueado).subscribe(res => {
      this.solicita_horas_enviados = res;
      console.log('solo_enviados', this.solicita_horas_enviados)
    })
  }

  solicita_horas_recibidos: any = [];
  ListarHorasRecibidos() {
    this.solicita_horas_recibidos = [];
    this.restN.ObtenerHorasExtrasRecibidas(this.idEmpleadoLogueado).subscribe(res => {
      this.solicita_horas_recibidos = res;
      console.log('solo_enviados', this.solicita_horas_recibidos)
    })
  }

  DocumentarHorasExtras(forma: string) {
    var titulo = '';
    if (forma === 'E') {
      titulo = 'NOTIFICACIONES ENVIADAS REFERENTES A SOLICITUD HORAS EXTRAS';
    }
    else if (forma === 'R') {
      titulo = 'NOTIFICACIONES RECIBIDAS REFERENTES A SOLICITUD HORAS EXTRAS';
    }
    sessionStorage.setItem('Horas Extras', this.solicita_horas_enviados);
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
                  text: '© Pag ' + currentPage.toString() + ' de ' + pageCount,
                  alignment: 'right', opacity: 0.3
                }
              ],
            }
          ], fontSize: 10
        }
      },
      content: [
        { image: this.logo, width: 150, margin: [10, -25, 0, 5] },
        { text: titulo, bold: true, fontSize: 20, alignment: 'center', margin: [0, 10, 0, 3] },
        this.PresentarHorasExtras(forma),
      ],
      styles: {
        tableHeader: { fontSize: 12, bold: true, alignment: 'center', fillColor: this.p_color },
        itemsTable: { fontSize: 10 },
        itemsTableC: { fontSize: 10, alignment: 'center' }
      }
    };
  }

  PresentarHorasExtras(forma: string) {
    if (forma === 'E') {
      var datos = this.solicita_horas_enviados;
    }
    else if (forma === 'R') {
      datos = this.solicita_horas_recibidos;
    }
    return {
      columns: [
        { width: '*', text: '' },
        {
          width: 'auto',
          table: {
            widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
            body: [
              [
                { text: 'Fecha Envío', style: 'tableHeader' },
                { text: 'Nombre', style: 'tableHeader' },
                { text: 'Apellido', style: 'tableHeader' },
                { text: 'Identificación', style: 'tableHeader' },
                { text: 'Descripción', style: 'tableHeader' },
                { text: 'Fecha Inicio', style: 'tableHeader' },
                { text: 'Fecha Final', style: 'tableHeader' },
                { text: 'Horas Solicitadas', style: 'tableHeader' },
                { text: 'Horas Autorizadas', style: 'tableHeader' },
                { text: 'Estado', style: 'tableHeader' }
              ],
              ...datos.map((obj: any) => {
                return [
                  { text: obj.create_at.split('T')[0], style: 'itemsTableC' },
                  { text: obj.nombre, style: 'itemsTable' },
                  { text: obj.apellido, style: 'itemsTable' },
                  { text: obj.identificacion, style: 'itemsTable' },
                  { text: obj.descripcion, style: 'itemsTableC' },
                  { text: obj.fec_inicio.split('T')[0], style: 'itemsTableC' },
                  { text: obj.fec_final.split('T')[0], style: 'itemsTableC' },
                  { text: obj.num_hora, style: 'itemsTableC' },
                  { text: obj.tiempo_autorizado, style: 'itemsTableC' },
                  { text: obj.estado, style: 'itemsTableC' }
                ];
              })
            ]
          }
        },
        { width: '*', text: '' },
      ]
    };
  }

  /** ************************************************************************************** */
  /**                 LISTA DE DATOS DE NOTIFICACIONES DE VACACIONES                          */
  /** ************************************************************************************** */
  // LISTA DE PERMISOS ENVIADOS
  vacaciones_enviados: any = [];
  ListarVacacionesEnviados() {
    this.vacaciones_enviados = [];
    this.restN.ObtenerVacacionesEnviadas(this.idEmpleadoLogueado).subscribe(res => {
      this.vacaciones_enviados = res;
      console.log('solo_enviados', this.vacaciones_enviados)
    })
  }

  vacaciones_recibidos: any = [];
  ListarVacacionesRecibidos() {
    this.vacaciones_recibidos = [];
    this.restN.ObtenerVacacionesRecibidas(this.idEmpleadoLogueado).subscribe(res => {
      this.vacaciones_recibidos = res;
      console.log('solo_enviados', this.vacaciones_recibidos)
    })
  }

  DocumentarVacaciones(forma: string) {
    var titulo = '';
    if (forma === 'E') {
      titulo = 'NOTIFICACIONES ENVIADAS REFERENTES A VACACIONES';
    }
    else if (forma === 'R') {
      titulo = 'NOTIFICACIONES RECIBIDAS REFERENTES A VACACIONES';
    }
    sessionStorage.setItem('VACACIONES', this.vacaciones_enviados);
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
                  text: '© Pag ' + currentPage.toString() + ' de ' + pageCount,
                  alignment: 'right', opacity: 0.3
                }
              ],
            }
          ], fontSize: 10
        }
      },
      content: [
        { image: this.logo, width: 150, margin: [10, -25, 0, 5] },
        { text: titulo, bold: true, fontSize: 20, alignment: 'center', margin: [0, 10, 0, 3] },
        this.Presentarvacaciones(forma),
      ],
      styles: {
        tableHeader: { fontSize: 12, bold: true, alignment: 'center', fillColor: this.p_color },
        itemsTable: { fontSize: 10 },
        itemsTableC: { fontSize: 10, alignment: 'center' }
      }
    };
  }

  Presentarvacaciones(forma: string) {
    if (forma === 'E') {
      var datos = this.vacaciones_enviados;
    }
    else if (forma === 'R') {
      datos = this.vacaciones_recibidos;
    }
    return {
      columns: [
        { width: '*', text: '' },
        {
          width: 'auto',
          table: {
            widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
            body: [
              [
                { text: 'Fecha Envío', style: 'tableHeader' },
                { text: 'Nombre', style: 'tableHeader' },
                { text: 'Apellido', style: 'tableHeader' },
                { text: 'Identificación', style: 'tableHeader' },
                { text: 'Descripción', style: 'tableHeader' },
                { text: 'Fecha Inicio', style: 'tableHeader' },
                { text: 'Fecha Final', style: 'tableHeader' },
                { text: 'Fecha Ingreso', style: 'tableHeader' },
                { text: 'Estado', style: 'tableHeader' }
              ],
              ...datos.map((obj: any) => {
                return [
                  { text: obj.create_at.split('T')[0], style: 'itemsTableC' },
                  { text: obj.nombre, style: 'itemsTable' },
                  { text: obj.apellido, style: 'itemsTable' },
                  { text: obj.identificacion, style: 'itemsTable' },
                  { text: 'Vacaciones', style: 'itemsTableC' },
                  { text: obj.fec_inicio.split('T')[0], style: 'itemsTableC' },
                  { text: obj.fec_final.split('T')[0], style: 'itemsTableC' },
                  { text: obj.fec_ingreso.split('T')[0], style: 'itemsTableC' },
                  { text: obj.estado, style: 'itemsTable' },
                ];
              })
            ]
          }
        },
        { width: '*', text: '' },
      ]
    };
  }

  /** ************************************************************************************** */
  /**                 LISTA DE DATOS DE NOTIFICACIONES DE PLANIFICACIONES                          */
  /** ************************************************************************************** */
  // LISTA DE PERMISOS ENVIADOS
  planificaciones_enviados: any = [];
  ListarPlanificacionesEnviados() {
    this.planificaciones_enviados = [];
    this.restN.ObtenerPalnificacionesEnviadas(this.idEmpleadoLogueado).subscribe(res => {
      this.planificaciones_enviados = res;
      console.log('solo_enviados', this.planificaciones_enviados)
    })
  }

  planificaciones_eliminadas: any = [];
  ListarPlanificacionesEliminadas() {
    this.planificaciones_eliminadas = [];
    this.restN.ObtenerPlanificacionesEliminadas(this.idEmpleadoLogueado).subscribe(res => {
      this.planificaciones_eliminadas = res;
      console.log('solo_enviados', this.planificaciones_eliminadas)
    })
  }

  DocumentarPlanificaciones(forma: string) {
    var titulo = '';
    if (forma === 'E') {
      titulo = 'NOTIFICACIONES ENVIADAS REFERENTES A PLANIFICACIONES';
    }
    else if (forma === 'D') {
      titulo = 'NOTIFICACIONES ELIMINADAS REFERENTES A PLANIFICACIONES';
    }
    sessionStorage.setItem('PLANIFICACIONES', this.planificaciones_enviados);
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
                  text: '© Pag ' + currentPage.toString() + ' de ' + pageCount,
                  alignment: 'right', opacity: 0.3
                }
              ],
            }
          ], fontSize: 10
        }
      },
      content: [
        { image: this.logo, width: 150, margin: [10, -25, 0, 5] },
        { text: titulo, bold: true, fontSize: 20, alignment: 'center', margin: [0, 10, 0, 3] },
        this.PresentarPlanificaciones(forma),
      ],
      styles: {
        tableHeader: { fontSize: 12, bold: true, alignment: 'center', fillColor: this.p_color },
        itemsTable: { fontSize: 10 },
        itemsTableC: { fontSize: 10, alignment: 'center' }
      }
    };
  }

  PresentarPlanificaciones(forma: string) {
    if (forma === 'E') {
      var datos = this.planificaciones_enviados;
    }
    else if (forma === 'D') {
      datos = this.planificaciones_eliminadas;
    }
    return {
      columns: [
        { width: '*', text: '' },
        {
          width: 'auto',
          table: {
            widths: ['auto', 'auto', 'auto', 'auto', 'auto'],
            body: [
              [
                { text: 'Fecha Envío', style: 'tableHeader' },
                { text: 'Nombre', style: 'tableHeader' },
                { text: 'Apellido', style: 'tableHeader' },
                { text: 'Identificación', style: 'tableHeader' },
                { text: 'Descripción', style: 'tableHeader' },
              ],
              ...datos.map((obj: any) => {
                return [
                  { text: obj.create_at.split('T')[0], style: 'itemsTableC' },
                  { text: obj.nombre, style: 'itemsTable' },
                  { text: obj.apellido, style: 'itemsTable' },
                  { text: obj.identificacion, style: 'itemsTable' },
                  { text: obj.descripcion, style: 'itemsTable' },
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
