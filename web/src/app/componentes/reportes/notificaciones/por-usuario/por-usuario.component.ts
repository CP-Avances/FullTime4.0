import { FormControl, FormGroup } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { DateTime } from 'luxon';

import { NotificacionService } from 'src/app/servicios/reportes/notificaciones/notificacion.service';
import { EmpleadoService } from 'src/app/servicios/usuarios/empleado/empleadoRegistro/empleado.service';
import { EmpresaService } from 'src/app/servicios/configuracion/parametrizacion/catEmpresa/empresa.service';
import { ToastrService } from 'ngx-toastr';
import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';

@Component({
  selector: 'app-por-usuario',
  standalone: false,
  templateUrl: './por-usuario.component.html',
  styleUrls: ['./por-usuario.component.css'],
})

export class PorUsuarioComponent implements OnInit {

  // ITEMS DE PAGINACION DE LA TABLA DE NOTIFICACIONES
  pageSizeOptions = [5, 10, 20, 50];
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;

  idEmpleadoLogueado: any;

  // VARIABLES PARA ACTIVAR O DESACTIVAR TABLAS
  tabla_permisos: boolean = false;
  tabla_vacaciones: boolean = false;
  tabla_horas_extras: boolean = false;
  tabla_plan_comidas: boolean = false;
  fechas: boolean = false;

  // Datos del Formulario de Periodo
  fechaInicialF = new FormControl('');
  fechaFinalF = new FormControl('');

  // Formulario de Periodo
  public fechasForm = new FormGroup({
    inicioForm: this.fechaInicialF,
    finalForm: this.fechaFinalF,
  });

  constructor(
    public restE: EmpleadoService,
    public restN: NotificacionService,
    public validar: ValidacionesService,
    public restEmpre: EmpresaService,
    private toastr: ToastrService,
  ) {
    this.idEmpleadoLogueado = parseInt(localStorage.getItem('empleado') as string);
  }

  ngOnInit(): void {
    this.ListarTipos();
    this.ObtenerLogo();
    this.ObtenerColores();
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

  // LISTA DE PERMISOS ENVIADOS
  usuarios_permisos: any = [];
  ListarUsuariosPermisos(forma: any) {
    if (forma === 'E') {
      this.usuarios_permisos = [];
      this.restN.ObtenerUsuariosPermisosEnviados(this.idEmpleadoLogueado).subscribe(res => {
        this.usuarios_permisos = res;
        console.log('solo_enviados_usuarios', this.usuarios_permisos)
      })
    }
    else {
      this.usuarios_permisos = [];
      this.restN.ObtenerUsuariosPermisosRecibidos(this.idEmpleadoLogueado).subscribe(res => {
        this.usuarios_permisos = res;
        console.log('solo_enviados_usuarios', this.usuarios_permisos)
      })
    }
  }

  // LISTA DE VACACIONES
  usuarios_vacaciones: any = [];
  ListarUsuariosVacaciones(forma: any) {
    if (forma === 'E') {
      this.usuarios_vacaciones = [];
      this.restN.ObtenerUsuariosVacionesEnviados(this.idEmpleadoLogueado).subscribe(res => {
        this.usuarios_vacaciones = res;
        console.log('solo_enviados_usuarios', this.usuarios_permisos)
      })
    }
    else {
      this.usuarios_vacaciones = [];
      this.restN.ObtenerUsuariosVacacionesRecibidos(this.idEmpleadoLogueado).subscribe(res => {
        this.usuarios_vacaciones = res;
        console.log('solo_enviados_usuarios', this.usuarios_permisos)
      })
    }
  }

  // LISTA DE EXTRAS
  usuarios_extras: any = [];
  ListarUsuariosExtras(forma: any) {
    if (forma === 'E') {
      this.usuarios_extras = [];
      this.restN.ObtenerUsuariosExtrasEnviados(this.idEmpleadoLogueado).subscribe(res => {
        this.usuarios_extras = res;
        console.log('solo_enviados_usuarios', this.usuarios_permisos)
      })
    }
    else {
      this.usuarios_extras = [];
      this.restN.ObtenerUsuariosExtrasRecibidos(this.idEmpleadoLogueado).subscribe(res => {
        this.usuarios_extras = res;
        console.log('solo_enviados_usuarios', this.usuarios_permisos)
      })
    }
  }

  // LISTA DE VACACIONES
  usuarios_comidas: any = [];
  ListarUsuariosComidas(forma: any) {
    if (forma === 'E') {
      this.usuarios_comidas = [];
      this.restN.ObtenerUsuariosComidasEnviados(this.idEmpleadoLogueado).subscribe(res => {
        this.usuarios_comidas = res;
        console.log('solo_enviados_usuarios', this.usuarios_permisos)
      })
    }
    else {
      this.usuarios_comidas = [];
      this.restN.ObtenerUsuariosComidasRecibidos(this.idEmpleadoLogueado).subscribe(res => {
        this.usuarios_comidas = res;
        console.log('solo_enviados_usuarios', this.usuarios_permisos)
      })
    }
  }

  LimpiarFechas() {
    this.fechaInicialF.reset();
    this.fechaFinalF.reset();
  }

  ImprimirDatos(id_seleccionado, form) {
    var tipo = this.num_tipo;
    var forma = this.selec_forma;
    console.log('fechas ', DateTime.fromISO(form.inicioForm).toFormat('yyyy-MM-dd'), ' ', DateTime.fromISO(form.finalForm).toFormat('yyyy-MM-dd'))
    if (form.inicioForm === '' || form.finalForm === '' || form.inicioForm === null || form.finalForm === null) {
      if (tipo === 1) {
        this.ListarPermisosTodos(id_seleccionado, forma, tipo);
      }
      else if (tipo === 2) {
        this.ListarVacacionesTodas(id_seleccionado, forma, tipo);
      }
      if (tipo === 3) {
        this.ListarHorasTodas(id_seleccionado, forma, tipo);
      }
      if (tipo === 4) {
        this.ListarComidasTodas(id_seleccionado, forma, tipo);
      }
    }
    else {
      if (Date.parse(form.inicioForm) <= Date.parse(form.finalForm)) {
        var inicio = DateTime.fromISO(form.inicioForm).toFormat('yyyy-MM-dd');
        var final = DateTime.fromISO(form.finalForm).toFormat('yyyy-MM-dd');
        if (tipo === 1) {
          this.ListarPermisosFecha(id_seleccionado, forma, inicio, final, tipo);
        }
        else if (tipo === 2) {
          this.ListarVacacionesFecha(id_seleccionado, forma, inicio, final, tipo);
        }
        if (tipo === 3) {
          this.ListarHorasFecha(id_seleccionado, forma, inicio, final, tipo);
        }
        if (tipo === 4) {
          this.ListarComidasFecha(id_seleccionado, forma, inicio, final, tipo);
        }
      }
      else {
        this.toastr.info('La fecha de inicio de Periodo no puede ser posterior a la fecha de fin de Periodo.', 'VERIFICAR', {
          timeOut: 6000,
        });
      }
    }
  }

  /** ************************************************************************************** */
  /**                 LISTA DE DATOS DE NOTIFICACIONES DE PERMISOS                           */
  /** ************************************************************************************** */

  MostrarDatos(permisos: boolean, vacaciones: boolean, extras: boolean, comidas: boolean, fechas: boolean) {
    this.tabla_permisos = permisos;
    this.tabla_vacaciones = vacaciones;
    this.tabla_horas_extras = extras;
    this.tabla_plan_comidas = comidas;
    this.fechas = fechas;
  }

  CerrarTabla() {
    this.MostrarDatos(false, false, false, false, false);
  }

  // LISTA DE USUARIOS QUE TIENEN PERMISOS
  num_tipo: number;
  selec_forma: string;
  MostrarTablas(tipo: any, forma: any) {
    console.log('tipo', tipo)
    if (tipo === 1) {
      this.MostrarDatos(true, false, false, false, true);
      this.ListarUsuariosPermisos(forma);
    }
    else if (tipo === 2) {
      this.MostrarDatos(false, true, false, false, true);
      this.ListarUsuariosVacaciones(forma);
    }
    if (tipo === 3) {
      this.MostrarDatos(false, false, true, false, true);
      this.ListarUsuariosExtras(forma);
    }
    if (tipo === 4) {
      this.MostrarDatos(false, false, false, true, true);
      this.ListarUsuariosComidas(forma);
    }
    this.num_tipo = tipo;
    this.selec_forma = forma;
  }

  // LISTA DE PERMISOS ENVIADOS
  permisos_enviados: any = [];
  permisos_recibidos: any = [];
  ListarPermisosTodos(id_seleccionado: any, forma: any, tipo: any) {
    if (forma === 'E') {
      this.permisos_enviados = [];
      this.restN.ObtenerUsuariosPermisosEnviados_Todas(this.idEmpleadoLogueado, id_seleccionado).subscribe(res => {
        this.permisos_enviados = res;
        console.log('solo_enviados', this.permisos_enviados)
        this.GenerarPDF('download', tipo, forma, this.permisos_enviados);
      })
    } else {
      this.permisos_recibidos = [];
      this.restN.ObtenerUsuariosPermisosRecibidos_Todas(this.idEmpleadoLogueado, id_seleccionado).subscribe(res => {
        this.permisos_recibidos = res;
        console.log('solo_enviados', this.permisos_recibidos)
        this.GenerarPDF('download', tipo, forma, this.permisos_recibidos);
      })
    }

  }

  ListarPermisosFecha(id_seleccionado: any, forma: any, inicio, final, tipo) {
    if (forma === 'E') {
      this.permisos_enviados = [];
      this.restN.ObtenerUsuariosPermisosEnviados_Fecha(this.idEmpleadoLogueado, id_seleccionado, inicio, final).subscribe(res => {
        this.permisos_enviados = res;
        console.log('solo_enviados', this.permisos_enviados)
        this.GenerarPDF('download', tipo, forma, this.permisos_enviados);
      }, error => {
        this.toastr.info('No se han encontrado datos en el período de búsqueda indicado', 'Verificar la Información', {
          timeOut: 3000,
        })
      });
    } else {
      this.permisos_recibidos = [];
      this.restN.ObtenerUsuariosPermisosRecibidos_Fecha(this.idEmpleadoLogueado, id_seleccionado, inicio, final).subscribe(res => {
        this.permisos_recibidos = res;
        console.log('solo_enviados', this.permisos_recibidos)
        this.GenerarPDF('download', tipo, forma, this.permisos_recibidos);
      }, error => {
        this.toastr.info('No se han encontrado datos en el período de búsqueda indicado', 'Verificar la Información', {
          timeOut: 3000,
        })
      });
    }
  }



  async GenerarPDF(action = 'download', tipo: number, forma: string, consulta: any) {
    const pdfMake = await this.validar.ImportarPDF();
    var documentDefinition: any;
    if (tipo === 1) {
      documentDefinition = this.DocumentarPermisos(forma, consulta);
    }
    else if (tipo === 2) {
      documentDefinition = this.DocumentarVacaciones(forma, consulta);
    }
    else if (tipo === 3) {
      documentDefinition = this.DocumentarHorasExtras(forma, consulta);
    }
    else if (tipo === 4) {
      documentDefinition = this.DocumentarPlanificaciones(forma, consulta);
    }
    switch (action) {
      case 'open': pdfMake.createPdf(documentDefinition).open(); break;
      case 'print': pdfMake.createPdf(documentDefinition).print(); break;
      case 'download': pdfMake.createPdf(documentDefinition).download(); break;
      default: pdfMake.createPdf(documentDefinition).open(); break;
    }
  }

  DocumentarPermisos(forma: string, consulta) {
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
        this.PresentarPermisos(consulta),
      ],
      styles: {
        tableHeader: { fontSize: 12, bold: true, alignment: 'center', fillColor: this.p_color },
        itemsTable: { fontSize: 10 },
        itemsTableC: { fontSize: 10, alignment: 'center' }
      }
    };
  }

  PresentarPermisos(datos) {
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
                { text: 'Cédula', style: 'tableHeader' },
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
                  { text: obj.cedula, style: 'itemsTable' },
                  { text: obj.permiso, style: 'itemsTableC' },
                  { text: obj.fec_inicio.split('T')[0], style: 'itemsTableC' },
                  { text: obj.fec_final.split('T')[0], style: 'itemsTableC' },
                  { text: obj.estado, style: 'itemsTableC' }
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

  /** ************************************************************************************** */
  /**                 LISTA DE DATOS DE NOTIFICACIONES DE HORAS EXTRAS                           */
  /** ************************************************************************************** */
  // LISTA DE PERMISOS ENVIADOS
  solicita_horas_enviados: any = [];
  solicita_horas_recibidos: any = [];
  ListarHorasTodas(id_seleccionado, forma: any, tipo: any) {
    if (forma === 'E') {
      this.solicita_horas_enviados = [];
      this.restN.ObtenerUsuariosExtrasEnviados_Todas(this.idEmpleadoLogueado, id_seleccionado).subscribe(res => {
        this.solicita_horas_enviados = res;
        console.log('solo_enviados', this.solicita_horas_enviados)
        this.GenerarPDF('download', tipo, forma, this.solicita_horas_enviados);
      })
    } else {
      this.solicita_horas_recibidos = [];
      this.restN.ObtenerUsuariosComidasRecibidos_Todas(this.idEmpleadoLogueado, id_seleccionado).subscribe(res => {
        this.solicita_horas_recibidos = res;
        console.log('solo_enviados', this.solicita_horas_recibidos)
        this.GenerarPDF('download', tipo, forma, this.solicita_horas_recibidos);
      })
    }
  }


  ListarHorasFecha(id_seleccionado, forma: any, inicio, final, tipo: any) {
    if (forma === 'E') {
      this.solicita_horas_enviados = [];
      this.restN.ObtenerUsuariosExtrasEnviados_Fecha(this.idEmpleadoLogueado, id_seleccionado, inicio, final).subscribe(res => {
        this.solicita_horas_enviados = res;
        console.log('solo_enviados', this.solicita_horas_enviados)
        this.GenerarPDF('download', tipo, forma, this.solicita_horas_enviados);
      }, error => {
        this.toastr.info('No se han encontrado datos en el período de búsqueda indicado', 'Verificar la Información', {
          timeOut: 3000,
        })
      });
    } else {
      this.solicita_horas_recibidos = [];
      this.restN.ObtenerUsuariosComidasRecibidos_Fecha(this.idEmpleadoLogueado, id_seleccionado, inicio, final).subscribe(res => {
        this.solicita_horas_recibidos = res;
        console.log('solo_enviados', this.solicita_horas_recibidos)
        this.GenerarPDF('download', tipo, forma, this.solicita_horas_recibidos);
      }, error => {
        this.toastr.info('No se han encontrado datos en el período de búsqueda indicado', 'Verificar la Información', {
          timeOut: 3000,
        })
      });
    }
  }

  DocumentarHorasExtras(forma: string, consulta) {
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
        this.PresentarHorasExtras(consulta),
      ],
      styles: {
        tableHeader: { fontSize: 12, bold: true, alignment: 'center', fillColor: this.p_color },
        itemsTable: { fontSize: 10 },
        itemsTableC: { fontSize: 10, alignment: 'center' }
      }
    };
  }

  PresentarHorasExtras(datos) {
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
                { text: 'Cédula', style: 'tableHeader' },
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
                  { text: obj.cedula, style: 'itemsTable' },
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
          ,
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

  /** ************************************************************************************** */
  /**                 LISTA DE DATOS DE NOTIFICACIONES DE VACACIONES                          */
  /** ************************************************************************************** */
  // LISTA DE PERMISOS ENVIADOS
  vacaciones_enviados: any = [];
  vacaciones_recibidos: any = [];
  ListarVacacionesTodas(id_seleccionado, forma, tipo: any) {
    if (forma === 'E') {
      this.vacaciones_enviados = [];
      this.restN.ObtenerUsuariosVacionesEnviados_Todas(this.idEmpleadoLogueado, id_seleccionado).subscribe(res => {
        this.vacaciones_enviados = res;
        console.log('solo_enviados', this.vacaciones_enviados)
        this.GenerarPDF('download', tipo, forma, this.vacaciones_enviados);
      })
    } else {
      this.vacaciones_recibidos = [];
      this.restN.ObtenerUsuariosVacacionesRecibidos_Todas(this.idEmpleadoLogueado, id_seleccionado).subscribe(res => {
        this.vacaciones_recibidos = res;
        console.log('solo_enviados', this.vacaciones_recibidos)
        this.GenerarPDF('download', tipo, forma, this.vacaciones_recibidos);
      })
    }
  }


  ListarVacacionesFecha(id_seleccionado, forma, inicio, final, tipo: any) {
    if (forma === 'E') {
      this.vacaciones_enviados = [];
      this.restN.ObtenerUsuariosVacionesEnviados_Fecha(this.idEmpleadoLogueado, id_seleccionado, inicio, final).subscribe(res => {
        this.vacaciones_enviados = res;
        console.log('solo_enviados', this.vacaciones_enviados)
        this.GenerarPDF('download', tipo, forma, this.vacaciones_enviados);
      }, error => {
        this.toastr.info('No se han encontrado datos en el período de búsqueda indicado', 'Verificar la Información', {
          timeOut: 3000,
        })
      });
    } else {
      this.vacaciones_recibidos = [];
      this.restN.ObtenerUsuariosVacacionesRecibidos_Fecha(this.idEmpleadoLogueado, id_seleccionado, inicio, final).subscribe(res => {
        this.vacaciones_recibidos = res;
        console.log('solo_enviados', this.vacaciones_recibidos)
        this.GenerarPDF('download', tipo, forma, this.vacaciones_recibidos);
      }, error => {
        this.toastr.info('No se han encontrado datos en el período de búsqueda indicado', 'Verificar la Información', {
          timeOut: 3000,
        })
      });
    }
  }

  DocumentarVacaciones(forma: string, consulta) {
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
        this.Presentarvacaciones(consulta),
      ],
      styles: {
        tableHeader: { fontSize: 12, bold: true, alignment: 'center', fillColor: this.p_color },
        itemsTable: { fontSize: 10 },
        itemsTableC: { fontSize: 10, alignment: 'center' }
      }
    };
  }

  Presentarvacaciones(datos) {
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
                { text: 'Cédula', style: 'tableHeader' },
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
                  { text: obj.cedula, style: 'itemsTable' },
                  { text: 'Vacaciones', style: 'itemsTableC' },
                  { text: obj.fec_inicio.split('T')[0], style: 'itemsTableC' },
                  { text: obj.fec_final.split('T')[0], style: 'itemsTableC' },
                  { text: obj.fec_ingreso.split('T')[0], style: 'itemsTableC' },
                  { text: obj.estado, style: 'itemsTable' },
                ];
              })
            ]
          }
          ,
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

  /** ************************************************************************************** */
  /**                 LISTA DE DATOS DE NOTIFICACIONES DE PLANIFICACIONES                          */
  /** ************************************************************************************** */
  // LISTA DE PERMISOS ENVIADOS
  planificaciones_enviados: any = [];
  planificaciones_recibidas: any = [];
  ListarComidasTodas(id_seleccionado, forma, tipo: any) {
    if (forma === 'E') {
      this.planificaciones_enviados = [];
      this.restN.ObtenerUsuariosComidasEnviados_Todas(this.idEmpleadoLogueado, id_seleccionado).subscribe(res => {
        this.planificaciones_enviados = res;
        console.log('solo_enviados', this.planificaciones_enviados)
        this.GenerarPDF('download', tipo, forma, this.planificaciones_enviados);
      })
    }
    else {

    }
  }

  ListarComidasFecha(id_seleccionado, forma, inicio, final, tipo: any) {
    if (forma === 'E') {
      this.planificaciones_enviados = [];
      this.restN.ObtenerUsuariosComidasEnviados_Fecha(this.idEmpleadoLogueado, id_seleccionado, inicio, final).subscribe(res => {
        this.planificaciones_enviados = res;
        console.log('solo_enviados', this.planificaciones_enviados)
        this.GenerarPDF('download', tipo, forma, this.planificaciones_enviados);
      }, error => {
        this.toastr.info('No se han encontrado datos en el período de búsqueda indicado', 'Verificar la Información', {
          timeOut: 3000,
        })
      });
    }
    else {

    }
  }

  planificaciones_eliminadas: any = [];
  ListarPlanificacionesEliminadas() {
    this.planificaciones_eliminadas = [];
    this.restN.ObtenerPlanificacionesEliminadas(this.idEmpleadoLogueado).subscribe(res => {
      this.planificaciones_eliminadas = res;
      console.log('solo_enviados', this.planificaciones_eliminadas)
    })
  }

  DocumentarPlanificaciones(forma: string, consulta) {
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
        this.PresentarPlanificaciones(consulta),
      ],
      styles: {
        tableHeader: { fontSize: 12, bold: true, alignment: 'center', fillColor: this.p_color },
        itemsTable: { fontSize: 10 },
        itemsTableC: { fontSize: 10, alignment: 'center' }
      }
    };
  }

  PresentarPlanificaciones(datos) {
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
                { text: 'Cédula', style: 'tableHeader' },
                { text: 'Descripción', style: 'tableHeader' },
              ],
              ...datos.map((obj: any) => {
                return [
                  { text: obj.create_at.split('T')[0], style: 'itemsTableC' },
                  { text: obj.nombre, style: 'itemsTable' },
                  { text: obj.apellido, style: 'itemsTable' },
                  { text: obj.cedula, style: 'itemsTable' },
                  { text: obj.descripcion, style: 'itemsTable' },
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

}
