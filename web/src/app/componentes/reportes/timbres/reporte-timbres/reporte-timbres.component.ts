// IMPORTAR LIBRERIAS
import { MAT_MOMENT_DATE_FORMATS, MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { Validators, FormControl, FormGroup } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import * as moment from 'moment'; // LIBRERÍA PARA FORMATO DE FECHAS
moment.locale('es');
// LIBRERÍA PARA GENERAR ARCHIVOS PDF
import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js'; 
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import * as xlsx from 'xlsx'; // LIBRERÍA PARA GENERAR ARCHIVOS EXCEL

// SERVICIOS
import { HorasExtrasRealesService } from 'src/app/servicios/reportes/horasExtrasReales/horas-extras-reales.service';
import { DatosGeneralesService } from 'src/app/servicios/datosGenerales/datos-generales.service';
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
import { EmpresaService } from 'src/app/servicios/catalogos/catEmpresa/empresa.service';
import { ReportesService } from 'src/app/servicios/reportes/reportes.service';

// SERVICIOS FILTROS DE BUSQUEDA
import { DepartamentosService } from 'src/app/servicios/catalogos/catDepartamentos/departamentos.service';
import { EmplCargosService } from 'src/app/servicios/empleado/empleadoCargo/empl-cargos.service';
import { ValidacionesService } from '../../../../servicios/validaciones/validaciones.service';
import { PlanGeneralService } from 'src/app/servicios/planGeneral/plan-general.service';
import { RegimenService } from 'src/app/servicios/catalogos/catRegimen/regimen.service';
import { SucursalService } from 'src/app/servicios/sucursales/sucursal.service';

@Component({
  selector: 'app-reporte-timbres',
  templateUrl: './reporte-timbres.component.html',
  styleUrls: ['./reporte-timbres.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } },
    { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'es' },
  ]
})

export class ReporteTimbresComponent implements OnInit {

  empleado: any = [];  // DATOS DEL USUARIO QUE TIMBRE
  datosEmpleado: any = []; // LISTA DE USUARIOS

  // DATOS DEL FORMULARIO DE BUSQUEDA
  departamentoF = new FormControl('', Validators.minLength(2));
  regimenF = new FormControl('', Validators.minLength(2));
  cedula = new FormControl('', Validators.minLength(2));
  nombre = new FormControl('', Validators.minLength(2));
  cargoF = new FormControl('', Validators.minLength(2));
  codigo = new FormControl('');

  // DATOS DEL FORMULARIO FECHAS
  fechaInicialF = new FormControl('', Validators.required);
  fechaFinalF = new FormControl('', Validators.required);

  // GRUPO FORMULARIO FECHAS
  public fechasForm = new FormGroup({
    inicioForm: this.fechaInicialF,
    finalForm: this.fechaFinalF,
  });

  // DATOS DE FILTROS DE BUSQUEDA
  filtroDepartamento: '';
  filtroCodigo: number;
  filtroEmpleado = '';
  filtroRegimen: '';
  filtroCedula: '';
  filtroCargo: '';

  // ITEMS DE PAGINACION DE LA TABLA
  pageSizeOptions = [5, 10, 20, 50];
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;

  // DATOS DEL EMPLEADO LOGUEADO
  empleadoLogueado: any = [];
  idEmpleado: number;


  // FILTROS DE BUSQUEDA 
  sucursalF = new FormControl('');
  laboralF = new FormControl('');
  cargosF = new FormControl('');
  depaF = new FormControl('');

  // FORMULARIO DE BUSQUEDAS
  public busquedasForm = new FormGroup({
    sucursalForm: this.sucursalF,
    laboralForm: this.laboralF,
    cargosForm: this.cargosF,
    depaForm: this.depaF,
  });

  constructor(
    // FILTROS DE BUSQUEDA 
    public restDepa: DepartamentosService,
    public restCargo: EmplCargosService,
    public restRegimen: RegimenService,
    public restSucur: SucursalService,

    private validaciones: ValidacionesService,
    public restH: HorasExtrasRealesService,
    public restD: DatosGeneralesService,
    public restEmpre: EmpresaService,
    public restP: PlanGeneralService,
    private toastr: ToastrService,
    public restR: ReportesService,
    public rest: EmpleadoService,
    public router: Router,
  ) {
    this.idEmpleado = parseInt(localStorage.getItem('empleado') as string);
  }

  ngOnInit(): void {
    this.ObtenerEmpleadoLogueado(this.idEmpleado);
    this.VerDatosEmpleado();
    this.ObtenerColores();
    this.ObtenerLogo();

    //FILTROS DE BUSQUEDA
    this.ListarSucursales();
    this.ListarDepartamentos();
    this.ListarCargos();
    this.ListarRegimen();
  }

  // METODO PARA VER LA INFORMACION DEL EMPLEADO 
  ObtenerEmpleadoLogueado(idemploy: any) {
    this.empleadoLogueado = [];
    this.rest.BuscarUnEmpleado(idemploy).subscribe(data => {
      this.empleadoLogueado = data;
      console.log('emple', this.empleadoLogueado)
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

  // EVENTO PARA MANEJAR LA PAGINACION
  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1;
  }

  // LISTA DE DATOS DE EMPLEADOS
  VerDatosEmpleado() {
    this.datosEmpleado = [];
    this.restD.ListarInformacionActual().subscribe(data => {
      this.datosEmpleado = data;
      console.log('datos_actuales', this.datosEmpleado)
    });
  }

  /*  // Control para verificar ingreso de fechas
    timbres: any = [];
    VerTimbresEmpleado(id_seleccionado, form, archivo) {
      if (form.inicioForm === '' || form.finalForm === '') {
        this.toastr.info('Ingresar fechas de periodo de búsqueda.', 'VERIFICAR DATOS DE FECHA', {
          timeOut: 6000,
        })
      }
      else {
        if (Date.parse(form.inicioForm) <= Date.parse(form.finalForm)) {
          let fechas = {
            fechaInicio: form.inicioForm,
            fechaFinal: form.finalForm
          }
          this.timbres = [];
          this.restR.ObtenerTimbres(id_seleccionado, fechas).subscribe(data => {
            this.timbres = data;
            console.log('Datos timbres: ', this.timbres);
            if (archivo === 'pdf') {
              this.generarPdf('open', id_seleccionado, form);
              this.LimpiarFechas();
            }
            else if (archivo === 'excel') {
              this.exportToExcelTimbres(id_seleccionado, form);
              this.LimpiarFechas();
            }
          }, error => {
            this.toastr.info('En el periodo indicado el empleado no tiene registros de Timbres.', 'Dar click aquí, para obtener reporte, en el que se indica que no existen registros.', {
              timeOut: 10000,
            }).onTap.subscribe(obj => {
              if (archivo === 'pdf') {
                this.PDF_Vacio('open', id_seleccionado, form);
                this.LimpiarFechas();
              }
            });
          }
          );
        }
        else {
          this.toastr.info('La fecha de inicio de Periodo no puede ser posterior a la fecha de fin de Periodo.', 'VERIFICAR', {
            timeOut: 6000,
          });
        }
      }
  
    }*/


  // Control para verificar ingreso de fechas
  timbres: any = [];
  timbresLimpios: any = [];
  timbresLimpiosES: any = [];
  timbresLimpiosES_A: any = [];
  timbresLimpiosES_P: any = [];
  timbresLimpiosPorDia: any = [];
  planificacionGeneral: any = [];
  async VerTimbresEmpleado(id_seleccionado, form, archivo) {
    if (form.inicioForm === '' || form.finalForm === '') {
      this.toastr.info('Ingresar fechas de periodo de búsqueda.', 'VERIFICAR DATOS DE FECHA', {
        timeOut: 6000,
      })
    }
    else {
      if (Date.parse(form.inicioForm) <= Date.parse(form.finalForm)) {
        let fechas = {
          fechaInicio: form.inicioForm,
          fechaFinal: form.finalForm
        }
        const fechaFinalAux = form.finalForm.add(9, 'h');
        let fechasPlan = {
          fechaInicio: form.inicioForm,
          fechaFinal: fechaFinalAux
        }
        // INICIO PROCESO
        /*  //Extrae la planificacion del empleado clikeado con el rango de fechas de la interfaz
          this.planificacionGeneral = [];
          await this.restP.BuscarPlanificacionEmpleado(id_seleccionado, fechasPlan).subscribe(data => {
              this.planificacionGeneral = data;
              console.log("Planificacion: ", this.planificacionGeneral);
            }, error => {
              this.toastr.info('NO existe horario registrado.', 'VERIFICAR', {
                timeOut: 6000,
              });
            }
          );*/

        //**********************************/
        this.timbres = [];
        this.restR.ObtenerTimbres(id_seleccionado, fechas).subscribe(data => {
          console.log("Data: ", data);
          this.timbres = data;
          console.log("Timbres: ", this.timbres);
          //Limpia timbres repetidos: timbres que esten en un rango de 10 mins a partir del primer turno, del empleado seleccionado
          for (let i = 0; i < this.timbres.length; i++) {
            if (i > 0) {
              if ((moment(this.timbres[i].fec_hora_timbre).format('DD/MM/YYYY HH:mm:ss')) > (moment(this.timbres[i - 1].fec_hora_timbre).add(10, 'm').format('DD/MM/YYYY HH:mm:ss'))) {
                this.timbresLimpios.push(this.timbres[i]);
              }
              //console.log("bool i: ",(this.timbres[i].fec_hora_timbre));
              //console.log("bool i: ",moment(this.timbres[i].fec_hora_timbre).format('DD/MM/YYYY HH:mm:ss'));
              //console.log("bool i-1: ",moment(this.timbres[i-1].fec_hora_timbre).format('DD/MM/YYYY HH:mm:ss'));
              //console.log("bool i-1: ",moment(this.timbres[i-1].fec_hora_timbre).add(10, 'm').format('DD/MM/YYYY HH:mm:ss'));
              //console.log("If: ", (moment(this.timbres[i].fec_hora_timbre).format('DD/MM/YYYY HH:mm:ss')) > (moment(this.timbres[i-1].fec_hora_timbre).add(10, 'm').format('DD/MM/YYYY HH:mm:ss')));
              //this.timbresLimpios.push(this.timbres[i]);
            } else {
              this.timbresLimpios.push(this.timbres[i]);
              //console.log("DAT: ", this.timbres[i]);
              //console.log("DAT A: ", this.timbresLimpios);
            }
          }
          console.log("DAT L1: ", this.timbresLimpios);
          /*
          for(let j=0;j<this.timbresLimpios.length;j++){
              let busquedaE: any;
              let busquedaS: any;
              let busquedaSA: any;
              let busquedaEA: any;
              busquedaE = null;
              busquedaS = null;
              busquedaSA = null;
              busquedaEA = null;
              
              console.log("Timbre: ", moment(this.timbresLimpios[j].fec_hora_timbre).format('YYYY-MM-DD HH:mm:ss'));

              //Busca su horario de timbre de entrada comparada con su timbre registrado
              busquedaE = this.planificacionGeneral.find(
                aux => 
                  (
                  moment(aux.fec_hora_horario).add(60,'m').format('YYYY-MM-DD HH:mm:ss') >= moment(this.timbresLimpios[j].fec_hora_timbre).format('YYYY-MM-DD HH:mm:ss') &&
                  moment(aux.fec_horario).format('YYYY-MM-DD') === moment(this.timbresLimpios[j].fec_hora_timbre).format('YYYY-MM-DD')
                  && aux.tipo_entr_salida === 'E'
                  && this.timbresLimpios[j].accion != 'PES'
                  )
              );
              if(busquedaE != undefined){
                console.log("Entrada: ",
                moment(busquedaE.fec_hora_horario).format('YYYY-MM-DD HH:mm:ss'));
                this.timbresLimpios[j].accion = 'E';
              }else{
                  busquedaSA = this.planificacionGeneral.find(
                    aux => 
                      (
                      moment(aux.fec_hora_horario).subtract(20,'m').format('YYYY-MM-DD HH:mm:ss') <= moment(this.timbresLimpios[j].fec_hora_timbre).format('YYYY-MM-DD HH:mm:ss') &&
                      moment(aux.fec_hora_horario).add((parseInt(this.timbresLimpios[j].min_almuerzo)),'m').format('YYYY-MM-DD HH:mm:ss') >= moment(this.timbresLimpios[j].fec_hora_timbre).format('YYYY-MM-DD HH:mm:ss') &&
                      moment(aux.fec_horario).format('YYYY-MM-DD') === moment(this.timbresLimpios[j].fec_hora_timbre).format('YYYY-MM-DD')
                      && aux.tipo_entr_salida === 'I/A'
                      && this.timbresLimpios[j].accion != 'PES' && this.timbresLimpios[j].accion != 'S/P'
                      )
                  );
                  if(busquedaSA != undefined){
                    console.log("Almuerzo 1: ",
                    moment(busquedaSA.fec_hora_horario).format('YYYY-MM-DD HH:mm:ss'));
                    this.timbresLimpios[j].accion = 'AES';
                  }else{
                    busquedaEA = this.planificacionGeneral.find(
                      aux => 
                        (
                        moment(aux.fec_hora_horario).add(20,'m').format('YYYY-MM-DD HH:mm:ss') >= moment(this.timbresLimpios[j].fec_hora_timbre).format('YYYY-MM-DD HH:mm:ss') &&
                        moment(aux.fec_hora_horario).subtract((parseInt(this.timbresLimpios[j].min_almuerzo)),'m').format('YYYY-MM-DD HH:mm:ss') <= moment(this.timbresLimpios[j].fec_hora_timbre).format('YYYY-MM-DD HH:mm:ss') &&
                        moment(aux.fec_horario).format('YYYY-MM-DD') === moment(this.timbresLimpios[j].fec_hora_timbre).format('YYYY-MM-DD')
                        && aux.tipo_entr_salida === 'F/A'
                        && this.timbresLimpios[j].accion != 'PES' && this.timbresLimpios[j].accion != 'E/P'
                        )
                    );
                    if(busquedaEA != undefined){
                      console.log("Almuerzo 2: ",
                      moment(busquedaEA.fec_hora_horario).format('YYYY-MM-DD HH:mm:ss'));
                      this.timbresLimpios[j].accion = 'AES';
                    }else{
                      busquedaS = this.planificacionGeneral.find(
                        aux => 
                          (
                          moment(aux.fec_hora_horario).subtract(45,'m').format('YYYY-MM-DD HH:mm:ss') <= moment(this.timbresLimpios[j].fec_hora_timbre).format('YYYY-MM-DD HH:mm:ss') &&
                          moment(aux.fec_horario).format('YYYY-MM-DD') === moment(this.timbresLimpios[j].fec_hora_timbre).format('YYYY-MM-DD')
                          && aux.tipo_entr_salida === 'S'
                          && this.timbresLimpios[j].accion != 'PES'
                          )
                      );
                      if(busquedaS != undefined){
                        console.log("Salida: ",
                        moment(busquedaS.fec_hora_horario).format('YYYY-MM-DD HH:mm:ss'));
                        this.timbresLimpios[j].accion = 'S';
                      }
                    }
                  }

                }
              
              
              if(busquedaS != undefined){
                console.log("Salida: ",
                moment(busquedaS.fec_hora_horario).format('YYYY-MM-DD HH:mm:ss')
                );
              }
              if(busquedaSA != undefined){
                console.log("S Almuerzo: ",
                moment(busquedaSA.fec_hora_horario).format('YYYY-MM-DD HH:mm:ss')
                );
              }
              if(busquedaEA != undefined){
                console.log("E Almuerzo: ",
                moment(busquedaEA.fec_hora_horario).format('YYYY-MM-DD HH:mm:ss')
                );
              }
              
          }

          //Codigos 99
          let busqueda99: any;
          do {
            busqueda99 = null;
            busqueda99 = this.timbresLimpios.find(
              aux => 
                (
                aux.accion === 'NA'
                )
            );
            if(busqueda99 != undefined){
              console.log("EncontrÃ³ timbre 99: ",busqueda99);
              let index99 = this.timbresLimpios.indexOf(busqueda99);
              let index99_Anterior = index99 - 1;
              let index99_Posterior = index99 + 1;
              switch (this.timbresLimpios[index99_Anterior].accion){
                case 'E':
                  if(this.timbresLimpios[index99_Posterior].accion === 'F/A'){
                    this.timbresLimpios[index99].accion = 'AES';
                  }else{
                    if(this.timbresLimpios[index99_Posterior].accion === 'NA'){
                      this.timbresLimpios[index99].accion = 'AES';
                    }else{
                      this.timbresLimpios[index99].accion = 'NN';
                    }
                  }
                break;
                case 'I/A':
                  this.timbresLimpios[index99].accion = 'AES';
                break;
                case 'F/A':
                  this.timbresLimpios[index99].accion = 'S';
                break;
                case 'S':
                  this.timbresLimpios[index99].accion = 'E';
                break;
                case 'S/P':
                  this.timbresLimpios[index99].accion = 'E/P';
                break;
                case 'PES':
                  this.timbresLimpios[index99].accion = 'E/P';
                break;
                default:
                  this.timbresLimpios[index99].accion = 'NN';
              }
            }
          } while (busqueda99 != undefined);

          //Busqueda de permisos
          let busquedaEP: any;
          let busquedaSP: any;
          let k = 0;
          do {
            busquedaEP = null;
            busquedaEP = this.timbresLimpios.find(
              aux => 
                (
                aux.accion === 'PES'
                )
            );
            if(busquedaEP != undefined){
              console.log("EncontrÃ³ timbre PES: ",busquedaEP);
              let indexEP = this.timbresLimpios.indexOf(busquedaEP);
              let indexEPAnterior = indexEP - 1;
              let indexEPPosterior = indexEP + 1;
              if(this.timbresLimpios[indexEPAnterior].accion != 'PES' && this.timbresLimpios[indexEPAnterior].accion != 'NA' && this.timbresLimpios[indexEPAnterior].accion != 'S/P'){
                this.timbresLimpios[indexEP].accion = 'S/P'
              }else{
                this.timbresLimpios[indexEP].accion = 'E/P'
              }
            }
            k ++;
          } while (busquedaEP != undefined);

          //Busqueda Alimentacion
          let busquedaSA_Destiempo: any;
          do {
            busquedaSA_Destiempo = null;
            busquedaSA_Destiempo = this.timbresLimpios.find(
              aux => 
                (
                aux.accion === 'AES'
                )
            );
            if(busquedaSA_Destiempo != undefined){
              console.log("EncontrÃ³ timbre Almuerzo: ",busquedaSA_Destiempo);
              let indexSA_Destiempo = this.timbresLimpios.indexOf(busquedaSA_Destiempo);
              let indexSA_Destiempo_Anterior = indexSA_Destiempo - 1;
              let indexSA_Destiempo_Posterior = indexSA_Destiempo + 1;
              if(this.timbresLimpios[indexSA_Destiempo_Anterior].accion != 'AES' && this.timbresLimpios[indexSA_Destiempo_Anterior].accion != 'I/A'){
                this.timbresLimpios[indexSA_Destiempo].accion = 'I/A';
              }else{
                this.timbresLimpios[indexSA_Destiempo].accion = 'F/A';
              }
            }
          } while (busquedaSA_Destiempo != undefined);

          do {
            busqueda99 = null;
            busqueda99 = this.timbresLimpios.find(
              aux => 
                (
                aux.accion === 'NN'
                )
            );
            if(busqueda99 != undefined){
              console.log("EncontrÃ³ timbre 99: ",busqueda99);
              let index99 = this.timbresLimpios.indexOf(busqueda99);
              let index99_Anterior = index99 - 1;
              let index99_Posterior = index99 + 1;
              switch (this.timbresLimpios[index99_Anterior].accion){
                case 'I/A':
                  this.timbresLimpios[index99].accion = 'F/A';
                break;
                default:
                  this.timbresLimpios[index99].accion = 'NM';
              }
            }
          } while (busqueda99 != undefined);

          
          console.log('Datos timbres: ', this.timbres);
          */
          // FIN PROCESO
          if (archivo === 'pdf') {
            this.generarPdf('open', id_seleccionado, form);
            this.LimpiarFechas();
          }
          else if (archivo === 'excel') {
            this.exportToExcelTimbres(id_seleccionado, form);
            this.LimpiarFechas();
          }
        }, error => {
          this.toastr.info('En el periodo indicado el empleado no tiene registros de Timbres. ', 'Dar click aquÃ­, para obtener reporte, en el que se indica que no existen registros.', {
            timeOut: 10000,//Revisar ingreso de horario
          }).onTap.subscribe(obj => {
            if (archivo === 'pdf') {
              this.PDF_Vacio('open', id_seleccionado, form);
              this.LimpiarFechas();
            }
          });
        }
        );
      }
      else {
        this.toastr.info('La fecha de inicio de Periodo no puede ser posterior a la fecha de fin de Periodo.', 'VERIFICAR', {
          timeOut: 6000,
        });
      }
    }
    this.timbresLimpios = [];
  }







  IngresarSoloLetras(e) {
    return this.validaciones.IngresarSoloLetras(e)
  }

  IngresarSoloNumeros(evt) {
    return this.validaciones.IngresarSoloNumeros(evt)
  }

  LimpiarCampos() {
    this.codigo.reset();
    this.cedula.reset();
    this.nombre.reset();
    this.departamentoF.reset();
    this.regimenF.reset();
    this.cargoF.reset();
    this.filtroEmpleado = '';
  }

  LimpiarFechas() {
    this.fechaInicialF.reset();
    this.fechaFinalF.reset();
  }

  /* ****************************************************************************************************
   *                               PARA LA EXPORTACION DE ARCHIVOS PDF
   * ****************************************************************************************************/

  generarPdf(action = 'open', id_seleccionado, form) {
    const documentDefinition = this.getDocumentDefinicion(id_seleccionado, form);

    switch (action) {
      case 'open': pdfMake.createPdf(documentDefinition).open(); break;
      case 'print': pdfMake.createPdf(documentDefinition).print(); break;
      case 'download': pdfMake.createPdf(documentDefinition).download(); break;

      default: pdfMake.createPdf(documentDefinition).open(); break;
    }

  }

  getDocumentDefinicion(id_seleccionado: number, form) {

    sessionStorage.setItem('Administrador', this.empleadoLogueado);

    return {

      // ENCABEZADO DE LA PAGINA
      //pageOrientation: 'landscape',
      watermark: { text: this.frase, color: 'blue', opacity: 0.1, bold: true, italics: false },
      header: { text: 'Impreso por:  ' + this.empleadoLogueado[0].nombre + ' ' + this.empleadoLogueado[0].apellido, margin: 10, fontSize: 9, opacity: 0.3, alignment: 'right' },

      // PIE DE LA PAGINA
      footer: function (currentPage: any, pageCount: any, fecha: any, hora: any) {
        var f = moment();
        fecha = f.format('YYYY-MM-DD');
        hora = f.format('HH:mm:ss');
        return {
          margin: 10,
          columns: [
            {
              text: [{
                text: 'Fecha: ' + fecha + ' Hora: ' + hora,
                alignment: 'left', opacity: 0.3
              }]
            },
            {
              text: [{
                text: '© Pag ' + currentPage.toString() + ' of ' + pageCount, alignment: 'right', opacity: 0.3
              }],
            }
          ], fontSize: 10
        }
      },
      content: [
        { image: this.logo, width: 150, margin: [10, -25, 0, 5] },
        ...this.datosEmpleado.map(obj => {
          console.log(obj);

          if (obj.codigo === id_seleccionado) {
            return [
              { text: obj.empresa.toUpperCase(), bold: true, fontSize: 25, alignment: 'center', margin: [0, -30, 0, 5] },
              { text: 'REPORTE TIMBRES', fontSize: 17, alignment: 'center', margin: [0, 0, 0, 5] },
            ];
          }
        }),
        this.presentarDatosGenerales(id_seleccionado, form),
        this.presentarTimbres(),
      ],
      styles: {
        tableHeader: { fontSize: 10, bold: true, alignment: 'center', fillColor: this.p_color },
        itemsTableD: { fontSize: 9, alignment: 'center' },
        itemsTableI: { fontSize: 9, alignment: 'left', margin: [50, 5, 5, 5] },
        itemsTableP: { fontSize: 9, alignment: 'left', bold: true, margin: [50, 5, 5, 5] },
        centrado: { fontSize: 10, bold: true, alignment: 'center', fillColor: this.p_color, margin: [0, 10, 0, 10] }
      }
    };
  }

  presentarDatosGenerales(id_seleccionado, form) {
    var ciudad, nombre, apellido, cedula, codigo, sucursal, departamento, cargo, regimen;
    this.datosEmpleado.forEach(obj => {
      if (obj.codigo === id_seleccionado) {
        nombre = obj.nombre;
        apellido = obj.apellido;
        cedula = obj.cedula;
        codigo = obj.codigo;
        sucursal = obj.sucursal;
        departamento = obj.departamento;
        ciudad = obj.ciudad;
        cargo = obj.cargo;
        regimen = obj.regimen
      }
    })
    var diaI = moment(form.inicioForm).day();
    var diaF = moment(form.finalForm).day();
    return {
      table: {
        widths: ['*'],
        body: [
          [{ text: 'INFORMACIÓN GENERAL EMPLEADO', style: 'tableHeader' },],
          [{
            columns: [
              { text: [{ text: 'CIUDAD: ' + ciudad, style: 'itemsTableI' }] },
              { text: [{ text: 'PERIODO DEL: ' + String(moment(form.inicioForm, "YYYY/MM/DD").format("DD/MM/YYYY")) + ' AL ' + String(moment(form.finalForm, "YYYY/MM/DD").format("DD/MM/YYYY")), style: 'itemsTableP' }] },
              { text: [{ text: '', style: 'itemsTableI' }] },
            ]
          }],
          [{
            columns: [
              { text: [{ text: 'APELLIDOS: ' + apellido, style: 'itemsTableI' }] },
              { text: [{ text: 'NOMBRES: ' + nombre, style: 'itemsTableI' }] },
              { text: [{ text: 'CÉDULA: ' + cedula, style: 'itemsTableI' }] },
            ]
          }],
          [{
            columns: [
              { text: [{ text: 'CÓDIGO: ' + codigo, style: 'itemsTableI' }] },
              { text: [{ text: 'CARGO: ' + cargo, style: 'itemsTableI' }] },
              { text: [{ text: 'REGIMEN LABORAL: ' + regimen, style: 'itemsTableI' }] },
            ]
          }],
          [{
            columns: [
              { text: [{ text: 'SUCURSAL: ' + sucursal, style: 'itemsTableI' }] },
              { text: [{ text: 'DEPARTAMENTO: ' + departamento, style: 'itemsTableI' }] },
              { text: [{ text: 'N° REGISTROS: ' + this.timbres.length, style: 'itemsTableI' }] },
            ]
          }],
          [{ text: 'LISTA DE TIMBRES PERIODO DEL ' + moment.weekdays(diaI).toUpperCase() + ' ' + String(moment(form.inicioForm, "YYYY/MM/DD").format("DD/MM/YYYY")) + ' AL ' + moment.weekdays(diaF).toUpperCase() + ' ' + String(moment(form.finalForm, "YYYY/MM/DD").format("DD/MM/YYYY")), style: 'tableHeader' },],
        ]
      },
      layout: {
        hLineColor: function (i, node) {
          return (i === 0 || i === node.table.body.length) ? 'rgb(80,87,97)' : 'rgb(80,87,97)';
        },
        paddingLeft: function (i, node) { return 40; },
        paddingRight: function (i, node) { return 40; },
        paddingTop: function (i, node) { return 5; },
        paddingBottom: function (i, node) { return 5; }
      }
    }
  }

  accionT: string;
  contarRegistros: number = 0;
  presentarTimbres() {
    this.contarRegistros = 0;
    return {
      table: {
        widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', '*'],
        body: [
          [
            { rowSpan: 2, text: 'N. REGISTRO', style: 'centrado' },
            { colSpan: 3, text: 'TIMBRE', style: 'tableHeader', fillColor: this.s_color },
            '', '',
            { rowSpan: 2, text: 'RELOJ', style: 'centrado' },
            { rowSpan: 2, text: 'ACCIÓN', style: 'centrado' },
            { rowSpan: 2, text: 'OBSERVACIÓN', style: 'centrado' },
          ],
          [
            '',
            { text: 'DÍA', style: 'tableHeader' },
            { text: 'FECHA', style: 'tableHeader' },
            { text: 'HORA', style: 'tableHeader' },
            '', '', ''
          ],
          ...this.timbres.map(obj => {
            switch (obj.accion) {
              case 'EoS': this.accionT = 'Entrada o Salida'; break;
              case 'AES': this.accionT = 'Inicio o Fin Alimentación'; break;
              case 'PES': this.accionT = 'Inicio o Fin Permiso'; break;
              case 'E': this.accionT = 'Entrada'; break;
              case 'S': this.accionT = 'Salida'; break;
              case 'F/A': this.accionT = 'Fin Alimentación'; break;
              case 'I/A': this.accionT = 'Inicio Alimentación'; break;
              case 'E/P': this.accionT = 'Fin Permiso'; break;
              case 'S/P': this.accionT = 'Inicio Permiso'; break;
              default: this.accionT = 'Desconocido'; break;
            }
            var day = moment(obj.fec_hora_timbre).day()

            this.contarRegistros = this.contarRegistros + 1;

            return [
              { text: this.contarRegistros, style: 'itemsTableD' },
              { text: moment.weekdays(day).charAt(0).toUpperCase() + moment.weekdays(day).slice(1), style: 'itemsTableD' },
              { text: moment(obj.fec_hora_timbre).format('DD/MM/YYYY'), style: 'itemsTableD' },
              { text: moment(obj.fec_hora_timbre).format('HH:mm:ss'), style: 'itemsTableD' },
              { text: obj.id_reloj, style: 'itemsTableD' },
              { text: this.accionT, style: 'itemsTableD' },
              { text: obj.observacion, style: 'itemsTableD' },
            ];
          })
        ]
      },
      // Estilo de colores formato zebra
      layout: {
        fillColor: function (i, node) {
          return (i % 2 === 0) ? '#CCD1D1' : null;
        }
      }
    };
  }


  /** GENERACIÓN DE PDF AL NO CONTAR CON REGISTROS */

  PDF_Vacio(action = 'open', id_seleccionado, form) {
    const documentDefinition = this.GenerarSinRegstros(id_seleccionado, form);

    switch (action) {
      case 'open': pdfMake.createPdf(documentDefinition).open(); break;
      case 'print': pdfMake.createPdf(documentDefinition).print(); break;
      case 'download': pdfMake.createPdf(documentDefinition).download(); break;

      default: pdfMake.createPdf(documentDefinition).open(); break;
    }

  }

  GenerarSinRegstros(id_seleccionado: any, form) {

    sessionStorage.setItem('Administrador', this.empleadoLogueado);

    return {

      // ENCABEZADO DE LA PAGINA
      pageOrientation: 'landscape',
      watermark: { text: this.frase, color: 'blue', opacity: 0.1, bold: true, italics: false },
      header: { text: 'Impreso por:  ' + this.empleadoLogueado[0].nombre + ' ' + this.empleadoLogueado[0].apellido, margin: 10, fontSize: 9, opacity: 0.3, alignment: 'right' },

      // PIE DE LA PAGINA
      footer: function (currentPage: any, pageCount: any, fecha: any, hora: any) {
        var f = moment();
        fecha = f.format('YYYY-MM-DD');
        hora = f.format('HH:mm:ss');
        return {
          margin: 10,
          columns: [
            {
              text: [{
                text: 'Fecha: ' + fecha + ' Hora: ' + hora,
                alignment: 'left', opacity: 0.3
              }]
            },
            {
              text: [{
                text: '© Pag ' + currentPage.toString() + ' of ' + pageCount, alignment: 'right', opacity: 0.3
              }],
            }
          ], fontSize: 10
        }
      },
      content: [
        { image: this.logo, width: 150, margin: [10, -25, 0, 5] },
        ...this.datosEmpleado.map(obj => {
          if (obj.codigo === id_seleccionado) {
            return [
              { text: obj.empresa.toUpperCase(), bold: true, fontSize: 25, alignment: 'center', margin: [0, -30, 0, 5] },
              { text: 'REPORTE TIMBRES', fontSize: 17, alignment: 'center', margin: [0, 0, 0, 5] },
            ];
          }
        }),
        this.presentarDatosEmpleado(id_seleccionado, form)
      ],
      // Estilos del archivo PDF
      styles: {
        tableHeader: { fontSize: 10, bold: true, alignment: 'center', fillColor: this.p_color },
        itemsTableI: { fontSize: 9, alignment: 'left', margin: [50, 5, 5, 5] },
        itemsTableP: { fontSize: 9, alignment: 'left', bold: true, margin: [50, 5, 5, 5] },
      }
    };
  }

  // Datos generales del PDF y sumatoria total de calculos realizados
  presentarDatosEmpleado(id_seleccionado, form) {
    // Inicialización de varibles
    var ciudad, nombre, apellido, cedula, codigo, sucursal, departamento, cargo, regimen;
    // BUSQUEDA de los datos del empleado del cual se obtiene el reporte
    this.datosEmpleado.forEach(obj => {
      if (obj.codigo === id_seleccionado) {
        nombre = obj.nombre;
        apellido = obj.apellido;
        cedula = obj.cedula;
        codigo = obj.codigo;
        sucursal = obj.sucursal;
        departamento = obj.departamento;
        ciudad = obj.ciudad;
        cargo = obj.cargo;
        regimen = obj.regimen;
      }
    });

    // Estructura de la tabla de lista de registros
    return {
      table: {
        widths: ['*'],
        body: [
          [{ text: 'INFORMACIÓN GENERAL EMPLEADO', style: 'tableHeader' },],
          [{
            columns: [
              { text: [{ text: 'PERIODO DEL: ' + String(moment(form.inicioForm, "YYYY/MM/DD").format("DD/MM/YYYY")) + ' AL ' + String(moment(form.finalForm, "YYYY/MM/DD").format("DD/MM/YYYY")), style: 'itemsTableP' }] },
            ]
          }],
          [{
            columns: [
              { text: [{ text: 'APELLIDOS: ' + apellido, style: 'itemsTableI' }] },
              { text: [{ text: 'NOMBRES: ' + nombre, style: 'itemsTableI' }] },
              { text: [{ text: 'CÉDULA: ' + cedula, style: 'itemsTableI' }] },
            ]
          }],
          [{
            columns: [
              { text: [{ text: 'CÓDIGO: ' + codigo, style: 'itemsTableI' }] },
              { text: [{ text: 'CARGO: ' + cargo, style: 'itemsTableI' }] },
              { text: [{ text: 'REGIMEN LABORAL: ' + regimen, style: 'itemsTableI' }] },
            ]
          }],
          [{
            columns: [
              { text: [{ text: 'CIUDAD: ' + ciudad, style: 'itemsTableI' }] },
              { text: [{ text: 'SUCURSAL: ' + sucursal, style: 'itemsTableI' }] },
              { text: [{ text: 'DEPARTAMENTO: ' + departamento, style: 'itemsTableI' }] },
            ]
          }],
          [{ text: 'NO EXISTEN REGISTROS DE TIMBRES', style: 'tableHeader' },],
        ]
      },
      layout: {
        hLineColor: function (i, node) {
          return (i === 0 || i === node.table.body.length) ? 'rgb(80,87,97)' : 'rgb(80,87,97)';
        },
        paddingLeft: function (i, node) { return 40; },
        paddingRight: function (i, node) { return 40; },
        paddingTop: function (i, node) { return 5; },
        paddingBottom: function (i, node) { return 5; }
      }
    }
  }

  /****************************************************************************************************** 
    *                                       METODO PARA EXPORTAR A EXCEL
    ******************************************************************************************************/
  exportToExcelTimbres(id_empleado: number, form) {
    var j = 0;
    for (var i = 0; i <= this.datosEmpleado.length - 1; i++) {
      if (this.datosEmpleado[i].codigo === id_empleado) {
        var datosEmpleado: any = [{
          CODIGO: this.datosEmpleado[i].codigo,
          NOMBRE: this.datosEmpleado[i].nombre,
          APELLIDO: this.datosEmpleado[i].apellido,
          CEDULA: this.datosEmpleado[i].cedula,
          SUCURSAL: this.datosEmpleado[i].sucursal,
          DEPARTAMENTO: this.datosEmpleado[i].departamento,
          CIUDAD: this.datosEmpleado[i].ciudad,
          CARGO: this.datosEmpleado[i].cargo,
          REGIMEN: this.datosEmpleado[i].regimen
        }]
        break;
      }
    }
    const wse: xlsx.WorkSheet = xlsx.utils.json_to_sheet(datosEmpleado);

    const headerE = Object.keys(datosEmpleado[0]); // columns name

    var wscolsE : any = [];
    for (var i = 0; i < headerE.length; i++) {  // columns length added
      wscolsE.push({ wpx: 110 })
    }
    wse["!cols"] = wscolsE;

    const wst: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.timbres.map(obj => {
      if (obj.accion === 'E' || obj.accion === '1') {
        this.accionT = 'Entrada';
      }
      else if (obj.accion === 'S' || obj.accion === '2') {
        this.accionT = 'Salida';
      }
      else if (obj.accion === 'EA' || obj.accion === '3') {
        this.accionT = 'Entrada Almuerzo';
      }
      else if (obj.accion === 'SA' || obj.accion === '4') {
        this.accionT = 'Salida Almuerzo';
      }
      else if (obj.accion === 'EP' || obj.accion === '5') {
        this.accionT = 'Entrada Permiso';
      }
      else if (obj.accion === 'SP' || obj.accion === '6') {
        this.accionT = 'Salida Permiso';
      }
      var day = moment(obj.fec_hora_timbre).day()
      return {
        N_REGISTROS: j = j + 1,
        DIA_TIMBRE: moment.weekdays(day).charAt(0).toUpperCase() + moment.weekdays(day).slice(1),
        FECHA_TIMBRE: moment(obj.fec_hora_timbre).format('DD/MM/YYYY'),
        HORA_TIMBRE: moment(obj.fec_hora_timbre).format('HH:mm:ss'),
        ID_RELOJ: obj.id_reloj,
        ACCION: this.accionT,
        OBSERVACION: obj.observacion,
      }
    }));

    const header = Object.keys(this.timbres[0]); // columns name

    var wscols : any = [];
    for (var i = 0; i < header.length; i++) {  // columns length added
      wscols.push({ wpx: 110 })
    }
    wst["!cols"] = wscols;

    /* wse["!A1"] = {
       fill: {
         patternType: "none", // none / solid
         fgColor: { rgb: "FFFFAA00" },
         bgColor: { rgb: "FFFFFFFF" }
       },
       font: {
         name: 'Times New Roman',
         sz: 16,
         color: { rgb: "#FF000000" },
         bold: true,
         italic: false,
         underline: false
       },
       border: {
         top: { style: "thin", color: { auto: 1 } },
         right: { style: "thin", color: { auto: 1 } },
         bottom: { style: "thin", color: { auto: 1 } },
         left: { style: "thin", color: { auto: 1 } }
       }
     };*/
    const wb: xlsx.WorkBook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, wse, 'Empleado');
    xlsx.utils.book_append_sheet(wb, wst, 'Timbres');
    xlsx.writeFile(wb, "Timbres - " + String(moment(form.inicioForm, "YYYY/MM/DD").format("DD/MM/YYYY")) + ' - ' + String(moment(form.finalForm, "YYYY/MM/DD").format("DD/MM/YYYY")) + '.xlsx');
  }



  /*FILTROS DE BUSQUEDA*/
  sucursales: any = [];
  ListarSucursales() {
    this.sucursales = [];
    this.restSucur.BuscarSucursal().subscribe(res => {
      this.sucursales = res;
    });
  }

  departamentos: any = [];
  ListarDepartamentos() {
    this.departamentos = [];
    this.restDepa.ConsultarDepartamentos().subscribe(res => {
      this.departamentos = res;
    });
  }

  cargos: any = [];
  ListarCargos() {
    this.cargos = [];
    this.restCargo.ObtenerTipoCargos().subscribe(res => {
      this.cargos = res;
    });
  }

  regimen: any = [];
  ListarRegimen() {
    this.regimen = [];
    this.restRegimen.ConsultarRegimen().subscribe(res => {
      this.regimen = res;
    });
  }

  LimpiarBusquedas() {
    this.busquedasForm.patchValue(
      {
        laboralForm: '',
        depaForm: '',
        cargosForm: '',
        sucursalForm: ''
      })
    this.VerDatosEmpleado();
    this.ListarSucursales();
    this.ListarDepartamentos();
    this.ListarCargos();
    this.ListarRegimen();
  }

  LimpiarCampos1() {
    this.busquedasForm.patchValue(
      {
        laboralForm: '',
        depaForm: '',
        cargosForm: ''
      })
  }

  LimpiarCampos2() {
    this.busquedasForm.patchValue(
      {
        depaForm: '',
        cargosForm: ''
      })
  }

  LimpiarCampos3() {
    this.busquedasForm.patchValue(
      { cargosForm: '' })
  }


  FiltrarSucursal(form: any) {
    this.departamentos = [];
    this.restDepa.BuscarDepartamentoSucursal(form.sucursalForm).subscribe(res => {
      this.departamentos = res;
    });
    this.cargos = [];
    this.restCargo.ObtenerCargoSucursal(form.sucursalForm).subscribe(res => {
      this.cargos = res;
    }, error => {
      this.toastr.info('La sucursal seleccionada no cuenta con cargos registrados.', 'Verificar la Información', {
        timeOut: 3000,
      })
    });
    this.regimen = [];
    this.restRegimen.ConsultarRegimenSucursal(form.sucursalForm).subscribe(res => {
      this.regimen = res;
    });
    this.LimpiarCampos1();
  }

  FiltrarRegimen(form: any) {
    this.cargos = [];
    this.restCargo.ObtenerCargoRegimen(form.laboralForm).subscribe(res => {
      this.cargos = res;
    }, error => {
      this.toastr.info('El regimen seleccionado no cuenta con cargos registrados.', 'Verificar la Información', {
        timeOut: 3000,
      })
    });
    this.departamentos = [];
    this.restDepa.BuscarDepartamentoRegimen(form.laboralForm).subscribe(res => {
      this.departamentos = res;
    });
    this.LimpiarCampos2();
  }

  FiltrarDepartamento(form: any) {
    this.cargos = [];
    this.restCargo.ObtenerCargoDepartamento(form.depaForm).subscribe(res => {
      this.cargos = res;
    }, error => {
      this.toastr.info('El departamento seleccionado no cuenta con cargos registrados.', 'Verificar la Información', {
        timeOut: 3000,
      })
    });
    this.LimpiarCampos3();
  }

  VerInformacionSucursal(form: any) {
    this.datosEmpleado = [];
    this.restD.VerDatosSucursal(form.sucursalForm).subscribe(res => {
      this.datosEmpleado = res;
    }, error => {
      this.toastr.error('Ningún dato coincide con los criterios de búsqueda indicados.', 'Verficar Información', {
        timeOut: 6000,
      })
    });
  }

  VerInformacionSucuDepa(form: any) {
    this.datosEmpleado = [];
    this.restD.VerDatosSucuDepa(form.sucursalForm, form.depaForm).subscribe(res => {
      this.datosEmpleado = res;
    }, error => {
      this.toastr.error('Ningún dato coincide con los criterios de búsqueda indicados.', 'Verficar Información', {
        timeOut: 6000,
      })
    });
  }

  VerInformacionSucuDepaRegimen(form: any) {
    this.datosEmpleado = [];
    this.restD.VerDatosSucuDepaRegimen(form.sucursalForm, form.depaForm, form.laboralForm).subscribe(res => {
      this.datosEmpleado = res;
    }, error => {
      this.toastr.error('Ningún dato coincide con los criterios de búsqueda indicados.', 'Verficar Información', {
        timeOut: 6000,
      })
    });
  }

  VerInformacionSucuCargo(form: any) {
    this.datosEmpleado = [];
    this.restD.VerDatosSucuCargo(form.sucursalForm, form.cargosForm).subscribe(res => {
      this.datosEmpleado = res;
    }, error => {
      this.toastr.error('Ningún dato coincide con los criterios de búsqueda indicados.', 'Verficar Información', {
        timeOut: 6000,
      })
    });
  }

  VerInformacionSucuRegimen(form: any) {
    this.datosEmpleado = [];
    this.restD.VerDatosSucuRegimen(form.sucursalForm, form.laboralForm).subscribe(res => {
      this.datosEmpleado = res;
    }, error => {
      this.toastr.error('Ningún dato coincide con los criterios de búsqueda indicados.', 'Verficar Información', {
        timeOut: 6000,
      })
    });
  }

  VerInformacionSucuRegimenCargo(form: any) {
    this.datosEmpleado = [];
    this.restD.VerDatosSucuRegimenCargo(form.sucursalForm, form.laboralForm, form.cargosForm).subscribe(res => {
      this.datosEmpleado = res;
    }, error => {
      this.toastr.error('Ningún dato coincide con los criterios de búsqueda indicados.', 'Verficar Información', {
        timeOut: 6000,
      })
    });
  }

  VerInformacionSucuDepaCargo(form: any) {
    this.datosEmpleado = [];
    this.restD.VerDatosSucuDepaCargo(form.sucursalForm, form.depaForm, form.cargosForm).subscribe(res => {
      this.datosEmpleado = res;
    }, error => {
      this.toastr.error('Ningún dato coincide con los criterios de búsqueda indicados.', 'Verficar Información', {
        timeOut: 6000,
      })
    });
  }

  VerInformacionSucuDepaCargoRegimen(form: any) {
    this.datosEmpleado = [];
    this.restD.VerDatosSucuRegimenDepartamentoCargo(form.sucursalForm, form.depaForm, form.laboralForm, form.cargosForm).subscribe(res => {
      this.datosEmpleado = res;
    }, error => {
      this.toastr.error('Ningún dato coincide con los criterios de búsqueda indicados.', 'Verficar Información', {
        timeOut: 6000,
      })
    });
  }

  VerInformacionDepartamento(form: any) {
    this.datosEmpleado = [];
    this.restD.VerDatosDepartamento(form.depaForm).subscribe(res => {
      this.datosEmpleado = res;
    }, error => {
      this.toastr.error('Ningún dato coincide con los criterios de búsqueda indicados.', 'Verficar Información', {
        timeOut: 6000,
      })
    });
  }

  VerInformacionDepaCargo(form: any) {
    this.datosEmpleado = [];
    this.restD.VerDatosDepaCargo(form.depaForm, form.cargosForm).subscribe(res => {
      this.datosEmpleado = res;
    }, error => {
      this.toastr.error('Ningún dato coincide con los criterios de búsqueda indicados.', 'Verficar Información', {
        timeOut: 6000,
      })
    });
  }

  VerInformacionDepaRegimen(form: any) {
    this.datosEmpleado = [];
    this.restD.VerDatosDepaRegimen(form.depaForm, form.laboralForm).subscribe(res => {
      this.datosEmpleado = res;
    }, error => {
      this.toastr.error('Ningún dato coincide con los criterios de búsqueda indicados.', 'Verficar Información', {
        timeOut: 6000,
      })
    });
  }

  VerInformacionDepaRegimenCargo(form: any) {
    this.datosEmpleado = [];
    this.restD.VerDatosDepaRegimenCargo(form.depaForm, form.laboralForm, form.cargosForm).subscribe(res => {
      this.datosEmpleado = res;
    }, error => {
      this.toastr.error('Ningún dato coincide con los criterios de búsqueda indicados.', 'Verficar Información', {
        timeOut: 6000,
      })
    });
  }

  VerInformacionRegimen(form: any) {
    this.datosEmpleado = [];
    this.restD.VerDatosRegimen(form.laboralForm).subscribe(res => {
      this.datosEmpleado = res;
    }, error => {
      this.toastr.error('Ningún dato coincide con los criterios de búsqueda indicados.', 'Verficar Información', {
        timeOut: 6000,
      })
    });
  }

  VerInformacionRegimenCargo(form: any) {
    this.datosEmpleado = [];
    this.restD.VerDatosRegimenCargo(form.laboralForm, form.cargosForm).subscribe(res => {
      this.datosEmpleado = res;
    }, error => {
      this.toastr.error('Ningún dato coincide con los criterios de búsqueda indicados.', 'Verficar Información', {
        timeOut: 6000,
      })
    });
  }

  VerInformacionCargo(form: any) {
    this.datosEmpleado = [];
    this.restD.VerDatosCargo(form.cargosForm).subscribe(res => {
      this.datosEmpleado = res;
    }, error => {
      this.toastr.error('Ningún dato coincide con los criterios de búsqueda indicados.', 'Verficar Información', {
        timeOut: 6000,
      })
    });
  }

  VerificarBusquedas(form: any) {
    console.log('form', form.depaForm, form.sucursalForm, form.cargosForm, form.laboralForm)
    if (form.sucursalForm === '' && form.depaForm === '' &&
      form.laboralForm === '' && form.cargosForm === '') {
      this.toastr.info('Ingresar un criterio de búsqueda.', 'Verficar Información', {
        timeOut: 6000,
      })
    }
    else if (form.sucursalForm != '' && form.depaForm === '' &&
      form.laboralForm === '' && form.cargosForm === '') {
      this.VerInformacionSucursal(form);
    }
    else if (form.sucursalForm != '' && form.depaForm != '' &&
      form.laboralForm === '' && form.cargosForm === '') {
      this.VerInformacionSucuDepa(form);
    }
    else if (form.sucursalForm != '' && form.depaForm != '' &&
      form.laboralForm != '' && form.cargosForm === '') {
      this.VerInformacionSucuDepaRegimen(form);
    }
    else if (form.sucursalForm != '' && form.depaForm != '' &&
      form.laboralForm === '' && form.cargosForm != '') {
      this.VerInformacionSucuDepaCargo(form);
    }
    else if (form.sucursalForm != '' && form.depaForm === '' &&
      form.laboralForm === '' && form.cargosForm != '') {
      this.VerInformacionSucuCargo(form);
    }
    else if (form.sucursalForm != '' && form.depaForm === '' &&
      form.laboralForm != '' && form.cargosForm === '') {
      this.VerInformacionSucuRegimen(form);
    }
    else if (form.sucursalForm != '' && form.depaForm === '' &&
      form.laboralForm != '' && form.cargosForm != '') {
      this.VerInformacionSucuRegimenCargo(form);
    }
    else if (form.sucursalForm != '' && form.depaForm != '' &&
      form.laboralForm != '' && form.cargosForm != '') {
      this.VerInformacionSucuDepaCargoRegimen(form);
    }
    else if (form.sucursalForm === '' && form.depaForm != '' &&
      form.laboralForm === '' && form.cargosForm === '') {
      this.VerInformacionDepartamento(form);
    }
    else if (form.sucursalForm === '' && form.depaForm != '' &&
      form.laboralForm === '' && form.cargosForm != '') {
      this.VerInformacionDepaCargo(form);
    }
    else if (form.sucursalForm === '' && form.depaForm != '' &&
      form.laboralForm != '' && form.cargosForm === '') {
      this.VerInformacionDepaRegimen(form);
    }
    else if (form.sucursalForm === '' && form.depaForm != '' &&
      form.laboralForm != '' && form.cargosForm != '') {
      this.VerInformacionDepaRegimenCargo(form);
    }
    else if (form.sucursalForm === '' && form.depaForm === '' &&
      form.laboralForm != '' && form.cargosForm === '') {
      this.VerInformacionRegimen(form);
    }
    else if (form.sucursalForm === '' && form.depaForm === '' &&
      form.laboralForm != '' && form.cargosForm != '') {
      this.VerInformacionRegimenCargo(form);
    }
    else if (form.sucursalForm === '' && form.depaForm === '' &&
      form.laboralForm === '' && form.cargosForm != '') {
      this.VerInformacionCargo(form);
    }
  }

}
