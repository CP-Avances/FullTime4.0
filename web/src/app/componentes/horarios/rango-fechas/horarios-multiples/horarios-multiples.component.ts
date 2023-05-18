// IMPORTAR LIBRERIAS
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { Component, OnInit, Input } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import * as moment from 'moment';

// IMPORTAR SERVICIOS
import { DetalleCatHorariosService } from 'src/app/servicios/horarios/detalleCatHorarios/detalle-cat-horarios.service';
import { EmpleadoHorariosService } from 'src/app/servicios/horarios/empleadoHorarios/empleado-horarios.service';
import { PlanGeneralService } from 'src/app/servicios/planGeneral/plan-general.service';
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
import { HorarioService } from 'src/app/servicios/catalogos/catHorarios/horario.service';
import { FeriadosService } from 'src/app/servicios/catalogos/catFeriados/feriados.service';
import { HorarioMultipleEmpleadoComponent } from '../horario-multiple-empleado/horario-multiple-empleado.component';
import { PageEvent } from '@angular/material/paginator';
import { ThisReceiver } from '@angular/compiler';

@Component({
  selector: 'app-horarios-multiples',
  templateUrl: './horarios-multiples.component.html',
  styleUrls: ['./horarios-multiples.component.css'],
})

export class HorariosMultiplesComponent implements OnInit {

  @Input() seleccionados: any;

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
  horarioF = new FormControl(0, Validators.required);
  miercolesF = new FormControl(false);
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
    private toastr: ToastrService, // VARIABLE USADA PARA MOSTRAR NOTIFICACIONES
    private componente: HorarioMultipleEmpleadoComponent,
  ) { }

  ngOnInit(): void {
    this.BuscarHorarios();
  }

  // ITEMS DE PAGINACION DE LA TABLA EMPLEADOS SIN HORARIO
  numero_pagina_h: number = 1;
  tamanio_pagina_h: number = 5;
  pageSizeOptions_h = [5, 10, 20, 50];

  // VARIABLE USADA PARA ALMACENAR LISTA DE EMPLEADOS QUE NO SE ASIGNAN HORARIO
  empleados_sin_asignacion: any = [];
  observaciones: boolean = false;

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
            nombre: '(' + this.hora_entrada + '-' + this.hora_salida + ') ' + hor.codigo
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
    if (obj_res.detalle === true) {
      const { hora_trabajo, id } = obj_res;
      // VERIFICACION DE FORMATO CORRECTO DE HORARIOS
      if (!this.StringTimeToSegundosTime(hora_trabajo)) {
        this.formulario.patchValue({ horarioForm: 0 });
        this.toastr.warning(
          'Formato de horas en horario seleccionado no son válidas.',
          'Dar click para verificar registro de detalle de horario.', {
          timeOut: 6000,
        }).onTap.subscribe(obj => {
          //this.ventana.close();
          this.router.navigate(['/verHorario', id]);
        });
      }
    }
  }

  // METODO PARA LIMPIAR CAMPO SELECCION DE HORARIO
  LimpiarHorario() {
    this.formulario.patchValue({ horarioForm: 0 });
  }

  MensajeAlerta() {
    this.toastr.warning(
      'En la tabla podrá observar una lista de usuarios a los cuales no se logró asignar HORARIO.',
      'Verificar la información.', {
      timeOut: 6000,
    })
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
      }
      this.datos = this.datos.concat(informacion);
    })
    return this.datos;
  }

  // VARIABLES DE ALMACENAMIENTO DE DATOS
  invalidos: any = [];
  usuarios: any = [];
  validos: any = [];
  // METODO PARA VERIFICAR QUE LOS USUARIOS NO DUPLIQUEN SU ASIGNACION DE HORARIO
  VerificarDuplicidad(form: any) {
    this.observaciones = false;
    this.usuarios = [];
    this.contador = 0;
    this.LeerDatos();
    let fechas = {
      fechaInicio: form.fechaInicioForm,
      fechaFinal: form.fechaFinalForm,
      id_horario: form.horarioForm
    };
    let duplicados = [];
    let correctos = [];
    this.datos.map(dh => {
      // METODO PARA BUSCAR DATOS DUPLICADOS DE HORARIOS
      this.rest.VerificarDuplicidadHorarios(dh.id, fechas).subscribe(response => {
        this.contador = this.contador + 1;

        dh.observacion = 'En las fechas ingresadas ya existe una planificación horaria.'
        duplicados = duplicados.concat(dh);

        if (this.contador === this.datos.length) {
          if (duplicados.length === this.datos.length) {
            this.observaciones = true;
            this.usuarios = this.usuarios.concat(duplicados);
          }
          else {
            this.usuarios = this.usuarios.concat(duplicados);
            this.VerificarContrato(form, correctos);
          }
        }
      }, error => {
        // NO EXISTEN REGISTRO DUPLICADOS
        this.contador = this.contador + 1;

        dh.observacion = 'OK'
        correctos = correctos.concat(dh);

        if (this.contador === this.datos.length) {
          this.usuarios = this.usuarios.concat(duplicados);
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
            this.usuarios = this.usuarios.concat(sin_contrato);
            this.ValidarHorarioByHorasTrabaja(form, contrato);
          }
        }
        else {

          dh.observacion = 'Las fechas ingresadas no corresponde al periodo registrado en su contrato.'
          sin_contrato = sin_contrato.concat(dh);

          if (this.cont2 === correctos.length) {
            if (sin_contrato.length === correctos.length) {
              this.observaciones = true;
              this.usuarios = this.usuarios.concat(sin_contrato);
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
    let problemas: any; //-----------------verificar
    let horas_correctas = [];
    let horas_incorrectas = [];
    let seg: any;
    const [obj_res] = this.horarios.filter(o => {
      return o.id === parseInt(form.horarioForm)
    })
    const { hora_trabajo } = obj_res;

    if (obj_res.detalle === true) {
      correctos.map(dh => {
        seg = this.SegundosToStringTime(dh.hora_trabaja * 3600)

        // METODO PARA LECTURA DE HORARIOS DE EMPLEADO
        this.horariosEmpleado = [];
        let fechas = {
          fechaInicio: form.fechaInicioForm,
          fechaFinal: form.fechaFinalForm,
        };
        this.rest.VerificarHorariosExistentes(dh.id, fechas).subscribe(existe => {
          this.cont3 = this.cont3 + 1;

          this.horariosEmpleado = existe;
          this.horariosEmpleado.map(h => {
            // SUMA DE HORAS DE CADA UNO DE LOS HORARIOS DEL EMPLEADO
            this.suma = moment(this.suma, 'HH:mm:ss').add(moment.duration(h.hora_trabajo)).format('HH:mm:ss');
          })
          // SUMA DE HORAS TOTALES DE HORARIO CON HORAS DE HORARIO SELECCIONADO
          this.sumHoras = moment(this.suma, 'HH:mm:ss').add(moment.duration(hora_trabajo)).format('HH:mm:ss');

          // METODO PARA COMPARAR HORAS DE TRABAJO CON HORAS DE CONTRATO
          if (this.StringTimeToSegundosTime(this.sumHoras) <= this.StringTimeToSegundosTime(seg)) {
            horas_correctas = horas_correctas.concat(dh);
            if (this.cont3 === correctos.length) {
              this.InsertarEmpleadoHorario(form, horas_correctas, problemas);
            }
          }
          else {
            dh.observacion = 'El número de horas de la planificación sobrepasa el número de horas establecidas en su contrato.'
            horas_incorrectas = horas_incorrectas.concat(dh);
            this.usuarios = this.usuarios.concat(horas_incorrectas);
            
            if (this.cont3 === correctos.length) {
              if (horas_incorrectas.length === correctos.length) {
                this.MensajeAlerta();
                //this.ventana.close(problemas);
              }
              else {
                this.InsertarEmpleadoHorario(form, horas_correctas, problemas);
              }
            }
          }
        }, error => {
          this.cont3 = this.cont3 + 1;
          // METODO PARA COMPARAR HORAS DE TRABAJO CON HORAS DE CONTRATO CUANDO NO EXISTEN HORARIOS EN LAS FECHAS INDICADAS
          if (this.StringTimeToSegundosTime(hora_trabajo) === this.StringTimeToSegundosTime(seg)) {
            horas_correctas = horas_correctas.concat(dh);
            if (this.cont3 === correctos.length) {
              if (horas_incorrectas.length === correctos.length) {
                this.MensajeAlerta();
                //this.ventana.close(problemas);
              }
              else {
                this.InsertarEmpleadoHorario(form, horas_correctas, problemas);
              }
            }
          } else if (this.StringTimeToSegundosTime(hora_trabajo) < this.StringTimeToSegundosTime(seg)) {
            horas_correctas = horas_correctas.concat(dh);
            if (this.cont3 === correctos.length) {
              if (horas_incorrectas.length === correctos.length) {
                this.MensajeAlerta();
                //this.ventana.close(problemas);
              }
              else {
                this.InsertarEmpleadoHorario(form, horas_correctas, problemas);
              }
            }
          }
          else {
            horas_incorrectas = horas_incorrectas.concat(dh);
            problemas = problemas.concat(dh);
            if (this.cont3 === correctos.length) {
              if (horas_incorrectas.length === correctos.length) {
                this.MensajeAlerta();
                //this.ventana.close(problemas);
              }
              else {
                this.InsertarEmpleadoHorario(form, horas_correctas, problemas);
              }
            }
          }
        });
      })
    }
    else {
      this.InsertarEmpleadoHorario(form, correctos, problemas);
    }
  }

  // METODO PARA FORMATEAR FECHAS
  SegundosToStringTime(segundos: number) {
    let h: string | number = Math.floor(segundos / 3600);
    h = (h < 10) ? '0' + h : h;
    let m: string | number = Math.floor((segundos / 60) % 60);
    m = (m < 10) ? '0' + m : m;
    let s: string | number = segundos % 60;
    s = (s < 10) ? '0' + s : s;
    return h + ':' + m + ':' + s;
  }

  // METODO PARA SUMAR HORAS
  StringTimeToSegundosTime(stringTime: string) {
    const h = parseInt(stringTime.split(':')[0]) * 3600;
    const m = parseInt(stringTime.split(':')[1]) * 60;
    const s = parseInt(stringTime.split(':')[2]);
    return h + m + s
  }

  // METODO PARA INGRESAR DATOS DE HORARIO
  contador: number = 0;
  cont4: number = 0;
  InsertarEmpleadoHorario(form: any, correctos: any, problemas: any) {
    this.cont4 = 0;
    correctos.map(obj => {
      let datosempleH = {
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
      this.rest.IngresarEmpleadoHorarios(datosempleH).subscribe(response => {
        this.IngresarPlanGeneral(form, obj);
        this.cont4 = this.cont4 + 1;
        if (this.cont4 === correctos.length) {
          //this.ventana.close(problemas);
          if (correctos.length === this.seleccionados.length) {
            this.toastr.success(
              'Operación Exitosa', 'Se asignó HORARIO a ' + correctos.length + ' colaboradores.', {
              timeOut: 6000,
            })
          }
          else {
            this.toastr.success('En la tabla podrá observar una lista de usuarios a los cuales no se logró asignar HORARIO.',
              'Se asignó HORARIO a ' + correctos.length + ' colaboradores.', {
              timeOut: 6000,
            })
          }
        }
      });
    })
  }

  // METODO PARA BUSCAR FERIADOS
  BuscarFeriados(form: any, id_empleado: any) {
    this.feriados = [];
    let datos = {
      fecha_inicio: form.fechaInicioForm,
      fecha_final: form.fechaFinalForm,
      id_empleado: parseInt(id_empleado)
    }
    this.feriado.ListarFeriadosCiudad(datos).subscribe(data => {
      this.feriados = data;
    })
  }

  // METODO PARA BUSCAR FECHAS DE RECUPERACION DE FERIADOS
  recuperar: any = [];
  BuscarFeriadosRecuperar(form: any, id_empleado: any) {
    this.recuperar = [];
    let datos = {
      fecha_inicio: form.fechaInicioForm,
      fecha_final: form.fechaFinalForm,
      id_empleado: parseInt(id_empleado)
    }
    this.feriado.ListarFeriadosRecuperarCiudad(datos).subscribe(data => {
      this.recuperar = data;
    })
  }

  // METODO PARA INGRESAR PLANIFICACIÓN GENERAL
  detalles: any = [];
  fechasHorario: any = [];
  inicioDate: any;
  finDate: any;
  IngresarPlanGeneral(form: any, dh: any) {
    this.detalles = [];
    this.restD.ConsultarUnDetalleHorario(form.horarioForm).subscribe(res => {
      this.detalles = res;
      this.fechasHorario = []; // ARRAY QUE CONTIENE TODAS LAS FECHAS DEL MES INDICADO 
      this.inicioDate = moment(form.fechaInicioForm).format('MM-DD-YYYY');
      this.finDate = moment(form.fechaFinalForm).format('MM-DD-YYYY');
      // INICIALIZAR DATOS DE FECHA
      var start = new Date(this.inicioDate);
      var end = new Date(this.finDate);
      // LÓGICA PARA OBTENER EL NOMBRE DE CADA UNO DE LOS DÍA DEL PERIODO INDICADO
      while (start <= end) {
        this.fechasHorario.push(moment(start).format('YYYY-MM-DD'));
        var newDate = start.setDate(start.getDate() + 1);
        start = new Date(newDate);
      }
      var tipo: string = '';
      this.fechasHorario.map(obj => {
        // DEFINICION DE TIPO DE DIA SEGUN HORARIO
        tipo = 'N';
        var day = moment(obj).day();
        if (moment.weekdays(day) === 'lunes') {
          if (form.lunesForm === true) {
            tipo = 'L';
          }
        }
        if (moment.weekdays(day) === 'martes') {
          if (form.martesForm === true) {
            tipo = 'L';
          }
        }
        if (moment.weekdays(day) === 'miércoles') {
          if (form.miercolesForm === true) {
            tipo = 'L';
          }
        }
        if (moment.weekdays(day) === 'jueves') {
          if (form.juevesForm === true) {
            tipo = 'L';
          }
        }
        if (moment.weekdays(day) === 'viernes') {
          if (form.viernesForm === true) {
            tipo = 'L';
          }
        }
        if (moment.weekdays(day) === 'sábado') {
          if (form.sabadoForm === true) {
            tipo = 'L';
          }
        }
        if (moment.weekdays(day) === 'domingo') {
          if (form.domingoForm === true) {
            tipo = 'L';
          }
        }
        // BUSCAR FERIADOS 
        if (this.feriados.length != 0) {
          for (let i = 0; i < this.feriados.length; i++) {
            if (moment(this.feriados[i].fecha, 'YYYY-MM-DD').format('YYYY-MM-DD') === obj) {
              tipo = 'FD';
              break;
            }
          }
        }

        // BUSCAR FECHAS DE RECUPERACION DE FERIADOS
        if (this.recuperar.length != 0) {
          for (let j = 0; j < this.recuperar.length; j++) {
            if (moment(this.recuperar[j].fec_recuperacion, 'YYYY-MM-DD').format('YYYY-MM-DD') === obj) {
              tipo = 'N';
              break;
            }
          }
        }

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
            estado: null,
            fec_hora_horario: obj + ' ' + element.hora,
            tipo_entr_salida: element.tipo_accion,
            maxi_min_espera: accion,
            id_det_horario: element.id,
            id_empl_cargo: dh.id_cargo,
            fec_horario: obj,
            id_horario: form.horarioForm,
            codigo: dh.codigo,
          };
          if (element.segundo_dia === true) {
            plan.fec_horario = moment(obj).add(1, 'd').format('YYYY-MM-DD');
            plan.fec_hora_horario = moment(obj).add(1, 'd').format('YYYY-MM-DD') + ' ' + element.hora;
          }
          if (element.tercer_dia === true) {
            plan.fec_horario = moment(obj).add(2, 'd').format('YYYY-MM-DD');
            plan.fec_hora_horario = moment(obj).add(2, 'd').format('YYYY-MM-DD') + ' ' + element.hora;
          }
          this.restP.CrearPlanGeneral(plan).subscribe(res => {
          })
        })

      });
    });
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
  }

  // METODO PARA CERRAR VENTANA
  CerrarVentana() {
    this.LimpiarCampos();
    this.componente.asignar = false;
    this.componente.seleccionar = true;
  }

  CerrarTabla() {
    this.observaciones = false;
    this.empleados_sin_asignacion = [];
  }

  // METODO PARA MANEJO DE PAGINAS EN TABLAS DE EMPLEADOS SIN ASIGNACION
  ManejarPaginaH(e: PageEvent) {
    this.tamanio_pagina_h = e.pageSize;
    this.numero_pagina_h = e.pageIndex + 1;
  }

}
