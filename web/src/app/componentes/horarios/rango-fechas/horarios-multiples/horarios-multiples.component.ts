// IMPORTAR LIBRERIAS
import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';
import { ToastrService } from 'ngx-toastr';
import { ThemePalette } from '@angular/material/core';
import { PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';
import * as moment from 'moment';

// IMPORTAR SERVICIOS
import { DetalleCatHorariosService } from 'src/app/servicios/horarios/detalleCatHorarios/detalle-cat-horarios.service';
import { EmpleadoHorariosService } from 'src/app/servicios/horarios/empleadoHorarios/empleado-horarios.service';
import { PlanGeneralService } from 'src/app/servicios/planGeneral/plan-general.service';
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
import { FeriadosService } from 'src/app/servicios/catalogos/catFeriados/feriados.service';
import { TimbresService } from 'src/app/servicios/timbres/timbres.service';
import { HorarioService } from 'src/app/servicios/catalogos/catHorarios/horario.service';

// IMPORTAR COMPONENTES
import { HorarioMultipleEmpleadoComponent } from '../horario-multiple-empleado/horario-multiple-empleado.component';
import { BuscarPlanificacionComponent } from '../buscar-planificacion/buscar-planificacion.component';

@Component({
  selector: 'app-horarios-multiples',
  templateUrl: './horarios-multiples.component.html',
  styleUrls: ['./horarios-multiples.component.css'],
})

export class HorariosMultiplesComponent implements OnInit {

  @Input() seleccionados: any;
  @Input() pagina: any;

  // VARIABLES PROGRESS SPINNER
  progreso: boolean = false;
  progreso_: boolean = false;
  color: ThemePalette = 'primary';
  mode: ProgressSpinnerMode = 'indeterminate';
  value = 10;

  // OPCIONES DE DIAS LIBRERIAS EN HORARIOS
  miercoles = false;
  domingo = false;
  viernes = false;
  martes = false;
  jueves = false;
  sabado = false;
  lunes = false;

  // VARIABLE DE ALMACENAMIENTO DE DATOS
  horarios: any = [];
  feriados: any = [];

  // CAMPOS DE FORMULARIO
  fechaInicioF = new FormControl('', Validators.required);
  fechaFinalF = new FormControl('', Validators.required);
  miercolesF = new FormControl(false);
  horarioF = new FormControl(0, Validators.required);
  viernesF = new FormControl(false);
  domingoF = new FormControl(false);
  martesF = new FormControl(false);
  juevesF = new FormControl(false);
  sabadoF = new FormControl(false);
  lunesF = new FormControl(false);

  // ASIGNACION DE VALIDACIONES A INPUTS DEL FORMULARIO
  public formulario = new FormGroup({
    fechaInicioForm: this.fechaInicioF,
    fechaFinalForm: this.fechaFinalF,
    miercolesForm: this.miercolesF,
    horarioForm: this.horarioF,
    viernesForm: this.viernesF,
    domingoForm: this.domingoF,
    martesForm: this.martesF,
    juevesForm: this.juevesF,
    sabadoForm: this.sabadoF,
    lunesForm: this.lunesF,
  });

  constructor(
    public rest: EmpleadoHorariosService, // SERVICIO DE DATOS DE HORARIOS ASIGNADOS A UN EMPLEADO
    public restH: HorarioService, // SERVCIOS DE HORARIOS
    public restE: EmpleadoService, // SERVICIOS DE DATOS DE EMPLEADOS
    public restP: PlanGeneralService, // SERVICIO DE DATOS DE PLANIFICACIÓN DE HORARIOS
    public restD: DetalleCatHorariosService, // SERVICIO DE DATOS DE DETALLES DE HORARIOS
    public router: Router, // VARIABLE USADA PARA NAVEGACIÓN ENTRE PÁGINAS
    public cambio: ChangeDetectorRef,
    public feriado: FeriadosService,
    public timbrar: TimbresService,
    private toastr: ToastrService, // VARIABLE USADA PARA MOSTRAR NOTIFICACIONES
    private buscar: BuscarPlanificacionComponent,
    private componente: HorarioMultipleEmpleadoComponent,
  ) { }

  ngOnInit(): void {
    //--console.log('ver seleccionados ', this.seleccionados)
    this.BuscarHorarios();
    this.LeerDatos();
  }

  ngAfterViewInit() {
    this.cambio.detectChanges();
  }

  ngAfterContentChecked(): void {
    this.cambio.detectChanges();
  }

  // ITEMS DE PAGINACION DE LA TABLA EMPLEADOS SIN HORARIO
  numero_pagina_h: number = 1;
  tamanio_pagina_h: number = 5;
  pageSizeOptions_h = [5, 10, 20, 50];

  // VARIABLE USADA PARA ALMACENAR LISTA DE EMPLEADOS QUE NO SE ASIGNAN HORARIO
  empleados_sin_asignacion: any = [];

  // VARIABLES DE ACTIVACION DE VISTA DE TABLA Y BOTONES
  btn_eliminar_todo: boolean = true;
  btn_eliminar: boolean = false;
  observaciones: boolean = false;
  guardar: boolean = false;
  cargar: boolean = false;
  validar: boolean = true;
  cancelar: boolean = false;
  registrar: boolean = false;

  // VARIABLES DE ALMACENAMIENTO DE DATOS ESPECIFICOS DE UN HORARIO
  detalles_horarios: any = [];
  vista_horarios: any = [];
  vista_descanso: any = [];
  lista_descanso: any = [];
  hora_entrada: any;
  hora_salida: any;
  segundo_dia: any;
  tercer_dia: any;
  // METODO PARA MOSTRAR NOMBRE DE HORARIO CON DETALLE DE ENTRADA Y SALIDA
  BuscarHorarios() {
    this.horarios = [];
    this.vista_horarios = [];
    this.vista_descanso = [];
    this.lista_descanso = [];
    // BUSQUEDA DE HORARIOS
    this.restH.BuscarListaHorarios().subscribe(datos => {
      this.horarios = datos;
      this.horarios.map(hor => {
        // BUSQUEDA DE DETALLES DE ACUERDO AL ID DE HORARIO
        this.restD.ConsultarUnDetalleHorario(hor.id).subscribe(res => {
          this.detalles_horarios = res;
          this.detalles_horarios.map(det => {
            if (det.tipo_accion === 'E') {
              this.hora_entrada = det.hora.slice(0, 5);
            }
            if (det.tipo_accion === 'S') {
              this.hora_salida = det.hora.slice(0, 5);
              this.segundo_dia = det.segundo_dia;
              this.tercer_dia = det.tercer_dia;
            }
          })
          // DATOS DE HORARIOS CON DETALLES
          let datos_horario = [{
            id: hor.id,
            nombre: hor.codigo + ' (' + this.hora_entrada + '-' + this.hora_salida + ') ',
            codigo: hor.codigo,
            entrada: this.hora_entrada,
            salida: this.hora_salida,
            segundo_dia: this.segundo_dia,
            tercer_dia: this.tercer_dia,
          }]
          hor.detalles = datos_horario[0];
          // SE VERIFICA QUE LOS HORARIOS SEAN NORMALES
          if (hor.default_ === 'DL' || hor.default_ === 'DFD') {
            this.vista_descanso = this.vista_descanso.concat(datos_horario);
            let descanso = {
              tipo: hor.default_,
              id_horario: hor.id,
              detalle: this.detalles_horarios
            }
            // SI LOS HORARIOS SON DE DESCANSO NO SE  MUESTRAN
            this.lista_descanso = this.lista_descanso.concat(descanso);
          }
          else {
            this.vista_horarios = this.vista_horarios.concat(datos_horario);
          }

        })
      })
    })
  }

  // METODO PARA VERIFICAR QUE CAMPOS DE FECHAS NO SE ENCUENTREN VACIOS
  VerificarIngresoFechas(form: any) {
    if (form.fechaInicioForm === '' || form.fechaInicioForm === null || form.fechaInicioForm === undefined ||
      form.fechaFinalForm === '' || form.fechaFinalForm === null || form.fechaFinalForm === undefined) {
      this.toastr.warning('Por favor ingrese fechas de inicio y fin de actividades.', '', {
        timeOut: 6000,
      });
      this.formulario.patchValue({
        horarioForm: 0
      })
    }
    else {
      this.ValidarFechas(form);
    }
  }

  // METODO PARA VERIFICAR SI EL EMPLEADO INGRESO CORRECTAMENTE LAS FECHAS
  ValidarFechas(form: any) {
    if (Date.parse(form.fechaInicioForm) <= Date.parse(form.fechaFinalForm)) {
      this.VerificarFormatoHoras(form);
    }
    else {
      this.toastr.warning(
        'Fecha de inicio de actividades debe ser mayor a la fecha fin de actividades.', '', {
        timeOut: 6000,
      });
      this.formulario.patchValue({
        horarioForm: 0
      })
    }
  }

  // METODO PARA VERIFICAR EL FORMATO DE HORAS DE UN HORARIO
  VerificarFormatoHoras(form: any) {
    const [obj_res] = this.horarios.filter(o => {
      return o.id === parseInt(form.horarioForm)
    })
    if (!obj_res) return this.toastr.warning('Horario no válido.');
    const { hora_trabajo, id } = obj_res;
    // VERIFICACION DE FORMATO CORRECTO DE HORARIOS
    if (!this.StringTimeToSegundosTime(hora_trabajo)) {
      this.formulario.patchValue({ horarioForm: 0 });
      this.toastr.warning(
        'Formato de horas en horario seleccionado no son válidas.',
        'Dar click para verificar registro de detalle de horario.', {
        timeOut: 6000,
      }).onTap.subscribe(obj => {
        this.componente.asignar = false;
        this.componente.VerDetalleHorario(id);
      });
    }
    else {
      this.ConsulatarDetalleHorario(form);
    }
  }

  // METODO PARA CONSULTAR DETALLE DE HORARIOS
  ConsulatarDetalleHorario(form: any) {
    this.detalles = [];
    this.restD.ConsultarUnDetalleHorario(form.horarioForm).subscribe(res => {
      this.detalles = res;
    })
  }

  // METODO PARA LIMPIAR CAMPO SELECCION DE HORARIO
  LimpiarHorario() {
    this.formulario.patchValue({ horarioForm: 0 });
  }

  // METODO DE LLAMADO DE FUNCIONES DE VALIDACION
  ValidarSeleccionados(form: any) {
    if (form.horarioForm) {
      this.VerificarDuplicidad(form);
    }
    else {
      this.toastr.warning(
        'Seleccionar un horario.',
        'Ups!!! se ha producido un error.', {
        timeOut: 6000,
      });
    }
  }

  // METODO PARA LEER LOS DATOS DE LA DATA ORIGINAL
  datos: any = [];
  LeerDatos() {
    let name = '';
    this.datos = [];
    this.seleccionados.forEach((valor: any) => {
      if (valor.name_empleado) {
        name = valor.name_empleado;
      }
      else {
        name = valor.nombre;
      }
      let informacion = {
        id: valor.id,
        nombre: name,
        codigo: valor.codigo,
        id_cargo: valor.id_cargo,
        hora_trabaja: valor.hora_trabaja,
      }
      this.datos = this.datos.concat(informacion);
    })
    return this.datos;
  }

  // METODO PARA ACTIVAR O DESACTIVAR BOTONES
  ControlarBotones(validar: boolean, cancelar: boolean, formulario: boolean, eliminar_todo: boolean, eliminar: boolean) {
    this.validar = validar;
    this.cancelar = cancelar;
    this.registrar = formulario;
    this.btn_eliminar_todo = eliminar_todo;
    this.btn_eliminar = eliminar;
  }

  // VARIABLES DE ALMACENAMIENTO DE DATOS
  usuarios_invalidos: any = [];
  usuarios_validos: any = [];
  usuarios: any = [];
  // METODO PARA VERIFICAR QUE LOS USUARIOS NO DUPLIQUEN SU ASIGNACION DE HORARIO
  VerificarDuplicidad(form: any) {
    this.progreso = true;
    this.guardar = false;
    this.cargar = false;
    this.observaciones = false;
    let fechas = {
      fechaInicio: form.fechaInicioForm,
      fechaFinal: form.fechaFinalForm,
      id_horario: form.horarioForm
    };
    this.contador = 0;
    this.usuarios = [];
    let correctos = [];
    let duplicados = [];
    this.usuarios_invalidos = [];

    this.datos.map((dh: any) => {
      // METODO PARA BUSCAR DATOS DUPLICADOS DE HORARIOS
      this.rest.VerificarDuplicidadHorarios(dh.codigo, fechas).subscribe(response => {
        this.contador = this.contador + 1;

        dh.observacion = 'En las fechas ingresadas ya existe una planificación horaria.'
        duplicados = duplicados.concat(dh);
        this.usuarios = this.usuarios.concat(dh);
        this.usuarios_invalidos = this.usuarios_invalidos.concat(dh);

        if (this.contador === this.datos.length) {

          if (duplicados.length === this.datos.length) {
            this.ControlarBotones(false, true, true, false, true);
            this.observaciones = true;
            this.progreso = false;
          }
          else {
            this.VerificarContrato(form, correctos);
          }
        }
      }, error => {
        // NO EXISTEN REGISTRO DUPLICADOS
        this.contador = this.contador + 1;

        dh.observacion = 'OK'
        correctos = correctos.concat(dh);

        if (this.contador === this.datos.length) {
          this.VerificarContrato(form, correctos);
        }
      });
    })
  }

  // METODO PARA VERIFICAR FECHAS DE CONTRATO 
  cont2: number = 0;
  VerificarContrato(form: any, correctos: any) {
    this.cont2 = 0;
    let contrato = [];
    let sin_contrato = [];

    correctos.map((dh: any) => {
      let datosBusqueda = {
        id_cargo: dh.id_cargo,
        id_empleado: dh.id
      }
      // METODO PARA BUSCAR FECHA DE CONTRATO REGISTRADO EN FICHA DE EMPLEADO
      this.restE.BuscarFechaContrato(datosBusqueda).subscribe(response => {
        this.cont2 = this.cont2 + 1;

        // VERIFICAR SI LAS FECHAS SON VALIDAS DE ACUERDO A LOS REGISTROS Y FECHAS INGRESADAS
        if (Date.parse(response[0].fecha_ingreso.split('T')[0]) <= Date.parse(form.fechaInicioForm)) {

          dh.observacion = 'OK';
          contrato = contrato.concat(dh);

          if (this.cont2 === correctos.length) {
            this.ValidarHorarioByHorasTrabaja(form, contrato);
          }
        }
        else {
          // FECHAS NO CORRESPONDEN AL REGISTRO DE CONTRATO
          dh.observacion = 'Las fechas ingresadas no corresponde al periodo registrado en su contrato.'
          sin_contrato = sin_contrato.concat(dh);
          this.usuarios = this.usuarios.concat(dh);
          this.usuarios_invalidos = this.usuarios_invalidos.concat(dh);

          if (this.cont2 === correctos.length) {

            if (sin_contrato.length === correctos.length) {
              this.ControlarBotones(false, true, true, false, true);
              this.observaciones = true;
              this.progreso = false;
            }
            else {
              this.ValidarHorarioByHorasTrabaja(form, contrato);
            }
          }
        }
      });
    })
  }

  // METODO PARA VALIDAR HORAS DE TRABAJO SEGUN CONTRATO
  sumHoras: any;
  suma = '00:00:00';
  horariosEmpleado: any = []
  cont3: number = 0;
  ValidarHorarioByHorasTrabaja(form: any, correctos: any) {
    let horas_correctas = [];
    let horas_incorrectas = [];
    this.usuarios_validos = [];
    const [obj_res] = this.horarios.filter(o => {
      return o.id === parseInt(form.horarioForm)
    })

    const { hora_trabajo } = obj_res;
    this.cont3 = 0;

    correctos.map((dh: any) => {
      console.log('dh ************************* ', dh)
      // METODO PARA LECTURA DE HORARIOS DE EMPLEADO
      this.horariosEmpleado = [];
      let fechas = {
        fechaInicio: form.fechaInicioForm,
        fechaFinal: form.fechaFinalForm,
      };

      this.rest.VerificarHorariosExistentes(dh.codigo, fechas).subscribe(existe => {
        //console.log('existe ', existe)
        this.suma = '00:00:00';
        this.sumHoras = '00:00:00';
        this.cont3 = this.cont3 + 1;

        this.horariosEmpleado = existe;

        this.horariosEmpleado.map((h: any) => {
          // SUMA DE HORAS DE CADA UNO DE LOS HORARIOS DEL EMPLEADO
          if (h.default_ != 'DL' && h.default_ != 'DFD') {
            this.suma = this.SumarHoras(this.suma, h.hora_trabajo);
          }
        })
        // SUMA DE HORAS TOTALES DE HORARIO CON HORAS DE HORARIO SELECCIONADO
        this.sumHoras = this.SumarHoras(this.suma, hora_trabajo);

        // METODO PARA COMPARAR HORAS DE TRABAJO CON HORAS DE CONTRATO
        this.IndicarNotificacionHoras(this.sumHoras, dh);

        // METODO PARA VERIFICAR QUE LOS HORARIOS NO SE SOBREPONGAN
        let verificador = this.VerificarHorarioRangos(obj_res);
        // LIMPIAR EXISTENCIAS
        this.horariosEmpleado = [];
        //console.log('ver verificador existe ', verificador)
        if (verificador === 2) {
          dh.observacion = 'No es posible registrar horarios con rangos de tiempo similares.';
          dh.nota = '';
          horas_incorrectas = horas_incorrectas.concat(dh);
          this.usuarios = this.usuarios.concat(dh);
          this.usuarios_invalidos = this.usuarios_invalidos.concat(dh);
          if (this.cont3 === correctos.length) {
            if (horas_incorrectas.length === correctos.length) {
              this.ControlarBotones(false, true, true, false, true);
              this.observaciones = true;
              this.progreso = false;
            }
            else {
              // FINALIZACION DEL CICLO
              this.observaciones = true;
              this.usuarios = this.usuarios.concat(horas_correctas);
              this.usuarios_validos = this.usuarios_validos.concat(horas_correctas);
              // CREACION DE LA DATA DE PLANIFICACION GENERAL
              this.CrearData(form);
            }
          }
        }
        else {
          dh.observacion = 'OK';
          horas_correctas = horas_correctas.concat(dh);
          if (this.cont3 === correctos.length) {
            // FINALIZACION DEL CICLO
            this.observaciones = true;
            this.usuarios = this.usuarios.concat(horas_correctas);
            this.usuarios_validos = this.usuarios_validos.concat(horas_correctas);
            // CREACION DE LA DATA DE PLANIFICACION GENERAL
            this.CrearData(form);
          }
        }
      }, error => {
        this.cont3 = this.cont3 + 1;
        // METODO PARA COMPARAR HORAS DE TRABAJO CON HORAS DE CONTRATO CUANDO NO EXISTEN HORARIOS EN LAS FECHAS INDICADAS
        this.IndicarNotificacionHoras(hora_trabajo, dh);
        // METODO PARA VERIFICAR QUE LOS HORARIOS NO SE SOBREPONGAN
        let verificador = this.VerificarHorarioRangos(obj_res);
        // LIMPIAR EXISTENCIAS
        this.horariosEmpleado = [];
        //console.log('ver verificador no existe ', verificador)

        if (verificador === 2) {
          dh.observacion = 'No es posible registrar horarios con rangos de tiempo similares.';
          dh.nota = '';
          horas_incorrectas = horas_incorrectas.concat(dh);
          this.usuarios = this.usuarios.concat(dh);
          this.usuarios_invalidos = this.usuarios_invalidos.concat(dh);
          if (this.cont3 === correctos.length) {
            if (horas_incorrectas.length === correctos.length) {
              this.ControlarBotones(false, true, true, false, true);
              this.observaciones = true;
              this.progreso = false;
            }
            else {
              // FINALIZACION DEL CICLO
              this.observaciones = true;
              this.usuarios = this.usuarios.concat(horas_correctas);
              this.usuarios_validos = this.usuarios_validos.concat(horas_correctas);
              // CREACION DE LA DATA DE PLANIFICACION GENERAL
              this.CrearData(form);
            }
          }
        }
        else {
          dh.observacion = 'OK';
          horas_correctas = horas_correctas.concat(dh);
          if (this.cont3 === correctos.length) {
            // FINALIZACION DEL CICLO
            this.observaciones = true;
            this.usuarios = this.usuarios.concat(horas_correctas);
            this.usuarios_validos = this.usuarios_validos.concat(horas_correctas);
            // CREACION DE LA DATA DE PLANIFICACION GENERAL
            this.CrearData(form);
          }
        }
      });
    })
  }

  // METODO PARA COMPARAR HORAS DE TRABAJO CON HORAS DE CONTRATO
  IndicarNotificacionHoras(horas: any, dh: any) {
    console.log('horas', horas, ' dh ', dh.hora_trabaja)
    if (this.StringTimeToSegundosTime(horas) <= this.StringTimeToSegundosTime(dh.hora_trabaja)) {
      dh.observacion = 'OK';
      dh.nota = '';
    }
    else {
      dh.observacion = 'OK';
      dh.nota = '(Planificación supera las horas registradas en su contrato.)';
    }
  }

  // METODO PARA VERIFICAR QUE NO EXISTAN HORARIOS DENTRO DE LOS MISMOS RANGOS
  feriados_eliminar: any = [];
  VerificarHorarioRangos(ingresado: any) {
    //console.log('existentes ', this.horariosEmpleado)
    //console.log('horarios ', this.horarios)
    //console.log('seleccionado ', ingresado)

    let verificador = 0;
    // DATOS TOMADOS DE LA BUSQUEDA (existe ---> this.horariosEmpleados)
    for (var i = 0; i < this.horariosEmpleado.length; i++) {

      for (var j = 0; j < this.horarios.length; j++) {

        if (this.horariosEmpleado[i].id_horario === this.horarios[j].id) {

          //console.log('ver horario ', this.horarios[j])

          if (this.horarios[j].default_ === 'N' || this.horarios[j].default_ === 'DHA' || this.horarios[j].default_ === 'L' || this.horarios[j].default_ === 'FD') {

            if (this.horarios[j].detalles.segundo_dia === false && ingresado.detalles.segundo_dia === false) {
              if (this.horarios[j].detalles.salida < ingresado.detalles.entrada) {
                verificador = 0;
              }
              else if (this.horarios[j].detalles.entrada > ingresado.detalles.salida) {
                verificador = 0
              }
              else {
                verificador = 2;
                break;
              }
            }
            else if (this.horarios[j].detalles.segundo_dia === true && ingresado.detalles.segundo_dia === true) {
              verificador = 2;
              break;
            }
            else if (this.horarios[j].detalles.segundo_dia === false && ingresado.detalles.segundo_dia === true) {
              if (this.horarios[j].detalles.entrada > ingresado.detalles.salida
                && this.horarios[j].detalles.salida > ingresado.detalles.salida
                && this.horarios[j].detalles.salida < ingresado.detalles.entrada) {
                verificador = 0;
              }
              else {
                verificador = 2;
                break;
              }
            }
            else if (this.horarios[j].detalles.segundo_dia === true && ingresado.detalles.segundo_dia === false) {
              if (this.horarios[j].detalles.salida < ingresado.detalles.entrada
                && this.horarios[j].detalles.salida < ingresado.detalles.salida
                && this.horarios[j].detalles.entrada > ingresado.detalles.salida) {
                verificador = 0;
              }
              else {
                verificador = 2;
                break;
              }
            }
          }
        }
      }
      if (verificador != 0) {
        break;
      }
    }
    return verificador;
  }

  // METODO PARA SUMAR HORAS
  StringTimeToSegundosTime(stringTime: string) {
    console.log('ver horas ... ', stringTime)
    const h = parseInt(stringTime.split(':')[0]) * 3600;
    const m = parseInt(stringTime.split(':')[1]) * 60;
    const s = parseInt(stringTime.split(':')[2]);
    return h + m + s
  }

  // METODO PARA SUMAR HORAS
  SumarHoras(suma: string, tiempo: string) {
    //console.log('dato 1 ', suma, ' dato 2 ', tiempo)
    let sumah = parseInt(suma.split(':')[0]) + parseInt(tiempo.split(':')[0]);
    let sumam = parseInt(suma.split(':')[1]) + parseInt(tiempo.split(':')[1]);
    let sumas = parseInt(suma.split(':')[2]) + parseInt(tiempo.split(':')[2]);

    if (sumam === 60) {
      sumam = 0;
      sumah = sumah + 1;
    }

    let h = '00';
    let m = '00';
    let s = '00';

    if (sumah < 10) {
      h = '0' + sumah;
    }
    else {
      h = String(sumah)
    }
    if (sumam < 10) {
      m = '0' + sumam;
    }
    else {
      m = String(sumam)
    }
    if (sumas < 10) {
      s = '0' + sumas;
    }
    else {
      s = String(sumas)
    }

    return h + ':' + m + ':' + s

  }

  // METODO PARA CREAR LA DATA QUE SE VA A INSERTAR EN LA BASE DE DATOS
  validos: number = 0;
  CrearData(form: any) {
    //console.log('ver datos validos ', this.usuarios_validos)
    this.plan_general = [];
    this.validos = 0;
    this.usuarios_validos.map(obj => {
      this.validos = this.validos + 1;
      this.RegistrarPlanificacion(form, obj, this.validos);
    })
  }

  // METODO PARA REGISTRAR PLANIFICACION CON BUSQUEDA DE FERIADOS
  RegistrarPlanificacion(form: any, valor: any, validos: number) {
    // METODO DE BUSQUEDA DE FERIADOS
    this.feriados = [];
    let datos = {
      fecha_inicio: form.fechaInicioForm,
      fecha_final: form.fechaFinalForm,
      id_empleado: parseInt(valor.id)
    }
    this.feriado.ListarFeriadosCiudad(datos).subscribe(data => {
      this.feriados = data;
      // METODO DE BUSQUEDA DE FECHAS DE RECUPERACION
      this.BuscarFeriadosRecuperar(form, valor, validos);
    }, vacio => {
      // METODO DE BUSQUEDA DE FECHAS DE RECUPERACION
      this.BuscarFeriadosRecuperar(form, valor, validos);
    })
  }

  // METODO PARA BUSCAR FECHAS DE RECUPERACION DE FERIADOS
  recuperar: any = [];
  BuscarFeriadosRecuperar(form: any, valor: any, validos: number) {
    this.recuperar = [];
    let datos = {
      fecha_inicio: form.fechaInicioForm,
      fecha_final: form.fechaFinalForm,
      id_empleado: parseInt(valor.id)
    }
    this.feriado.ListarFeriadosRecuperarCiudad(datos).subscribe(data => {
      this.recuperar = data;
      // METODO PARA CREAR PLANIFICACION GENERAL
      this.CrearPlanGeneral(form, valor, validos);
    }, vacio => {
      // METODO PARA CREAR PLANIFICACION GENERAL
      this.CrearPlanGeneral(form, valor, validos);
    })
  }

  // METODO PARA INGRESAR PLANIFICACION GENERAL
  detalles: any = [];
  fechasHorario: any = [];
  inicioDate: any;
  finDate: any;
  plan_general: any = [];
  CrearPlanGeneral(form: any, dh: any, validos: number) {

    // CONSULTAR HORARIO
    const [obj_res] = this.horarios.filter(o => {
      return o.id === parseInt(form.horarioForm)
    })

    if (!obj_res) return this.toastr.warning('Horario no válido.');
    const { default_ } = obj_res;

    //console.log('dh  --------------------------------- ', dh)
    this.fechasHorario = []; // ARRAY QUE CONTIENE TODAS LAS FECHAS DEL MES INDICADO 
    this.inicioDate = moment(form.fechaInicioForm).format('YYYY-MM-DD');
    this.finDate = moment(form.fechaFinalForm).format('YYYY-MM-DD');

    // LOGICA PARA OBTENER EL NOMBRE DE CADA UNO DE LOS DIAS DEL PERIODO INDICADO
    while (this.inicioDate <= this.finDate) {
      this.fechasHorario.push(this.inicioDate);
      var newDate = moment(this.inicioDate).add(1, 'd').format('YYYY-MM-DD')
      this.inicioDate = newDate;
    }

    var tipo: any = null;
    var origen: string = '';
    var tipo_dia: string = '';

    this.fechasHorario.map(obj => {
      // DEFINICION DE TIPO DE DIA SEGUN HORARIO
      tipo_dia = default_;
      origen = default_;
      tipo = null;
      var day = moment(obj).day();
      if (moment.weekdays(day) === 'lunes') {
        if (form.lunesForm === true) {
          tipo = 'L';
          tipo_dia = 'L';
          origen = 'L';
        }
      }
      if (moment.weekdays(day) === 'martes') {
        if (form.martesForm === true) {
          tipo = 'L';
          tipo_dia = 'L';
          origen = 'L';
        }
      }
      if (moment.weekdays(day) === 'miércoles') {
        if (form.miercolesForm === true) {
          tipo = 'L';
          tipo_dia = 'L';
          origen = 'L';
        }
      }
      if (moment.weekdays(day) === 'jueves') {
        if (form.juevesForm === true) {
          tipo = 'L';
          tipo_dia = 'L';
          origen = 'L';
        }
      }
      if (moment.weekdays(day) === 'viernes') {
        if (form.viernesForm === true) {
          tipo = 'L';
          tipo_dia = 'L';
          origen = 'L';
        }
      }
      if (moment.weekdays(day) === 'sábado') {
        if (form.sabadoForm === true) {
          tipo = 'L';
          tipo_dia = 'L';
          origen = 'L';
        }
      }
      if (moment.weekdays(day) === 'domingo') {
        if (form.domingoForm === true) {
          tipo = 'L';
          tipo_dia = 'L';
          origen = 'L';
        }
      }
      //console.log('ver tipo dia default -------- ', default_)
      if (default_ === 'FD' || default_ === 'L') {
        //console.log('ingresa fd ')
        tipo = default_;
        tipo_dia = default_;
        origen = 'H' + default_;
      }
      else {
        // BUSCAR FERIADOS 
        if (this.feriados.length != 0) {
          for (let i = 0; i < this.feriados.length; i++) {
            if (moment(this.feriados[i].fecha, 'YYYY-MM-DD').format('YYYY-MM-DD') === obj) {
              tipo = 'DFD';
              tipo_dia = 'DFD';
              break;
            }
          }
        }
      }

      // BUSCAR FECHAS DE RECUPERACION DE FERIADOS
      if (this.recuperar.length != 0) {
        for (let j = 0; j < this.recuperar.length; j++) {
          if (moment(this.recuperar[j].fecha_recuperacion, 'YYYY-MM-DD').format('YYYY-MM-DD') === obj) {
            tipo = 'REC';
            tipo_dia = 'REC';
            break;
          }
        }
      }
      // METODO PARA CREACION DE DATA DE REGISTRO DE HORARIOS
      let fechas = {
        fechaInicio: obj,
        fechaFinal: obj,
      };
      //console.log('ver tipo ***** ', tipo_dia, 'origen ', origen)
      if (tipo_dia === 'N' || tipo_dia === 'REC' || tipo_dia === 'DHA' || origen === 'HFD' || origen === 'HL') {
        //console.log('ingresa a crear')
        this.CrearDataHorario(obj, tipo_dia, dh, origen, tipo, this.detalles);
      }
      // EN HORARIOS DE DESCANSO SE ELIMINA LOS REGISTROS PARA ACTUALIZARLOS
      else if (tipo_dia === 'DFD') {
        this.rest.VerificarHorariosExistentes(dh.codigo, fechas).subscribe(existe => {
          //console.log('ver existe ----------------------------- ', existe)
          this.EliminarRegistrosH(existe, obj, dh);
        });
        this.lista_descanso.forEach(desc => {
          if (desc.tipo === 'DFD') {
            tipo = 'FD';
            tipo_dia = 'FD';
            origen = 'FD';
            this.CrearDataHorario(obj, tipo_dia, dh, origen, tipo, desc.detalle);
          }
        })
      }
      else if (tipo_dia === 'L' && origen === 'L') {
        this.rest.VerificarHorariosExistentes(dh.codigo, fechas).subscribe(existe => {
          //console.log('ver existe ----------------------------- ', existe)
          this.EliminarRegistrosH(existe, obj, dh);
        });
        this.lista_descanso.forEach(desc => {
          if (desc.tipo === 'DL') {
            tipo = 'L';
            tipo_dia = 'L';
            origen = 'L';
            this.CrearDataHorario(obj, tipo_dia, dh, origen, tipo, desc.detalle);
          }
        })
      }
    });
    // SE VALIDA QUE EL LIMITE DE REGISTROS SEA EL ADECUADO PARA EL SISTEMA
    if (validos === this.usuarios_validos.length) {
      this.ValidarLimites();
    }
  }

  // METODO PARA ELIMINAR HORARIOS Y REGISTRAR LIBRES
  EliminarRegistrosH(existe: any, obj: any, dh: any) {
    existe.forEach(h => {
      //console.log(' ver valor h ..... ', h)
      if (h.default_ === 'N' || h.default_ === 'DHA' || h.default_ === 'L' || h.default_ === 'FD') {
        let plan_fecha = {
          codigo: dh.codigo,
          fec_final: obj,
          fec_inicio: obj,
          id_horario: h.id_horario,
        };
        //console.log(' ingresa eliminar  ..... ', plan_fecha)
        this.restP.BuscarFechas(plan_fecha).subscribe(res => {
          // METODO PARA ELIMINAR DE LA BASE DE DATOS
          this.restP.EliminarRegistro(res).subscribe(datos => {
          })
        })
      }
    })
  }

  // METODO PARA VALIDAR LIMITE DE REGISTROS
  ValidarLimites() {
    if (this.plan_general.length > 99200) {
      this.progreso = false;
      this.guardar = false;
      this.cargar = false;
      this.toastr.error(
        'Intentar con un número menor de usuarios o planificar con periodos más cortos de tiempo.',
        'Ups!!! se ha producido un error.', {
        timeOut: 6000,
      });
    }
    else {
      this.progreso = false;
      this.guardar = true;
      this.btn_eliminar = false;
      this.cargar = false;
    }
  }

  // METODO PARA CREAR LA DATA DE REGISTRO DE HORARIO
  CrearDataHorario(obj: any, tipo_dia: any, dh: any, origen: any, tipo: any, lista: any) {

    if (lista.length != 0) {
      // COLOCAR DETALLE DE DIA SEGUN HORARIO
      lista.map(element => {
        //console.log('ver detalle ', element)
        var accion = 0;
        var nocturno: number = 0;
        if (element.tipo_accion === 'E') {
          accion = element.tolerancia;
        }
        if (element.segundo_dia === true) {
          nocturno = 1;
        }
        else if (element.tercer_dia === true) {
          nocturno = 2;
        }
        else {
          nocturno = 0;
        }

        let plan = {
          codigo: dh.codigo,
          tipo_dia: tipo_dia,
          min_antes: element.minutos_antes,
          tolerancia: accion,
          id_horario: element.id_horario,
          min_despues: element.minutos_despues,
          fec_horario: obj,
          estado_origen: origen,
          estado_timbre: tipo,
          id_empl_cargo: dh.id_cargo,
          id_det_horario: element.id,
          salida_otro_dia: nocturno,
          tipo_entr_salida: element.tipo_accion,
          fec_hora_horario: obj + ' ' + element.hora,
          min_alimentacion: element.minutos_comida,
        };
        if (element.segundo_dia === true) {
          plan.fec_hora_horario = moment(obj).add(1, 'd').format('YYYY-MM-DD') + ' ' + element.hora;
        }
        if (element.tercer_dia === true) {
          plan.fec_hora_horario = moment(obj).add(2, 'd').format('YYYY-MM-DD') + ' ' + element.hora;
        }
        // ALMACENAMIENTO DE PLANIFICACION GENERAL
        this.plan_general = this.plan_general.concat(plan);
      })
      //console.log('ver datos de plan_general ', this.plan_general)
    }
  }

  // METODO PARA INGRESAR DATOS DE HORARIO
  contador: number = 0;
  InsertarEmpleadoHorario(form: any) {
    this.progreso = true;
    this.eliminar_horarios = [];
    this.eliminar = [];
    this.contar_eliminar = 0;

    this.lista_descanso.forEach(obj => {
      let data_eliminar = {
        id: obj.id_horario,
      }
      this.eliminar_horarios = this.eliminar_horarios.concat(data_eliminar);
    })

    //console.log('ver eliminar ', this.eliminar_horarios);
    let total = 0;
    this.usuarios_validos.forEach(obj => {
      //console.log('ver obj ', obj)
      this.eliminar_horarios.forEach(eh => {
        total = total + 1;
      })
    })

    //console.log('total ', total)
    this.usuarios_validos.forEach(obj => {
      this.eliminar_horarios.forEach(eh => {
        let plan_fecha = {
          codigo: obj.codigo,
          fec_final: moment(form.fechaFinalForm).format('YYYY-MM-DD'),
          fec_inicio: moment(form.fechaInicioForm).format('YYYY-MM-DD'),
          id_horario: eh.id,
        };
        this.restP.BuscarFechas(plan_fecha).subscribe(res => {
          this.contar_eliminar = this.contar_eliminar + 1;
          // METODO PARA ALMACENAR TODAS LAS FECHAS A ELIMINARSE
          this.eliminar = this.eliminar.concat(res);

          if (this.contar_eliminar === total) {
            this.BorrarDescanso();
          }

        }, error => {
          this.contar_eliminar = this.contar_eliminar + 1;
          if (this.contar_eliminar === total) {
            if (this.eliminar.length != 0) {
              this.BorrarDescanso();
            }
            else {
              this.GuardarInformacion();
            }
          }
        })
      })
    })

  }

  // METODO PARA ELIMINAR DESCANSOS - FERIADOS
  BorrarDescanso() {
    this.restP.EliminarRegistro(this.eliminar).subscribe(datos_ => {
      if (datos_.message === 'OK') {
        this.GuardarInformacion();
      }
      else {
        this.progreso = false;
        this.toastr.error('Ups!!! se ha producido un error. Verificar registro de planificación.', '', {
          timeOut: 6000,
        });
      }
    }, error => {
      this.progreso = false;
      this.toastr.error('Ups!!! se ha producido un error. Verificar registro de planificación.', '', {
        timeOut: 6000,
      });
    })
  }

  // METODO PARA REGISTRAR PLANIFICACION
  GuardarInformacion() {
    //console.log('plan general ', this.plan_general)
    this.restP.CrearPlanGeneral(this.plan_general).subscribe(res => {
      //console.log('respuesta ****** ', res)
      if (res.message === 'OK') {
        this.progreso = false;
        this.cargar = true;
        this.guardar = false;
        this.toastr.success(
          'Operación exitosa.', 'Se asignó la planificación horaria a ' + this.usuarios_validos.length + ' colaboradores.', {
          timeOut: 6000,
        })
      }
      else {
        this.progreso = false;
        this.toastr.error(
          'Ups!!! algo salio mal.', '', {
          timeOut: 6000,
        })
      }
    })
  }

  // METODO PARA CARGAR TIMBRES
  CargarTimbres(form: any) {
    this.guardar = false;
    var codigos = '';
    this.usuarios_validos.forEach(obj => {
      if (codigos === '') {
        codigos = '\'' + obj.codigo + '\''
      }
      else {
        codigos = codigos + ', \'' + obj.codigo + '\''
      }
    })

    let usuarios = {
      codigo: codigos,
      fec_final: moment(moment(form.fechaFinalForm).format('YYYY-MM-DD')).add(2, 'days'),
      fec_inicio: moment(form.fechaInicioForm).format('YYYY-MM-DD'),
    };

    this.timbrar.BuscarTimbresPlanificacion(usuarios).subscribe(datos => {
      //console.log('datos ', datos)
      if (datos.message === 'vacio') {
        this.toastr.info(
          'No se han encontrado registros de marcaciones.', '', {
          timeOut: 6000,
        })
      }
      else if (datos.message === 'error') {
        this.toastr.info(
          'Ups!!! algo salio mal', 'No se cargaron todos los registros.', {
          timeOut: 6000,
        })
      }
      else {
        this.toastr.success(
          'Operación exitosa.', 'Registros cargados.', {
          timeOut: 6000,
        })
        this.CerrarTabla();
      }
    }, vacio => {
      this.toastr.info(
        'No se han encontrado registros de marcaciones.', '', {
        timeOut: 6000,
      })
    })
  }

  // METODO PARA LIMPIAR FORMULARIO
  LimpiarCampos() {
    this.formulario.reset();
    this.formulario.patchValue({
      miercolesForm: false,
      viernesForm: false,
      domingoForm: false,
      martesForm: false,
      juevesForm: false,
      sabadoForm: false,
      lunesForm: false,
    });
    this.usuarios_validos = [];
  }

  // METODO PARA CERRAR VENTANA
  CerrarVentana() {
    this.LimpiarCampos();
    if (this.pagina === 'buscar') {
      this.buscar.asignar_multiple = false;
      this.buscar.buscar_fechas = true;
      this.buscar.multiple = true;
      this.buscar.auto_individual = true;
    }
    else {
      this.componente.asignar = false;
      this.componente.seleccionar = true;
    }
  }

  // METODO PARA CERRAR LA TABLA
  CerrarTabla() {
    this.observaciones = false;
    this.ControlarBotones(true, false, false, true, false);
    this.guardar = false;
    this.cargar = false;
    if (this.pagina === 'buscar') {
      this.buscar.buscar_fechas = true;
    }
  }

  // METODO PARA MANEJO DE PAGINAS EN TABLAS DE EMPLEADOS SIN ASIGNACION
  ManejarPaginaH(e: PageEvent) {
    this.tamanio_pagina_h = e.pageSize;
    this.numero_pagina_h = e.pageIndex + 1;
  }

  // METODO PARA TRAER PLANIFICACION DE TODOS LOS USUARIOS
  eliminar: any = [];
  contar_eliminar: number = 0;
  eliminar_horarios: any = [];
  EliminarPlanificacion(form: any, datos: any, opcion: number) {
    this.eliminar = [];
    this.contar_eliminar = 0;
    let anidar_eliminar: any = [];

    //console.log('ver datos ', datos)
    datos.forEach(ver => {
      let data_eliminar = [{
        id: form.horarioForm,
      }]
      anidar_eliminar = anidar_eliminar.concat(data_eliminar);
      // VERIFICAR SI EL HORARIO A ELIMINAR EXISTE EN EL REGISTRO DE USUARIO
      let verificar = 0;
      ver.horarios_existentes.forEach(he => {
        if (he.id_horario === form.horarioForm) {
          verificar = verificar + 1;
        }
      })
      // SI EL REGISTRO EXISTE SE COMPARA CON EL RESTO DE HORARIOS PARA ELIMINAR DESCANSOS
      if (verificar != 0) {
        //console.log('ver existencias ', ver.existencias)
        if (ver.existencias >= 2) {
        }
        else {
          this.lista_descanso.forEach(obj => {
            if (obj.tipo === 'DL') {
              data_eliminar = [{
                id: obj.id_horario,
              }]
              anidar_eliminar = anidar_eliminar.concat(data_eliminar);
            }
          })
          this.lista_descanso.forEach(obj => {
            if (obj.tipo === 'DFD') {
              data_eliminar = [{
                id: obj.id_horario,
              }]
              anidar_eliminar = anidar_eliminar.concat(data_eliminar);
            }
          })
        }
      }

      // SE AGREGAR AL USUARIO LISTA DE HORARIOS A ELIMINAR
      ver.eliminar = anidar_eliminar;
      // LIMPIAR LISTA
      anidar_eliminar = [];
    })
    //console.log('ver data a eliminar ', datos)

    // SE CONTABILIZA HORARIOS A ELIMINAR
    let total = 0;
    datos.forEach(obj => {
      obj.eliminar.forEach(eh => {
        total = total + 1;
      })
    })

    //console.log('total ', total)
    // PROCESO PARA BUSCAR FECHAS A ELIMINAR
    datos.forEach(obj => {
      obj.eliminar.forEach(eh => {
        let plan_fecha = {
          codigo: obj.codigo,
          fec_final: moment(form.fechaFinalForm).format('YYYY-MM-DD'),
          fec_inicio: moment(form.fechaInicioForm).format('YYYY-MM-DD'),
          id_horario: eh.id,
        };
        this.restP.BuscarFechas(plan_fecha).subscribe(res => {
          this.contar_eliminar = this.contar_eliminar + 1;
          // METODO PARA ALMACENAR TODAS LAS FECHAS A ELIMINARSE
          this.eliminar = this.eliminar.concat(res);

          if (this.contar_eliminar === total) {
            this.BorrarDatos(opcion);
          }

        }, error => {
          this.contar_eliminar = this.contar_eliminar + 1;
          if (this.contar_eliminar === total) {
            if (this.eliminar.length === 0) {
              this.toastr.success('Continuar...', 'No se han encontrado registros para eliminar.', {
                timeOut: 6000,
              });
            }
            else {
              this.BorrarDatos(opcion);
            }
          }
          if (opcion === 2) {
            this.CerrarTabla()
          }
        })
      })
    })
  }

  // METODO PARA BORRAR REGISTROS DE LA BASE DE DATOS
  BorrarDatos(opcion: number) {
    this.progreso = true;
    // METODO PARA ELIMINAR DE LA BASE DE DATOS
    this.restP.EliminarRegistro(this.eliminar).subscribe(datos_ => {
      if (datos_.message === 'OK') {
        this.progreso = false;
        this.toastr.error('Operación exitosa.', 'Registros eliminados.', {
          timeOut: 6000,
        });

        if (opcion === 2) {
          this.CerrarTabla()
        }
      }
      else {
        this.progreso = false;
        this.toastr.error('Ups!!! se ha producido un error. Intentar eliminar los registros nuevamente.', '', {
          timeOut: 6000,
        });
      }
    }, error => {
      this.progreso = false;
      this.toastr.error('Ups!!! se ha producido un error. Intentar eliminar los registros nuevamente.', '', {
        timeOut: 6000,
      });
    })
  }

  // METODO PARA LLAMAR A FUNCIONES DE ELIMINACION 
  EliminarRegistros(form: any, opcion: number) {
    if (form.horarioForm) {
      this.eliminar_horarios = [];
      // OPCION 1 ELIMINAR TODOS LOS REGISTROS
      if (opcion === 1) {
        this.BuscarExistencias(form, opcion, this.datos);
      }
      else {
        this.BuscarExistencias(form, opcion, this.usuarios_invalidos);
      }
    }
    else {
      this.toastr.warning(
        'Seleccionar un horario.',
        'Ups!!! se ha producido un error.', {
        timeOut: 6000,
      });
    }
  }

  // METODO PARA BUSCAR EXISTENCIAS DE HORARIOS
  BuscarExistencias(form: any, opcion: number, datos: any) {
    let suma = 0;
    let verificar = 0;
    let contador = 0;
    let fechas = {
      fechaInicio: moment(form.fechaInicioForm).format('YYYY-MM-DD'),
      fechaFinal: moment(form.fechaFinalForm).format('YYYY-MM-DD'),
    };
    datos.forEach(d => {
      //console.log('datos d ----------------------------- ', d)
      //console.log('datos d ----------------------------- ', fechas)
      this.rest.VerificarHorariosExistentes(d.codigo, fechas).subscribe(existe => {
        contador = contador + 1;
        //console.log('ver existe ----------------------------- ', existe)
        d.horarios_existentes = existe;
        existe.forEach(e => {
          //console.log('datos e ----------------------------- ', e)
          //console.log('suma  ----------------------------- ', suma)
          verificar = verificar + 1;
          if (e.default_ === 'N' || e.default_ === 'DHA' || e.default_ === 'L' || e.default_ === 'FD') {
            suma = suma + 1;
            d.existencias = suma;
          }
          if (verificar === existe.length) {
            verificar = 0;
            suma = 0;
          }
        })
        //console.log('ver existe con datos 1----------------------------- ', datos)
        this.ConfirmarEliminacion(contador, datos, form, opcion);
      }, vacio => {
        contador = contador + 1;
        d.horarios_existentes = [];
        //console.log('ver existe con datos 2----------------------------- ', datos)
        this.ConfirmarEliminacion(contador, datos, form, opcion);
      });
    })
  }

  // METODO PARA CONFIRMAR ELIMINACION
  ConfirmarEliminacion(contador: number, datos: any, form: any, opcion: number) {
    if (contador === datos.length) {
      //console.log('ver datos recibidos ', datos)
      this.EliminarPlanificacion(form, datos, opcion);
    }
  }

}
