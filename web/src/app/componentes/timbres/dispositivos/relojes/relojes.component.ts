import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

import { DepartamentosService } from 'src/app/servicios/catalogos/catDepartamentos/departamentos.service';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { AsignacionesService } from 'src/app/servicios/asignaciones/asignaciones.service';
import { SucursalService } from 'src/app/servicios/sucursales/sucursal.service';
import { RelojesService } from 'src/app/servicios/catalogos/catRelojes/relojes.service';
import { map, Observable, startWith } from 'rxjs';

@Component({
  selector: 'app-relojes',
  templateUrl: './relojes.component.html',
  styleUrls: ['./relojes.component.css'],
})

export class RelojesComponent implements OnInit {

  // VARIABLES DE ALMACENAMIENTO
  zonas_horarias: any = [];
  sucursales: any = [];
  departamento: any = [];
  registrar: boolean = true;
  totalDispositivos: number = 0;
  numeroDipositivos: number = 0;

  idEmpleadoLogueado: any;
  rolEmpleado: number; // VARIABLE DE ALMACENAMIENTO DE ROL DE EMPLEADO QUE INICIA SESION

  idUsuariosAcceso: Set<any> = new Set();
  idSucursalesAcceso: Set<any> = new Set();
  idDepartamentosAcceso: Set<any> = new Set();

  // CONTROL DE FORMULARIOS
  isLinear = true;
  primerFormulario: FormGroup;
  segundoFormulario: FormGroup;

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  // CONTROL DE CAMPOS Y VALIDACIONES DEL FORMULARIO

  // PRIMER FORMULARIO
  ipF = new FormControl('', [Validators.required, Validators.pattern(/^(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)$/)]);
  nombreF = new FormControl('', [Validators.required, Validators.minLength(4)]);
  puertoF = new FormControl('', [Validators.required]);
  codigoF = new FormControl('', Validators.required);
  funcionesF = new FormControl('', [Validators.required]);
  temperaturaF = new FormControl('', [Validators.required]);
  idSucursalF = new FormControl('', Validators.required);
  idDepartamentoF = new FormControl('', [Validators.required]);

  // SEGUNDO FORMULARIO
  macF = new FormControl('');
  marcaF = new FormControl('', [Validators.required]);
  serieF = new FormControl('', [Validators.required, Validators.minLength(4)]);
  modeloF = new FormControl('', [Validators.minLength(3)]);
  fabricanteF = new FormControl('', [Validators.minLength(4)]);
  contraseniaF = new FormControl('', [Validators.minLength(1)]);
  idFabricacionF = new FormControl('', [Validators.minLength(4)]);
  zonasF = new FormControl('', Validators.required);
  filteredOptions: Observable<any[]>;

  constructor(
    private restCatDepartamento: DepartamentosService,
    private restSucursales: SucursalService,
    private asignaciones: AsignacionesService,
    private formulario: FormBuilder,
    private validar: ValidacionesService,
    private toastr: ToastrService,
    private router: Router,
    private rest: RelojesService,
  ) {
    this.idEmpleadoLogueado = parseInt(localStorage.getItem('empleado') as string);
  }

  ngOnInit(): void {
    this.totalDispositivos = 15;
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');
    this.rolEmpleado = parseInt(localStorage.getItem('rol') as string);
    
    this.idDepartamentosAcceso = this.asignaciones.idDepartamentosAcceso;
    this.idSucursalesAcceso = this.asignaciones.idSucursalesAcceso;
    this.idUsuariosAcceso = this.asignaciones.idUsuariosAcceso;

    this.FiltrarSucursales();
    this.ValidarFormulario();
    this.ContarDispositivos();
    this.LeerZonasHorarias();

  }

  // METODO PARA BUSCAR ZONAS HORARIAS
  LeerZonasHorarias() {
    this.zonas_horarias = [];
    this.rest.ConsultarZonasHorarias().subscribe(response => {
      this.zonas_horarias = response;

      this.filteredOptions = this.zonasF.valueChanges
        .pipe(
          startWith(''),
          map((value: any) => this._filter(value))
        );
    });
  }

  // METODO DE FILTRACION DE DATOS DE ZONAS HORARIAS -- POR NOMBRE --POR FORMATO -- POR NUMERO
  private _filter(value: string): any {
    if (value != null) {
      const filterValue = value.toLowerCase();
      return this.zonas_horarias.filter((z: any) =>
        z.formato_nombre.toLowerCase().includes(filterValue) ||
        z.formato_gmt.toLowerCase().includes(filterValue) ||
        z.formato_gmt.replace('GMT', '').includes(filterValue)
      );
    }
  }

  // METODO PARA CONTAR DIPOSITIVOS
  ContarDispositivos() {
    this.numeroDipositivos = 0;
    this.rest.ContarRelojes().subscribe(response => {
      this.numeroDipositivos = parseInt(response.total) + 1;
      //console.log('relojes ', this.numeroDipositivos)
      if (this.numeroDipositivos > this.totalDispositivos) {
        this.toastr.info('No tienes permitido realizar más registros.', 'Has alcanzado el límite máximo de dispositivos.', {
          timeOut: 6000,
        })
        this.CerrarVentana();
      }
    });
  }

  // VALIDACIONES DE FORMULARIO
  ValidarFormulario() {
    this.primerFormulario = this.formulario.group({
      ipForm: this.ipF,
      nombreForm: this.nombreF,
      puertoForm: this.puertoF,
      codigoForm: this.codigoF,
      funcionesForm: this.funcionesF,
      temperaturaForm: this.temperaturaF,
      idSucursalForm: this.idSucursalF,
      idDepartamentoForm: this.idDepartamentoF,
    });
    this.segundoFormulario = this.formulario.group({
      macForm: this.macF,
      zonaForm: this.zonasF,
      marcaForm: this.marcaF,
      serieForm: this.serieF,
      modeloForm: this.modeloF,
      fabricanteForm: this.fabricanteF,
      contraseniaForm: this.contraseniaF,
      idFabricacionForm: this.idFabricacionF,
    });
  }

  // METODO PARA LISTAR ESTABLECIMIENTOS
  FiltrarSucursales() {
    let idEmpre = parseInt(localStorage.getItem('empresa') as string);
    this.sucursales = [];
    this.restSucursales.BuscarSucursalEmpresa(idEmpre).subscribe(datos => {
      this.sucursales = this.rolEmpleado === 1 ? datos : this.FiltrarSucursalesAsignadas(datos);
    }, error => {
      this.toastr.info('No se han encntrado registros de establecimientos.', '', {
        timeOut: 6000,
      })
    })
  }

  // METODO PARA FILTRAR SUCURSALES ASIGNADAS
  FiltrarSucursalesAsignadas(data: any) {
    return data.filter((sucursal: any) => this.idSucursalesAcceso.has(sucursal.id));
  }

  // METODO PARA LISTAR DEPARTAMENTOS DE ESTABLECIMIENTO
  ObtenerDepartamentos(form: any) {
    this.departamento = [];
    let idSucursal = form.idSucursalForm;
    this.restCatDepartamento.BuscarDepartamentoSucursal(idSucursal).subscribe(datos => {
      this.departamento = this.rolEmpleado === 1 ? datos : this.FiltrarDepartamentosAsignados(datos);
    }, error => {
      this.toastr.info('Sucursal no cuenta con departamentos registrados.', '', {
        timeOut: 6000,
      })
    });
  }

  // METODO PARA FILTRAR DEPARTAMENTOS ASIGNADOS
  FiltrarDepartamentosAsignados(data: any) {
    return data.filter((departamento: any) => this.idDepartamentosAcceso.has(departamento.id));
  }


  // METODO PARA REGISTRAR DISPOSITIVO
  InsertarReloj(form1: any, form2: any) {
    // VALIDAR DIRECCION MAC
    const direccMac = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$|^[0-9A-Fa-f]{12}$/;
    const zona = form2.zonaForm;
    const [nombre, formatogmt] = zona.split(" ("); // DIVIDIMOS EN DOS PARTES
    const gmt = formatogmt.slice(0, -1); // QUITAMOS EL ULTIMO PARENTESIS

    let reloj = {
      // PRIMER FORMULARIO
      ip: form1.ipForm,
      codigo: form1.codigoForm,
      nombre: form1.nombreForm,
      puerto: form1.puertoForm,
      id_sucursal: form1.idSucursalForm,
      tipo_conexion: form1.funcionesForm,
      id_departamento: form1.idDepartamentoForm,
      temperatura: form1.temperaturaForm,

      // SEGUNDO FORMULARIO
      mac: form2.macForm,
      serie: form2.serieForm,
      marca: form2.marcaForm,
      modelo: form2.modeloForm,
      fabricante: form2.fabricanteForm,
      contrasenia: form2.contraseniaForm,
      id_fabricacion: form2.idFabricacionForm,
      formato_gmt_dispositivo: gmt,
      zona_horaria_dispositivo: nombre,
      user_name: this.user_name,
      user_ip: this.ip,
    };
    console.log('form2 ', form2.zonaForm)
    console.log(`Nombre: ${nombre}`);
    console.log(`GMT: ${gmt}`);
    console.log('ver form ', reloj)

    // VALIDAR DIRECCION MAC
    if (reloj.mac != '') {
      if (direccMac.test(reloj.mac.toString())) {
        this.GuardarSistema(reloj);
      } else {
        this.toastr.warning('MAC ingresada no es válida.',
          'Ups!!! algo salio mal.', {
          timeOut: 6000,
        })
      }
    }
    else {
      this.GuardarSistema(reloj);
    }
  }

  // METODO PARA ALMACENAR LOS DATOS EN LA BASE
  GuardarSistema(reloj: any) {
    this.rest.CrearNuevoReloj(reloj).subscribe(response => {
      if (response.message === 'guardado') {
        this.LimpiarCampos();
        this.VerDatosReloj(response.reloj.id);
        this.toastr.success('Operación exitosa.', 'Registro guardado.', {
          timeOut: 6000,
        })
      }
      else if (response.message === 'existe') {
        this.toastr.warning('Código o serie del equipo ya existe en el sistema.',
          'Ups!!! algo salio mal.', {
          timeOut: 6000,
        })
      }
      else if (response.message === 'error') {
        this.toastr.warning('IP ingresada ya existe en el sistema.',
          'Ups!!! algo salio mal.', {
          timeOut: 6000,
        })
      }
    });
  }

  // MENSAJES DE ERRORES
  ObtenerMensajeErrorIp() {
    if (this.ipF.hasError('pattern')) {
      return 'Ingresar IP Ej: 0.0.0.0';
    }
  }

  // METODO PARA VALIDAR INGRESO DE IP
  IngresarIp(evt: any) {
    if (window.event) {
      var keynum = evt.keyCode;
    }
    else {
      keynum = evt.which;
    }
    // COMPROBAMOS SI SE ENCUENTRA EN EL RANGO NUMERICO Y QUE TECLAS NO RECIBIRA.
    if ((keynum > 47 && keynum < 58) || keynum == 8 || keynum == 13 || keynum == 6 || keynum == 46) {
      return true;
    }
    else {
      this.toastr.info('No se admite el ingreso de letras.', 'Usar solo números.', {
        timeOut: 6000,
      })
      return false;
    }
  }

  // METODO PARA INGRESAR SOLO NUMEROS
  IngresarSoloNumeros(evt: any) {
    return this.validar.IngresarSoloNumeros(evt);
  }

  // METODO PARA LIMPIAR FORMULARIO
  LimpiarCampos() {
    this.primerFormulario.reset();
    this.segundoFormulario.reset();
  }

  // METODO PARA CERRAR VENTANA
  CerrarVentana() {
    this.LimpiarCampos();
    this.router.navigate(['/listarRelojes']);
  }

  // METODO PARA VER DATOS DE RELOJ
  ver_datos: boolean = false;
  reloj_id: number;
  pagina: string = '';
  VerDatosReloj(id: number) {
    this.reloj_id = id;
    this.ver_datos = true;
    this.registrar = false;
    this.pagina = 'registrar-reloj';
  }

}