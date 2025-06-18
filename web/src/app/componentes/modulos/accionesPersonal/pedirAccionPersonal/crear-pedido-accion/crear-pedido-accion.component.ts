
import { FormControl, Validators, FormGroup, AbstractControl, ValidatorFn } from "@angular/forms";
import { Component, OnInit } from "@angular/core";
import { startWith, map } from "rxjs/operators";
import { ToastrService } from "ngx-toastr";
import { Observable } from "rxjs";
import { DateTime } from 'luxon';
import { Router } from "@angular/router";

/** IMPORTACION DE SERVICIOS */
import { AccionPersonalService } from "src/app/servicios/modulos/modulo-acciones-personal/accionPersonal/accion-personal.service";
import { ValidacionesService } from "src/app/servicios/generales/validaciones/validaciones.service";
import { AsignacionesService } from "src/app/servicios/usuarios/asignaciones/asignaciones.service";
import { EmpleadoService } from "src/app/servicios/usuarios/empleado/empleadoRegistro/empleado.service";
import { ProcesoService } from "src/app/servicios/modulos/modulo-acciones-personal/catProcesos/proceso.service";
import { EmpresaService } from 'src/app/servicios/configuracion/parametrizacion/catEmpresa/empresa.service';
import { MainNavService } from "src/app/componentes/generales/main-nav/main-nav.service";
import { CiudadService } from "src/app/servicios/configuracion/localizacion/ciudad/ciudad.service";
import { SucursalService } from "src/app/servicios/configuracion/localizacion/sucursales/sucursal.service";
import { DepartamentosService } from "src/app/servicios/configuracion/localizacion/catDepartamentos/departamentos.service";
import { CatGrupoOcupacionalService } from "src/app/servicios/modulos/modulo-acciones-personal/catGrupoOcupacional/cat-grupo-ocupacional.service";
import { CatGradoService } from "src/app/servicios/modulos/modulo-acciones-personal/catGrado/cat-grado.service";
import { CatTipoCargosService } from "src/app/servicios/configuracion/parametrizacion/catTipoCargos/cat-tipo-cargos.service";
import { MatAutocompleteSelectedEvent } from "@angular/material/autocomplete";
import { UsuarioService } from "src/app/servicios/usuarios/usuario/usuario.service";
import { number } from "echarts/core";



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
  selector: "app-crear-pedido-accion",
  standalone: false,
  templateUrl: "./crear-pedido-accion.component.html",
  styleUrls: ["./crear-pedido-accion.component.css"],
})

export class CrearPedidoAccionComponent implements OnInit {
  ips_locales: any = '';

  // FILTRO DE NOMBRES DE LOS EMPLEADOS
  filtroNombreH: Observable<any[]>;
  filtroNombreG: Observable<any[]>;
  filtroNombreR: Observable<any[]>;
  filtroNombre: Observable<any[]>;

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

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  // EVENTOS RELACIONADOS A SELECCION E INGRESO DE ACUERDOS - DECRETOS - RESOLUCIONES
  ingresoAcuerdo: boolean = false;
  vistaAcuerdo: boolean = true;

  // EVENTOS REALCIONADOS A SELECCION E INGRESO DE CARGOS PROPUESTOS
  ingresoCargo: boolean = false;
  vistaCargo: boolean = true;


  // INICIACION DE CAMPOS DEL FORMULARIO

  otroDecretoF = new FormControl("", [Validators.minLength(3)]);
  otroCargoF = new FormControl("", [Validators.minLength(3)]);
  numPartidaF = new FormControl("", [Validators.required]);
  accionForm = new FormControl("");


  funcionesReemp = new FormControl("");
  numPropuestaF = new FormControl("");
  descripcionP = new FormControl("");
  DepartamentoForm = new FormControl("");
  DepartamentoPropuestoForm = new FormControl("");

  nombreReemp = new FormControl("");
  puestoReemp = new FormControl("");
  accionReemp = new FormControl("");
  numPartidaI = new FormControl("");

  fechaActaF = new FormControl("");

  //Formulario 1 accion personal
  identificacionF = new FormControl("", [Validators.required, Validators.minLength(3),]);
  fechaF = new FormControl("", [Validators.required]);
  funcionarioF = new FormControl("");
  fechaRigeDesde = new FormControl("", [Validators.required]);
  fechaRigeHasta = new FormControl("", [Validators.required]);

  //Formulario 2 tipo accion y motivacion
  idTipoAccion = new FormControl("");
  otroAccionF = new FormControl("");
  otroEspecificacion = new FormControl("");
  declaracionJuradaF = new FormControl(false);
  observacionForm = new FormControl("");
  baseLegalForm = new FormControl("", [Validators.minLength(6)]);

  //Formulario 3 situacion actual
  tipoProcesoF = new FormControl("", [Validators.required]);
  idSucursal = new FormControl("", [Validators.required]);
  idDepa = new FormControl("");
  idDepaActual = new FormControl("");
  idCiudad = new FormControl("", [Validators.required]);
  tipoCargoF = new FormControl("", [Validators.required]);
  grupoOcupacionalF = new FormControl("", [Validators.required]);
  gradoF = new FormControl("", [Validators.required, noRegistradoValidator()]);
  sueldoF = new FormControl("", [Validators.required]);
  actaF = new FormControl("");

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

  habilitarForm4 = new FormControl("");

  //Formulario 4 posesion
  cedualF = new FormControl("");
  fechaPosesionFor = new FormControl("");
  actaFinalForm = new FormControl("");
  fechaActaFinalForm = new FormControl("");

  //Formulario 5 responsables aprovacion
  abrevHA = new FormControl("");
  abrevGA = new FormControl("");
  abrevHF = new FormControl("");
  abrevGF = new FormControl("");

  idEmpleadoRA = new FormControl("");
  idEmpleadoF = new FormControl("");
  idEmpleadoHF = new FormControl("");
  idEmpleadoGF = new FormControl("");
  idEmpleadoRF = new FormControl("");
  razonForm = new FormControl("");

  idEmpleadoRNF = new FormControl("");
  idEmpleadoRNA = new FormControl("");
  idEmpleadoRRC = new FormControl("");
  abrevRGF = new FormControl("");
  abrevRHF = new FormControl("");
  abrevRRC = new FormControl("");

  fechaServidorF = new FormControl("");
  fechaNegativaF = new FormControl("");

  //Formulario 6 notificaciones
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
    numPartidaIForm: this.numPartidaI,
    numPropuestaForm: this.numPropuestaF,
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
    lugar_trabajo: this.idCiudad,
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
    razonForm: this.razonForm,

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

  // INICIACION DE VARIABLES
  idEmpleadoLogueado: any;
  rolEmpleado: number; // VARIABLE DE ALMACENAMIENTO DE ROL DE EMPLEADO QUE INICIA SESION

  idUsuariosAcceso: Set<any> = new Set();

  empleados: any = [];
  sucursal: any = [];
  ciudades: any = [];
  departamento: any;
  departamentos: any = [];
  departamentosact: any = [];
  departamentosPro: any = [];
  FechaActual: any;

  get habilitarAccion(): boolean {
    return this.funciones.accionesPersonal;
  }

  constructor(
    private asignaciones: AsignacionesService,
    public restProcesos: ProcesoService,
    public restGrupo: CatGrupoOcupacionalService,
    public restGrado: CatGradoService,
    public restEmpresa: EmpresaService,
    public restAccion: AccionPersonalService,
    private funciones: MainNavService,
    private validar: ValidacionesService,
    private toastr: ToastrService,
    public restE: EmpleadoService,
    public restUsu: UsuarioService,
    public restSu: SucursalService,
    public restDe: DepartamentosService,
    public restC: CiudadService,
    public restCargo: CatTipoCargosService,
    public router: Router
  ) {
    this.idEmpleadoLogueado = parseInt(localStorage.getItem("empleado") as string);
    this.departamento = parseInt(localStorage.getItem("departamento") as string);
  }

  ngOnInit(): void {
    this.user_name = localStorage.getItem("usuario");
    this.ip = localStorage.getItem("ip");
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
    } else {

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
    }
  }

  //METODO PARA VALIDAR DATOS EN LOS FORMULARIOS
  siguiente(form: string){
    console.log('usuario: ',this.InfoUser)
  }

  // METODO PARA BUSQUEDA DE NOMBRES SEGUN LO INGRESADO POR EL USUARIO
  private _filtrarEmpleado(value: string): any {
    if (value != null) {
      const filterValue = value.toUpperCase();
      return this.empleados.filter((info: any) =>
        info.empleado.toUpperCase().includes(filterValue)  
      );
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
      return this.departamentosact.filter((info: any) =>
        info.nombre.toUpperCase().includes(filterValue)
      );
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

  // BUSQUEDA DE DATOS DE EMPRESA
  empresa: any = [];
  MostrarDatos() {
    this.empresa = [];
    this.restEmpresa
      .ConsultarDatosEmpresa(parseInt(localStorage.getItem('empresa') as string))
      .subscribe((data) => {
        this.empresa = data;
        console.log('this.empresa: ', this.empresa)
        this.secondFormGroup.patchValue({
          //numPartidaForm: this.empresa[0].numero_partida,
        });
      });
  }

  // BUSQUEDA DE DATOS DE LA TABLA PROCESOS
  procesos: any = [];
  ObtenerProcesos() {
    this.procesos = [];
    this.restProcesos.ConsultarProcesos().subscribe((datos) => {
      this.procesos = datos;
      console.log('procesos: ', this.procesos);
      this.filtroProceso = this.procesoPropuesto.valueChanges.pipe(
        startWith(""),
        map((value: any) => this._filtrarProceso(value))
      );

    });
  }
  // BUSQUEDA DE DATOS DE LA TABLA GRUPO OCUPACIONAL
  grupoOcupacional: any = [];
  ObtenerGrupoOcupacional() {
    this.grupoOcupacional = [];
    this.restGrupo.ConsultarGrupoOcupacion().subscribe((datos) => {
      this.grupoOcupacional = datos;
      console.log('grupoOcupacional: ', this.grupoOcupacional);
      this.filtroGrupoOcupacional = this.grupoOcupacionalPropuestoF.valueChanges.pipe(
        startWith(""),
        map((value: any) => this._filtrarGrupoOcupacional(value))
      );

    });
  }
  // BUSQUEDA DE DATOS DE LA TABLA GRADO
  grados: any = [];
  ObtenerGrados() {
    this.grados = [];
    this.restGrado.ConsultarGrados().subscribe((datos) => {
      this.grados = datos;
      console.log('grados: ', this.grados);
      this.filtroGrado = this.gradoPropuestoF.valueChanges.pipe(
        startWith(""),
        map((value: any) => this._filtrarGrado(value))
      );
    });
  }
  // BUSQUEDA DE DATOS DE LA TABLA GRADO
  cargos: any = [];
  ObtenerCargos() {
    this.cargos = [];
    this.restCargo.ListaCargos().subscribe((datos) => {
      this.cargos = datos;
      console.log('cargos: ', this.cargos);
      this.filtroCargos = this.tipoCargoPropuestoF.valueChanges.pipe(
        startWith(""),
        map((value: any) => this._filtrarCargo(value))
      );
    });
  }

  // METODO PARA ACTIVAR FORMULARIO NOMBRE DE OTRA OPCION
  IngresarOtro(form1: any) {
    if (form1.tipoDecretoForm === undefined) {
      this.firstFormGroup.patchValue({
        //otroDecretoForm: "",
      });
      this.ingresoAcuerdo = true;
      this.toastr.info("Ingresar nombre de un nuevo tipo de proceso", "", {
        timeOut: 6000,
      });
      this.vistaAcuerdo = false;
    }
  }

  // METODO PARA VER LISTA DE DECRETOS
  VerDecretos() {
    this.firstFormGroup.patchValue({
      //otroDecretoForm: "",
    });
    this.ingresoAcuerdo = false;
    this.vistaAcuerdo = true;
  }

  // METODO DE BUSQUEDA DE DATOS DE LA TABLA TIPO_ACCIONES
  tipos_accion: any = [];
  ObtenerTiposAccion() {
    this.tipos_accion = [];
    this.restAccion.ConsultarTipoAccionPersonal().subscribe((datos) => {
      this.tipos_accion = datos;
      this.filtroTipoAccion = this.idTipoAccion.valueChanges.pipe(
        startWith(""),
        map((value: any) => this._filtrarTipoAccion(value))
      );

    });
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

  // METODO PARA ACTIVAR FORMULARIO DE INGRESO DE UN NUEVO TIPO DE CARGO PROPUESTO
  IngresarCargo(form2: any) {
    if (form2.tipoCargoForm === undefined) {
      this.secondFormGroup.patchValue({
        //otroCargoForm: "",
      });
      this.ingresoCargo = true;
      this.toastr.info(
        "Ingresar nombre de un nuevo tipo de cargo o puesto propuesto.",
        "",
        {
          timeOut: 6000,
        }
      );
      this.vistaCargo = false;
    }
  }
  activarOtro = true;
  textoFijo: string = '';
  onTipoAccionSeleccionado(e: MatAutocompleteSelectedEvent) {
    if (e.option.value != undefined && e.option.value != null) {
      this.tipos_accion.forEach(item => {
        console.log('SI: ',item)
        console.log('SI: ',item.descripcion,' - ',e.option.value)
        if (item.descripcion == e.option.value) {
          console.log('entro aqui: ',item.decripcion,' - ',e.option.value)
          this.secondFormGroup.controls['baseLegalForm'].setValue(item.base_legal);
          this.textoFijo = item.base_legal;
        }
      });

      if (e.option.value == 'OTRO') {
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

    // Si borraron parte del valor fijo, restáuralo
    if (!inputValue.startsWith(this.textoFijo)) {
      event.target.value = this.textoFijo
      return;
    }

    this.secondFormGroup.controls['baseLegalForm'].setValue(inputValue);
  }

  onKeyDown(event: KeyboardEvent) {
    const input = event.target as HTMLInputElement;
    if (input.selectionStart! <= this.textoFijo.length) {
      const teclasBloqueadas = ['Backspace', 'Delete', 'ArrowLeft'];

      if (teclasBloqueadas.includes(event.key)) {
        event.preventDefault();
      }
    }
  }

  onFocus() {
    if (this.baseLegalForm.value === this.textoFijo) {
      this.baseLegalForm.setValue('\n');
    }
  }

  InfoUser: any = {}
  idUserSelect: any = 0;
  btnForm1: boolean = true;
  oninfoEmpleado(e: any) {
    if (e.id != undefined && e.id != null) {
      this.restUsu.BuscarInfoUsuarioAccion(e.id).subscribe((datos) => {
        this.InfoUser = datos
      
        this.InfoUser.forEach(valor => {

          //this.firstFormGroup.controls['funcionarioForm'].setValue(this.idUserSelect);
          this.idUserSelect = e.id
          this.fourthFormGroup.controls['funcionarioForm'].setValue(e.empleado)
          this.fourthFormGroup.controls['cedulaForm'].setValue(valor.identificacion)

          //Proceso
          const proceso = this.procesos.find((info: any) => info.id == valor.id_proceso);
          if (proceso == undefined || proceso == null) {
            this.thirdFormGroup.controls['tipoProcesoForm'].setValue('No registrado')
          } else {
            this.thirdFormGroup.controls['tipoProcesoForm'].setValue(proceso.nombre)
          }
          //Sucursal
          const sucursal = this.sucursal.find((inf: any) => inf.id == valor.id_suc);
          if (sucursal == undefined || sucursal == null) {
            this.thirdFormGroup.controls['sucursalForm'].setValue('No registrado')
          } else {
            this.thirdFormGroup.controls['sucursalForm'].setValue(sucursal.nombre)
            this.departamentos.forEach(item => {
              if(item.id_sucursal == sucursal.id){
                this.departamentosact.push(item);
              }
            });

            this.FiltrarDepaActua();
          }
          //Departamento
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

          //Lugar de trabajo
          this.thirdFormGroup.controls['idCiudadForm'].setValue(sucursal.descripcion)
          //Grupo ocupacion
          const grupo_ocupacional = this.grupoOcupacional.find((inf: any) => inf.id == valor.id_grupo_ocupacional);
          if (grupo_ocupacional == undefined || grupo_ocupacional == null) {
            this.thirdFormGroup.controls['grupoOcupacionalForm'].setValue('No registrado')
          } else {
            this.thirdFormGroup.controls['grupoOcupacionalForm'].setValue(grupo_ocupacional.descripcion)
          }
          //Grado
          const grado = this.grados.find((inf: any) => inf.id == valor.id_grado);
          if (grado == undefined || grado == null) {
            this.thirdFormGroup.controls['gradoForm'].setValue('No registrado')
          } else {
            this.thirdFormGroup.controls['gradoForm'].setValue(grado.descripcion)
          }
          //Cargo actual
          const cargo = this.cargos.find((inf: any) => inf.id == valor.id_tipo_cargo);
          if (cargo == undefined || cargo == null) {
            this.thirdFormGroup.controls['tipoCargoForm'].setValue('No registrado')
          } else {
            this.thirdFormGroup.controls['tipoCargoForm'].setValue(cargo.cargo)
          }
          //Remuneracion
          this.thirdFormGroup.controls['sueldoForm'].setValue(valor.sueldo.split(".")[0])
          this.thirdFormGroup.controls['actaForm'].setValue(valor.numero_partida_individual)

          //this.fivethFormGroup.controls['idEmpleadoHF'].setValue(e.empleado);
          this.fivethFormGroup.patchValue({
            fechaServidorForm: this.FechaActual,
          });

          this.btnForm1 = false

        })

      },error => (
        this.InfoUser = null
      ))
    }else{
      this.btnForm1 = true
    }
  }

  onSucursal(e: any){
    if (e.id != undefined && e.id != null) {
      this.departamentosPro = [];
      const filtrados = this.departamentos.filter(item => item.id_sucursal == e.id);
      this.departamentosPro = filtrados;

      this.idDepaPropues.setValue("");
      this.idDepaAdminPropuesta.setValue("");
      this.FiltrarDepaPro();
    }
  }

  // METODO PARA VER LISTA DE CARGOS PROPUESTO
  VerCargos() {
    this.secondFormGroup.patchValue({
      //otroCargoForm: "",
    });
    this.ingresoCargo = false;
    this.vistaCargo = true;
  }

  // METODO PARA OBTENER LISTA DE EMPLEADOS
  ObtenerEmpleados() {
    this.empleados = [];
    this.restE.BuscarListaEmpleados().subscribe((data) => {
      this.empleados = this.rolEmpleado === 1 ? data : this.FiltrarEmpleadosAsignados(data);

      // METODO PARA AUTOCOMPLETADO EN BUSQUEDA DE NOMBRES
      this.filtroNombre = this.funcionarioF.valueChanges.pipe(
        startWith(""),
        map((value: any) => this._filtrarEmpleado(value))
      );

      this.filtroNombreH = this.idEmpleadoHF.valueChanges.pipe(
        startWith(""),
        map((value: any) => this._filtrarEmpleado(value))
      );

      this.filtroNombreG = this.idEmpleadoGF.valueChanges.pipe(
        startWith(""),
        map((value: any) => this._filtrarEmpleado(value))
      );

      this.filtroNombreR = this.idEmpleadoRF.valueChanges.pipe(
        startWith(""),
        map((value: any) => this._filtrarEmpleado(value))
      );
    });
  }

  // METODO PARA FILTRAR EMPLEADOS A LOS QUE EL USUARIO TIENE ACCESO
  FiltrarEmpleadosAsignados(data: any) {
    return data.filter((empleado: any) => this.idUsuariosAcceso.has(empleado.id));
  }

  // METODO PARA OBTENER LISTA DE CIUDADES
  id_sucursal: any = 0
  ObtenerSucursal() {
    this.sucursal = [];
    this.restSu.BuscarSucursal().subscribe((data) => {
      this.sucursal = data;
      console.log('sucursales: ',this.sucursal)
      this.filtroSucursal = this.idSucursal.valueChanges.pipe(
        startWith(""),
        map((value: any) => this._filtrarSucursal(value))
      );

      this.filtroSucursalPropuesta = this.idSucursalPropues.valueChanges.pipe(
        startWith(""),
        map((value: any) => this._filtrarSucursal(value))
      );
    });
  }

  // METODO PARA OBTENER LISTA DE CIUDADES
  ObtenerDepartamentos() {
    this.departamentos = [];
    this.restDe.ConsultarDepartamentos().subscribe((data) => {
      this.departamentos = data;
      console.log('departamentos: ', this.departamentos)
    });
  }

  FiltrarDepaActua(){
      this.filtroDepartamentos = this.idDepa.valueChanges.pipe(
        startWith(""),
        map((value: any) => this._filtrarDeparta(value))
      );
  }

  FiltrarDepaPro(){
      this.filtroDepartamentosProuesta = this.idDepaPropues.valueChanges.pipe(
        startWith(""),
        map((value: any) => this._filtrarDepaPro(value))
      );

      this.filtroDeparAdministrativaProuesta = this.idDepaAdminPropuesta.valueChanges.pipe(
        startWith(""),
        map((value: any) => this._filtrarDepaPro(value))
      );
  }

  // METODO PARA OBTENER LISTA DE CIUDADES
  ObtenerCiudades() {
    this.ciudades = [];
    this.restC.ConsultarCiudades().subscribe((data) => {
      this.ciudades = data;
      //console.log("ciudades", this.ciudades);
      this.filtroCiudad = this.idCiudadPropuesta.valueChanges.pipe(
        startWith(""),
        map((value: any) => this._filtrarCiudad(value))
      );
    });
  }

  //Buscar ciudad seleccionada
  ObtenerIdCiudadSeleccionada(nombreCiudad: String) {
    var results = this.ciudades.filter(function (ciudad) {
      return ciudad.descripcion == nombreCiudad;
    });
    return results[0].id;
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
        name1 + " " + name2 + " " + name3 + " " + name4;
    } else {
      let name1 = nombres[0].charAt(0).toUpperCase() + nombres[0].slice(1);
      NombreCapitalizado = NombreCapitalizado = name1;
    }
    return NombreCapitalizado;
  }

  cargoFirma1: any;
  cargoFirma2: any;
  cargoFirma3: any;
  cargoFirma4: any;
  cargoFirma5: any;
  onCargo(datos: any, firma: number){
    let info = {}
    if(firma == 1){
      this.cargoFirma1 = {};
      info = {
        informacion: datos.empleado.toUpperCase(),
      };
    }else if(firma == 2){
      this.cargoFirma2 = {};
      info = {
        informacion: datos.empleado.toUpperCase(),
      };
    }else if(firma == 3){
      this.cargoFirma3 = {};
      info = {
        informacion: datos.empleado.toUpperCase(),
      };
    }else if(firma == 4){
      this.cargoFirma4 = {};
      info = {
        informacion: datos.empleado.toUpperCase(),
      };
    }else{
      this.cargoFirma5 = {};
      info = {
        informacion: datos.empleado.toUpperCase(),
      };
    }

    // BUSQUEDA DE LOS DATOS DEL EMPLEADO QUE REALIZA LA PRIMERA FIRMA
    this.restE.BuscarEmpleadoNombre(info).subscribe((empl) => {
      const x = {
        id_cargo: empl[0].id_cargo_,
        cargo: empl[0].name_cargo
      }

      if(firma == 1){
        this.cargoFirma1 = x
      }else if(firma == 2){
        this.cargoFirma2 = x
      }else if(firma == 3){
        this.cargoFirma3 = x
      }else if(firma == 4){
        this.cargoFirma4 = x
      }else if(firma == 5){
        this.cargoFirma5 = x
      }
      
    })


  }

  // METODO PARA REALIZAR EL REGISTRO DE ACCION DE PERSONAL
  InsertarAccionPersonal(form1: any, form2: any, form3: any, form4: any, form5: any, form6: any) {

    // CAMBIO EL APELLIDO Y NOMBRE DE LOS EMPLEADOS SELECCIONADOS A LETRAS MAYUSCULAS
    let datos1 = {
      informacion: form1.funcionarioForm.toUpperCase(),
    };
    
    //Talento humano
    let datos2 = {
      informacion: form5.idEmpleadoRAForm.toUpperCase(),
    };
    //Delegado
    let datos3 = {
      informacion: form5.idEmpleadoRForm.toUpperCase(),
    };
    //Servidor publico
    let datos4 = {
      informacion: form5.idEmpleadoHForm.toUpperCase(),
    };
    
    //Caso negativa
    let datos5 = {
      informacion: form5.idEmpleadoGForm.toUpperCase(),
    }

    //Responsable elaboracion
    let datos6 = {
      informacion: form5.idEmpleadoRNAForm.toUpperCase(),
    }
    //Responsable revision
    let datos7 = {
      informacion: form5.idEmpleadoRNForm.toUpperCase(),
    }
    //Responsable control
    let datos8 = {
      informacion: form5.idEmpleadoRRCForm.toUpperCase(),
    }

    const ahora = new Date();
    const horaActual = ahora.toTimeString().split(' ')[0];

    //BUSQUEDA DE LOS DATOS DEL EMPLEADO QUE REALIZA EL PEDIDO DE ACCION DE PERSONAL
    this.restE.BuscarEmpleadoNombre(datos1).subscribe((empl1) => {
      console.log('empl1: ',empl1)
      var idEmpl_pedido = empl1[0].id;
      
      // BUSQUEDA DE LOS DATOS DEL EMPLEADO QUE REALIZA LA PRIMERA FIRMA
      this.restE.BuscarEmpleadoNombre(datos2).subscribe((empl2) => {

        console.log('empl2: ',empl2);

        var idEmpl_firmaTH = empl2[0].id;
        var Empl_firmaTH_cargo = empl2[0].id_cargo_

        // BUSQUEDA DE LOS DATOS DEL EMPLEADO QUE REALIZA LA SEGUNDA FIRMA
        this.restE.BuscarEmpleadoNombre(datos3).subscribe((empl3) => {
          var idEmpl_firmaG = empl3[0].id;
          var Empl_firmaG_cargo = empl3[0].id_cargo_

          this.restE.BuscarEmpleadoNombre(datos4).subscribe((empl4) => {
            var idEmpl_firmaS = empl4[0].id;
            var Empl_firmaS_cargo = empl4[0].id_cargo_

            this.restE.BuscarEmpleadoNombre(datos6).subscribe((empl5) => {
              var idEmpl_firmaRE = empl5[0].id;
              var Empl_firmaRE_cargo = empl5[0].id_cargo_

              this.restE.BuscarEmpleadoNombre(datos7).subscribe((empl6) => {
                var idEmpl_firmaRR = empl6[0].id;
                var Empl_firmaRR_cargo = empl6[0].id_cargo_

                this.restE.BuscarEmpleadoNombre(datos8).subscribe((empl7) => {
                  var idEmpl_firmaRC = empl7[0].id;
                  var Empl_firmaRC_cargo = empl7[0].id_cargo_

                  
                    let id_tipo_accion_personal = this.tipos_accion.find(item => item.nombre === form2.idTipoAccionFom)

                    let procesoActual = this.procesos.find(item => item.nombre === form3.tipoProcesoForm);
                    let nivel_gestion_actual = this.departamentos.find(item => item.nombre === form3.NivelDepaForm)
                    let unidad_admi_actual = this.departamentos.find(item => item.nombre === form3.DepartamentoForm)
                    let sucursal_actual = this.sucursal.find(item => item.nombre === form3.sucursalForm);
                    let lugar_trabajo_actual = this.ObtenerIdCiudadSeleccionada(form3.idCiudadForm);
                    let cargo_actual = this.cargos.find(item => item.cargo === form3.tipoCargoForm);
                    let grupo_ocupacional_actual = this.grupoOcupacional.find(item => item.descripcion === form3.grupoOcupacionalForm)
                    let grado_actual = this.grados.find(item => item.descripcion === form3.gradoForm);

                    let procesoPropuesto = this.procesos.find(item => item.nombre === form3.procesoPropuestoForm);
                    let nivel_gestion_propuesto = this.departamentos.find(item => item.nombre === form3.NivelDepaPropuestoForm)
                    let unidad_admi_propuesto = this.departamentos.find(item => item.nombre === form3.DepartamentoPropuestoForm)
                    let sucursal_propuesto = this.sucursal.find(item => item.nombre === form3.sucursalPropuestoForm);
                    let lugar_trabajo_propuesto = form3.idCiudadPropuestaForm != '' ? this.ObtenerIdCiudadSeleccionada(form3.idCiudadPropuestaForm) : undefined;
                    let cargo_propuesto = this.cargos.find(item => item.cargo === form3.tipoCargoPropuestoForm);
                    let grupo_ocupacional_propuesto = this.grupoOcupacional.find(item => item.descripcion === form3.grupoOcupacionalPropuestoForm)
                    let grado_propuesto = this.grados.find(item => item.descripcion === form3.gradoPropuestoForm);

                    let hora_comuni = '';

                    if (form6.horaComunicadoForm != ''){
                      const hora_comunicacion = form6.horaComunicadoForm.c;
                      const horas = hora_comunicacion.hour.toString().padStart(2, '0');
                      const minutos = hora_comunicacion.minute.toString().padStart(2, '0');
                      const segundos = hora_comunicacion.second.toString().padStart(2, '0');                      
                      hora_comuni = horas+':'+minutos+':'+segundos
                      console.log('hora_comuni: ',hora_comuni);
                    }
                    

                    // INICIALIZAMOS EL ARRAY CON TODOS LOS DATOS DEL PEDIDO
                    let datosAccion = {

                      //parte formulario 1
                      formulario1: {
                        numero_accion_personal: form1.identificacionForm,
                        fecha_elaboracion: form1.fechaForm,
                        hora_elaboracion: horaActual,
                        id_empleado_personal: idEmpl_pedido,
                        fecha_rige_desde: form1.fechaRigeDeseForm,
                        fecha_rige_hasta: form1.fechaRigeHastaForm,
                      },

                      //parte formulario 2
                      formulario2: {
                        id_tipo_accion_personal: id_tipo_accion_personal.id_tipo_accion_personal,
                        id_detalle_accion: id_tipo_accion_personal.id,
                        detalle_otro: form2.otroAccionForm,
                        especificacion: form2.otroEspecificacion,
                        declaracion_jurada: form2.declaracionJuradaForm,
                        adicion_base_legal: form2.baseLegalForm,
                        observacion: form2.observacionForm,
                      },

                      //parte formulario 3
                      formulario3: {
                        id_proceso_actual: procesoActual != undefined ? procesoActual.id : null,
                        id_nivel_gestion_actual: nivel_gestion_actual != undefined ? nivel_gestion_actual.id : null,
                        id_unidad_administrativa: unidad_admi_actual != undefined ? unidad_admi_actual.id : null,
                        id_sucursal_actual: sucursal_actual != undefined ? sucursal_actual.id : null,
                        id_lugar_trabajo_actual: lugar_trabajo_actual != undefined ? lugar_trabajo_actual : null,
                        id_tipo_cargo_actual: cargo_actual != undefined ? cargo_actual.id : null,
                        id_grupo_ocupacional_actual: grupo_ocupacional_actual != undefined ? grupo_ocupacional_actual.id : null,
                        id_grado_actual: grado_actual != undefined ? grado_actual.id : null,
                        remuneracion_actual: parseFloat(form3.sueldoForm) ,
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

                      //parte formulario 4
                      formulario4: {
                        funcionario: form3.habilitarForm4 ? idEmpl_pedido : null,
                        cedual: form3.habilitarForm4 ? form4.cedulaForm : null,
                        lugar_posesion: form3.habilitarForm4 ? lugar_trabajo_actual : null,
                        fecha_posesion: form3.habilitarForm4 ? form4.fechaPosesionForm : null,
                        actaFinal: form3.habilitarForm4 ? form4.actaFinalForm : null,
                        fechaActa: form3.habilitarForm4 ? form4.fechaActaFinalForm : null,
                      },

                      //parte formulario 5
                      formulario5: {
                        abrevia_talentoHunamo: form5.abrevHAForm,
                        firma_talentoHumano: idEmpl_firmaTH,
                        cargo_talentoHumano: Empl_firmaTH_cargo,
                        abrevia_delegado: form5.abrevGAForm,
                        firma_delegado: idEmpl_firmaG,
                        cargo_delegado: Empl_firmaG_cargo,
                        abrevia_servidorPublico: form5.abrevHForm,
                        firma_servidorPublico: idEmpl_firmaS,
                        cargo_servidorPublico: Empl_firmaS_cargo,
                        fecha_servidorPublico: form5.fechaServidorForm == '' ? null : form5.fechaServidorForm,

                        abrevia_negativa: form5.abrevGForm,
                        firma_negativa: form5.idEmpleadoGForm,
                        fecha_negativa: form5.fechaNegativaF == '' ? null : form5.fechaNegativaF,
                        razon_negativa: form5.razonForm,

                        abrevia_RespElaboracion: form5.abrevRGForm,
                        firma_RespElaboracion: idEmpl_firmaRE,
                        cargo_RespElaboracion: Empl_firmaRE_cargo,
                        abrevia_RespRevision: form5.abrevRHForm,
                        firma_RespRevision: idEmpl_firmaRR,
                        cargo_RespRevision: Empl_firmaRR_cargo,
                        abrevia_RespRegistro_control: form5.abrevRRCForm,
                        firma_RespRegistro_control: idEmpl_firmaRC,
                        cargo_RespRegistro_control: Empl_firmaRC_cargo,
                      },

                      //parte formulario 6
                      formulario6: {
                        ComunicacionElect: form6.ComunicacionElectForm == '' ? false : form6.ComunicacionElectForm,
                        fechaComunicacion: form6.fechaComunicadoForm == '' ? null : form6.fechaComunicadoForm,
                        horaComunicado: form6.horaComunicadoForm == '' ? null :  hora_comuni,
                        medioComunicacionForm: form6.medioComunicacionForm == '' ? null : form6.medioComunicacionForm,
                        abrevCForm: form6.abrevCForm == '' ? null : form6.abrevCForm,
                        firma_Resp_Notificacion: form6.idEmpleadoCForm == '' ? null : form6.idEmpleadoCForm,
                      },

                      user_name: this.user_name,
                      ip: this.ip, ip_local: this.ips_locales,
                    };

                    console.log("informacion", datosAccion);
                    this.ValidacionesIngresos(form1, form2, datosAccion);

                })

              })

            })

          })

        })

      })

    })

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

    } else if (
      form1.tipoDecretoForm === undefined &&
      form2.tipoCargoForm === undefined
    ) {
      console.log("INGRESA 5", datosAccion);
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
      datosAccion.decre_acue_resol === "" ||
      datosAccion.decre_acue_resol === null
    ) {
      datosAccion.decre_acue_resol = null;
    }
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
    this.restAccion.IngresarPedidoAccion(datosAccion).subscribe((res) => {
      this.toastr.success(
        "Operación exitosa.",
        "Acción de Personal Registrada",
        {
          timeOut: 6000,
        }
      );
      this.router.navigate(["/listaPedidos/"]);
    });
  }

  habilitarformPosesion: boolean = false
  validarForm(formValue: any, stepper: any) {
    console.log('formValue: ',formValue);
    if (formValue.tipoProcesoForm == 'No registrado' || formValue.sucursalForm == 'No registrado' || formValue.NivelDepaForm == 'No registrado'
      || formValue.DepartamentoForm == 'No registrado' || formValue.grupoOcupacionalForm == 'No registrado' || formValue.gradoForm == 'No registrado'
      || formValue.tipoCargoForm == 'No registrado'
    ) {
      this.toastr.warning(
        "El empleado debe cumplir con los datos obligatorios de su situacion actual.",
        "Advertencia.", { timeOut: 5000, }
      );
      // Marca los campos como tocados para mostrar errores
      this.thirdFormGroup.markAllAsTouched();
    } else {

      this.habilitarformPosesion = formValue.habilitarForm4
      stepper.next();
    }
  }

  // METODO PARA INGRESAR SOLO LETRAS
  IngresarSoloLetras(e: any) {
    return this.validar.IngresarSoloLetras(e);
  }

  // METODO PARA INGRESAR SOLO NUMEROS
  IngresarSoloNumeros(evt: any) {
    return this.validar.IngresarSoloNumeros(evt);
  }

  //CONTROL BOTONES
  private tienePermiso(accion: string): boolean {
    const datosRecuperados = sessionStorage.getItem('paginaRol');
    if (datosRecuperados) {
      try {
        const datos = JSON.parse(datosRecuperados);
        return datos.some((item: any) => item.accion === accion);
      } catch {
        return false;
      }
    } else {
      // Si no hay datos, se permite si el rol es 1 (Admin)
      return parseInt(localStorage.getItem('rol') || '0') === 1;
    }
  }

  getRegistrarPedidoAccionPersonal() {
    return this.tienePermiso('Registrar Pedido Acción Personal');
  }

}