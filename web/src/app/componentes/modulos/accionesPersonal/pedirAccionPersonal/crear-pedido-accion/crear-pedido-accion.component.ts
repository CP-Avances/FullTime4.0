
import { FormControl, Validators, FormGroup } from "@angular/forms";
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
  identificacionF = new FormControl("", [
    Validators.required,
    Validators.minLength(3),
  ]);
  
  otroDecretoF = new FormControl("", [Validators.minLength(3)]);
  otroCargoF = new FormControl("", [Validators.minLength(3)]);
  fechaDesdeF = new FormControl("", [Validators.required]);
  numPartidaF = new FormControl("", [Validators.required]);
  baseLegalForm = new FormControl("", [Validators.minLength(6)]);
  accionForm = new FormControl("");
  fechaF = new FormControl("", [Validators.required]);
  notificacionesPosesiones = new FormControl("");
  funcionesReemp = new FormControl("");
  fechaRigeDesde = new FormControl("", [Validators.required]);
  fechaRigeHasta = new FormControl("", [Validators.required]);
  otroAccionF = new FormControl("");
  idTipoAccion = new FormControl("");
  otroEspecificacion = new FormControl("");
  numPropuestaF = new FormControl("");
  descripcionP = new FormControl("");
  tipoProcesoF = new FormControl("");
  DepartamentoForm = new FormControl("");
  DepartamentoPropuestoForm = new FormControl("");
  grupoOcupacionalF = new FormControl("");
  gradoF = new FormControl("");
  funcionarioF = new FormControl("");
  idEmpleadoHF = new FormControl("");
  idEmpleadoGF = new FormControl("");
  idEmpleadoRF = new FormControl("");
  nombreReemp = new FormControl("");
  puestoReemp = new FormControl("");
  accionReemp = new FormControl("");
  fechaHastaF = new FormControl("");
  idEmpleadoF = new FormControl("");
  idEmpleadoRNF = new FormControl("");
  idDepaActual = new FormControl("");
  numPartidaI = new FormControl("");
  fechaReemp = new FormControl("");
  fechaActaF = new FormControl("");
  tipoCargoF = new FormControl("");
  idSucursal = new FormControl("");
  idSucursalPropues = new FormControl("");
  idDepa = new FormControl("");
  idDepaPropues = new FormControl("");
  idDepaAdminPropuesta = new FormControl("");
  idCiudad = new FormControl("");
  sueldoF = new FormControl("");
  abrevHF = new FormControl("");
  abrevGF = new FormControl("");
  actaF = new FormControl("");
  declaracionJuradaF = new FormControl(null);

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
    baseLegalForm: this.baseLegalForm
  });
  public thirdFormGroup = new FormGroup({
    numPartidaIForm: this.numPartidaI,
    numPropuestaForm: this.numPropuestaF,
    tipoProcesoForm: this.tipoProcesoF,
    DepartamentoForm: this.DepartamentoForm,
    DepartamentoPropuestoForm: this.DepartamentoPropuestoForm,
    idCiudad: this.idCiudad,
    tipoCargoForm: this.tipoCargoF,
    grupoOcupacionalForm: this.grupoOcupacionalF,
    gradoForm: this.gradoF,
    sueldoForm: this.sueldoF,
    actaForm: this.actaF,
  });
  public fourthFormGroup = new FormGroup({

    idEmpleadoRForm: this.idEmpleadoRF,
    idEmpleadoRNForm: this.idEmpleadoRNF,

    fechaActaForm: this.fechaActaF,
    idEmpleadoHForm: this.idEmpleadoHF,
    idEmpleadoGForm: this.idEmpleadoGF,
    
    otroCargoForm: this.otroCargoF,
    abrevHForm: this.abrevHF,
    abrevGForm: this.abrevGF,

    funcionesReempForm: this.funcionesReemp,
    nombreReempForm: this.nombreReemp,
    puestoReempForm: this.puestoReemp,
    accionReempForm: this.accionReemp,
    fechaReempForm: this.fechaReemp,
    posesionNotificacionForm: this.notificacionesPosesiones,
    descripcionPForm: this.descripcionP,
  });


  // INICIACION DE VARIABLES
  idEmpleadoLogueado: any;
  rolEmpleado: number; // VARIABLE DE ALMACENAMIENTO DE ROL DE EMPLEADO QUE INICIA SESION

  idUsuariosAcceso: Set<any> = new Set();

  empleados: any = [];
  sucursal: any = [];
  ciudades: any = [];
  departamento: any;
  departamentos: any = [];
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
    public restSu: SucursalService,
    public restDe: DepartamentosService,
    public restC: CiudadService,
    public restCargo: CatTipoCargosService,
    public router: Router,
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
      return this.departamentos.filter((info: any) =>
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
        console.log('procesos: ',this.procesos);
        this.filtroProceso = this.tipoProcesoF.valueChanges.pipe(
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
        console.log('grupoOcupacional: ',this.grupoOcupacional);
        this.filtroGrupoOcupacional = this.grupoOcupacionalF.valueChanges.pipe(
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
        console.log('grados: ',this.grados);
        this.filtroGrado = this.gradoF.valueChanges.pipe(
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
        console.log('cargos: ',this.cargos);
        this.filtroCargos = this.tipoCargoF.valueChanges.pipe(
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
      console.log('tipos_accion',this.tipos_accion)
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
          info.nombre.toUpperCase().includes(filterValue)
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

  onTipoAccionSeleccionado(e:MatAutocompleteSelectedEvent){
    console.log('e: ',e.option.value);
    if(e.option.value != undefined && e.option.value != null){
      this.tipos_accion.forEach(item => {
        if(item.nombre == e.option.value){
          this.secondFormGroup.controls['baseLegalForm'].setValue(item.base_legal);
        }
      });
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

      console.log('lista de empleado: ',this.empleados)

      // METODO PARA AUTOCOMPLETADO EN BUSQUEDA DE NOMBRES

      this.filtroNombre = this.idEmpleadoF.valueChanges.pipe(
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
      console.log('departamentos: ',this.departamentos)
      
      this.filtroDepartamentos = this.idDepa.valueChanges.pipe(
        startWith(""),
        map((value: any) => this._filtrarDeparta(value))
      );

      this.filtroDepartamentosProuesta = this.idDepaPropues.valueChanges.pipe(
        startWith(""),
        map((value: any) => this._filtrarDeparta(value))
      );

      this.filtroDeparAdministrativaProuesta = this.idDepaAdminPropuesta.valueChanges.pipe(
        startWith(""),
        map((value: any) => this._filtrarDeparta(value))
      );

    });
  }

  // METODO PARA OBTENER LISTA DE CIUDADES
  ObtenerCiudades() {
    this.ciudades = [];
    this.restC.ConsultarCiudades().subscribe((data) => {
      this.ciudades = data;
      //console.log("ciudades", this.ciudades);
      this.filtroCiudad = this.idCiudad.valueChanges.pipe(
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

  // METODO PARA REALIZAR EL REGISTRO DE ACCION DE PERSONAL
  InsertarAccionPersonal(form1: any, form2: any, form3: any, form4: any) {
    // CAMBIO EL APELLIDO Y NOMBRE DE LOS EMPLEADOS SELECCIONADOS A LETRAS MAYUSCULAS
    let datos1 = {
      informacion: form2.idEmpleadoForm.toUpperCase(),
    };
    let datos2 = {
      informacion: form3.idEmpleadoHForm.toUpperCase(),
    };
    let datos3 = {
      informacion: form3.idEmpleadoGForm.toUpperCase(),
    };
    let datos4 = {
      informacion: form3.idEmpleadoRForm.toUpperCase(),
    };
    let nombreCapitalizado = this.CapitalizarNombre(
      form4.nombreReempForm.split(" ")
    );

    // BUSQUEDA DE LOS DATOS DEL EMPLEADO QUE REALIZA EL PEDIDO DE ACCION DE PERSONAL
    this.restE.BuscarEmpleadoNombre(datos1).subscribe((empl1) => {
      var idEmpl_pedido = empl1[0].id;
      // BUSQUEDA DE LOS DATOS DEL EMPLEADO QUE REALIZA LA PRIMERA FIRMA
      this.restE.BuscarEmpleadoNombre(datos2).subscribe((empl2) => {
        var idEmpl_firmaH = empl2[0].id;
        // BUSQUEDA DE LOS DATOS DEL EMPLEADO QUE REALIZA LA SEGUNDA FIRMA
        this.restE.BuscarEmpleadoNombre(datos3).subscribe((empl3) => {
          var idEmpl_firmaG = empl3[0].id;
          this.restE.BuscarEmpleadoNombre(datos4).subscribe((empl4) => {
            var idEmpl_responsable = empl4[0].id;
            let idCiudadSeleccionada = this.ObtenerIdCiudadSeleccionada(
              form2.idCiudad
            );
            // INICIALIZAMOS EL ARRAY CON TODOS LOS DATOS DEL PEDIDO
            let datosAccion = {
              id_empleado: idEmpl_pedido,
              fec_creacion: form1.fechaForm,
              fec_rige_desde: this.validar.DarFormatoFecha(form2.fechaDesdeForm, "yyyy-MM-dd"),
              fec_rige_hasta: form2.fechaHastaForm !== null ?
                (this.validar.DarFormatoFecha(form2.fechaHastaForm, "yyyy-MM-dd")) : null,
              identi_accion_p: form1.identificacionForm,
              num_partida: form2.numPartidaForm,
              decre_acue_resol: form1.tipoDecretoForm,
              abrev_empl_uno: form3.abrevHForm,
              firma_empl_uno: idEmpl_firmaH,
              abrev_empl_dos: form3.abrevGForm,
              firma_empl_dos: idEmpl_firmaG,
              adicion_legal: form2.baseLegalForm,
              tipo_accion: form1.accionForm,
              cargo_propuesto: form2.tipoCargoForm,
              proceso_propuesto: form2.tipoProcesoForm,
              num_partida_propuesta: form2.numPropuestaForm,
              salario_propuesto: form2.sueldoForm,
              id_ciudad: idCiudadSeleccionada,
              id_empl_responsable: idEmpl_responsable,
              num_partida_individual: form2.numPartidaIForm,
              act_final_concurso: form3.actaForm,
              fec_act_final_concurso: form3.fechaActaForm !== null ?
                (this.validar.DarFormatoFecha(form3.fechaActaForm, "yyyy-MM-dd")) : null,
              nombre_reemp: nombreCapitalizado,
              puesto_reemp: form4.puestoReempForm,
              funciones_reemp: form4.funcionesReempForm,
              num_accion_reemp: form4.accionReempForm,
              primera_fecha_reemp: form4.fechaReempForm !== null ?
                (this.validar.DarFormatoFecha(form4.fechaReempForm, "yyyy-MM-dd")) : null,
              posesion_notificacion: form4.posesionNotificacionForm,
              descripcion_pose_noti: form4.descripcionPForm,
              user_name: this.user_name,
              ip: this.ip, ip_local: this.ips_locales,
            };
            // VALIDAR QUE FECHAS SE ENCUENTREN BIEN INGRESADA
            if (form4.fechaReempForm === "" || form4.fechaReempForm === null) {
              datosAccion.primera_fecha_reemp = null;
            }

            if (form2.fechaHastaForm === "" || form2.fechaHastaForm === null) {
              datosAccion.fec_rige_hasta = null;
              console.log("informacion", datosAccion);
              this.ValidacionesIngresos(form1, form2, datosAccion);
            } else {
              if (
                Date.parse(form2.fechaDesdeForm) <
                Date.parse(form2.fechaHastaForm)
              ) {
                this.ValidacionesIngresos(form1, form2, datosAccion);
              } else {
                this.toastr.info(
                  "Las fechas ingresadas no son las correctas.",
                  "Revisar los datos ingresados.",
                  {
                    timeOut: 6000,
                  }
                );
              }
            }
          });
        });
      });
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
     
    } else if (
      form1.tipoDecretoForm === undefined &&
      form2.tipoCargoForm === undefined
    ) {
      console.log("INGRESA 5", datosAccion);

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

  getRegistrarPedidoAccionPersonal(){
    return this.tienePermiso('Registrar Pedido Acción Personal');
  }

}
