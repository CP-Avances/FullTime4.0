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
    private cdRef: ChangeDetectorRef
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
    this.VerificarCodigo();
    this.AsignarFormulario();
    this.ObtenerNacionalidades();
    this.ObtenerEstadoCivil()
    this.ObtenerGeneros();

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
        console.log("this.identificacion", this.identificacion)
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

  // METODO PARA REGISTRAR EMPLEADO
  InsertarEmpleado(form1: any, form2: any, form3: any) {
    // BUSCA EL ID DE LA NACIONALIDAD ELEGIDA EN EL AUTOCOMPLETADO
    this.nacionalidades.forEach((obj: any) => {
      if (form2.nacionalidadForm == obj.nombre) {
        this.idNacionalidad = obj.id;
      }
    });

    // REALIZAR UN CAPITAL LETTER A LOS NOMBRES
    var NombreCapitalizado: any;
    let nombres = form1.nombreForm.split(' ');
    if (nombres.length > 1) {
      let name1 = nombres[0].charAt(0).toUpperCase() + nombres[0].slice(1);
      let name2 = nombres[1].charAt(0).toUpperCase() + nombres[1].slice(1);
      NombreCapitalizado = name1 + ' ' + name2;
    }
    else {
      let name1 = nombres[0].charAt(0).toUpperCase() + nombres[0].slice(1);
      var NombreCapitalizado = name1
    }

    // REALIZAR UN CAPITAL LETTER A LOS APELLIDOS
    var ApellidoCapitalizado: any;
    let apellidos = form1.apellidoForm.split(' ');
    if (apellidos.length > 1) {
      let lastname1 = apellidos[0].charAt(0).toUpperCase() + apellidos[0].slice(1);
      let lastname2 = apellidos[1].charAt(0).toUpperCase() + apellidos[1].slice(1);
      ApellidoCapitalizado = lastname1 + ' ' + lastname2;
    }
    else {
      let lastname1 = apellidos[0].charAt(0).toUpperCase() + apellidos[0].slice(1);
      ApellidoCapitalizado = lastname1
    }

    // CAPTURAR DATOS DEL FORMULARIO
    let empleado = {
      id_nacionalidad: this.idNacionalidad,
      fec_nacimiento: form1.fechaForm,
      esta_civil: form2.estadoCivilForm,
      domicilio: form2.domicilioForm,
      apellido: ApellidoCapitalizado,
      telefono: form2.telefonoForm,
      cedula: form1.cedulaForm,
      nombre: NombreCapitalizado,
      genero: form2.generoForm,
      correo: form1.emailForm,
      codigo: form1.codigoForm,
      estado: 1,
      user_name: this.user_name,
      ip: this.ip, ip_local: this.ips_locales
    };

    // CONTADOR 0 EL REGISTRO SE REALIZA UNA SOL VEZ, CONTADOR 1 SE DIO UN ERROR Y SE REALIZA NUEVAMENTE EL PROCESO
    if (this.contador === 0) {
      this.rest.RegistrarEmpleados(empleado).subscribe(response => {
        if (response.message === 'error') {
          this.toastr.error('Cédula o código de usuario ya se encuentran registrados.', 'Ups!!! algo salio mal.', {
            timeOut: 6000,
          });
        }
        else {
          this.empleadoGuardado = response;
          this.GuardarDatosUsuario(form3, this.empleadoGuardado.id, form1);

        }
      });
    }
    else {
      this.GuardarDatosUsuario(form3, this.empleadoGuardado.id, form1);
    }
  }

  // METODO PARA GUARDAR DATOS DE USUARIO
  contador: number = 0;
  GuardarDatosUsuario(form3: any, id: any, form1: any) {
    // CIFRADO DE CONTRASEÑA
    let clave = form3.passForm.toString();
    let dataUser = {
      id_empleado: id,
      contrasena: clave,
      usuario: form3.userForm,
      id_rol: form3.rolForm,
      estado: true,
      user_name: this.user_name,
      ip: this.ip, ip_local: this.ips_locales,
    }
    this.user.RegistrarUsuario(dataUser).subscribe(data => {
      if (data.message === 'error') {
        this.toastr.error('Nombre de usuario ya se encuentra registrado.', 'Ups!!! algo salio mal.', {
          timeOut: 6000,
        });
        this.contador = 1;
      }
      else {
        this.ActualizarCodigo(form1.codigoForm);
        this.VerDatos(id);
        this.toastr.success('Operación exitosa.', 'Registro guardado.', {
          timeOut: 6000,
        });
        this.LimpiarCampos();
        this.contador = 0;
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



  CambiarIdentificacion(ob: MatRadioChange){
    this.identificacion=ob.value;
  }

  cedulaValida:boolean=false;
  ValidarCedula(cedula: any) {
    console.log("entra a validar Cedula", cedula);
    const inputElement = cedula.cedulaForm;
  
    const cad: string = inputElement;
    let total: number = 0;
    const longitud: number = cad.length;
    const longcheck: number = longitud - 1;
  
    // 👉 Si es menos de 10 dígitos, marcar como inválido
    if (longitud < 10) {
      this.cedulaValida = false;
      this.cdRef.detectChanges();
      this.primeroFormGroup.controls['cedulaForm'].setErrors({ minlength: true });
      console.log("Cédula con menos de 10 dígitos");
      return; // salir
    }
  
    // 👉 Validación normal si tiene 10 dígitos
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
  
      if (parseInt(cad.charAt(longitud - 1), 10) === total) {
        this.cedulaValida = true;
        console.log("Cédula Válida");
      } else {
        this.cedulaValida = false;
        this.cdRef.detectChanges();
        this.primeroFormGroup.controls['cedulaForm'].setErrors({ invalidCedula: true });
        console.log("Cédula Inválida");
      }
    }
  }
  


  pasaporteValida:boolean=false;
  ValidarPasaporte(pasaporte:any){


  }


}


