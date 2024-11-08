// IMPORTAR LIBRERIAS
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DateTime } from 'luxon';
import { Router } from '@angular/router';

declare const pdfMake: any;
declare const pdfFonts: any;
pdfMake.vfs = pdfFonts.pdfMake.vfs;

// IMPORTAR SERVICIOS
import { AutorizaDepartamentoService } from 'src/app/servicios/configuracion/localizacion/autorizaDepartamento/autoriza-departamento.service';
import { DatosGeneralesService } from 'src/app/servicios/generales/datosGenerales/datos-generales.service';
import { AutorizacionService } from 'src/app/servicios/modulos/autorizacion/autorizacion.service';
import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';
import { PlanGeneralService } from 'src/app/servicios/horarios/planGeneral/plan-general.service';
import { ParametrosService } from 'src/app/servicios/configuracion/parametrizacion/parametrosGenerales/parametros.service';
import { EmpleadoService } from 'src/app/servicios/usuarios/empleado/empleadoRegistro/empleado.service';
import { PermisosService } from 'src/app/servicios/modulos/modulo-permisos/permisos/permisos.service';
import { EmpresaService } from 'src/app/servicios/configuracion/parametrizacion/catEmpresa/empresa.service';
import { UsuarioService } from 'src/app/servicios/usuarios/usuario/usuario.service';

import { EditarEstadoAutorizaccionComponent } from 'src/app/componentes/autorizaciones/editar-estado-autorizaccion/editar-estado-autorizaccion.component';

@Component({
  selector: 'app-ver-empleado-permiso',
  templateUrl: './ver-empleado-permiso.component.html',
  styleUrls: ['./ver-empleado-permiso.component.css']
})

export class VerEmpleadoPermisoComponent implements OnInit {

  // VARIABLES DE ALMACENAMIENTO DE DATOS
  autorizacion: any = []; // DATOS AUTORIZACIONES
  InfoPermiso: any = []; // DATOS PERMISOS
  dep: any = []; // DATOS DEPARTAMENTOS

  departamento: string = '';
  estado: string = '';

  HabilitarAutorizacion: boolean = true;

  // VARIABLES DE BUSQUEDA DE DATOS DE EMPLEADO
  empleado: any = [];
  idEmpleado: number;

  // VARIABLES USADAS PARA BUSQUEDA DE DATOS DE PERMISO
  id_permiso: string;
  datoSolicitud: any = [];

  fechaActual: any;
  habilitarActualizar: boolean = true;
  hipervinculo: string = (localStorage.getItem('empresaURL') as string)

  ocultar: boolean = true;
  esconder: boolean = false;

  constructor(

    private parametro: ParametrosService,
    private validar: ValidacionesService, // VALIDACIONES DE ACCESO
    private router: Router, // VARIABLE DE MANEJO DE RUTAS O NAVEGACIÓN
    private restA: AutorizacionService, // SERVICIO DE DATOS DE AUTORIZACIONES 
    private restP: PermisosService, // SERVICIO DE DATOS DE PERMISO
    public restGeneral: DatosGeneralesService, // SERVICIO DE DATOS GENERALES DE EMPLEADO
    public restEmpre: EmpresaService, // SERVICIO DE DATOS DE EMPRESA
    public ventana: MatDialog, // VARIABLE DE MANEJO DE VENTANAS
    public restE: EmpleadoService, // SERVICIO DE DATOS DE EMPLEADO
    public restAutoriza: AutorizaDepartamentoService, //SERVICIO DE DATOS DE AUTORIZACION POR EL EMPLEADO
    public usuarioDepa: UsuarioService, //SERVICIO DE DATOS DE DEPARTAMENTO POR EL USUARIO DE LA SOLICITUD
    private plangeneral: PlanGeneralService,
  ) {
    this.idEmpleado = parseInt(localStorage.getItem('empleado') as string);
    this.id_permiso = this.router.url.split('/')[2];
  }

  ngOnInit(): void {
    this.ObtenerLogo();
    this.ObtenerColores();
    this.BuscarParametro();
  }

  /** **************************************************************************************** **
   ** **                   BUSQUEDA DE FORMATOS DE FECHAS Y HORAS                           ** ** 
   ** **************************************************************************************** **/

  formato_fecha: string = 'dd/MM/yyyy';
  formato_hora: string = 'HH:mm:ss';
  ArrayAutorizacionTipos: any = [];
  idioma_fechas: string = 'es';
  // METODO PARA BUSCAR DATOS DE PARAMETROS
  BuscarParametro() {
    let datos: any = [];
    let detalles = { parametros: '1, 2' };
    this.parametro.ListarVariosDetallesParametros(detalles).subscribe(
      res => {
        datos = res;
        //console.log('datos ', datos)
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
        this.BuscarDatos(this.formato_fecha, this.formato_hora);
      }, vacio => {
        this.BuscarDatos(this.formato_fecha, this.formato_hora);
      });
    this.restAutoriza.BuscarAutoridadUsuarioDepa(this.idEmpleado).subscribe(
      (res) => {
        this.ArrayAutorizacionTipos = res;
      }
    );
  }

  // VARIABLE DE ALMACENAMIENTO DE DATOS DE COLABORADORES QUE REVISARON SOLICITUD
  empleado_estado: any = [];
  // CONTADOR DE REVISIONES DE SOLICITUD
  lectura: number = 1;
  cont: number;
  gerencia: boolean = false;
  // METODO DE BUSQUEDA DE DATOS DE SOLICITUD Y AUTORIZACIÓN
  BuscarDatos(formato_fecha: string, formato_hora: string) {
    this.InfoPermiso = [];

    // BUSQUEDA DE DATOS DE PERMISO
    this.restP.obtenerUnPermisoEmpleado(parseInt(this.id_permiso)).subscribe(res => {
      this.InfoPermiso = res;

      this.InfoPermiso.forEach(p => {
        // TRATAMIENTO DE FECHAS Y HORAS EN FORMATO DD/MM/YYYYY
        p.fec_creacion_ = this.validar.FormatearFecha(p.fec_creacion, formato_fecha, this.validar.dia_completo, this.idioma_fechas);
        p.fec_inicio_ = this.validar.FormatearFecha(p.fec_inicio, formato_fecha, this.validar.dia_completo, this.idioma_fechas);
        p.fec_final_ = this.validar.FormatearFecha(p.fec_final, formato_fecha, this.validar.dia_completo, this.idioma_fechas);

        p.hora_ingreso_ = this.validar.FormatearHora(p.hora_ingreso, formato_hora);
        p.hora_salida_ = this.validar.FormatearHora(p.hora_salida, formato_hora);

      })

      if (this.InfoPermiso[0].estado > 1) {
        this.esconder = true;
      } else {
        this.esconder = false;
      }

      // BUSQUEDA DE DATOS DE AUTORIZACIÓN
      this.ObtenerAutorizacion(this.InfoPermiso[0].id);

    }, err => {
      return this.validar.RedireccionarMixto(err.error)
    });

    this.ObtenerEmpleados(this.idEmpleado);
    this.ObtenerSolicitud(this.id_permiso);
  }

  estado_auto: any;
  listadoDepaAutoriza: any = [];
  ObtenerAutorizacion(id: number) {
    this.autorizacion = [];
    this.empleado_estado = [];
    this.listadoDepaAutoriza = [];
    this.lectura = 1;
    this.restA.BuscarAutorizacionPermiso(id).subscribe(res1 => {
      this.autorizacion = res1;
      console.log('autorizacion: ', this.autorizacion);
      // METODO PARA OBTENER EMPLEADOS Y ESTADOS
      var autorizaciones = this.autorizacion[0].id_autoriza_estado.split(',');
      autorizaciones.map((obj: string) => {
        this.lectura = this.lectura + 1;
        if (obj != '') {
          let empleado_id = obj.split('_')[0];
          this.estado_auto = obj.split('_')[1];

          // CAMBIAR DATO ESTADO INT A VARCHAR
          if (this.estado_auto === '1') {
            this.estado_auto = 'Pendiente';
          }
          if (this.estado_auto === '2') {
            this.estado_auto = 'Preautorizado';
          }
          if (this.estado_auto === '3') {
            this.estado_auto = 'Autorizado';
          }
          if (this.estado_auto === '4') {
            this.estado_auto = 'Permiso Negado';
          }

          // CREAR ARRAY DE DATOS DE COLABORADORES
          var data = {
            id_empleado: empleado_id,
            estado: this.estado_auto
          }

          if ((this.estado_auto === 'Pendiente') || (this.estado_auto === 'Preautorizado')) {
            //Valida que el usuario que va a realizar la aprobacion le corresponda su nivel y autorice caso contrario se oculta el boton de aprobar.
            this.restAutoriza.BuscarListaAutorizaDepa(this.autorizacion[0].id_departamento).subscribe(res => {
              this.listadoDepaAutoriza = res;
              this.listadoDepaAutoriza.forEach((item: any) => {
                if ((this.idEmpleado == item.id_empleado) && (autorizaciones.length == item.nivel)) {
                  this.obtenerPlanificacionHoraria(this.InfoPermiso[0].fec_inicio, this.InfoPermiso[0].fec_final, this.InfoPermiso[0].id_empleado);
                } else {
                  return this.ocultar = true;
                }
              })
            });
          } else {
            this.ocultar = true;
          }

          this.empleado_estado = this.empleado_estado.concat(data);
          // CUANDO TODOS LOS DATOS SE HAYAN REVISADO EJECUTAR METODO DE INFORMACIÓN DE AUTORIZACIÓN
          if (this.lectura === autorizaciones.length) {
            this.VerInformacionAutoriza(this.empleado_estado);
          }

        } else {
          //Valida que el usuario que va a realizar la aprobacion le corresponda su nivel y autorice caso contrario se oculta el boton de aprobar.
          this.restAutoriza.BuscarListaAutorizaDepa(this.autorizacion[0].id_departamento).subscribe(res => {
            this.listadoDepaAutoriza = res;
            this.listadoDepaAutoriza.forEach((item: any) => {
              if ((this.idEmpleado == item.id_empleado) && (autorizaciones.length == item.nivel)) {
                this.obtenerPlanificacionHoraria(this.InfoPermiso[0].fec_inicio, this.InfoPermiso[0].fec_final, this.InfoPermiso[0].id_empleado);
              } else {
                return this.ocultar = true;
              }
            })
          });
        }
      })

      // TOMAR TAMAÑO DE ARREGLO DE COLABORADORES QUE REVIZARÓN SOLICITUD
      this.cont = autorizaciones.length - 1;

    }, error => {
      this.ocultar = false;
      this.HabilitarAutorizacion = false;
    });

  }

  listahorario: any = [];
  mensaje: string = '';
  dia: any;
  obtenerPlanificacionHoraria(fecha_i: any, fehca_f: any, id_empleado: any) {
    this.mensaje = '';
    var datos = {
      fecha_inicio: fecha_i,
      fecha_final: fehca_f,
      id_empleado: '\'' + id_empleado + '\''
    }

    this.plangeneral.BuscarPlanificacionHoraria(datos).subscribe(res => {
      this.listahorario = res;
      console.log('this.listahorario: ', this.listahorario);
      if (this.listahorario.data.length == 0) {
        this.mensaje = 'No tiene registrado la planificacion horaria en esas fechas';
        return this.ocultar = true;
      } else {
        this.mensaje = '';
        return this.ocultar = false;
      }
    }, error => {
      this.mensaje = 'Problemas con validar su planificacion horaria en esas fechas';
      return this.ocultar = true;
    });

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

  // METODO PARA INGRESAR NOMBRE Y CARGO DEL USUARIO QUE REVISÓ LA SOLICITUD 
  cadena_texto: string = ''; // VARIABLE PARA ALMACENAR TODOS LOS USUARIOS

  VerInformacionAutoriza(array: any) {
    array.map(empl => {
      this.restGeneral.InformarEmpleadoAutoriza(parseInt(empl.id_empleado)).subscribe(data => {
        empl.nombre = data[0].fullname;
        empl.cargo = data[0].cargo;
        empl.departamento = data[0].departamento;
        if (this.cadena_texto === '') {
          this.cadena_texto = data[0].fullname + ': ' + empl.estado;
        } else {
          this.cadena_texto = this.cadena_texto + ' | ' + data[0].fullname + ': ' + empl.estado;
        }
      })
    })
  }

  // METODO PARA VER LA INFORMACION DEL EMPLEADO 
  ObtenerEmpleados(idemploy: any) {
    this.empleado = [];
    this.restE.BuscarUnEmpleado(idemploy).subscribe(data => {
      this.empleado = data;
    })
  }

  // METODO PARA VER LA INFORMACIÓN DE LA SOLICITUD 
  ObtenerSolicitud(id: any) {
    var f = DateTime.now();
    this.fechaActual = f.toFormat('yyyy-MM-dd');
    this.datoSolicitud = [];
    // BUSQUEDA DE DATOS DE SOLICITUD PARA MOSTRAR EN PDF
    this.restP.BuscarDatosSolicitud(id).subscribe(data => {
      this.datoSolicitud = data;
      // BUSQUEDA DE DATOS DE EMPRESA
      this.restEmpre.ConsultarDatosEmpresa(parseInt(localStorage.getItem('empresa') as string)).subscribe(res => {
        var fecha_inicio = DateTime.fromISO(this.datoSolicitud[0].fec_inicio);
        // METODO PARA VER DÍAS DISPONIBLES DE AUTORIZACIÓN
        console.log(fecha_inicio.diff(this.fechaActual, 'days'), ' dias de diferencia');

        console.log('fecha inicio -- ' + fecha_inicio + ' fecha actual ' + this.fechaActual +
          ' fecha dato ' + this.datoSolicitud[0].fec_inicio.split('T')[0])

        if (this.InfoPermiso[0].estado > 2) {
          this.habilitarActualizar = false;
        } else {
          if (res[0].cambios === true) {
            if (res[0].cambios === 0) {
              this.habilitarActualizar = false;
            }
            else {
              //var dias = fecha_inicio.diff(this.fechaActual, 'days');
              var dias = this.fechaActual.diff(fecha_inicio, 'days').days;
              console.log('dias ----- ', dias + ' cambio ' + res[0].dias_cambio);
              if (res[0].dias_cambio >= dias) {
                this.habilitarActualizar = false;
              }
              else {
                this.habilitarActualizar = true;
              }
            }
          }
        }

      });
    }, err => {
      return this.validar.RedireccionarMixto(err.error)
    })
  }

  AbrirVentanaEditarAutorizacion(autoriza: any): void {
    this.ventana.open(EditarEstadoAutorizaccionComponent,
      { width: '350px', data: { auto: autoriza, permiso: this.InfoPermiso[0] } })
      .afterClosed().subscribe(item => {
        this.BuscarParametro();
      });
  }

  // METODO PARA CERRAR VENTANA
  cerrarVentana() {
    this.router.navigate(['/permisos-solicitados']);
  }

  /* **************************************************************************************************** * 
   *                                         METODO PARA EXPORTAR A PDF                                   *
   * **************************************************************************************************** */
  GenerarPdf(action = 'open') {
    const documentDefinition = this.DefinirInformacionPDF();
    switch (action) {
      case 'open': pdfMake.createPdf(documentDefinition).open(); break;
      case 'print': pdfMake.createPdf(documentDefinition).print(); break;
      case 'download': pdfMake.createPdf(documentDefinition).download(); break;
      default: pdfMake.createPdf(documentDefinition).open(); break;
    }
  }

  fila1firmas: any = [];
  fila2firmas: any = [];
  DefinirInformacionPDF() {
    this.fila1firmas = [];
    this.fila2firmas = [];

    //Array de los datos del empleado para mostrar en la firma;
    let firmaEmple = {
      cargo: this.datoSolicitud[0].cargo,
      departamento: "",
      estado: "Empleado",
      id_empleado: this.datoSolicitud[0].id_empl_contrato,
      nombre: this.datoSolicitud[0].nombre_emple + ' ' + this.datoSolicitud[0].apellido_emple,
    }

    let cont1 = 1;
    //Filtar el array empleado_estado para dividir en otros arrays para firmar
    this.empleado_estado.filter(item => {
      if (cont1 < 4) {
        this.fila1firmas.push(item);
        return cont1 = cont1 + 1;
      } else {
        this.fila2firmas.push(item);
      }
    });


    if (this.fila2firmas.length == 0) {
      this.fila1firmas.push(firmaEmple);
    } else {
      this.fila2firmas.push(firmaEmple);
    }


    return {
      // ENCABEZADO DE LA PAGINA
      pageOrientation: 'landscape',
      watermark: { text: this.frase, color: 'blue', opacity: 0.1, bold: true, italics: false },
      header: { text: 'Impreso por:  ' + this.empleado[0].nombre + ' ' + this.empleado[0].apellido, margin: 10, fontSize: 9, opacity: 0.3, alignment: 'right' },

      // PIE DE PAGINA
      footer: function (currentPage: { toString: () => string; }, pageCount: string, fecha: string, hora: string) {
        let f = DateTime.now();
        fecha = f.toFormat('yyyy-MM-dd');
        hora = f.toFormat('HH:mm:ss');
        return {
          margin: 10,
          columns: [
            'Fecha: ' + fecha + ' Hora: ' + hora,
            {
              text: [
                {
                  text: '© Pag ' + currentPage.toString() + ' of ' + pageCount,
                  alignment: 'right', color: 'blue',
                  opacity: 0.5
                }
              ],
            }
          ], fontSize: 10, color: '#A4B8FF',
        }
      },
      content: [
        { image: this.logo, width: 150, margin: [5, -27, 0, 2] },
        { text: this.datoSolicitud[0].nom_empresa.toUpperCase(), bold: true, fontSize: 20, alignment: 'center', margin: [0, -2, 0, 10] },
        { text: 'SOLICITUD DE PERMISO', fontSize: 10, alignment: 'center', margin: [0, 0, 0, 10] },
        this.SeleccionarMetodo(),
      ],
      styles: {
        tableHeader: { fontSize: 10, bold: true, alignment: 'center', fillColor: this.p_color, },
        tableHeaderA: { fontSize: 10, bold: true, alignment: 'center', fillColor: this.s_color, margin: [10, 0, 10, 0], },
        itemsTableD: { fontSize: 10, alignment: 'left', margin: [50, 5, 5, 5] },
        itemsTable: { fontSize: 10, alignment: 'center', }
      }
    };
  }

  SeleccionarMetodo() {
    let fec_creacion_ = this.validar.FormatearFecha(this.datoSolicitud[0].fec_creacion.split('T')[0], this.formato_fecha, this.validar.dia_completo, this.idioma_fechas);
    let fec_inicio_ = this.validar.FormatearFecha(this.datoSolicitud[0].fec_inicio.split('T')[0], this.formato_fecha, this.validar.dia_completo, this.idioma_fechas);
    let fec_final_ = this.validar.FormatearFecha(this.datoSolicitud[0].fec_final.split('T')[0], this.formato_fecha, this.validar.dia_completo, this.idioma_fechas);

    return {
      table: {
        widths: ['*'],
        body: [
          [{ text: 'INFORMACIÓN GENERAL', style: 'tableHeader' }],
          [{
            columns: [
              { text: [{ text: 'FECHA: ' + fec_creacion_, style: 'itemsTableD' }] },
              { text: [{ text: '', style: 'itemsTableD' }] },
              { text: [{ text: 'CIUDAD: ' + this.datoSolicitud[0].nom_ciudad, style: 'itemsTableD' }] }
            ]
          }],
          [{
            columns: [
              { text: [{ text: 'APELLIDOS: ' + this.datoSolicitud[0].apellido_emple, style: 'itemsTableD' }] },
              { text: [{ text: 'NOMBRES: ' + this.datoSolicitud[0].nombre_emple, style: 'itemsTableD' }] },
              { text: [{ text: 'CÉDULA: ' + this.datoSolicitud[0].cedula, style: 'itemsTableD' }] }
            ]
          }],
          [{
            columns: [
              { text: [{ text: 'RÉGIMEN: ' + this.datoSolicitud[0].nom_regimen, style: 'itemsTableD' }] },
              { text: [{ text: 'Sucursal: ' + this.datoSolicitud[0].nom_sucursal, style: 'itemsTableD' }] },
              { text: [{ text: 'N°. Permiso: ' + this.datoSolicitud[0].num_permiso, style: 'itemsTableD' }] }
            ]
          }],
          [{ text: 'MOTIVO', style: 'tableHeader' }],
          [{
            columns: [
              { text: [{ text: 'TIPO DE SOLICITUD: ' + this.datoSolicitud[0].nom_permiso, style: 'itemsTableD' }] },
              { text: [{ text: '', style: 'itemsTableD' }] },
              { text: [{ text: 'FECHA DE INICIO: ' + fec_inicio_, style: 'itemsTableD' }] },]
          }],
          [{
            columns: [
              { text: [{ text: 'OBSERVACIÓN: ' + this.datoSolicitud[0].descripcion, style: 'itemsTableD' }] },
              { text: [{ text: '', style: 'itemsTableD' }] },
              { text: [{ text: 'FECHA DE FINALIZACIÓN: ' + fec_final_, style: 'itemsTableD' }] },
            ]
          }],
          [{
            columns: [
              { text: [{ text: 'REVISADO POR: ' + this.cadena_texto, style: 'itemsTableD' }] },
            ]
          }],
          [{
            columns: [
              ...this.fila1firmas.map((obj: any) => {
                return {
                  columns: [
                    { width: '*', text: '' },
                    {
                      width: 'auto',
                      layout: 'lightHorizontalLines',
                      table: {
                        widths: ['auto'],
                        body: [
                          [{ text: obj.estado.toUpperCase(), style: 'tableHeaderA' },],
                          [{ text: ' ', style: 'itemsTable', margin: [0, 15, 0, 15] },],
                          [{ text: obj.nombre + '\n' + obj.cargo, style: 'itemsTable' },]
                        ]
                      }
                    },
                    { width: '*', text: '' },
                  ]
                }
              })
            ],
          }],

          [{
            columns: [
              ...this.fila2firmas.map((obje: any) => {
                return {
                  columns: [
                    { width: '*', text: '' },
                    {
                      width: 'auto',
                      layout: 'lightHorizontalLines',
                      table: {
                        widths: ['auto'],
                        body: [
                          [{ text: obje.estado.toUpperCase(), style: 'tableHeaderA' },],
                          [{ text: ' ', style: 'itemsTable', margin: [0, 15, 0, 15] },],
                          [{ text: obje.nombre + '\n' + obje.cargo, style: 'itemsTable' },]
                        ]
                      }
                    },
                    { width: '*', text: '' },
                  ]
                }
              })
            ]
          }
          ],
        ]
      },
      layout: {
        hLineColor: function (i: number, node: { table: { body: string | any[]; }; }) {
          return (i === 0 || i === node.table.body.length) ? 'rgb(80,87,97)' : 'rgb(80,87,97)';
        },
        paddingLeft: function (i: any, node: any) { return 40; },
        paddingRight: function (i: any, node: any) { return 40; },
        paddingTop: function (i: any, node: any) { return 6; },
        paddingBottom: function (i: any, node: any) { return 6; },
      }
    };
  }

}
