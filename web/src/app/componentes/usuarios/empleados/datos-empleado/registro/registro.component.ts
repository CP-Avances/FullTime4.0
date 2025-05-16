// SECCION DE LIBRERIAS
import { FormGroup, Validators, FormBuilder, FormControl, FormsModule  } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { startWith, map } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr'
import { Observable } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { MatRadioChange } from '@angular/material/radio';
import { ChangeDetectorRef } from '@angular/core';

// SECCION DE SERVICIOS
import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';
import { EmpleadoService } from 'src/app/servicios/usuarios/empleado/empleadoRegistro/empleado.service';
import { UsuarioService } from 'src/app/servicios/usuarios/usuario/usuario.service';
import { RolesService } from 'src/app/servicios/configuracion/parametrizacion/catRoles/roles.service';
import { GenerosService } from 'src/app/servicios/usuarios/catGeneros/generos.service';
import { EstadoCivilService } from 'src/app/servicios/usuarios/catEstadoCivil/estado-civil.service';
import { ParametrosService } from 'src/app/servicios/configuracion/parametrizacion/parametrosGenerales/parametros.service';

@Component({
  selector: 'app-registro',
  standalone: false,
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.css'],
})

export class RegistroComponent implements OnInit {
  ips_locales: any = '';

  empleadoGuardado: any = [];
  nacionalidades: any = [];
  escritura = false;
  cedula = false;
  roles: any = [];
  hide = true;

  private idNacionalidad: number;

  isLinear = true;
  primeroFormGroup: FormGroup;
  segundoFormGroup: FormGroup;
  terceroFormGroup: FormGroup;

  NacionalidadControl = new FormControl('', Validators.required);
  filteredOptions: Observable<any[]>;

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  constructor(
    private rol: RolesService,
    private rest: EmpleadoService,
    private user: UsuarioService,
    private toastr: ToastrService,
    private router: Router,
    private _formBuilder: FormBuilder,
    public validar: ValidacionesService,
    public ventana: MatDialog,
    public generoS: GenerosService,
    public estadoS: EstadoCivilService,
    private cdRef: ChangeDetectorRef,
    private restParametros: ParametrosService,

  ) {

  }
   identificacion ="Cedula"

  ngOnInit(): void {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');
    this.validar.ObtenerIPsLocales().then((ips) => {
      this.ips_locales = ips;
    });

    this.CargarRoles();
    this.SincronizarYVerificarCodigo();
    this.AsignarFormulario();
    this.ObtenerNacionalidades();
    this.ObtenerEstadoCivil()
    this.ObtenerGeneros();
    this.CargarEstadoValidacionCedula();
  }

  // METODO DE FILTRACION DE DATOS DE NACIONALIDAD
  private _filter(value: string): any {
    if (value != null) {
      const filterValue = value.toLowerCase();
      return this.nacionalidades.filter((nacionalidades: any) => nacionalidades.nombre.toLowerCase().includes(filterValue));
    }
  }

  // METODO PARA BUSCAR NACIONALIDADES
  ObtenerNacionalidades() {
    this.rest.BuscarNacionalidades().subscribe(res => {
      this.nacionalidades = res;
      this.filteredOptions = this.NacionalidadControl.valueChanges
        .pipe(
          startWith(''),
          map((value: any) => this._filter(value))
        );
    });
  }

  // METODO PARA LISTAR ROLES
  CargarRoles() {
    this.rol.BuscarRoles().subscribe(data => {
      this.roles = data;
    });
  }

  // METODO PARA VALIDAR CAMPOS DE FORMULARIO
  AsignarFormulario() {
    this.primeroFormGroup = this._formBuilder.group({
      apellidoForm: [''],
      nombreForm: [''],
      cedulaForm: ['', Validators.required],
      codigoForm: [''],
      emailForm: ['', Validators.email],
      fechaForm: ['', Validators.required],
      tipoIdentificacionForm: ['', Validators.required],
    });
    this.segundoFormGroup = this._formBuilder.group({
      nacionalidadForm: this.NacionalidadControl,
      estadoCivilForm: ['', Validators.required],
      domicilioForm: [''],
      telefonoForm: [''],
      generoForm: ['', Validators.required],
    });
    this.terceroFormGroup = this._formBuilder.group({
      userForm: ['', Validators.required],
      passForm: ['', Validators.required],
      rolForm: ['', Validators.required],
      partidaForm: [''],
    });
  }

  // METODO DE VALIDACION DE INGRESO DE CODIGO DE FORMA MANUAL O AUTOMATICO
  datosCodigo: any = [];
  VerificarCodigo() {
    this.datosCodigo = [];
    this.rest.ObtenerCodigo().subscribe(datos => {
      this.datosCodigo = datos[0];
      if (this.datosCodigo.automatico === true) {
        this.primeroFormGroup.patchValue({
          codigoForm: parseInt(this.datosCodigo.valor) + 1
        })
        this.escritura = true;
      }
      else if (this.datosCodigo.cedula === true) {
        if(this.identificacion == 'Pasaporte')
        {
          this.escritura = false;
          this.cedula = false;
        }else{
          this.cedula = true;
          this.escritura = true;
        }

      }
      else {

        this.escritura = false;

      }

    }, error => {
      this.toastr.info('Configurar ingreso de código de usuarios.', '', {
        timeOut: 6000,
      });
      this.router.navigate(['/codigo/']);
    });
  }

  //VERIFICA EL VALOR MAS ALTO CUANDO ESTA EN AUTOMATICO EL CODIGO EN TABLA e_codigo PARA EVITAR ERRORES DE CRUCE DE CODIGO
  SincronizarYVerificarCodigo() {
    this.rest.ObtenerCodigo().subscribe(config => {
      this.datosCodigo = config[0];
      if (this.datosCodigo.automatico === true) {
        this.rest.ObtenerCodigoMAX().subscribe(max => {
          const maximo = parseInt(max[0].codigo) || 0;
          const actualValor = parseInt(this.datosCodigo.valor) || 0;
          if (maximo > actualValor) {
            const dataCodigo = {
              id: 1,
              valor: maximo,
              manual: this.datosCodigo.manual,
              automatico: this.datosCodigo.automatico,
              identificacion: this.datosCodigo.cedula,
              user_name: this.user_name,
              ip: this.ip,
              ip_local: this.ips_locales,
            };
            this.rest.ActualizarCodigoTotal(dataCodigo).subscribe(() => {
              this.VerificarCodigo();
            }, error => {
              this.toastr.info('No se pudo actualizar el código automáticamente.', '', { timeOut: 6000 });
              this.VerificarCodigo();
            });
          } else {
            this.VerificarCodigo();
          }
        }, error => {
          this.toastr.info('No se pudo obtener el código máximo.', '', { timeOut: 6000 });
          this.VerificarCodigo();
        });
      } else {
        this.VerificarCodigo(); 
      }
    }, error => {
      this.toastr.info('Configurar ingreso de código de usuarios.', '', {
        timeOut: 6000,
      });
      this.router.navigate(['/codigo/']);
    });
  }  

  // METODO PARA REGISTRAR EMPLEADO
  InsertarEmpleado(form1: any, form2: any, form3: any) {
    this.nacionalidades.forEach((obj: any) => {
      if (form2.nacionalidadForm == obj.nombre) {
        this.idNacionalidad = obj.id;
      }
    });
    const capitalizar = (texto: string) => texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
    const NombreCapitalizado = form1.nombreForm.split(' ').map(capitalizar).join(' ');
    const ApellidoCapitalizado = form1.apellidoForm.split(' ').map(capitalizar).join(' ');
    const empleado = {
      id_nacionalidad: this.idNacionalidad,
      fec_nacimiento: form1.fechaForm,
      esta_civil: form2.estadoCivilForm,
      domicilio: form2.domicilioForm,
      apellido: ApellidoCapitalizado,
      telefono: form2.telefonoForm,
      identificacion: form1.cedulaForm,
      tipo_identificacion: form1.tipoIdentificacionForm === 'Cedula' ? 1 : 2,
      nombre: NombreCapitalizado,
      genero: form2.generoForm,
      correo: form1.emailForm,
      codigo: form1.codigoForm,
      estado: 1,
      numero_partida_individual: form3.partidaForm,
      user_name: this.user_name,
      ip: this.ip,
      ip_local: this.ips_locales,
    };
    if (this.empleadoGuardado && this.empleadoGuardado.id) {
      this.GuardarDatosUsuario(form3, this.empleadoGuardado.id, form1);
      return;
    }
    this.rest.RegistrarEmpleados(empleado).subscribe({
      next: (response) => {
        if (response.message === 'error') {
          this.toastr.error('Identificación o código ya se encuentran registrados.', 'Ups! algo salió mal.', {
            timeOut: 6000,
          });
        } else {
          this.empleadoGuardado = response;
          this.GuardarDatosUsuario(form3, this.empleadoGuardado.id, form1);
        }
      },
      error: () => {
        this.toastr.error('La identificación ya está registrada en el sistema.', 'Error al registrar empleado.', {
          timeOut: 6000,
        });
      }
    });
  }

  // METODO PARA GUARDAR DATOS DE USUARIO
  GuardarDatosUsuario(form3: any, id: any, form1: any) {
    const clave = form3.passForm.toString();
    const dataUser = {
      id_empleado: id,
      contrasena: clave,
      usuario: form3.userForm,
      id_rol: form3.rolForm,
      estado: true,
      user_name: this.user_name,
      ip: this.ip,
      ip_local: this.ips_locales,
    };
    this.user.RegistrarUsuario(dataUser).subscribe({
      next: (data) => {
        if (data.message === 'error') {
          this.toastr.error('Nombre de usuario ya se encuentra registrado.', 'Ups! algo salió mal.', {
            timeOut: 6000,
          });
        } else {
          this.ActualizarCodigo(form1.codigoForm);
          this.VerDatos(id);
          this.toastr.success('Operación exitosa.', 'Registro guardado.', {
            timeOut: 6000,
          });
          this.LimpiarCampos();
          this.empleadoGuardado = null; 
        }
      },
      error: () => {
        this.toastr.error('No se pudo registrar el usuario.', 'Error inesperado', {
          timeOut: 6000,
        });
      }
    });
  }

  // METODO PARA INGRESAR A FICHA DEL USUARIO
  VerDatos(id: string) {
    this.router.navigate(['/verEmpleado/', id]);
  }

  // ACTUALIZACION DE CODIGO DE USUARIO
  ActualizarCodigo(codigo: any) {
    if (this.datosCodigo.automatico === true) {
      let dataCodigo = {
        valor: codigo,
        id: 1,
        user_name: this.user_name,
        ip: this.ip, ip_local: this.ips_locales
      }
      this.rest.ActualizarCodigo(dataCodigo).subscribe(res => {
      })
    }
  }

  // METODO DE VALIDACION DE INGRESO DE LETRAS
  IngresarSoloLetras(e: any) {
    let key = e.keyCode || e.which;
    let tecla = String.fromCharCode(key).toString();
    const patron = /^[a-zA-Z\s]*$/
    if (!patron.test(tecla)) {
      this.toastr.info('No se admite datos numéricos o caracteres especiales', 'Usar solo letras', {
        timeOut: 6000,
      });
      return false;
    }
  }


  // METODO DE VALIDACION DE INGRESO DE NUMEROS

  IngresarSoloNumeros(evt: any) {
    return this.validar.IngresarSoloNumeros(evt);
  }

  IngresarSoloLetrasNumeros(e: any) {
    let key = e.keyCode || e.which;
    let tecla = String.fromCharCode(key).toString();
    // SE DEFINE TODO EL CONJUNTO DE CARACTERES PERMITIDOS.
    const patron = /^[a-zA-Z0-9]*$/;

    if (!patron.test(tecla)) {
      this.toastr.info('No se admite caracteres especiales', 'Usar solo letras y números', {
        timeOut: 6000,
      });
      return false;
    }
  }

  // METODO PARA COLOCAR EL CODIGO SIMILAR AL CAMPO CEDULA
  LlenarCodigo(form1: any) {

    if (this.cedula) {
      let codigo: number = form1.cedulaForm;
      this.primeroFormGroup.patchValue({
        codigoForm: codigo
      })
    }
  }


  // METODO PARA LIMPIAR FORMULARIOS
  LimpiarCampos() {
    this.primeroFormGroup.reset();
    this.segundoFormGroup.reset();
    this.terceroFormGroup.reset();
  }

  estados_civil: any = []
  // METODO PARA LISTAR NACIONALIDADES
  ObtenerEstadoCivil() {
    this.estadoS.ListarEstadoCivil().subscribe(res => {
      this.estados_civil = res;
    });
  }

  // METODO PARA LISTAR NACIONALIDADES
  generos: any = []

  ObtenerGeneros() {
    this.generoS.ListarGeneros().subscribe(res => {
      this.generos = res;
    });
  }


  //METODO QUE DETECTA EL CAMBIO EN TIPO DE IDENTIFICACION DE CEDULA A PASAPORTE
  CambiarIdentificacion(ob: MatRadioChange) {
    this.identificacion = ob.value;
    const valor = this.primeroFormGroup.get('cedulaForm')?.value;
  
    if (this.identificacion === 'Cedula') {
      this.ValidarCedula({ cedulaForm: valor }); 
    } else {
      this.cedulaValida = true;
      this.pasaporteValida = true;
      this.primeroFormGroup.get('cedulaForm')?.setErrors(null); 
    }
  }

  //METODO QUE VALIDA LA CEDULA POR ALGORITMO
  cedulaValida: boolean = false;
  ValidarCedula(cedula: any) {
    if (!this.validarCedulaActiva) {
      this.cedulaValida = true;
      this.primeroFormGroup.controls['cedulaForm'].setErrors(null);
      return;
    }
    const inputElement = cedula.cedulaForm;
    const cad: string = inputElement;
    let total: number = 0;
    const longitud: number = cad.length;
    const longcheck: number = longitud - 1;
  
    if (longitud < 10) {
      this.cedulaValida = false;
      this.cdRef.detectChanges();
      this.primeroFormGroup.controls['cedulaForm'].setErrors({ minlength: true });
      return;
    }
  
    if (cad !== "" && longitud === 10) {
      for (let i = 0; i < longcheck; i++) {
        let num = parseInt(cad.charAt(i), 10);
        if (isNaN(num)) return;
  
        if (i % 2 === 0) {
          num *= 2;
          if (num > 9) num -= 9;
        }
        total += num;
      }
  
      total = total % 10 ? 10 - (total % 10) : 0;
  
      if (parseInt(cad.charAt(longcheck), 10) === total) {
        this.cedulaValida = true;
        this.primeroFormGroup.controls['cedulaForm'].setErrors(null); 
      } else {
        this.cedulaValida = false;
        this.cdRef.detectChanges();
        this.primeroFormGroup.controls['cedulaForm'].setErrors({ invalidCedula: true });
      }
    }
  }
  

  //METODO PARA OBTENER EL  DETALLE DEL PARAMETRO VALIDAR CEDULA (ACTIVADO/DESACTIVADO)
  validarCedulaActiva: boolean = true;
  CargarEstadoValidacionCedula() {
    this.restParametros.BuscarDetallesParametros().subscribe(detalles => {
      const parametro36 = detalles.find((d: any) => d.id_parametro === 36);
      this.validarCedulaActiva = parametro36?.descripcion?.toLowerCase() !== 'no';
    });
  }

  pasaporteValida:boolean=false;
  ValidarPasaporte(pasaporte:any){

  }
}


