// IMPORTAR LIBRERIAS
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { Component, OnInit, Input } from '@angular/core';
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
    public feriado: FeriadosService,
    private componente: HorarioMultipleEmpleadoComponent,
    private toastr: ToastrService, // VARIABLE USADA PARA MOSTRAR NOTIFICACIONES
    private buscar: BuscarPlanificacionComponent,
  ) { }

  ngOnInit(): void {
    this.BuscarHorarios();
    this.LeerDatos();
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
  validar: boolean = true;
  cancelar: boolean = false;
  registrar: boolean = false;

  // VARIABLES DE ALMACENAMIENTO DE DATOS ESPECIFICOS DE UN HORARIO
  detalles_horarios: any = [];
  vista_horarios: any = [];
  hora_entrada: any;
  hora_salida: any;

  // METODO PARA MOSTRAR NOMBRE DE HORARIO CON DETALLE DE ENTRADA Y SALIDA
  BuscarHorarios() {
    this.horarios = [];
    this.vista_horarios = [];
    // BUSQUEDA DE HORARIOS
    this.restH.BuscarListaHorarios().subscribe(datos => {
      this.horarios = datos;
      this.horarios.map(hor => {
        // BUSQUEDA DE DETALLES DE ACUERDO AL ID DE HORARIO
        this.restD.ConsultarUnDetalleHorario(hor.id).subscribe(res => {
          this.detalles_horarios = res;
          this.detalles_horarios.map(det => {
            if (det.tipo_accion === 'E') {
              this.hora_entrada = det.hora.slice(0, 5)
            }
            if (det.tipo_accion === 'S') {
              this.hora_salida = det.hora.slice(0, 5)
            }
          })
          let datos_horario = [{
            id: hor.id,
            nombre: hor.codigo + ' (' + this.hora_entrada + '-' + this.hora_salida + ') '
          }]
          if (this.vista_horarios.length === 0) {
            this.vista_horarios = datos_horario;
          } else {
            this.vista_horarios = this.vista_horarios.concat(datos_horario);
          }
        }, error => {
          let datos_horario = [{
            id: hor.id,
            nombre: hor.codigo
          }]
          if (this.vista_horarios.length === 0) {
            this.vista_horarios = datos_horario;
          } else {
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
    this.VerificarDuplicidad(form);
  }

  // MÉTODO PARA LEER LOS DATOS DE LA DATA ORIGINAL
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
    this.datos.map(dh => {
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

    correctos.map(dh => {
      let datosBusqueda = {
        id_cargo: dh.id_cargo,
        id_empleado: dh.id
      }
      // METODO PARA BUSCAR FECHA DE CONTRATO REGISTRADO EN FICHA DE EMPLEADO
      this.restE.BuscarFechaContrato(datosBusqueda).subscribe(response => {
        this.cont2 = this.cont2 + 1;

        // VERIFICAR SI LAS FECHAS SON VALIDAS DE ACUERDO A LOS REGISTROS Y FECHAS INGRESADAS
        if (Date.parse(response[0].fec_ingreso.split('T')[0]) <= Date.parse(form.fechaInicioForm)) {

          dh.observacion = 'OK';
          contrato = contrato.concat(dh);

          if (this.cont2 === correctos.length) {
            this.ValidarHorarioByHorasTrabaja(form, contrato);
          }
        }
        else {

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
    this.ControlarBotones(false, true, true, false, true);
    let horas_correctas = [];
    let horas_incorrectas = [];
    this.usuarios_validos = [];
    const [obj_res] = this.horarios.filter(o => {
      return o.id === parseInt(form.horarioForm)
    })

    const { hora_trabajo } = obj_res;
    this.cont3 = 0;
    correctos.map(dh => {
      // METODO PARA LECTURA DE HORARIOS DE EMPLEADO
      this.horariosEmpleado = [];
      let fechas = {
        fechaInicio: form.fechaInicioForm,
        fechaFinal: form.fechaFinalForm,
      };

      this.rest.VerificarHorariosExistentes(dh.codigo, fechas).subscribe(existe => {
        this.suma = '00:00:00';
        this.sumHoras = '00:00:00';
        this.cont3 = this.cont3 + 1;

        this.horariosEmpleado = existe;

        this.horariosEmpleado.map(h => {
          // SUMA DE HORAS DE CADA UNO DE LOS HORARIOS DEL EMPLEADO
          this.suma = moment(this.suma, 'HH:mm:ss').add(moment.duration(h.hora_trabajo)).format('HH:mm:ss');
        })
        // SUMA DE HORAS TOTALES DE HORARIO CON HORAS DE HORARIO SELECCIONADO
        this.sumHoras = moment(this.suma, 'HH:mm:ss').add(moment.duration(hora_trabajo)).format('HH:mm:ss');

        // METODO PARA COMPARAR HORAS DE TRABAJO CON HORAS DE CONTRATO
        if (this.StringTimeToSegundosTime(this.sumHoras) <= this.StringTimeToSegundosTime(dh.hora_trabaja)) {
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
        else {
          dh.observacion = 'El número de horas de la planificación sobrepasa el número de horas establecidas en su contrato.'
          horas_incorrectas = horas_incorrectas.concat(dh);
          this.usuarios = this.usuarios.concat(dh);
          this.usuarios_invalidos = this.usuarios_invalidos.concat(dh);

          if (this.cont3 === correctos.length) {
            if (horas_incorrectas.length === correctos.length) {
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
      }, error => {
        this.cont3 = this.cont3 + 1;
        // METODO PARA COMPARAR HORAS DE TRABAJO CON HORAS DE CONTRATO CUANDO NO EXISTEN HORARIOS EN LAS FECHAS INDICADAS
        if (this.StringTimeToSegundosTime(hora_trabajo) <= this.StringTimeToSegundosTime(dh.hora_trabaja)) {
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
        else {
          dh.observacion = 'El número de horas de la planificación sobrepasa el número de horas establecidas en su contrato.'
          horas_incorrectas = horas_incorrectas.concat(dh);
          this.usuarios_invalidos = this.usuarios_invalidos.concat(dh);
          this.usuarios = this.usuarios.concat(dh);
          if (this.cont3 === correctos.length) {
            if (horas_incorrectas.length === correctos.length) {
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
      });
    })
  }

  // METODO PARA SUMAR HORAS
  StringTimeToSegundosTime(stringTime: string) {
    const h = parseInt(stringTime.split(':')[0]) * 3600;
    const m = parseInt(stringTime.split(':')[1]) * 60;
    const s = parseInt(stringTime.split(':')[2]);
    return h + m + s
  }

  // METODO PARA CREAR LA DATA QUE SE VA A INSERTAR EN LA BASE DE DATOS
  empl_horario: any = [];
  validos: number = 0;
  CrearData(form: any) {
    this.empl_horario = [];
    this.plan_general = [];
    this.validos = 0;
    this.usuarios_validos.map(obj => {
      this.validos = this.validos + 1;
      let horario = {
        fec_inicio: form.fechaInicioForm,
        fec_final: form.fechaFinalForm,
        id_horarios: form.horarioForm,
        miercoles: form.miercolesForm,
        codigo: parseInt(obj.codigo),
        id_empl_cargo: obj.id_cargo,
        viernes: form.viernesForm,
        domingo: form.domingoForm,
        martes: form.martesForm,
        jueves: form.juevesForm,
        sabado: form.sabadoForm,
        lunes: form.lunesForm,
        estado: 1,
      };
      this.empl_horario = this.empl_horario.concat(horario);
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
      tipo_dia = 'N';
      origen = 'N';
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
      // BUSCAR FERIADOS 
      if (this.feriados.length != 0) {
        for (let i = 0; i < this.feriados.length; i++) {
          if (moment(this.feriados[i].fecha, 'YYYY-MM-DD').format('YYYY-MM-DD') === obj) {
            tipo = 'FD';
            tipo_dia = 'FD';
            break;
          }
        }
      }

      // BUSCAR FECHAS DE RECUPERACION DE FERIADOS
      if (this.recuperar.length != 0) {
        for (let j = 0; j < this.recuperar.length; j++) {
          if (moment(this.recuperar[j].fec_recuperacion, 'YYYY-MM-DD').format('YYYY-MM-DD') === obj) {
            tipo = 'REC';
            tipo_dia = 'REC';
            break;
          }
        }
      }

      if (this.detalles.length != 0) {
        // COLOCAR DETALLE DE DIA SEGUN HORARIO
        this.detalles.map(element => {
          var accion = 0;
          var nocturno: number = 0;
          if (element.tipo_accion === 'E') {
            accion = element.minu_espera;
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
            min_antes: element.min_antes,
            tolerancia: accion,
            id_horario: form.horarioForm,
            min_despues: element.min_despues,
            fec_horario: obj,
            estado_origen: origen,
            estado_timbre: tipo,
            id_empl_cargo: dh.id_cargo,
            id_det_horario: element.id,
            salida_otro_dia: nocturno,
            tipo_entr_salida: element.tipo_accion,
            fec_hora_horario: obj + ' ' + element.hora,
          };
          if (element.segundo_dia === true) {
            plan.fec_hora_horario = moment(obj).add(1, 'd').format('YYYY-MM-DD') + ' ' + element.hora;
          }
          if (element.tercer_dia === true) {
            plan.fec_hora_horario = moment(obj).add(2, 'd').format('YYYY-MM-DD') + ' ' + element.hora;
          }

          this.plan_general = this.plan_general.concat(plan);
        })
      }
      else {
        let plan = {
          codigo: dh.codigo,
          tipo_dia: tipo_dia,
          min_antes: 0,
          tolerancia: 0,
          id_horario: form.horarioForm,
          min_despues: 0,
          fec_horario: obj,
          estado_origen: origen,
          estado_timbre: tipo,
          id_empl_cargo: dh.id_cargo,
          id_det_horario: null,
          salida_otro_dia: 99,
          tipo_entr_salida: 'HA',
          fec_hora_horario: obj,
        };
        this.plan_general = this.plan_general.concat(plan);
      }
    });
    if (validos === this.usuarios_validos.length) {
      this.ValidarLimites();
    }
  }

  // METODO PARA VALIDAR LIMITE DE REGISTROS
  ValidarLimites() {
    if (this.plan_general.length > 99200) {
      this.progreso = false;
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
    }
  }

  // METODO PARA INGRESAR DATOS DE HORARIO
  contador: number = 0;
  InsertarEmpleadoHorario() {
    this.progreso = true;
    this.GuardarInformacion();
  }

  // METODO PARA REGISTRAR PLANIFICACION
  GuardarInformacion() {
    this.restP.CrearPlanGeneral(this.plan_general).subscribe(res => {
      if (res.message === 'OK') {
        this.progreso = false;
        this.toastr.success(
          'Operación exitosa.', 'Se asignó la planificación horaria a ' + this.usuarios_validos.length + ' colaboradores.', {
          timeOut: 6000,
        })
        this.CerrarTabla();
      }
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
  EliminarPlanificacion(form: any, datos: any, opcion: number) {
    this.eliminar = [];
    this.contar_eliminar = 0;
    datos.forEach(obj => {
      let plan_fecha = {
        codigo: obj.codigo,
        fec_final: moment(form.fechaFinalForm).format('YYYY-MM-DD'),
        fec_inicio: moment(form.fechaInicioForm).format('YYYY-MM-DD'),
        id_horario: form.horarioForm,
      };
      this.restP.BuscarFechas(plan_fecha).subscribe(res => {
        this.contar_eliminar = this.contar_eliminar + 1;
        // METODO PARA ALMACENAR TODAS LAS FECHAS A ELIMINARSE
        this.eliminar = this.eliminar.concat(res);

        if (this.contar_eliminar === datos.length) {
          this.BorrarDatos(opcion);
        }

      }, error => {
        this.contar_eliminar = this.contar_eliminar + 1;
        if (this.contar_eliminar === datos.length) {
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
    // OPCION 1 ELIMINAR TODOS LOS REGISTROS
    if (opcion === 1) {
      this.EliminarPlanificacion(form, this.datos, opcion);
    }
    else {
      // OPCION 2 ELIMINAR SOLO REGISTROS INVALIDOS
      this.EliminarPlanificacion(form, this.usuarios_invalidos, opcion);
    }
  }

}
