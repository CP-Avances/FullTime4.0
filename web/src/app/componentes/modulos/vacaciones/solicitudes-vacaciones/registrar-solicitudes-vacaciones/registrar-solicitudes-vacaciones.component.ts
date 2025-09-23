import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Optional } from '@angular/core';
import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { MatDatepicker } from '@angular/material/datepicker';
import { ToastrService } from 'ngx-toastr';
import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';
import { VacacionesService } from 'src/app/servicios/modulos/modulo-vacaciones/vacaciones/vacaciones.service';
import { MatPaginator, PageEvent } from '@angular/material/paginator';

import { FeriadosService } from 'src/app/servicios/horarios/catFeriados/feriados.service';
import { VerEmpleadoComponent } from 'src/app/componentes/usuarios/empleados/datos-empleado/ver-empleado/ver-empleado.component';
import { ConfigurarVacacionMultipleComponent } from 'src/app/componentes/modulos/vacaciones/multiples/configurar-vacacion-multiple/configurar-vacacion-multiple.component';
import { ConteoDiasSemana } from 'src/app/interfaces/ConteoDiasSemana';


@Component({
  selector: 'app-registrar-solicitudes-vacaciones',
  standalone: false,
  templateUrl: './registrar-solicitudes-vacaciones.component.html',
  styleUrls: ['./registrar-solicitudes-vacaciones.component.css'],
})

export class RegistrarSolicitudesVacacionesComponent implements OnInit {
  @Input() data: any[] = [];
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild('picker2') picker2!: MatDatepicker<Date>;

  ips_locales: any = '';
  idEmploy: any;

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  //VARIABLES PARA SOLICITUD DE VACACIONES
  conteoDiasSemana: ConteoDiasSemana = {
    L: 0, M: 0, X: 0, J: 0, V: 0, S: 0, D: 0
  };
  diasTotales: number = 0;
  diasFeriados: number = 0;
  usuariosCorrectos: number = 0;
  vacaciones: any = [];
  tiposVacacion: any[] = [];
  incluirFeriados: boolean = false
  verificacionRealizada: boolean = false;
  estadoVerificacion: string = '';
  feriados: any = [];
  permiteHoras: boolean = false;
  diaSemanaSeleccionado: string | null = null;
  horasTotales: string = '00:00';
  saldo: number = 0;

  constructor(
    public validar: ValidacionesService,
    private rest: FeriadosService,
    private vacaServ: VacacionesService,
    private toastr: ToastrService,
    public verEmpleadoComponente: VerEmpleadoComponent,
    @Optional() private configuracion?: ConfigurarVacacionMultipleComponent,
  ) { }

  ngOnInit(): void {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');
    this.validar.ObtenerIPsLocales().then((ips) => {
      this.ips_locales = ips;
    });
    this.ObtenerFeriados(this.formato_fecha);
    this.CargarTiposVacacion();
    this.idEmploy = this.data[0].id;
    this.registrarSuscripciones();
  }

  //METODO PARA REGISTRAR LAS SUSCRIPCIONES QUE ESCUCHAN LOS CAMBIOS EN EL FORMULARIO
  private registrarSuscripciones(): void {
    this.fechaInicio.valueChanges.subscribe(() => {
      this.CalculoAutomatico();
    });
    this.fechaFinal.valueChanges.subscribe(() => {
      this.CalculoAutomatico();
    });
    this.vacacionSeleccionada.valueChanges.subscribe((idTipo) => {
      this.CalculoAutomatico();
      this.limpiarInputs();
      this.resetearConteo();
    });
    this.vacacionSeleccionada.valueChanges.subscribe((idTipo) => {
      const tipo = this.tiposVacacion.find(v => v.id === idTipo);
      this.permiteHoras = tipo?.permite_horas ?? false;
      this.CalculoAutomatico();
    });
    this.horaInicio.valueChanges.subscribe(() => this.validarHoras());
    this.horaFinal.valueChanges.subscribe(() => this.validarHoras());
    this.fechaHoras.valueChanges.subscribe(() => {
      this.validarFechaPorHoras();
      this.actualizarResumenPorHoras();
    });
    this.horaInicio.valueChanges.subscribe(() => this.actualizarResumenPorHoras());
    this.horaFinal.valueChanges.subscribe(() => this.actualizarResumenPorHoras());
  }

  //VALIDACIONES PARA FORMULARIO DE VACACIONES
  fechaInicio = new FormControl<Date | null>(null, Validators.required);
  fechaFinal = new FormControl<Date | null>(null, Validators.required);
  vacacionSeleccionada = new FormControl(null, Validators.required);
  certificadoF = new FormControl('');
  archivoF = new FormControl('');
  horaInicio = new FormControl<string | null>(null, [Validators.required, Validators.pattern("^[0-9]*(:[0-9][0-9])?$")]);
  horaFinal = new FormControl<string | null>(null, [Validators.required, Validators.pattern("^[0-9]*(:[0-9][0-9])?$")]);
  fechaHoras = new FormControl(null, Validators.required);

  //ITEMS DE PAGINACION DE LA TABLA
  pageSizeOptions = [5, 10, 20, 50];
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;

  //EVENTO PARA MOSTRAR FILAS DETERMINADAS EN LA TABLA
  ManejarPaginaMulti(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1
  }

  //METODO PARA VALIDAR INGRESO DE NUMEROS
  IngresarSoloNumerosEnteros(evt: any) {
    return this.validar.IngresarSoloNumeros(evt);
  }

  //METODO QUE REALIZA EL CALCULO AUTOMATICO DE DIAS
  CalculoAutomatico(): void {
    const inicio = this.fechaInicio.value;
    const fin = this.fechaFinal.value;
    if (inicio && fin) {
      if (fin < inicio) {
        this.fechaFinal.setErrors({ fechaInvalida: true });
        this.fechaFinal.markAsTouched();
        this.picker2.close();
        this.resetearConteo();
        return;
      }
      this.fechaFinal.setErrors(null);
      this.calcularDias();
    }
  }

  //METODO QUE REALIZA LA VALIDACION DE HORAS SEGUN MINIMO DE HORAS POR TIPO DE VACACION Y QUE LA HORA FINAL SEA POSTERIOR A LA HORA INICIAL
  validarHoras(): void {
    const inicio = this.horaInicio.value;
    const fin = this.horaFinal.value;
    const tipo = this.tiposVacacion.find(v => v.id === this.vacacionSeleccionada.value);
    const minimoHoras = tipo?.minimo_horas ?? '00:00:00';
    if (!inicio || !fin || !tipo) return;
    if (fin <= inicio) {
      this.horaFinal.setErrors({ ...this.horaFinal.errors, horaInvalida: true });
    } else {
      this.limpiarError('horaInvalida', this.horaFinal);
    }
    const diffMinutos = this.calcularDiferenciaMinutos(inicio, fin);
    const minimoMinutos = this.convertirHoraATotalMinutos(minimoHoras);
    if (diffMinutos < minimoMinutos) {
      this.horaFinal.setErrors({ ...this.horaFinal.errors, minHoras: true });
    } else {
      this.limpiarError('minHoras', this.horaFinal);
    }
  }

  //METODO PARA OBTENER EL MINIMO DE HORAS REQUERIDAS PARA UN TIPO DE VACACION Y MOSTRAR EN LA INTERFAZ
  getMinimoHoras(): string {
    const tipo = this.tiposVacacion.find(v => v.id === this.vacacionSeleccionada.value);
    return tipo?.minimo_horas ?? '00:00:00';
  }

  //METODO QUE CALCULA LA DIFERENCIA EN MINUTOS DE DOS HORAS
  calcularDiferenciaMinutos(inicio: string, fin: string): number {
    const [h1, m1] = inicio.split(':').map(Number);
    const [h2, m2] = fin.split(':').map(Number);
    return (h2 * 60 + m2) - (h1 * 60 + m1);
  }

  //METODO QUE CONVIERTE UNA HORA A MINUTOS
  convertirHoraATotalMinutos(hora: string): number {
    const [h, m] = hora.split(':').map(Number);
    return h * 60 + m;
  }

  //METODO QUE LIMPIA UN ERROR ESPECIFICO EN UN FORMCONTROL
  limpiarError(nombreError: string, control: FormControl): void {
    if (control.hasError(nombreError)) {
      const errores = { ...control.errors };
      delete errores[nombreError];
      control.setErrors(Object.keys(errores).length ? errores : null);
    }
  }

  //METODO QUE ACTUALIZA EL RESUMEN DE VACACIONES POR HORAS, EL DIA ELEGIDO Y LAS HORAS TOTALES
  actualizarResumenPorHoras(): void {
    const fecha = this.fechaHoras.value;
    const inicio = this.horaInicio.value;
    const fin = this.horaFinal.value;
    this.diaSemanaSeleccionado = null;
    this.horasTotales = '00:00';

    if (!fecha || !inicio || !fin) return;

    const dia = new Date(fecha).getDay();
    const dias = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];
    this.diaSemanaSeleccionado = dias[dia];
    const [h1, m1] = inicio.split(':').map(Number);
    const [h2, m2] = fin.split(':').map(Number);
    let totalMinutos = (h2 * 60 + m2) - (h1 * 60 + m1);

    if (totalMinutos < 0) totalMinutos = 0;

    const horas = Math.floor(totalMinutos / 60);
    const minutos = totalMinutos % 60;
    this.horasTotales = `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`;
  }

  //METODO PARA CALCULAR EL NUMERO DE DIAS DE VACACIONES SOLICITADOS
  calcularDias(): void {
    const inicio = this.fechaInicio.value;
    const fin = this.fechaFinal.value;
    if (!inicio || !fin || fin < inicio) {
      this.resetearConteo();
      return;
    }
    const fechaIterada = new Date(inicio);
    this.resetearConteo();
    const tipoSeleccionado = this.tiposVacacion.find(v => v.id === this.vacacionSeleccionada.value);
    const incluirFeriados = tipoSeleccionado?.incluir_feriados ?? false;

    while (fechaIterada <= fin) {
      const dia = fechaIterada.getDay();
      switch (dia) {
        case 0: this.conteoDiasSemana.D++; break;
        case 1: this.conteoDiasSemana.L++; break;
        case 2: this.conteoDiasSemana.M++; break;
        case 3: this.conteoDiasSemana.X++; break;
        case 4: this.conteoDiasSemana.J++; break;
        case 5: this.conteoDiasSemana.V++; break;
        case 6: this.conteoDiasSemana.S++; break;
      }
      const fechaFormateada = this.validar.FormatearFecha(
        fechaIterada.toISOString(),
        this.formato_fecha,
        'no',
        this.idioma_fechas
      );
      const esFeriado = this.feriados.some(f => f.fecha_ === fechaFormateada);
      if (esFeriado) {
        this.diasFeriados++;
      }
      if (!esFeriado || incluirFeriados) {
        this.diasTotales++;
      }
      fechaIterada.setDate(fechaIterada.getDate() + 1);
    }

    const minimoDias = tipoSeleccionado?.minimo_dias ?? 0;

    if (this.diasTotales < minimoDias) {
      this.fechaFinal.setErrors({ ...this.fechaFinal.errors, minDias: true });
    } else {
      if (this.fechaFinal.hasError('minDias')) {
        const errores = { ...this.fechaFinal.errors };
        delete errores['minDias'];
        this.fechaFinal.setErrors(Object.keys(errores).length ? errores : null);
      }
    }
  }

  //METODO PARA OBTENER EL NUMERO MINIMO DE DIAS REQUERIDOS SEGUN EL TIPO DE VACACION Y MOSTRALO EN LA INTERFAZ
  getMinDias(): number {
    const tipo = this.tiposVacacion.find(v => v.id === this.vacacionSeleccionada.value);
    return tipo?.minimo_dias ?? 0;
  }

  //METODO PARA RESETEAR LOS CONTADORES
  resetearConteo() {
    this.conteoDiasSemana = { L: 0, M: 0, X: 0, J: 0, V: 0, S: 0, D: 0 };
    this.diasTotales = 0;
    this.diasFeriados = 0;
  }

  formato_fecha: string = 'dd/MM/yyyy';
  idioma_fechas: string = 'es';
  //METODO PARA CONSULTAR LA LISTA DE FERIADOS 
  ObtenerFeriados(formato: string) {
    this.feriados = [];
    this.rest.ConsultarFeriado().subscribe(datos => {
      this.feriados = datos;
      this.feriados.forEach((data: any) => {
        data.fecha_ = this.validar.FormatearFecha(
          data.fecha,
          formato,
          'no',
          this.idioma_fechas
        );
      });
    });
  }

  //METODO QUE VALIDA SI LA FECHA SELECCIONADA PARA UN TIPO DE VACACION POR HORAS CAE EN UN FERIADO Y SI ESTE TIPO DE VACACION PERMITE O NO FERIADOS
  validarFechaPorHoras(): void {
    const fecha = this.fechaHoras.value;
    const tipo = this.tiposVacacion.find(v => v.id === this.vacacionSeleccionada.value);
    const incluyeFeriados = tipo?.incluir_feriados ?? false;
    if (!fecha || incluyeFeriados) {
      this.fechaHoras.setErrors(null);
      return;
    }
    const date = new Date(fecha);
    const fechaFormateada = this.validar.FormatearFecha(
      date.toISOString(),
      this.formato_fecha,
      'no',
      this.idioma_fechas
    );
    const esFeriado = this.feriados.some(f => f.fecha_ === fechaFormateada);
    if (esFeriado) {
      this.fechaHoras.setErrors({ esFeriado: true });
    } else {
      this.fechaHoras.setErrors(null);
    }
  }

  //METODO PARA OBTENER TIPOS DE VACACIONES
  CargarTiposVacacion() {
    this.vacaServ.ListarTodasConfiguraciones().subscribe({
      next: (data) => {
        this.tiposVacacion = Array.isArray(data) ? data : [];
      },
      error: () => {
        this.toastr.warning('No se pudieron cargar los tipos de vacaciones');
      }
    });
  }

  //METODO QUE DEVUELVE SI EL TIPO DE VACACION PERMITE O NO FERIADOS (SIRVE PARA LA NOTA EN LA INTERFAZ)
  get incluirFeriadosSeleccionado(): boolean | null {
    const tipo = this.tiposVacacion.find(v => v.id === this.vacacionSeleccionada.value);
    return tipo ? tipo.incluir_feriados : null;
  }

  // METODO PARA CERRAR FORMULARIO DE PERMISOS
  CerrarVentana() {

    if (this.verEmpleadoComponente) {
      //const solicitudes = this.verEmpleadoComponente.ObtenerVacaciones(this.verEmpleadoComponente.formato_fecha);
      //this.verEmpleadoComponente.ObtenerSolicitudesVacaciones(this.verEmpleadoComponente.formato_fecha);
      //console.log("solicitudes: ", solicitudes)
      this.verEmpleadoComponente.ver_periodo = true;
      this.verEmpleadoComponente.activar_vacacion_individual = false;
    }

    if (this.configuracion) {
      this.configuracion.activar_busqueda = true;
      this.configuracion.activar_vacacion = false;
      this.configuracion.LimpiarFormulario();
    }
  }


  verificaciones: any[] = [];
  mostrarTablaVerificacion = false;
  listUsuariosCorrectas: any = [];
  //METODO QUE VERIFICA SI LOS EMPLEADOS SELECCIONADO CUMPLEN CON LOS REQUISITOS PARA SOLICITAR VACACIONES
  verificarEmpleadosVacacion(): void {
    this.listUsuariosCorrectas = [];
    this.verificaciones = [];
    const datosVerificacion: any = {
      empleados: this.data.map(emp => emp.id),
      incluirFeriados: this.incluirFeriadosSeleccionado ?? false,
      permiteHoras: this.permiteHoras
    };

    //VACACION POR DIAS
    if (!this.permiteHoras) {
      const inicio = new Date(this.fechaInicio.value!);
      const fin = new Date(this.fechaFinal.value!);
      datosVerificacion.fechaInicio = inicio.toISOString().split('T')[0];
      datosVerificacion.fechaFin = fin.toISOString().split('T')[0];
      datosVerificacion.numHoras = 0;

    } else {
      //VACACION POR HORAS
      const fecha = new Date(this.fechaHoras.value!);
      datosVerificacion.fechaInicio = fecha.toISOString().split('T')[0];
      datosVerificacion.fechaFin = fecha.toISOString().split('T')[0];
      datosVerificacion.numHoras = this.horasTotales ?? 0;
    }

    this.vacaServ.VerificarVacacionesMultiples(datosVerificacion).subscribe(
      (res: any) => {
        this.data = this.data.map((emp: any) => {
          const resultado = res.find(r => r.idEmpleado === emp.id);
          return {
            ...emp,
            observacion: resultado?.observacion ?? 'No validado (verificar)',
            tipoVacacion: this.vacacionSeleccionada.value
          };
        });

        let pendientes = this.data.length;
        this.data.forEach((emp: any) => {
          const verificacion = {
            id_empleado: emp.id,
            fecha_inicio: datosVerificacion.fechaInicio,
            fecha_final: datosVerificacion.fechaFin
          };

          this.vacaServ.BuscarSolicitudExistente(verificacion).subscribe(
            existente => {
              emp.observacion = 'Ya existe una solicitud para este rango de fechas.';
              pendientes--;
              finalizarVerificacionSiListo();
            },
            vacio => {
              if (emp.observacion === 'Ok') {
                this.listUsuariosCorrectas.push(emp);
              }
              pendientes--;
              finalizarVerificacionSiListo();
            }
          );
        });

        const finalizarVerificacionSiListo = () => {
          if (pendientes === 0) {
            this.usuariosCorrectos = this.listUsuariosCorrectas.length;
            this.mostrarTablaVerificacion = true;
            this.verificacionRealizada = true;

            this.estadoVerificacion = this.data.length === 1 && this.data[0]?.observacion === 'Ok'
              ? 'ok'
              : 'rechazado';
          }
        };
      },
      (error) => {
        this.toastr.error('Error al verificar los empleados para vacaciones.');
        this.verificacionRealizada = false;
        this.estadoVerificacion = '';
      }
    );
  }

  //METODO PARA HABILITAR O NO EL BOTON REGISTRAR SOLICITUD DE ACUERDO A LOS RESULTADOS DE LA VERIFICACION
  hayAlMenosUnEmpleadoValido(): boolean {
    if (this.data.length === 1) {
      return this.estadoVerificacion === 'ok';
    } else {
      return this.listUsuariosCorrectas.length > 0;
    }
  }

  private totalRegistros = 0;
  private registrosCompletados = 0;
  private registrosExitosos = 0;
  //METODO QUE GUARDA LA SOLICITUD DE VACACIONES
  GuardarDatosSolicitud() {
    const tipoVacacion = this.tiposVacacion.find(v => v.id === this.vacacionSeleccionada.value);
    if (tipoVacacion?.documento === true && (!this.archivoF.value || this.archivoF.value === '')) {
      this.toastr.warning('Este tipo de vacación requiere subir un archivo adjunto a la solicitud.', 'Archivo requerido');
      return;
    }
    this.totalRegistros = this.listUsuariosCorrectas.length;
    this.registrosCompletados = 0;
    this.registrosExitosos = 0;

    this.listUsuariosCorrectas.forEach((emp: any) => {
      const esPorHoras = this.permiteHoras;
      const fechaInicio = esPorHoras
        ? this.fechaHoras.value
        : this.fechaInicio.value;
      const fechaFinal = esPorHoras
        ? this.fechaHoras.value
        : this.fechaFinal.value;
      const solicitudVacacion: any = {
        subir_documento: false,
        id_tipo_vacacion: this.vacacionSeleccionada.value,
        id_empleado: emp.id,
        fecha_inicio: fechaInicio,
        fecha_final: fechaFinal,
        incluir_feriados: this.incluirFeriadosSeleccionado ?? false,
        user_name: this.user_name,
        ip: this.ip,
        ip_local: this.ips_locales,
        permite_horas: esPorHoras,
        num_horas: esPorHoras ? this.horasTotales ?? 0 : 0,
        num_lunes: esPorHoras ? 0 : this.conteoDiasSemana.L,
        num_martes: esPorHoras ? 0 : this.conteoDiasSemana.M,
        num_miercoles: esPorHoras ? 0 : this.conteoDiasSemana.X,
        num_jueves: esPorHoras ? 0 : this.conteoDiasSemana.J,
        num_viernes: esPorHoras ? 0 : this.conteoDiasSemana.V,
        num_sabado: esPorHoras ? 0 : this.conteoDiasSemana.S,
        num_domingo: esPorHoras ? 0 : this.conteoDiasSemana.D,
        num_dias_totales: esPorHoras ? 0 : this.diasTotales
      };
      this.GuardarDatosSistema(solicitudVacacion);
    });
  }

  //METODO PARA NOTIFICACIÓN DE REGISTRO INDIVIDUAL Y MULTIPLE
  private notificarRegistro(success: boolean): void {
    this.registrosCompletados++;
    if (success) this.registrosExitosos++;
    if (this.registrosCompletados === this.totalRegistros) {
      if (this.registrosExitosos === this.totalRegistros) {
        const mensaje = this.totalRegistros === 1
          ? 'La solicitud fue registrada correctamente.'
          : 'Todas las solicitudes fueron registradas correctamente.';
        this.toastr.success(mensaje, 'Registro exitoso', { timeOut: 6000 });
      } else {
        this.toastr.error('No se pudo registrar la solicitud.', 'Error en el registro', { timeOut: 6000 });
      }
    }
  }

  //METODO PARA REGISTRAR LA SOLICITUD EN EL SISTEMA
  GuardarDatosSistema(solicitudVacacion: any) {
    if (this.certificadoF.value !== '' && this.certificadoF.value !== null && this.certificadoF.value !== undefined) {
      this.VerificarArchivoVacacion(solicitudVacacion);
    } else {
      this.Registrar_sinDocumento(solicitudVacacion);
      this.CerrarVentana();
    }
  }

  //METODO PARA REGISTRA SIN DOCUMENTO ADJUNTO
  Registrar_sinDocumento(datos: any) {
    this.vacaServ.RegistrarVacaciones(datos).subscribe(
      response => {
        this.notificarRegistro(true);
      },
      error => {
        this.notificarRegistro(false);
      }
    );
  }

  //METODO PARA GUARDAR DATOS DE REGISTROS SI EL ARCHIVO CUMPLE CON LOS REQUISITOS
  VerificarArchivoVacacion(datos: any) {
    if (this.archivoSubido && this.archivoSubido[0]?.size <= 2e+6) {
      datos.subir_documento = true;
      this.CargarDocumento(datos);
      this.CerrarVentana();
    }
    else {
      this.toastr.warning('El archivo ha excedido el tamaño permitido.', 'Tamaño de archivos permitido máximo 2MB.', {
        timeOut: 6000,
      });
    }
  }

  //METODO QUE REGISTRA Y SUBE EL DOCUMENTO AL SERVIDOR
  CargarDocumento(datos: any) {
    this.vacaServ.RegistrarVacaciones(datos).subscribe(solicitud => {
      let formData = new FormData();
      for (let i = 0; i < this.archivoSubido.length; i++) {
        formData.append("uploads", this.archivoSubido[i], this.archivoSubido[i].name);
      }
      formData.append('user_name', this.user_name as string);
      formData.append('ip', this.ip as string);
      formData.append('ip_local', this.ips_locales);
      this.vacaServ.SubirDocumento(formData, solicitud.id, datos.id_empleado).subscribe(
        res => {
          this.archivoF.reset();
          this.nameFile = '';
          if (res.message === 'error') {
            this.notificarRegistro(false);
          }
          else if (res.message === 'error_carpeta') {
            this.notificarRegistro(false);
          }
          else {
            this.notificarRegistro(true);
          }
        },
        error => {
          this.notificarRegistro(false);
        }
      );
    });
  }

  //METODO PARA ESTILO DE CELDA
  EstiloCelda(observacion: string): string {
    if (observacion === 'Ok') {
      return 'rgba(159, 221, 154,1)';
    } else if (observacion.includes('Empleado sin periodo registrado')) {
      return 'rgba(244, 150, 10, 1)';
    } else if (observacion.startsWith('Saldo insuficiente')) {
      return 'rgba(249, 9, 9, 1)';
    }
    else if (observacion.startsWith('Empleado sin periodo activo')) {
      return 'rgba(33, 219, 229, 1)';
    }
    else if (observacion.startsWith('Las fechas están fuera del periodo activo del empleado')) {
      return 'rgba(222, 162, 73,1)';
    }
    else if (observacion.startsWith('Las horas solicitadas superan las horas que equivalen a un día')) {
      return 'rgba(174, 49, 242, 1)';
    }
    else {
      return 'rgba(251, 18, 146, 1)';
    }
  }

  //RESETEA EL SUBIR CONTRATO PARA NO DAR PROBLEMA SI SE SELECCIONA EL MISMO ARCHIVO
  ReseteoArchivo(event: any) {
    event.target.value = null;
  }

  // FORMULARIO DENTRO DE UN GRUPO
  public formulario = new FormGroup({
    certificadoForm: this.certificadoF,
  });

  // METODO PARA SELECCIONAR UN ARCHIVO
  nameFile: string;
  archivoSubido: Array<File>;
  fileChange(element: any) {
    this.archivoSubido = element.target.files;
    if (this.archivoSubido.length != 0) {
      const name = this.archivoSubido[0].name;
      this.formulario.patchValue({ certificadoForm: name });
      this.HabilitarBtn = true;
    }
  }

  // METODO PARA LIMPIAR NOMBRE DEL ARCHIVO SELECCIONADO
  LimpiarNombreArchivo() {
    this.formulario.patchValue({
      certificadoForm: '',
    });
  }

  // METODO PARA QUITAR ARCHIVO SELECCIONADO
  HabilitarBtn: boolean = false;
  RetirarArchivo() {
    this.archivoSubido = [];
    this.HabilitarBtn = false;
    this.LimpiarNombreArchivo();
    this.archivoF.patchValue('');
  }

  //METODO PARA LIMPIAR EL FORMULARIO
  limpiarInputs() {
    this.fechaInicio.reset();
    this.fechaFinal.reset();
    this.horaInicio.reset();
    this.horaFinal.reset();
    this.fechaHoras.reset();
    this.fechaFinal.setErrors(null);
    this.horaFinal.setErrors(null);
    this.diasFeriados = 0;
    this.diasTotales = 0;
    this.certificadoF.reset();
    this.archivoF.reset();
    this.HabilitarBtn = false;
  }
}
