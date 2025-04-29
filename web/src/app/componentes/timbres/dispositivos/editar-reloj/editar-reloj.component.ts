import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Component, OnInit, Input } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

import { DepartamentosService } from 'src/app/servicios/configuracion/localizacion/catDepartamentos/departamentos.service';
import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';
import { SucursalService } from 'src/app/servicios/configuracion/localizacion/sucursales/sucursal.service';
import { RelojesService } from 'src/app/servicios/timbres/catRelojes/relojes.service';

import { ListarRelojesComponent } from 'src/app/componentes/timbres/dispositivos/listar-relojes/listar-relojes.component';
import { VerDipositivoComponent } from '../ver-dipositivo/ver-dipositivo.component';
import { RelojesComponent } from '../../../timbres/dispositivos/relojes/relojes.component';

import { map, Observable, startWith } from 'rxjs';

@Component({
  selector: 'app-editar-reloj',
  standalone: false,
  templateUrl: './editar-reloj.component.html',
  styleUrls: ['./editar-reloj.component.css']
})

export class EditarRelojComponent implements OnInit {
  ips_locales: any = '';

  @Input() idReloj: number;
  @Input() pagina: string;

  // CONTROL DE FORMULARIOS
  isLinear = true;
  primerFormulario: FormGroup;
  segundoFormulario: FormGroup;

  // VARIABLES DE ALMACENAMIENTO
  empresas: any = [];
  sucursales: any = [];
  datosReloj: any = [];
  departamento: any = [];
  zonas_horarias: any = [];
  activarCampo: boolean = false;
  ver_editar: boolean = true;

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  // PRIMER FORMULARIO
  ipF = new FormControl('', [Validators.required, Validators.pattern(/^(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)$/)]);
  nombreF = new FormControl('', [Validators.required, Validators.minLength(4)]);
  codigoF = new FormControl('', Validators.required);
  funcionesF = new FormControl('', [Validators.required]);
  temperaturaF = new FormControl('', [Validators.required]);
  idSucursalF = new FormControl('', Validators.required);
  idDepartamentoF = new FormControl('', [Validators.required]);

  // SEGUNDO FORMULARIO
  macF = new FormControl('');
  marcaF = new FormControl('', [Validators.required]);
  serieF = new FormControl('', [Validators.minLength(4), Validators.required]);
  modeloF = new FormControl('', [Validators.minLength(3)]);
  puertoF = new FormControl('', [Validators.required]);
  fabricanteF = new FormControl('', [Validators.minLength(4)]);
  contraseniaF = new FormControl('', [Validators.minLength(1)]);
  idFabricacionF = new FormControl('', [Validators.minLength(4)]);
  zonasF = new FormControl('', Validators.required);
  filteredOptions: Observable<any[]>;

  constructor(
    private restCatDepartamento: DepartamentosService,
    private restSucursales: SucursalService,
    private formulario: FormBuilder,
    private validar: ValidacionesService,
    private toastr: ToastrService,
    private rest: RelojesService,
    public router: Router,
    public componentel: ListarRelojesComponent,
    public componentev: VerDipositivoComponent,
    public componenter: RelojesComponent,
  ) { }

  ngOnInit(): void {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');  
    this.validar.ObtenerIPsLocales().then((ips) => {
      this.ips_locales = ips;
    }); 
    this.FiltrarSucursales();
    this.ValidarFormulario();
    this.LeerZonasHorarias();
  }

  // METODO PARA BUSCAR ZONAS HORARIAS
  LeerZonasHorarias() {
    this.zonas_horarias = [];
    this.rest.ConsultarZonasHorarias().subscribe(response => {
      this.zonas_horarias = response;
      this.ObtenerDatos();
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
      marcaForm: this.marcaF,
      zonaForm: this.zonasF,
      serieForm: this.serieF,
      modeloForm: this.modeloF,
      fabricanteForm: this.fabricanteF,
      contraseniaForm: this.contraseniaF,
      idFabricacionForm: this.idFabricacionF,
    });
  }

  // METODO PARA IMPRIMIR DATOS EN FORMULARIO
  ObtenerDatos() {
    this.datosReloj = [];
    this.rest.ConsultarUnReloj(this.idReloj).subscribe(datos => {
      this.datosReloj = datos[0];
      this.BuscarDatos(this.datosReloj.id_sucursal);
      this.primerFormulario.patchValue({
        ipForm: this.datosReloj.ip,
        nombreForm: this.datosReloj.nombre,
        puertoForm: this.datosReloj.puerto,
        codigoForm: this.datosReloj.codigo,
        funcionesForm: this.datosReloj.tipo_conexion,
        temperaturaForm: this.datosReloj.temperatura,
        idSucursalForm: this.datosReloj.id_sucursal,
        idDepartamentoForm: this.datosReloj.id_departamento,
      })
      var zona = this.datosReloj.zona_horaria_dispositivo;
      var verificar_zona = this.zonas_horarias.filter((o: any) => { return zona === o.formato_nombre }).map((o: any) => { return o.nombre_general });
      this.segundoFormulario.patchValue({
        macForm: this.datosReloj.mac,
        marcaForm: this.datosReloj.marca,
        serieForm: this.datosReloj.serie,
        modeloForm: this.datosReloj.modelo,
        fabricanteForm: this.datosReloj.fabricante,
        contraseniaForm: this.datosReloj.contrasenia,
        idFabricacionForm: this.datosReloj.id_fabricacion,
        zonaForm: verificar_zona[0],
      })
      //console.log('ver zonas ', this.zonas_horarias.filter((o: any) => { return zona === o.formato_nombre }).map((o: any) => { return o.nombre_general }))
      //console.log('verificar ', verificar_zona[0])
      this.filteredOptions = this.zonasF.valueChanges
        .pipe(
          startWith(''),
          map((value: any) => this._filter(value))
        );
    })
  }

  // METODO PARA BUSCAR DEPARTAMENTOS
  BuscarDatos(id_sucursal: number) {
    this.departamento = [];
    this.restCatDepartamento.BuscarDepartamentoSucursal(id_sucursal).subscribe(datos => {
      this.departamento = datos;
    });
  }

  // METODO PARA LISTAR SUCURSALES
  FiltrarSucursales() {
    let idEmpresa = parseInt(localStorage.getItem('empresa') as string);
    this.sucursales = [];
    this.restSucursales.BuscarSucursalEmpresa(idEmpresa).subscribe(datos => {
      this.sucursales = datos;
    }, error => {
      this.toastr.info('No se han encontrado registros de establecimientos.', '', {
        timeOut: 6000,
      })
    })
  }

  // METODO PARA LISTAR DEPARTAMENTOS POR SUCURSAL
  ObtenerDepartamentos(form: any) {
    this.departamento = [];
    let idSucursal = form.idSucursalForm;
    this.restCatDepartamento.BuscarDepartamentoSucursal(idSucursal).subscribe(datos => {
      this.departamento = datos;
    }, error => {
      this.toastr.info('Sucursal no cuenta con departamentos registrados.', '', {
        timeOut: 6000,
      })
    });
  }

  // METODO PARA REGISTRAR DATOS
  InsertarReloj(form1: any, form2: any) {
    // VALIDAR DIRECCION MAC
    const direccMac = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$|^[0-9A-Fa-f]{12}$/;
    const zona = form2.zonaForm;
    console.log('zona ', zona)
    const [nombre, formatogmt] = zona.split(" ("); // DIVIDIMOS EN DOS PARTES
    const gmt = formatogmt.slice(0, -1); // QUITAMOS EL ULTIMO PARENTESIS

    let datosReloj = {
      // PRIMER FORMULARIO
      codigo: form1.codigoForm,
      ip: form1.ipForm,
      id_real: this.idReloj,
      nombre: form1.nombreForm,
      puerto: form1.puertoForm,
      id_sucursal: form1.idSucursalForm,
      temperatura: form1.temperaturaForm,
      tipo_conexion: form1.funcionesForm,
      id_departamento: form1.idDepartamentoForm,

      // SEGUNDO FORMULARIO
      mac: form2.macForm,
      marca: form2.marcaForm,
      serie: form2.serieForm,
      modelo: form2.modeloForm,
      fabricante: form2.fabricanteForm,
      contrasenia: form2.contraseniaForm,
      id_fabricacion: form2.idFabricacionForm,
      formato_gmt_dispositivo: gmt,
      zona_horaria_dispositivo: nombre,
      user_name: this.user_name,
      user_ip: this.ip, ip_local: this.ips_locales,
    };
    /*console.log('form2 ', form2.zonaForm)
    console.log(`Nombre: ${nombre}`);
    console.log(`GMT: ${gmt}`);
    console.log('ver form ', datosReloj)*/
    // VERIFICAR DIRECCION MAC
    if (datosReloj.mac != '') {
      if (direccMac.test(datosReloj.mac.toString())) {
        this.GuardarSistema(datosReloj);
      } else {
        this.toastr.warning('MAC ingresada no es válida.',
          'Ups! algo salio mal.', {
          timeOut: 6000,
        })
      }
    }
    else {
      this.GuardarSistema(datosReloj);
    }
  }

  // METODO PARA GUARDAR EN LA BASE DE DATOS
  GuardarSistema(datosReloj: any) {
    //console.log('ingresa')
    this.rest.ActualizarDispositivo(datosReloj).subscribe(response => {
      if (response.message === 'actualizado') {
        this.toastr.success('Operación exitosa.', 'Registro actualizado.', {
          timeOut: 6000,
        });
        this.CerrarVentana();
      }
      else if (response.message === 'existe') {
        this.toastr.warning('Código o serie del equipo ya existe en el sistema.',
          'Ups! algo salio mal.', {
          timeOut: 6000,
        })
      }
      else if (response.message === 'error') {
        this.toastr.warning('IP ingresada ya existe en el sistema.',
          'Ups! algo salio mal.', {
          timeOut: 6000,
        })
      }
    });
  }

  // MENSAJES DE ERROR
  ObtenerMensajeErrorIp() {
    if (this.ipF.hasError('pattern')) {
      return 'Ingresar IP Ej: 0.0.0.0';
    }
  }

  // METODO PARA REGISTRAR IP
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

  // METODO PARA CERRAR FORMULARIO
  ver_datos: boolean = false;
  pagina_: string = '';
  reloj_id: number;
  CerrarVentana() {
    this.LimpiarCampos();
    if (this.pagina === 'editar-reloj') {
      this.ver_datos = true;
      this.ver_editar = false;
      this.pagina_ = 'listar-relojes';
      this.reloj_id = this.idReloj;
    }
    else if (this.pagina === 'ver-editar-listar' || this.pagina === 'ver-editar-registrar') {
      this.componentev.ver_datos = true;
      this.componentev.ver_editar = false;
      this.componentev.idReloj = this.idReloj;
      this.componentev.CargarDatosReloj();
      if (this.pagina === 'ver-editar-listar') {
        this.componentev.pagina = 'listar-relojes';
      }
    }

  }

}
