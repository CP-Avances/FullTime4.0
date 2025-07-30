import { FormControl, Validators, FormGroup, AbstractControl, ValidatorFn } from "@angular/forms";
import { MatAutocompleteSelectedEvent } from "@angular/material/autocomplete";
import { Component, OnInit, Input } from "@angular/core";
import { startWith, map } from "rxjs/operators";
import { ToastrService } from "ngx-toastr";
import { Observable } from "rxjs";
import { DateTime } from 'luxon';
import { Router } from "@angular/router";

/** IMPORTACION DE SERVICIOS */
import { CatGrupoOcupacionalService } from "src/app/servicios/modulos/modulo-acciones-personal/catGrupoOcupacional/cat-grupo-ocupacional.service";
import { AccionPersonalService } from "src/app/servicios/modulos/modulo-acciones-personal/accionPersonal/accion-personal.service";
import { DepartamentosService } from "src/app/servicios/configuracion/localizacion/catDepartamentos/departamentos.service";
import { CatTipoCargosService } from "src/app/servicios/configuracion/parametrizacion/catTipoCargos/cat-tipo-cargos.service";
import { ValidacionesService } from "src/app/servicios/generales/validaciones/validaciones.service";
import { AsignacionesService } from "src/app/servicios/usuarios/asignaciones/asignaciones.service";
import { EmpleadoService } from "src/app/servicios/usuarios/empleado/empleadoRegistro/empleado.service";
import { SucursalService } from "src/app/servicios/configuracion/localizacion/sucursales/sucursal.service";
import { CatGradoService } from "src/app/servicios/modulos/modulo-acciones-personal/catGrado/cat-grado.service";
import { ProcesoService } from "src/app/servicios/modulos/modulo-acciones-personal/catProcesos/proceso.service";
import { EmpresaService } from 'src/app/servicios/configuracion/parametrizacion/catEmpresa/empresa.service';
import { MainNavService } from "src/app/componentes/generales/main-nav/main-nav.service";
import { UsuarioService } from "src/app/servicios/usuarios/usuario/usuario.service";
import { CiudadService } from "src/app/servicios/configuracion/localizacion/ciudad/ciudad.service";

import { ListarPedidoAccionComponent } from "../listar-pedido-accion/listar-pedido-accion.component";

export function rangoFechasValidator(fechaInicioKey: string, fechaFinKey: string): ValidatorFn {
  return (formGroup: AbstractControl): { [key: string]: any } | null => {
    const fechaInicio = formGroup.get(fechaInicioKey)?.value;
    const fechaFin = formGroup.get(fechaFinKey)?.value;

    if (fechaInicio && fechaFin && new Date(fechaFin) < new Date(fechaInicio)) {
      return { rangoFechasInvalido: true };
    }
    return null;
  };
}

export function noRegistradoValidator(): ValidatorFn {
  return (control: AbstractControl) => {
    const value = control.value;
    if (!value || value === 'NO REGISTRADO') {
      return { noRegistrado: true };
    }
    return null;
  };
}

@Component({
  selector: "app-editar-pedido-accion",
  standalone: false,
  templateUrl: "./editar-pedido-accion.component.html",
  styleUrls: ["./editar-pedido-accion.component.css"],
})

export class EditarPedidoAccionComponent implements OnInit {
  ips_locales: any = '';

  @Input() idPedido: number;
  @Input() pagina: string = '';

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  // FILTRO DE NOMBRES DE LOS EMPLEADOS
  filtroNombre: Observable<any[]>; // FUNCIONARIO
  filtroNombreH: Observable<any[]>; // TALENTO HUMAMO
  filtroNombreG: Observable<any[]>; // DELEGADO
  filtroNombreN: Observable<any[]>; // NEGATIVA
  filtroNombreRE: Observable<any[]>; // RESPONSABLE ELABORADO
  filtroNombreRR: Observable<any[]>; // RESPONSABLE REVISION
  filtroNombreRC: Observable<any[]>; // RESPONSABLE CONTROL
  filtroNombreNC: Observable<any[]>; // RESPONSABLE CONTROL

  // FILTRO DE TIPO DE ACCION
  filtroTipoAccion: Observable<any[]>
  // FILTRO DE TIPO DE ACCION
  filtroSucursal: Observable<any[]>
  filtroSucursalPropuesta: Observable<any[]>
  // FILTRO DE TIPO DE ACCION
  filtroDepartamentos: Observable<any[]>
  filtroDepartamentosProuesta: Observable<any[]>
  filtroDeparAdministrativaProuesta: Observable<any[]>
  //FILTRO CIUDAD
  filtroCiudad: Observable<any[]>;
  //FILTRO PROCESO
  filtroProceso: Observable<any[]>;
  //FILTRO GRUPO OCUPACIONAL
  filtroGrupoOcupacional: Observable<any[]>;
  //FILTRO GRADO
  filtroGrado: Observable<any[]>;
  //FILTRO CARGOS
  filtroCargos: Observable<any[]>;

  // FORMULARIO 1 ACCION PERSONAL
  identificacionF = new FormControl("", [Validators.required, Validators.minLength(3),]);
  fechaF = new FormControl("", [Validators.required]);
  funcionarioF = new FormControl("");
  fechaRigeDesde = new FormControl("", [Validators.required]);
  fechaRigeHasta = new FormControl("", [Validators.required]);

  // FORMULARIO 2 TIPO ACCION Y MOTIVACION
  idTipoAccion = new FormControl("");
  otroAccionF = new FormControl("");
  otroEspecificacion = new FormControl("");
  declaracionJuradaF = new FormControl(false);
  observacionForm = new FormControl("");
  baseLegalForm = new FormControl("");

  // FORMULARIO 3 SITUACION ACTUAL
  tipoProcesoF = new FormControl("", [Validators.required]);
  idSucursal = new FormControl("", [Validators.required]);
  idDepa = new FormControl("");
  idDepaActual = new FormControl("");
  idCiudad = new FormControl("", [Validators.required]);
  tipoCargoF = new FormControl("", [Validators.required]);
  grupoOcupacionalF = new FormControl("", [Validators.required]);
  gradoF = new FormControl("", [Validators.required, noRegistradoValidator()]);
  sueldoF = new FormControl("", [Validators.required]);
  actaF = new FormControl("", Validators.required);

  procesoPropuesto = new FormControl("")
  idSucursalPropues = new FormControl("");
  idDepaPropues = new FormControl("");
  idDepaAdminPropuesta = new FormControl("");
  idCiudadPropuesta = new FormControl("");
  tipoCargoPropuestoF = new FormControl("");
  grupoOcupacionalPropuestoF = new FormControl("");
  gradoPropuestoF = new FormControl("");
  sueldoPropuestoF = new FormControl("");
  actaPropuestaF = new FormControl("");

  habilitarForm4 = new FormControl(false);

  // FORMULARIO 4 POSESION
  cedualF = new FormControl("");
  fechaPosesionFor = new FormControl("");
  idCiudadPosecion = new FormControl("");
  actaFinalForm = new FormControl("");
  fechaActaFinalForm = new FormControl("");

  // FORMULARIO 5 RESPONSABLES APROBACION
  abrevHA = new FormControl("");
  abrevGA = new FormControl("");
  abrevHF = new FormControl("");
  abrevGF = new FormControl("");

  idEmpleadoRA = new FormControl("", [Validators.required]);
  idEmpleadoF = new FormControl("");
  idEmpleadoHF = new FormControl("");
  idEmpleadoGF = new FormControl("");
  idEmpleadoRF = new FormControl("");

  idEmpleadoRNF = new FormControl("");
  idEmpleadoRNA = new FormControl("");
  idEmpleadoRRC = new FormControl("");
  abrevRGF = new FormControl("");
  abrevRHF = new FormControl("");
  abrevRRC = new FormControl("");

  fechaServidorF = new FormControl("");
  fechaNegativaF = new FormControl("");

  // FORMULARIO 6 NOTIFICACIONES
  ComunicacionElectForm = new FormControl("");
  fechaComunicadoForm = new FormControl("");
  horaComunicadoForm = new FormControl("");
  medioComunicacionForm = new FormControl("");
  abrevC = new FormControl("");
  idEmpleadoC = new FormControl("");

  // ASIGNAR LOS CAMPOS DE LOS FORMULARIOS EN GRUPOS
  isLinear = true;

  public firstFormGroup = new FormGroup({
    identificacionForm: this.identificacionF,
    fechaForm: this.fechaF,
    funcionarioForm: this.funcionarioF,
    fechaRigeDeseForm: this.fechaRigeDesde,
    fechaRigeHastaForm: this.fechaRigeHasta,
  }, {
    validators: rangoFechasValidator('fechaRigeDeseForm', 'fechaRigeHastaForm')
  });

  public secondFormGroup = new FormGroup({
    idTipoAccionFom: this.idTipoAccion,
    otroAccionForm: this.otroAccionF,
    otroEspecificacion: this.otroEspecificacion,
    declaracionJuradaForm: this.declaracionJuradaF,
    observacionForm: this.observacionForm,
    baseLegalForm: this.baseLegalForm
  });

  public thirdFormGroup = new FormGroup({
    tipoProcesoForm: this.tipoProcesoF,
    sucursalForm: this.idSucursal,
    NivelDepaForm: this.idDepa,
    DepartamentoForm: this.idDepaActual,
    idCiudadForm: this.idCiudad,
    tipoCargoForm: this.tipoCargoF,
    grupoOcupacionalForm: this.grupoOcupacionalF,
    gradoForm: this.gradoF,
    sueldoForm: this.sueldoF,
    actaForm: this.actaF,

    procesoPropuestoForm: this.procesoPropuesto,
    sucursalPropuestoForm: this.idSucursalPropues,
    NivelDepaPropuestoForm: this.idDepaPropues,
    DepartamentoPropuestoForm: this.idDepaAdminPropuesta,
    idCiudadPropuestaForm: this.idCiudadPropuesta,
    tipoCargoPropuestoForm: this.tipoCargoPropuestoF,
    grupoOcupacionalPropuestoForm: this.grupoOcupacionalPropuestoF,
    gradoPropuestoForm: this.gradoPropuestoF,
    sueldoPropuestoForm: this.sueldoPropuestoF,
    actaPropuestaFom: this.actaPropuestaF,

    habilitarForm4: this.habilitarForm4
  });

  public fourthFormGroup = new FormGroup({
    funcionarioForm: this.funcionarioF,
    cedulaForm: this.cedualF,
    lugar_posecion: this.idCiudadPosecion,
    fechaPosesionForm: this.fechaPosesionFor,
    actaFinalForm: this.actaFinalForm,
    fechaActaFinalForm: this.fechaActaFinalForm,
  });

  public fivethFormGroup = new FormGroup({

    idEmpleadoRAForm: this.idEmpleadoRA,
    idEmpleadoRForm: this.idEmpleadoRF,
    idEmpleadoHForm: this.idEmpleadoHF,
    idEmpleadoGForm: this.idEmpleadoGF,
    abrevHAForm: this.abrevHA,
    abrevGAForm: this.abrevGA,
    abrevHForm: this.abrevHF,
    abrevGForm: this.abrevGF,
    fechaServidorForm: this.fechaServidorF,
    fechaNegativaForm: this.fechaNegativaF,

    idEmpleadoRNAForm: this.idEmpleadoRNA,
    idEmpleadoRNForm: this.idEmpleadoRNF,
    idEmpleadoRRCForm: this.idEmpleadoRRC,
    abrevRGForm: this.abrevRGF,
    abrevRHForm: this.abrevRHF,
    abrevRRCForm: this.abrevRRC,

  });

  public sixthFormGroup = new FormGroup({
    ComunicacionElectForm: this.ComunicacionElectForm,
    fechaComunicadoForm: this.fechaComunicadoForm,
    horaComunicadoForm: this.horaComunicadoForm,
    medioComunicacionForm: this.medioComunicacionForm,
    abrevCForm: this.abrevC,
    idEmpleadoCForm: this.idEmpleadoC
  })

  get habilitarAccion(): boolean {
    return this.funciones.accionesPersonal;
  }

  // INICIACION DE VARIABLES
  rolEmpleado: number; // VARIABLE DE ALMACENAMIENTO DE ROL DE EMPLEADO QUE INICIA SESION
  idUsuariosAcceso: Set<any> = new Set();

  idEmpleadoLogueado: any;
  empleados: any = [];
  ciudades: any = [];
  departamento: any;
  FechaActual: any;
  listaAuxiliar: any = [];
  sucursal: any = [];
  departamentos: any = [];
  departamentosact: any = [];
  departamentosPro: any = [];

  private timerInterval: any;

  constructor(
    public restProcesos: ProcesoService,
    public restEmpresa: EmpresaService,
    public componentel: ListarPedidoAccionComponent,
    public restAccion: AccionPersonalService,
    public restGrupo: CatGrupoOcupacionalService,
    public restGrado: CatGradoService,
    public restCargo: CatTipoCargosService,
    public restUsu: UsuarioService,
    public restSu: SucursalService,
    public restDe: DepartamentosService,
    public restE: EmpleadoService,
    public restC: CiudadService,
    public router: Router,
    private asignaciones: AsignacionesService,
    private funciones: MainNavService,
    private validar: ValidacionesService,
    private toastr: ToastrService,
  ) {
    this.idEmpleadoLogueado = parseInt(localStorage.getItem("empleado") as string);
    this.departamento = parseInt(localStorage.getItem("departamento") as string);
  }

  ngOnInit(): void {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');
    this.validar.ObtenerIPsLocales().then((ips) => {
      this.ips_locales = ips;
    });

    this.rolEmpleado = parseInt(localStorage.getItem('rol') as string);

    if (this.habilitarAccion === false) {
      let mensaje = {
        access: false,
        title: `Ups! al parecer no tienes activado en tu plan el Módulo de Acciones de Personal. \n`,
        message: "¿Te gustaría activarlo? Comunícate con nosotros.",
        url: "www.casapazmino.com.ec",
      };
      return this.validar.RedireccionarHomeAdmin(mensaje);
    }
    else {

      this.idUsuariosAcceso = this.asignaciones.idUsuariosAcceso;
      // INICIALIZACION DE FECHA Y MOSTRAR EN FORMULARIO
      var f = DateTime.now();
      this.FechaActual = f.toFormat("yyyy-MM-dd");
      this.firstFormGroup.patchValue({
        fechaForm: this.FechaActual,
      });

      // INVOCACION A LOS METODOS PARA CARGAR DATOS
      this.ObtenerTiposAccion();
      this.ObtenerEmpleados();
      this.ObtenerSucursal();
      this.ObtenerDepartamentos();
      this.ObtenerCiudades();
      this.ObtenerProcesos();
      this.ObtenerGrupoOcupacional();
      this.ObtenerGrados();
      this.ObtenerCargos();
      this.MostrarDatos();
      this.CargarInformacion();
    }

    this.firstFormGroup.statusChanges.subscribe(status => {
      const error = this.firstFormGroup.errors?.['rangoFechasInvalido'];
      if (error) {
        this.mostrarToastError();
      }
    });
  }

  mostrarToastError() {
    this.toastr.warning('La fecha final no puede ser menor a la fecha inicial.', '', {
      timeOut: 6000,
    });
  }

  // METODO PARA BUSQUEDA DE NOMBRES SEGUN LO INGRESADO POR EL USUARIO
  private _filtrarEmpleado(value: string): any {
    if (value != null) {
      const filterValue = value.toUpperCase().trim().split(/\s+/);
      return this.empleados.filter((info: any) => {

        const nombreCompleto = info.empleado.toUpperCase();
        return filterValue.every(fragmento =>
          nombreCompleto.includes(fragmento)
        );
      });
    }
  }

  private _filtrarEmpleadoR(value: string): any {
    if (value != null) {
      const filterValue = value.toUpperCase().trim().split(/\s+/);
      return this.listaAuxiliar.filter((info: any) => {
        const nombreCompleto = info.empleado.toUpperCase();
        return filterValue.every(fragmento =>
          nombreCompleto.includes(fragmento)
        );
      });
    }
  }

  // METODO PARA BUSQUEDA DE NOMBRES SEGUN LO INGRESADO POR EL USUARIO
  private _filtrarSucursal(value: string): any {
    if (value != null) {
      const filterValue = value.toUpperCase();
      return this.sucursal.filter((info: any) =>
        info.nombre.toUpperCase().includes(filterValue)
      );
    }
  }

  // METODO PARA BUSQUEDA DE NOMBRES SEGUN LO INGRESADO POR EL USUARIO
  private _filtrarDeparta(value: string): any {
    if (value != null) {
      const filterValue = value.toUpperCase();
      const filtrados = this.departamentosact.filter((info: any) =>
        info.nombre.toUpperCase().includes(filterValue)
      );
      // ELIMINAR DUPLICADOS USANDO SET O MAP
      const unicos = Array.from(new Map(filtrados.map(item => [item.id, item])).values());
      return unicos
    }
  }

  private _filtrarDepaPro(value: string): any {
    if (value != null) {
      const filterValue = value.toUpperCase();
      return this.departamentosPro.filter((info: any) =>
        info.nombre.toUpperCase().includes(filterValue)
      );
    }
  }

  // METODO PARA BUSQUEDA DE NOMBRES SEGUN LO INGRESADO POR EL USUARIO
  private _filtrarCiudad(value: string): any {
    if (value != null) {
      const filterValue = value.toUpperCase();
      return this.ciudades.filter((info: any) =>
        info.descripcion.toUpperCase().includes(filterValue)
      );
    }
  }

  // METODO PARA BUSQUEDA DE NOMBRES SEGUN LO INGRESADO POR EL USUARIO
  private _filtrarProceso(value: string): any {
    if (value != null) {
      const filterValue = value.toUpperCase();
      return this.procesos.filter((info: any) =>
        info.nombre.toUpperCase().includes(filterValue)
      );
    }
  }

  // METODO PARA BUSQUEDA DE NOMBRES SEGUN LO INGRESADO POR EL USUARIO
  private _filtrarGrupoOcupacional(value: string): any {
    if (value != null) {
      const filterValue = value.toUpperCase();
      return this.grupoOcupacional.filter((info: any) =>
        info.descripcion.toUpperCase().includes(filterValue)
      );
    }
  }

  // METODO PARA BUSQUEDA DE NOMBRES SEGUN LO INGRESADO POR EL USUARIO
  private _filtrarGrado(value: string): any {
    if (value != null) {
      const filterValue = value.toUpperCase();
      return this.grados.filter((info: any) =>
        info.descripcion.toUpperCase().includes(filterValue)
      );
    }
  }

  // METODO PARA BUSQUEDA DE NOMBRES SEGUN LO INGRESADO POR EL USUARIO
  private _filtrarCargo(value: string): any {
    if (value != null) {
      const filterValue = value.toUpperCase();
      return this.cargos.filter((info: any) =>
        info.cargo.toUpperCase().includes(filterValue)
      );
    }
  }

  // METODO PARA BUSQUEDA DE NOMBRES SEGUN LO INGRESADO POR EL USUARIO
  private _filtrarTipoAccion(value: string): any {
    if (value != null) {
      const filterValue = value.toUpperCase();
      return this.tipos_accion.filter((info: any) =>
        info.descripcion.toUpperCase().includes(filterValue)
      );
    }
  }

  // BUSQUEDA DE DATOS DE EMPRESA
  empresa: any = [];
  MostrarDatos() {
    this.empresa = [];
    this.restEmpresa
      .ConsultarDatosEmpresa(parseInt(localStorage.getItem('empresa') as string))
      .subscribe((data) => {
        this.empresa = data;
      });
  }

  datosForm6(formValue: any, stepper: any) {

    if (formValue.valid) {
      if (this.cargoFirma1.id_cargo != null || this.cargoFirma2.id_cargo != null ||
        this.cargoFirma3.id_cargo != null || this.cargoFirma4.id_cargo != null || this.cargoFirma5.id_cargo != null) {

        const ahora = new Date();
        const fecha = ahora.toISOString().split('T')[0];
        this.timerInterval = setInterval(() => {
          const now = new Date();
          const horas = String(now.getHours()).padStart(2, '0');
          const minutos = String(now.getMinutes()).padStart(2, '0');
          const segundos = String(now.getSeconds()).padStart(2, '0');

          const horaFormateada = `${horas}:${minutos}:${segundos}`;

        }, 1000);

        this.sixthFormGroup.controls['fechaComunicadoForm'].setValue(fecha);

        stepper.next();

      } else {
        this.toastr.warning(
          "No se permiten usuarios sin cargo para firmar.",
          "Advertencia.", { timeOut: 5000, }
        );
      }
    } else (
      // MARCA LOS CAMPOS COMO TOCADOS PARA MOSTRAR ERRORES
      this.fivethFormGroup.markAllAsTouched()
    )
  }

  ListaEmpleadosFirmas(id_empleado: any) {
    this.listaAuxiliar = this.empleados;
    this.listaAuxiliar = this.listaAuxiliar.filter(user => user.id !== id_empleado);
    this.filtrosEmpleados();
  }


  // BUSQUEDA DE DATOS DE LA TABLA PROCESOS
  procesos: any = [];
  ObtenerProcesos() {
    this.procesos = [];
    this.restProcesos.ConsultarProcesos().subscribe((datos) => {
      this.procesos = datos;
    });
  }
  // BUSQUEDA DE DATOS DE LA TABLA GRUPO OCUPACIONAL
  grupoOcupacional: any = [];
  ObtenerGrupoOcupacional() {
    this.grupoOcupacional = [];
    this.restGrupo.ConsultarGrupoOcupacion().subscribe((datos) => {
      this.grupoOcupacional = datos;
    });
  }

  // BUSQUEDA DE DATOS DE LA TABLA GRADO
  grados: any = [];
  ObtenerGrados() {
    this.grados = [];
    this.restGrado.ConsultarGrados().subscribe((datos) => {
      this.grados = datos;
    });
  }

  // BUSQUEDA DE DATOS DE LA TABLA GRADO
  cargos: any = [];
  cargoFirma1: any;
  cargoFirma2: any;
  cargoFirma3: any;
  cargoFirma4: any;
  cargoFirma5: any;
  cargoFirma6: any;
  ObtenerCargos() {
    this.cargos = [];
    this.restCargo.ListaCargos().subscribe((datos) => {
      this.cargos = datos;
    });
  }

  onCargo(datos: any, firma: number) {
    let info = {}
    if (firma == 1) {
      this.cargoFirma1 = {};
      info = {
        informacion: datos.empleado.toUpperCase(),
      };
    } else if (firma == 2) {
      this.cargoFirma2 = {};
      info = {
        informacion: datos.empleado.toUpperCase(),
      };
    } else if (firma == 3) {
      this.cargoFirma3 = {};
      info = {
        informacion: datos.empleado.toUpperCase(),
      };
    } else if (firma == 4) {
      this.cargoFirma4 = {};
      info = {
        informacion: datos.empleado.toUpperCase(),
      };
    } else if (firma == 5) {
      this.cargoFirma5 = {};
      info = {
        informacion: datos.empleado.toUpperCase(),
      };
    } else {
      this.cargoFirma6 = {};
      info = {
        informacion: datos.empleado.toUpperCase(),
      };
    }

    // BUSQUEDA DE LOS DATOS DEL EMPLEADO QUE REALIZA LA PRIMERA FIRMA
    this.restE.BuscarEmpleadoNombre(info).subscribe((empl) => {
      const x = {
        id_empleado: empl[0].id,
        id_cargo: empl[0].id_cargo_,
        cargo: empl[0].name_cargo
      }

      if (firma == 1) {
        this.cargoFirma1 = x
      } else if (firma == 2) {
        this.cargoFirma2 = x
      } else if (firma == 3) {
        this.cargoFirma3 = x
      } else if (firma == 4) {
        this.cargoFirma4 = x
      } else if (firma == 5) {
        this.cargoFirma5 = x
      } else {
        this.cargoFirma6 = x
      }

    }, err => {
      this.toastr.warning(
        "El usuario seleccionado, no registra un cargo activo.",
        "Advertencia.", { timeOut: 5000, }
      );

      const x = {
        id_empleado: null,
        id_cargo: null,
        cargo: 'sin cargo'
      }

      if (firma == 1) {
        this.cargoFirma1 = x
      } else if (firma == 2) {
        this.cargoFirma2 = x
      } else if (firma == 3) {
        this.cargoFirma3 = x
      } else if (firma == 4) {
        this.cargoFirma4 = x
      } else if (firma == 5) {
        this.cargoFirma5 = x
      } else {
        this.cargoFirma6 = x
      }
    })
  }

  // METODO PARA OBTENER LISTA DE CIUDADES
  id_sucursal: any = 0
  ObtenerSucursal() {
    this.sucursal = [];
    this.restSu.BuscarSucursal().subscribe((data) => {
      this.sucursal = data;
    });
  }

  // METODO PARA OBTENER LISTA DE CIUDADES
  ObtenerDepartamentos() {
    this.departamentos = [];
    this.restDe.ConsultarDepartamentos().subscribe((data) => {
      this.departamentos = data;
    });
  }

  activarOtro = true;
  textoFijo: string = '';
  onTipoAccionSeleccionado(e: MatAutocompleteSelectedEvent) {
    if (e.option.value != undefined && e.option.value != null) {
      var datoOtro = "";
      this.tipos_accion.forEach((item: any) => {
        if (item.descripcion == e.option.value) {
          this.textoFijo = item.base_legal + ' ';
          datoOtro = item.nombre;
        }
      });

      if (datoOtro == 'OTRO') {
        this.activarOtro = false
      } else {
        this.activarOtro = true
      }

      this.secondFormGroup.controls['otroAccionForm'].setValue("");
      this.secondFormGroup.controls['otroEspecificacion'].setValue("");
    }
  }

  onInputChange(event: any) {
    const inputValue = event.target.value;
    if (!inputValue.startsWith(this.textoFijo)) {
      event.target.value = this.textoFijo
      return;
    }
    this.secondFormGroup.controls['baseLegalForm'].setValue(inputValue);
  }

  onKeyDown(event: KeyboardEvent) {
    const input = event.target as HTMLInputElement;
    if (input.selectionStart! <= this.textoFijo.trim().length) {
      const teclasBloqueadas = ['Backspace', 'Delete', 'ArrowLeft'];

      if (teclasBloqueadas.includes(event.key)) {
        event.preventDefault();
      }
    }
  }

  onFocus() {
    if (this.baseLegalForm.value === this.textoFijo.trim()) {
      this.baseLegalForm.setValue(this.textoFijo + ' ');
    }
  }

  InfoUser: any = {}
  idUserSelect: any = 0;
  btnForm1: boolean = true;
  oninfoEmpleado(e: any) {
    this.thirdFormGroup.reset();

    if (e.id != undefined && e.id != null) {
      this.restUsu.BuscarInfoUsuarioAccion(e.id).subscribe((datos) => {
        this.InfoUser = datos

        this.InfoUser.forEach((valor: any) => {
          this.idUserSelect = e.id

          this.firstFormGroup.patchValue({ funcionarioForm: e.empleado, });
          this.fourthFormGroup.controls['funcionarioForm'].setValue(e.empleado)
          this.fourthFormGroup.controls['cedulaForm'].setValue(valor.identificacion)

          // PROCESO
          const proceso = this.procesos.find((info: any) => info.id == valor.id_proceso);
          if (proceso == undefined || proceso == null) {
            this.thirdFormGroup.controls['tipoProcesoForm'].setValue('No registrado')
          } else {
            this.thirdFormGroup.controls['tipoProcesoForm'].setValue(proceso.nombre)
          }
          // SUCURSAL
          const sucursal = this.sucursal.find((inf: any) => inf.id == valor.id_suc);
          if (sucursal == undefined || sucursal == null) {
            this.thirdFormGroup.controls['sucursalForm'].setValue('No registrado')
          } else {
            this.thirdFormGroup.controls['sucursalForm'].setValue(sucursal.nombre)
            this.departamentos.forEach(item => {
              if (item.id_sucursal == sucursal.id) {
                this.departamentosact.push(item);
              }
            });

            this.FiltrarDepaActua();
          }
          // DEPARTAMENTO
          const departamento = this.departamentos.find((inf: any) => inf.id == valor.id_departamento);
          if (departamento == undefined || departamento == null) {
            this.thirdFormGroup.controls['DepartamentoForm'].setValue('No registrado')
            this.thirdFormGroup.controls['NivelDepaForm'].setValue('No registrado')
          } else {
            this.thirdFormGroup.controls['DepartamentoForm'].setValue(departamento.nombre)
            if (departamento.departamento_padre == null || departamento.departamento_padre == undefined) {
              this.thirdFormGroup.controls['NivelDepaForm'].setValue('No registrado')
            } else {
              this.thirdFormGroup.controls['NivelDepaForm'].setValue(departamento.departamento_padre)
            }
          }
          // LUGAR DE TRABAJO
          this.thirdFormGroup.controls['idCiudadForm'].setValue(sucursal.descripcion)
        
          // GRUPO OCUPACION
          const grupo_ocupacional = this.grupoOcupacional.find((inf: any) => inf.id == valor.id_grupo_ocupacional);
          if (grupo_ocupacional == undefined || grupo_ocupacional == null) {
            this.thirdFormGroup.controls['grupoOcupacionalForm'].setValue('No registrado')
          }
          else {
            this.thirdFormGroup.controls['grupoOcupacionalForm'].setValue(grupo_ocupacional.descripcion)
          }
          // GRADO
          const grado = this.grados.find((inf: any) => inf.id == valor.id_grado);
          if (grado == undefined || grado == null) {
            this.thirdFormGroup.controls['gradoForm'].setValue('No registrado')
          } else {
            this.thirdFormGroup.controls['gradoForm'].setValue(grado.descripcion)
          }
          // CARGO ACTUAL
          const cargo = this.cargos.find((inf: any) => inf.id == valor.id_tipo_cargo);
          if (cargo == undefined || cargo == null) {
            this.thirdFormGroup.controls['tipoCargoForm'].setValue('No registrado')
          } else {
            this.thirdFormGroup.controls['tipoCargoForm'].setValue(cargo.cargo)
          }
          // REMUNERACION
          this.thirdFormGroup.controls['sueldoForm'].setValue(valor.sueldo.split(".")[0])
          this.thirdFormGroup.controls['actaForm'].setValue(valor.numero_partida_individual)

          this.fivethFormGroup.controls['idEmpleadoHForm'].setValue(e.empleado);
          this.fivethFormGroup.patchValue({
            fechaServidorForm: this.firstFormGroup.controls['fechaForm'].value,
          });
          this.btnForm1 = false
        })

        this.ListaEmpleadosFirmas(e.id);
        this.filtrosTipoAcciones();

      }, err => {
        this.InfoUser = null
        this.toastr.warning(err.error.text, "Advertencia.", { timeOut: 5000, });
        this.btnForm1 = true;
        this.thirdFormGroup.reset();
      })

    } else {
      this.btnForm1 = true
    }
  }

  onSucursal(e: any) {
    if (e.id != undefined && e.id != null) {
      this.departamentosPro = [];
      const filtrados = this.departamentos.filter(item => item.id_sucursal == e.id);
      this.departamentosPro = filtrados;

      this.idDepaPropues.setValue("");
      this.idDepaAdminPropuesta.setValue("");
      this.FiltrarDepaPro();
    }
  }

  habilitarformPosesion: boolean = false
  validarForm(formValue: any, stepper: any) {

    if (formValue.tipoProcesoForm == 'No registrado' || formValue.sucursalForm == 'No registrado' || formValue.NivelDepaForm == 'No registrado'
      || formValue.DepartamentoForm == 'No registrado' || formValue.grupoOcupacionalForm == 'No registrado' || formValue.gradoForm == 'No registrado'
      || formValue.tipoCargoForm == 'No registrado' || formValue.idCiudadForm == 'No registrado' || formValue.tipoProcesoForm == '' || formValue.sucursalForm == '' || formValue.NivelDepaForm == ''
      || formValue.DepartamentoForm == '' || formValue.grupoOcupacionalForm == '' || formValue.gradoForm == ''
      || formValue.tipoCargoForm == '' || formValue.idCiudadForm == ''
    ) {
      this.toastr.warning(
        "El empleado debe cumplir con los datos obligatorios de su situacion actual.",
        "Advertencia.", { timeOut: 5000, }
      );
      // MARCA LOS CAMPOS COMO TOCADOS PARA MOSTRAR ERRORES
      this.thirdFormGroup.markAllAsTouched();
    } else {

      console.log('this.idUserSelect: ',this.idUserSelect)
      this.ListaEmpleadosFirmas(this.idUserSelect);
      this.habilitarformPosesion = formValue.habilitarForm4
      stepper.next();
    }
  }

  CargarInfoCargos(id_empleado: any, id_cargo: any, cargo: any) {
    const x = {
      id_empleado: id_empleado,
      id_cargo: id_cargo,
      cargo: cargo
    }
    return x;
  }

  datosPedido: any = [];
  CargarInformacion() {
    this.restAccion.BuscarDatosPedidoId(this.idPedido)
      .subscribe((data) => {
        this.datosPedido = data;

        console.log("datos", this.datosPedido);

        this.firstFormGroup.patchValue({
          identificacionForm: this.datosPedido[0].numero_accion_personal,
          fechaForm: this.datosPedido[0].fecha_elaboracion,
          funcionarioForm: this.datosPedido[0].nombres,
          fechaRigeDeseForm: this.datosPedido[0].fecha_rige_desde,
          fechaRigeHastaForm: this.datosPedido[0].fecha_rige_hasta,
        });

        this.tipos_accion.forEach(item => {
          if (item.descripcion == this.datosPedido[0].descripcion) {
            this.secondFormGroup.controls['baseLegalForm'].setValue(item.base_legal);
            this.textoFijo = item.base_legal + ' ';
            if (item.nombre == 'OTRO') {
              this.activarOtro = false
            } else {
              this.activarOtro = true
            }
          }
        });

        this.secondFormGroup.patchValue({
          idTipoAccionFom: this.datosPedido[0].descripcion,
          otroAccionForm: this.datosPedido[0].detalle_otro,
          otroEspecificacion: this.datosPedido[0].especificacion,
          declaracionJuradaForm: this.datosPedido[0].declaracion_jurada,
          observacionForm: this.datosPedido[0].observacion,
          baseLegalForm: this.datosPedido[0].adicion_base_legal

        });

        var activarForm4 = false;
        if (this.datosPedido[0].numero_acta_final != null && this.datosPedido[0].numero_acta_final != undefined && this.datosPedido[0].numero_acta_final != "") {
          activarForm4 = true
        } else {
          activarForm4 = false
        }

        
        this.thirdFormGroup.patchValue({
          tipoProcesoForm: this.datosPedido[0].proceso_actual != null ? this.datosPedido[0].proceso_actual : 'No registrado',
          sucursalForm: this.datosPedido[0].sucursal_actual != null ? this.datosPedido[0].sucursal_actual : 'No registrado',
          NivelDepaForm: this.datosPedido[0].nivel_gestion_actual != null ? this.datosPedido[0].nivel_gestion_actual : 'No registrado',
          DepartamentoForm: this.datosPedido[0].unidad_administrativa != null ? this.datosPedido[0].unidad_administrativa : 'No registrado',
          idCiudadForm: this.datosPedido[0].lugar_trabajo_actual != null ? this.datosPedido[0].lugar_trabajo_actual : 'No registrado',
          tipoCargoForm: this.datosPedido[0].cargo_actual != null ? this.datosPedido[0].cargo_actual : 'No registrado',
          grupoOcupacionalForm: this.datosPedido[0].grupo_ocupacional_actual != null ? this.datosPedido[0].grupo_ocupacional_actual : 'No registrado',
          gradoForm: this.datosPedido[0].grado_actual != null ? this.datosPedido[0].grado_actual : 'No registrado',
          sueldoForm: this.datosPedido[0].remuneracion_actual != null ? this.datosPedido[0].remuneracion_actual : 'No registrado',
          actaForm: this.datosPedido[0].partida_individual_actual,

          procesoPropuestoForm: this.datosPedido[0].proceso_propuesto,
          sucursalPropuestoForm: this.datosPedido[0].sucursal_propuesto,
          NivelDepaPropuestoForm: this.datosPedido[0].nivel_gestion_propuesto,
          DepartamentoPropuestoForm: this.datosPedido[0].unidad_administrativa_propuesta,
          idCiudadPropuestaForm: this.datosPedido[0].lugar_trabajo_propuesto,
          tipoCargoPropuestoForm: this.datosPedido[0].cargo_propuesto,
          grupoOcupacionalPropuestoForm: this.datosPedido[0].grupo_ocupacional_propuesto,
          gradoPropuestoForm: this.datosPedido[0].grado_propuesto,
          sueldoPropuestoForm: this.datosPedido[0].remuneracion_propuesta,
          actaPropuestaFom: this.datosPedido[0].partida_individual_propuesta,

          habilitarForm4: false
        });

        // SUCURSAL
        const sucursal = this.sucursal.find((inf: any) => inf.id == this.datosPedido[0].id_sucursal_actual);
        if (sucursal == undefined || sucursal == null) {
          this.thirdFormGroup.controls['sucursalForm'].setValue('No registrado')
        } else {
          this.departamentos.forEach(item => {
            if (item.id_sucursal == this.datosPedido[0].id_sucursal_actual) {
              this.departamentosact.push(item);
            }
          });
          this.FiltrarDepaActua();
        }

        // LUGAR DE TRABAJO
        if (this.datosPedido[0].lugar_trabajo_actual != null){
           this.thirdFormGroup.controls['idCiudadForm'].setValue(this.datosPedido[0].lugar_trabajo_actual)
        }else{ 
           this.thirdFormGroup.controls['idCiudadForm'].setValue('No registrado')
        }
       

        this.thirdFormGroup.controls['habilitarForm4'].setValue(activarForm4);

        this.fourthFormGroup.patchValue({
          funcionarioForm: this.datosPedido[0].nombres,
          cedulaForm: this.datosPedido[0].cedula_empleado,
          lugar_posecion: this.datosPedido[0].descripcion_lugar_posesion,
          fechaPosesionForm: this.datosPedido[0].fecha_posesion,
          actaFinalForm: this.datosPedido[0].numero_acta_final,
          fechaActaFinalForm: this.datosPedido[0].fecha_acta_final,
        });

        this.cargoFirma1 = this.CargarInfoCargos(this.datosPedido[0].id_empleado_director, this.datosPedido[0].id_tipo_cargo_director, this.datosPedido[0].cargo_director)
        this.cargoFirma2 = this.CargarInfoCargos(this.datosPedido[0].id_empleado_autoridad_delegado, this.datosPedido[0].id_tipo_cargo_autoridad_delegado, this.datosPedido[0].cargo_autoridad_delegado)
        this.cargoFirma3 = this.CargarInfoCargos(this.datosPedido[0].id_empleado_elaboracion, this.datosPedido[0].id_tipo_cargo_elaboracion, this.datosPedido[0].tipo_cargo_elaboracion)
        this.cargoFirma4 = this.CargarInfoCargos(this.datosPedido[0].id_empleado_revision, this.datosPedido[0].id_tipo_cargo_revision, this.datosPedido[0].tipo_cargo_revision)
        this.cargoFirma5 = this.CargarInfoCargos(this.datosPedido[0].id_empleado_control, this.datosPedido[0].id_tipo_cargo_control, this.datosPedido[0].tipo_cargo_control)
        this.cargoFirma6 = this.CargarInfoCargos(this.datosPedido[0].id_empleado_comunicacion, this.datosPedido[0].id_tipo_cargo_comunicacion, this.datosPedido[0].cargo_comunicacion)

        this.fivethFormGroup.patchValue({
          idEmpleadoRAForm: this.datosPedido[0].empleado_director,
          idEmpleadoRForm: this.datosPedido[0].empleado_autoridad_delegado,
          idEmpleadoHForm: this.datosPedido[0].nombres.toUpperCase(),
          idEmpleadoGForm: this.datosPedido[0].empleado_testigo,

          abrevHAForm: this.datosPedido[0].abreviatura_director,
          abrevGAForm: this.datosPedido[0].abreviatura_delegado,
          abrevHForm: this.datosPedido[0].abreviatura_empleado,
          abrevGForm: this.datosPedido[0].abreviatura_testigo,
          fechaServidorForm: this.datosPedido[0].fecha_elaboracion,
          fechaNegativaForm: this.datosPedido[0].fecha_testigo,

          idEmpleadoRNAForm: this.datosPedido[0].empleado_elaboracion,
          idEmpleadoRNForm: this.datosPedido[0].empleado_revision,
          idEmpleadoRRCForm: this.datosPedido[0].empleado_control,
          abrevRGForm: this.datosPedido[0].abreviatura_elaboracion,
          abrevRHForm: this.datosPedido[0].abreviatura_revision,
          abrevRRCForm: this.datosPedido[0].abreviatura_control
          ,
        });

        this.btnForm1 = false

        this.sixthFormGroup.patchValue({
          ComunicacionElectForm: this.datosPedido[0].comunicacion_electronica,
          fechaComunicadoForm: this.datosPedido[0].fecha_comunicacion,
          horaComunicadoForm: this.datosPedido[0].hora_comunicacion,
          medioComunicacionForm: this.datosPedido[0].medio_comunicacion,
          abrevCForm: this.datosPedido[0].abreviatura_comunicacion,
          idEmpleadoCForm: this.datosPedido[0].empleado_comunicacion
        })


        this.idUserSelect = this.datosPedido[0].id_empleado_personal
        this.filtrosTipoAcciones();

      });
  }

  // METODO DE BUSQUEDA DE DATOS DE LA TABLA TIPO_ACCIONES
  tipos_accion: any = [];
  ObtenerTiposAccion() {
    this.tipos_accion = [];
    this.restAccion.ConsultarTipoAccionPersonal().subscribe((datos) => {
      this.tipos_accion = datos;
    });
  }

  // LISTA DE POSESIONES Y NOTIFICACIONES
  posesiones_notificaciones: any = [
    { nombre: "POSESIÓN DEL CARGO" },
    { nombre: "NOTIFICACIÓN" },
  ];


  // METODO PARA OBTENER LISTA DE EMPLEADOS
  ObtenerEmpleados() {
    this.empleados = [];
    this.listaAuxiliar = [];
    this.restE.BuscarListaEmpleados().subscribe((data) => {
      this.empleados = this.rolEmpleado === 1 ? data : this.FiltrarEmpleadosAsignados(data);
      this.listaAuxiliar = this.empleados;

      // METODO PARA AUTOCOMPLETADO EN BUSQUEDA DE NOMBRES
      this.filtroNombre = this.funcionarioF.valueChanges.pipe(
        startWith(""),
        map((value: any) => this._filtrarEmpleado(value))
      );

    });
  }
  // METODO PARA OBTENER LISTA DE CIUDADES
  ObtenerCiudades() {
    this.ciudades = [];
    this.restC.ConsultarCiudades().subscribe((data) => {
      this.ciudades = data;
    });
  }
  ObtenerIdCiudadSeleccionada(nombreCiudad: String) {
    var results = this.ciudades.filter(function (ciudad) {
      return ciudad.descripcion == nombreCiudad;
    });
    return results[0].id;
  }


  //FILTROS PARA LOS FORMULARIOS
  filtroCiudades() {
    this.filtroCiudad = this.idCiudadPropuesta.valueChanges.pipe(
      startWith(""),
      map((value: any) => this._filtrarCiudad(value))
    );
  }
  filtrosTipoAcciones() {
    this.filtroTipoAccion = this.idTipoAccion.valueChanges.pipe(
      startWith(""),
      map((value: any) => this._filtrarTipoAccion(value))
    );
  }
  filtroSucursalActual() {
    this.filtroSucursal = this.idSucursal.valueChanges.pipe(
      startWith(""),
      map((value: any) => this._filtrarSucursal(value))
    );
  }
  filtroSucursalPropuestas() {
    this.filtroSucursalPropuesta = this.idSucursalPropues.valueChanges.pipe(
      startWith(""),
      map((value: any) => this._filtrarSucursal(value))
    );
  }
  filtrosCargos() {
    this.filtroCargos = this.tipoCargoPropuestoF.valueChanges.pipe(
      startWith(""),
      map((value: any) => this._filtrarCargo(value))
    );
  }
  FiltrarDepaActua() {
    this.filtroDepartamentos = this.idDepa.valueChanges.pipe(
      startWith(""),
      map((value: any) => this._filtrarDeparta(value))
    );
  }
  FiltrarDepaPro() {
    this.filtroDepartamentosProuesta = this.idDepaPropues.valueChanges.pipe(
      startWith(""),
      map((value: any) => this._filtrarDepaPro(value))
    );

    this.filtroDeparAdministrativaProuesta = this.idDepaAdminPropuesta.valueChanges.pipe(
      startWith(""),
      map((value: any) => this._filtrarDepaPro(value))
    );
  }
  filtrosEmpleados() {

    // METODO PARA AUTOCOMPLETADO EN BUSQUEDA DE NOMBRES
    this.filtroNombreH = this.idEmpleadoRA.valueChanges.pipe(
      startWith(""),
      map((value: any) => this._filtrarEmpleadoR(value))
    );

    this.filtroNombreG = this.idEmpleadoRF.valueChanges.pipe(
      startWith(""),
      map((value: any) => this._filtrarEmpleadoR(value))
    );

    this.filtroNombreN = this.idEmpleadoGF.valueChanges.pipe(
      startWith(""),
      map((value: any) => this._filtrarEmpleadoR(value))
    );

    this.filtroNombreRE = this.idEmpleadoRNA.valueChanges.pipe(
      startWith(""),
      map((value: any) => this._filtrarEmpleadoR(value))
    );

    this.filtroNombreRR = this.idEmpleadoRNF.valueChanges.pipe(
      startWith(""),
      map((value: any) => this._filtrarEmpleadoR(value))
    );

    this.filtroNombreRC = this.idEmpleadoRRC.valueChanges.pipe(
      startWith(""),
      map((value: any) => this._filtrarEmpleadoR(value))
    );

    this.filtroNombreNC = this.idEmpleadoC.valueChanges.pipe(
      startWith(""),
      map((value: any) => this._filtrarEmpleadoR(value))
    );
  }
  filtroProcesos() {
    this.filtroProceso = this.procesoPropuesto.valueChanges.pipe(
      startWith(""),
      map((value: any) => this._filtrarProceso(value))
    );
  }
  filtroGrupoOcupacionales() {
    this.filtroGrupoOcupacional = this.grupoOcupacionalPropuestoF.valueChanges.pipe(
      startWith(""),
      map((value: any) => this._filtrarGrupoOcupacional(value))
    );
  }
  filtroGrados() {
    this.filtroGrado = this.gradoPropuestoF.valueChanges.pipe(
      startWith(""),
      map((value: any) => this._filtrarGrado(value))
    );
  }

  datosForm3() {
    this.filtroProcesos();
    this.FiltrarDepaActua();
    this.FiltrarDepaPro();
    this.filtroProcesos();
    this.filtroSucursalActual();
    this.filtroSucursalPropuestas();
    this.filtroCiudades();
    this.filtrosCargos();
    this.filtroGrados();
    this.filtroGrupoOcupacionales();
  }

  // METODO PARA FILTRAR EMPLEADOS A LOS QUE EL USUARIO TIENE ACCESO
  FiltrarEmpleadosAsignados(data: any) {
    return data.filter((empleado: any) => this.idUsuariosAcceso.has(empleado.id));
  }

  CapitalizarNombre(nombre: any) {
    // REALIZAR UN CAPITAL LETTER A LOS NOMBRES
    let NombreCapitalizado: any;
    let nombres = nombre;
    if (nombres.length == 2) {
      let name1 = nombres[0].charAt(0).toUpperCase() + nombres[0].slice(1);
      let name2 = nombres[1].charAt(0).toUpperCase() + nombres[1].slice(1);
      NombreCapitalizado = name1 + " " + name2;
    } else if (nombres.length == 3) {
      let name1 = nombres[0].charAt(0).toUpperCase() + nombres[0].slice(1);
      let name2 = nombres[1].charAt(0).toUpperCase() + nombres[1].slice(1);
      let name3 = nombres[2].charAt(0).toUpperCase() + nombres[2].slice(1);
      NombreCapitalizado = NombreCapitalizado =
        name1 + " " + name2 + " " + name3;
    } else if (nombres.length == 4) {
      let name1 = nombres[0].charAt(0).toUpperCase() + nombres[0].slice(1);
      let name2 = nombres[1].charAt(0).toUpperCase() + nombres[1].slice(1);
      let name3 = nombres[2].charAt(0).toUpperCase() + nombres[2].slice(1);
      let name4 = nombres[3].charAt(0).toUpperCase() + nombres[3].slice(1);
      NombreCapitalizado = NombreCapitalizado =
        name1 + " " + +" " + name3 + " " + name4;
    } else {
      let name1 = nombres[0].charAt(0).toUpperCase() + nombres[0].slice(1);
      NombreCapitalizado = NombreCapitalizado = name1;
    }
    return NombreCapitalizado;
  }

  // METODO PARA REALIZAR EL REGISTRO DE ACCIÓN DE PERSONAL
  UpdateAccionPersonal(form1: any, form2: any, form3: any, form4: any, form5: any, form6: any) {

    // CAMBIO EL APELLIDO Y NOMBRE DE LOS EMPLEADOS SELECCIONADOS A LETRAS MAYÚSCULAS
    let datos1 = {
      informacion: form1.funcionarioForm.toUpperCase(),
    };

    const ahora = new Date();
    const horaActual = ahora.toTimeString().split(' ')[0];

    // BUSQUEDA DE LOS DATOS DEL EMPLEADO QUE REALIZA EL PEDIDO DE ACCIÓN DE PERSONAL
    this.restE.BuscarEmpleadoNombre(datos1).subscribe((empl1) => {

      var idEmpl_pedido = empl1[0].id;
      var idEmpl_pedido_cargo = empl1[0].id_cargo_;

      let id_tipo_accion_personal = this.tipos_accion.find((item: any) => item.descripcion === form2.idTipoAccionFom);
      let procesoActual = this.procesos.find((item: any) => item.nombre === form3.tipoProcesoForm);
      let nivel_gestion_actual = this.departamentos.find((item: any) => item.nombre === form3.NivelDepaForm)
      let unidad_admi_actual = this.departamentos.find((item: any) => item.nombre === form3.DepartamentoForm)
      let sucursal_actual = this.sucursal.find((item: any) => item.nombre === form3.sucursalForm);
      let lugar_trabajo_actual = this.ObtenerIdCiudadSeleccionada(form3.idCiudadForm);
      let cargo_actual = this.cargos.find((item: any) => item.cargo === form3.tipoCargoForm);
      let grupo_ocupacional_actual = this.grupoOcupacional.find((item: any) => item.descripcion === form3.grupoOcupacionalForm)
      let grado_actual = this.grados.find((item: any) => item.descripcion === form3.gradoForm);
      let procesoPropuesto = this.procesos.find((item: any) => item.nombre === form3.procesoPropuestoForm);
      let nivel_gestion_propuesto = this.departamentos.find((item: any) => item.nombre === form3.NivelDepaPropuestoForm)
      let unidad_admi_propuesto = this.departamentos.find((item: any) => item.nombre === form3.DepartamentoPropuestoForm)
      let sucursal_propuesto = this.sucursal.find((item: any) => item.nombre === form3.sucursalPropuestoForm);
      let lugar_trabajo_propuesto = form3.idCiudadPropuestaForm != '' && form3.idCiudadPropuestaForm != null ? this.ObtenerIdCiudadSeleccionada(form3.idCiudadPropuestaForm) : null;
      let cargo_propuesto = this.cargos.find((item: any) => item.cargo === form3.tipoCargoPropuestoForm);
      let grupo_ocupacional_propuesto = this.grupoOcupacional.find((item: any) => item.descripcion === form3.grupoOcupacionalPropuestoForm)
      let grado_propuesto = this.grados.find((item: any) => item.descripcion === form3.gradoPropuestoForm);

      let lugar_posesion = this.ObtenerIdCiudadSeleccionada(form4.lugar_posecion);

      let hora_comuni = '';

      if (form6.horaComunicadoForm != '') {
        hora_comuni = form6.horaComunicadoForm
      }

      // INICIALIZAMOS EL ARRAY CON TODOS LOS DATOS DEL PEDIDO
      let datosAccion = {
        id: this.idPedido,

        // PARTE FORMULARIO 1
        formulario1: {
          numero_accion_personal: form1.identificacionForm,
          fecha_elaboracion: form1.fechaForm,
          hora_elaboracion: form1.horaActual,
          id_empleado_personal: idEmpl_pedido,
          fecha_rige_desde: form1.fechaRigeDeseForm,
          fecha_rige_hasta: form1.fechaRigeHastaForm,
        },

        // PARTE FORMULARIO 2
        formulario2: {
          id_tipo_accion_personal: id_tipo_accion_personal.id_tipo_accion_personal,
          id_detalle_accion: id_tipo_accion_personal.id,
          detalle_otro: form2.otroAccionForm,
          especificacion: form2.otroEspecificacion,
          declaracion_jurada: form2.declaracionJuradaForm,
          adicion_base_legal: form2.baseLegalForm,
          observacion: form2.observacionForm,
        },

        // PARTE FORMULARIO 3
        formulario3: {
          id_proceso_actual: procesoActual != undefined ? procesoActual.id : null,
          id_nivel_gestion_actual: nivel_gestion_actual != undefined ? nivel_gestion_actual.id : null,
          id_unidad_administrativa: unidad_admi_actual != undefined ? unidad_admi_actual.id : null,
          id_sucursal_actual: sucursal_actual != undefined ? sucursal_actual.id : null,
          id_lugar_trabajo_actual: lugar_trabajo_actual != undefined ? lugar_trabajo_actual : null,
          id_tipo_cargo_actual: cargo_actual != undefined ? cargo_actual.id : null,
          id_grupo_ocupacional_actual: grupo_ocupacional_actual != undefined ? grupo_ocupacional_actual.id : null,
          id_grado_actual: grado_actual != undefined ? grado_actual.id : null,
          remuneracion_actual: parseFloat(form3.sueldoForm),
          partida_individual_actual: form3.actaForm,

          id_proceso_propuesto: procesoPropuesto != undefined ? procesoPropuesto.id : null,
          id_nivel_gestion_propuesto: nivel_gestion_propuesto != undefined ? nivel_gestion_propuesto.id : null,
          id_unidad_administrativa_propuesta: unidad_admi_propuesto != undefined ? unidad_admi_propuesto.id : null,
          id_sucursal_propuesta: sucursal_propuesto != undefined ? sucursal_propuesto.id : null,
          id_lugar_trabajo_propuesto: lugar_trabajo_propuesto != undefined ? lugar_trabajo_propuesto : null,
          id_tipo_cargo_propuesto: cargo_propuesto != undefined ? cargo_propuesto.id : null,
          id_grupo_ocupacional_propuesto: grupo_ocupacional_propuesto != undefined ? grupo_ocupacional_propuesto.id : null,
          id_grado_propuesto: grado_propuesto != undefined ? grado_propuesto.id : null,
          remuneracion_propuesta: form3.sueldoPropuestoForm != '' ? parseFloat(form3.sueldoPropuestoForm) : null,
          partida_individual_propuesta: form3.actaPropuestaFom,
        },

        // PARTE FORMULARIO 4
        formulario4: {
          funcionario: form3.habilitarForm4 ? idEmpl_pedido : null,
          cedual: form3.habilitarForm4 ? form4.cedulaForm : null,
          lugar_posesion: form3.habilitarForm4 ? lugar_posesion : null,
          fecha_posesion: form3.habilitarForm4 ? form4.fechaPosesionForm : null,
          actaFinal: form3.habilitarForm4 ? form4.actaFinalForm : null,
          fechaActa: form3.habilitarForm4 ? form4.fechaActaFinalForm : null,
        },

        // PARTE FORMULARIO 5
        formulario5: {
          abrevia_talentoHunamo: form5.abrevHAForm,
          firma_talentoHumano: this.cargoFirma1.id_empleado,
          cargo_talentoHumano: this.cargoFirma1.id_cargo,

          abrevia_delegado: form5.abrevGAForm,
          firma_delegado: this.cargoFirma2 == undefined ? null : this.cargoFirma2.id_empleado,
          cargo_delegado: this.cargoFirma2 == undefined ? null : this.cargoFirma2.id_cargo,
          abrevia_servidorPublico: form5.abrevHForm,
          firma_servidorPublico: idEmpl_pedido,
          cargo_servidorPublico: idEmpl_pedido_cargo,
          fecha_servidorPublico: form5.fechaServidorForm == '' ? null : form5.fechaServidorForm,

          abrevia_negativa: form5.abrevGForm,
          firma_negativa: form5.idEmpleadoGForm,
          fecha_negativa: form5.fechaNegativaForm == '' ? null : form5.fechaNegativaForm,

          abrevia_RespElaboracion: form5.abrevRGForm,
          firma_RespElaboracion: this.cargoFirma3 == undefined ? null : this.cargoFirma3.id_empleado,
          cargo_RespElaboracion: this.cargoFirma3 == undefined ? null : this.cargoFirma3.id_cargo,
          abrevia_RespRevision: form5.abrevRHForm,
          firma_RespRevision: this.cargoFirma4 == undefined ? null : this.cargoFirma4.id_empleado,
          cargo_RespRevision: this.cargoFirma4 == undefined ? null : this.cargoFirma4.id_cargo,
          abrevia_RespRegistro_control: form5.abrevRRCForm,
          firma_RespRegistro_control: this.cargoFirma5 == undefined ? null : this.cargoFirma5.id_empleado,
          cargo_RespRegistro_control: this.cargoFirma5 == undefined ? null : this.cargoFirma5.id_cargo
        },

        // PARTE FORMULARIO 6
        formulario6: {
          ComunicacionElect: form6.ComunicacionElectForm == '' ? false : form6.ComunicacionElectForm,
          fechaComunicacion: form6.fechaComunicadoForm == '' ? null : form6.fechaComunicadoForm,
          horaComunicado: form6.horaComunicadoForm == '' ? null : hora_comuni,
          medioComunicacionForm: form6.medioComunicacionForm == '' ? null : form6.medioComunicacionForm,
          abrevCForm: form6.abrevCForm == '' ? null : form6.abrevCForm,
          firma_Resp_Notificacion: form6.idEmpleadoCForm == '' ? null : form6.idEmpleadoCForm,
        },

        user_name: this.user_name,
        ip: this.ip, ip_local: this.ips_locales,
      };

      this.ValidacionesIngresos(form1, form2, datosAccion);

    });
  }

  // METODO PARA VERIFICAR LAS POSIBLES OPCIONES DE INGRESOS EN EL FORMULARIO
  ValidacionesIngresos(form1: any, form2: any, datosAccion: any) {
    // INGRESO DE DATOS DE ACUERDO A LO INGRESADO POR EL USUARIO
    if (form1.tipoDecretoForm != undefined && form2.tipoCargoForm != undefined) {
      console.log("INGRESA 1", datosAccion);
      this.GuardarDatos(datosAccion);
    } else if (
      form1.tipoDecretoForm === undefined &&
      form2.tipoCargoForm != undefined
    ) {
      console.log("INGRESA 2", datosAccion);

    } else if (
      form1.tipoDecretoForm != undefined &&
      form2.tipoCargoForm === undefined
    ) {
      console.log("INGRESA 3", datosAccion);
      this.GuardarDatos(datosAccion);
    } else {
      console.log("INGRESA 9", datosAccion);
      this.GuardarDatos(datosAccion);
    }
  }

  // METODO PARA GUARDAR LOS DATOS DEL PEDIDO DE ACCIONES DE PERSONAL
  GuardarDatos(datosAccion: any) {
    // CAMBIAR VALOR A NULL LOS CAMPOS CON FORMATO INTEGER QUE NO SON INGRESADOS
    if (
      datosAccion.cargo_propuesto === "" ||
      datosAccion.cargo_propuesto === null
    ) {
      datosAccion.cargo_propuesto = null;
    }
    if (
      datosAccion.proceso_propuesto === "" ||
      datosAccion.proceso_propuesto === null
    ) {
      datosAccion.proceso_propuesto = null;
    }
    if (
      datosAccion.salario_propuesto === "" ||
      datosAccion.salario_propuesto === null
    ) {
      datosAccion.salario_propuesto = null;
    }
    console.log("DATOS FINALES", datosAccion);

    this.restAccion.ActualizarPedidoAccion(datosAccion).subscribe((res) => {
      this.toastr.success(
        "Operación exitosa.",
        "Acción de Personal Registrada",
        {
          timeOut: 6000,
        }
      );
      this.CerrarVentana(2, this.idPedido);
    });
  }

  // METODO PARA INGRESAR SOLO NUMEROS
  IngresarSoloNumeros(evt: any) {
    return this.validar.IngresarSoloNumeros(evt);
  }

  // METODO PARA CERRAR VENTANA
  CerrarVentana(opcion: number, datos: any) {
    this.componentel.ver_editar = false;
    //console.log('opcion: ', opcion, ' - ', 'datos: ', datos)
    if (opcion === 1 && this.pagina === 'listar-pedido') {
      this.componentel.ver_lista = true;
    }
    else if (opcion === 2 && this.pagina === 'listar-pedido') {
      this.componentel.VerDatosPedidos(datos);
    }
    else if (opcion === 1 && this.pagina === 'datos-pedido') {
      this.componentel.ver_datos = true;
    }
    else if (opcion === 2 && this.pagina === 'datos-pedido') {
      this.componentel.VerDatosPedidos(datos);
    }
  }
}
