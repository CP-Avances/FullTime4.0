// IMPORTAR LIBRERIIAS
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
import * as moment from 'moment';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

// IMPORTAR SERVICIOS
import { DatosGeneralesService } from 'src/app/servicios/datosGenerales/datos-generales.service';
import { AutorizacionService } from 'src/app/servicios/autorizacion/autorizacion.service';
import { VacacionesService } from 'src/app/servicios/vacaciones/vacaciones.service';
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
import { EmpresaService } from 'src/app/servicios/catalogos/catEmpresa/empresa.service';

import { EditarEstadoVacacionAutoriacionComponent } from 'src/app/componentes/autorizaciones/editar-estado-vacacion-autoriacion/editar-estado-vacacion-autoriacion.component';
import { VacacionAutorizacionesComponent } from 'src/app/componentes/autorizaciones/vacacion-autorizaciones/vacacion-autorizaciones.component';
import { ParametrosService } from 'src/app/servicios/parametrosGenerales/parametros.service';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';

@Component({
  selector: 'app-ver-vacacion',
  templateUrl: './ver-vacacion.component.html',
  styleUrls: ['./ver-vacacion.component.css']
})

export class VerVacacionComponent implements OnInit {

  // VARIABLE DE BUSQUEDA DE DATOS DE VACACIONES
  vacacion: any = [];
  id_solicitud: number;
  // VARIABLE DE BUSQUEDA DE DATOS DE AUTORIZACIONES
  autorizacion: any = [];
  HabilitarAutorizacion: boolean = true;

  // VARIABLES DE ALMACENAMIENTO DE DATOS DE EMPLEADO QUE INICIA SESIÓN
  empleado: any = [];
  idEmpleado: number;

  // VARIABLE DE ALMACENAMIENTO DE DATOS QUE SE MUESTRAN EN EL PDF
  fechaActual: any;
  id_vacacion: string;
  datoSolicitud: any = [];
  datosAutorizacion: any = [];
  habilitarActualizar: boolean = true;

  ocultar: boolean = false;
  estado: boolean = false;

  constructor(
    public restGeneral: DatosGeneralesService, // SERVICIO DE DATOS GENERALES DE EMPLEADO
    public restEmpre: EmpresaService, // SERVICIO DE DATOS DE EMPRESA
    public ventana: MatDialog, // VARIABLE DE MANEJO DE VENTANAS
    public validar: ValidacionesService,
    public restE: EmpleadoService, // SERVICIO DE DATOS DE EMPLEADO
    private router: Router, // VARIABLE DE MANEJO DE RUTAS
    private restA: AutorizacionService, // SERVICIO DE DATOS DE AUTORIZACIÓN
    private restV: VacacionesService, // SERVICIO DE DATOS DE SOLICITUD DE VACACIONES
    private parametro: ParametrosService,
  ) {
    this.idEmpleado = parseInt(localStorage.getItem('empleado') as string);
    this.id_vacacion = this.router.url.split('/')[2];
  }

  ionViewWillEnter(){
    this.BuscarParametro();
  }

  ngOnInit(): void {
    this.ObtenerLogo();
    this.ObtenerColores();
    this.BuscarParametro();
  }

  /** **************************************************************************************** **
   ** **                   BUSQUEDA DE FORMATOS DE FECHAS Y HORAS                           ** ** 
   ** **************************************************************************************** **/

  formato_fecha: string = 'DD/MM/YYYY';
  formato_hora: string = 'HH:mm:ss';

  // METODO PARA BUSCAR PARÁMETRO DE FORMATO DE FECHA
  BuscarParametro() {
    var f = moment();
    this.fechaActual = f.format('YYYY-MM-DD');
    // id_tipo_parametro Formato fecha = 25
    this.parametro.ListarDetalleParametros(25).subscribe(
      res => {
        this.formato_fecha = res[0].descripcion;
        this.BuscarDatos(this.formato_fecha);
      },
      vacio => {
        this.BuscarDatos(this.formato_fecha);
      });
  }

  // VARIABE DE ALMACENAMIENTO DE DATOS DE COLABORADORES QUE REVISARON SOLICITUD
  empleado_estado: any = [];
  // CONTADOR DE REVISIONES DE SOLICITUD
  lectura: number = 1;
  cont: number;
  // METODO DE BUSQUEDA DE DATOS DE SOLICITUD Y AUTORIZACIÓN
  BuscarDatos(formato_fecha: string) {
    this.vacacion = [];
    // BUSQUEDA DE DATOS DE VACACIONES
    this.restV.ObtenerUnaVacacion(parseInt(this.id_vacacion)).subscribe(res => {
      this.vacacion = res;
      console.log('ver data ... ', this.vacacion);

      this.id_solicitud = this.vacacion[0].id;

      this.vacacion.forEach(v => {
        // TRATAMIENTO DE FECHAS Y HORAS 
        v.fec_ingreso_ = this.validar.FormatearFecha(v.fec_ingreso, formato_fecha, this.validar.dia_completo);
        v.fec_inicio_ = this.validar.FormatearFecha(v.fec_inicio, formato_fecha, this.validar.dia_completo);
        v.fec_final_ = this.validar.FormatearFecha(v.fec_final, formato_fecha, this.validar.dia_completo);
      })

      if(this.idEmpleado == this.vacacion[0].id_empleado){
        this.ocultar = true;
      }else{
        this.ocultar = false;
      }

      if(this.vacacion[0].estado > 1){
        this.estado = true;
      }else{
        this.estado = false;
      }

      this.ObtenerAutorizacion(this.vacacion[0].id);
    });

    this.ObtenerEmpleados(this.idEmpleado);
    this.ObtenerSolicitud(this.id_vacacion);
  }

  ObtenerAutorizacion(id: number) {
    this.autorizacion = [];
    this.empleado_estado = [];
    this.lectura = 1;

    // BUSQUEDA DE DATOS DE AUTORIZACIÓN
    this.restA.getUnaAutorizacionByVacacionRest(id).subscribe(res1 => {
      this.autorizacion = res1;
      console.log("Autorizacion: ",this.autorizacion);

      // METODO PARA OBTENER EMPLEADOS Y ESTADOS
      var autorizaciones = this.autorizacion[0].id_documento.split(',');
      autorizaciones.map((obj: string) => {
        this.lectura = this.lectura + 1;
        if (obj != '') {
          let empleado_id = obj.split('_')[0];
          var estado_auto = obj.split('_')[1];
          // CAMBIAR DATO ESTADO INT A VARCHAR
          if (estado_auto === '1') {
            estado_auto = 'Pendiente';
          }
          if (estado_auto === '2') {
            estado_auto = 'Preautorización';
          }
          if (estado_auto === '3') {
            estado_auto = 'Autorización';
          }
          if (estado_auto === '4') {
            estado_auto = 'Permiso Negado';
          }
          // CREAR ARRAY DE DATOS DE COLABORADORES
          var data = {
            id_empleado: empleado_id,
            estado: estado_auto
          }
          this.empleado_estado = this.empleado_estado.concat(data);
          // CUANDO TODOS LOS DATOS SE HAYAN REVISADO EJECUTAR METODO DE INFORMACIÓN DE AUTORIZACIÓN
          if (this.lectura === autorizaciones.length) {
            this.VerInformacionAutoriza(this.empleado_estado);
          }
        }
      })
      // TOMAR TAMAÑO DE ARREGLO DE COLABORADORES QUE REVIZARÓN SOLICITUD
      this.cont = autorizaciones.length - 1;

    }, error => {
      this.HabilitarAutorizacion = false;
    });
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
      this.p_color = res[0].color_p;
      this.s_color = res[0].color_s;
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

  // METODO PARA VER LA INFORMACIÓN DE LA SOLICITUD 
  ObtenerSolicitud(id: any) {
    this.datoSolicitud = [];
    // BUSQUEDA DE DATOS DE SOLICITUD PARA MOSTRAR EN PDF
    this.restV.BuscarDatosSolicitud(id).subscribe(data => {
      this.datoSolicitud = data;
      // BUSQUEDA DE DATOS DE EMPRESA
      this.restEmpre.ConsultarDatosEmpresa(parseInt(localStorage.getItem('empresa') as string)).subscribe(res => {
        var fecha_inicio = moment(this.datoSolicitud[0].fec_inicio);
        // METODO PARA VER DÍAS DISPONIBLES DE AUTORIZACIÓN
        console.log(fecha_inicio.diff(this.fechaActual, 'days'), ' dias de diferencia ' + res[0].dias_cambio);
        if (res[0].cambios === true) {
          if (res[0].cambios === 0) {
            this.habilitarActualizar = false;
          }
          else {
            var dias = fecha_inicio.diff(this.fechaActual, 'days');
            if (dias >= res[0].dias_cambio) {
              this.habilitarActualizar = true;
            }
            else {
              this.habilitarActualizar = false;
            }
          }
        } else {
          this.habilitarActualizar = false;
        }
      });



    })
  }

  // ABRIR VENTANAS DE NAVEGACIÓN
  AbrirVentanaEditarAutorizacion(datosSeleccionados: any): void {
    console.log("Esta en autorizacion 1 edicion: ",datosSeleccionados);
    this.ventana.open(EditarEstadoVacacionAutoriacionComponent,
      { width: '350px', data: { auto: datosSeleccionados, vacacion: this.vacacion[0] } })
      .afterClosed().subscribe(item => {
        this.BuscarParametro();
      });
  }

  AbrirAutorizaciones(datosSeleccionados: any): void {
    this.ventana.open(VacacionAutorizacionesComponent,
      { width: '350px', data: datosSeleccionados }).afterClosed().subscribe(item => {
        this.BuscarParametro();
        this.HabilitarAutorizacion = true;
      });
  }

  /** **************************************************************************************************** * 
   *                                         METODO PARA EXPORTAR A PDF                                    *
   ** **************************************************************************************************** */
  GenerarPdf(action = 'open') {
    const documentDefinition = this.getDocumentDefinicion();
    switch (action) {
      case 'open': pdfMake.createPdf(documentDefinition).open(); break;
      case 'print': pdfMake.createPdf(documentDefinition).print(); break;
      case 'download': pdfMake.createPdf(documentDefinition).download(); break;
      default: pdfMake.createPdf(documentDefinition).open(); break;
    }
  }

  getDocumentDefinicion() {
    return {
      // ENCABEZADO DE LA PÁGINA
      pageOrientation: 'landscape',
      watermark: { text: this.frase, color: 'blue', opacity: 0.1, bold: true, italics: false },
      header: { text: 'Impreso por:  ' + this.empleado[0].nombre + ' ' + this.empleado[0].apellido, margin: 10, fontSize: 9, opacity: 0.3, alignment: 'right' },
      // PIE DE PÁGINA
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
        { text: this.datoSolicitud[0].nom_empresa.toUpperCase(), bold: true, fontSize: 20, alignment: 'center', margin: [0, -30, 0, 10] },
        { text: 'SOLICITUD DE VACACIONES', fontSize: 10, alignment: 'center', margin: [0, 0, 0, 10] },
        this.SeleccionarMetodo(),
      ],
      styles: {
        tableHeaderA: { fontSize: 10, bold: true, alignment: 'center', fillColor: this.s_color, margin: [20, 0, 20, 0] },
        tableHeader: { fontSize: 10, bold: true, alignment: 'center', fillColor: this.p_color },
        itemsTableC: { fontSize: 10, alignment: 'center', margin: [50, 5, 5, 5] },
        itemsTableD: { fontSize: 10, alignment: 'left', margin: [50, 5, 5, 5] },
        itemsTable: { fontSize: 10, alignment: 'center', }
      }
    };
  }

  SeleccionarMetodo() {
    let fecha = this.validar.FormatearFecha(this.fechaActual, this.formato_fecha, this.validar.dia_completo);
    let fec_ingreso_ = this.validar.FormatearFecha(this.datoSolicitud[0].fec_ingreso.split('T')[0], this.formato_fecha, this.validar.dia_completo);
    let fec_inicio_ = this.validar.FormatearFecha(this.datoSolicitud[0].fec_inicio.split('T')[0], this.formato_fecha, this.validar.dia_completo);
    let fec_final_ = this.validar.FormatearFecha(this.datoSolicitud[0].fec_final.split('T')[0], this.formato_fecha, this.validar.dia_completo);

    return {
      table: {
        widths: ['*'],
        body: [
          [{ text: 'INFORMACIÓN GENERAL', style: 'tableHeader' }],
          [{
            columns: [
              { text: [{ text: 'FECHA: ' + fecha, style: 'itemsTableD' }] },
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
              { text: [{ text: 'SUCURSAL: ' + this.datoSolicitud[0].nom_sucursal, style: 'itemsTableD' }] },
              { text: [{ text: 'DÍAS DE VACACIONES: ' + this.datoSolicitud[0].dia_laborable, style: 'itemsTableD' }] }
            ]
          }],
          [{ text: 'VACACIONES', style: 'tableHeader' }],
          [{
            columns: [
              { text: [{ text: 'OBSERVACIÓN: ' + this.datoSolicitud[0].descripcion, style: 'itemsTableD' }] },
              { text: [{ text: '', style: 'itemsTableD' }] },
              { text: [{ text: 'FECHA DE INICIO: ' + fec_inicio_, style: 'itemsTableD' }] },
            ]
          }],
          [{
            columns: [
              { text: [{ text: 'FECHA INGRESO: ' + fec_ingreso_, style: 'itemsTableD' }] },
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
            columns: [{
              columns: [
                { width: '*', text: '' },
                {
                  width: 'auto',
                  layout: 'lightHorizontalLines',
                  table: {
                    widths: ['auto'],
                    body: [
                      [{ text: this.empleado_estado[this.cont - 1].estado.toUpperCase() + ' POR', style: 'tableHeaderA' }],
                      [{ text: ' ', style: 'itemsTable', margin: [0, 20, 0, 20] }],
                      [{ text: this.empleado_estado[this.cont - 1].nombre + '\n' + this.empleado_estado[this.cont - 1].cargo, style: 'itemsTable' }]
                    ]
                  }
                },
                { width: '*', text: '' },
              ]
            },
            {
              columns: [
                { width: '*', text: '' },
                {
                  width: 'auto',
                  layout: 'lightHorizontalLines',
                  table: {
                    widths: ['auto'],
                    body: [
                      [{ text: 'EMPLEADO', style: 'tableHeaderA' }],
                      [{ text: ' ', style: 'itemsTable', margin: [0, 20, 0, 20] }],
                      [{ text: this.datoSolicitud[0].nombre_emple + ' ' + this.datoSolicitud[0].apellido_emple + '\n' + this.datoSolicitud[0].cargo, style: 'itemsTable' }]
                    ]
                  }
                },
                { width: '*', text: '' },
              ]
            }
            ]
          }],
        ]
      },
      layout: {
        hLineColor: function (i, node) {
          return (i === 0 || i === node.table.body.length) ? 'rgb(80,87,97)' : 'rgb(80,87,97)';
        },
        paddingLeft: function (i, node) { return 40; },
        paddingRight: function (i, node) { return 40; },
        paddingTop: function (i, node) { return 10; },
        paddingBottom: function (i, node) { return 10; }
      }
    };
  }

}
