import { FormControl, Validators, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, OnInit, Inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';
import { DepartamentosService } from 'src/app/servicios/configuracion/localizacion/catDepartamentos/departamentos.service';
import { SucursalService } from 'src/app/servicios/configuracion/localizacion/sucursales/sucursal.service';

@Component({
  selector: 'app-registro-departamento',
  standalone: false,
  templateUrl: './registro-departamento.component.html',
  styleUrls: ['./registro-departamento.component.css'],
})

export class RegistroDepartamentoComponent implements OnInit {
  ips_locales: any = '';

  // CONTROL DE LOS CAMPOS DEL FORMULARIO
  idSucursal = new FormControl('');
  nombre = new FormControl('', Validators.required);

  // DATOS DEPARTAMENTO
  sucursales: any = [];
  departamentos: any = [];
  Habilitar: boolean = false;

  // ASIGNAR LOS CAMPOS EN UN FORMULARIO EN GRUPO
  public formulario = new FormGroup({
    idSucursalForm: this.idSucursal,
    nombreForm: this.nombre,
  });

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  constructor(
    private rest: DepartamentosService,
    private restS: SucursalService,
    private toastr: ToastrService,
    private router: Router,
    public ventana: MatDialogRef<RegistroDepartamentoComponent>,
    public validar: ValidacionesService,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit(): void {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');  
    this.validar.ObtenerIPsLocales().then((ips) => {
      this.ips_locales = ips;
    }); 
   
    if (this.data != undefined) {
      this.Habilitar = false;
      this.rest.BuscarDepartamentoSucursal(this.data).subscribe(datos => {
        this.departamentos = datos;
      });
    }
    else {
      this.Habilitar = true;
      this.FiltrarSucursales();
    }
  }

  // BUSCAR DATOS DE SUCURSALES
  FiltrarSucursales() {
    let empresa_id = parseInt(localStorage.getItem('empresa') as string);
    this.sucursales = [];
    this.restS.BuscarSucursalEmpresa(empresa_id).subscribe(datos => {
      this.sucursales = datos;
    }, error => {
      this.toastr.info('No existe registro de establecimientos.', 'Ir a registrar establecimientos.', {
        timeOut: 6000,
      }).onTap.subscribe(obj => {
        this.router.navigate(['/sucursales'])
      })
    })
  }

  // OBTENER LISTA DE DEPARTAMENTOS
  ObtenerDepartamentos(form: any) {
    this.departamentos = [];
    this.rest.BuscarDepartamentoSucursal(parseInt(form.idSucursalForm)).subscribe(datos => {
      this.departamentos = datos;
    });
  }

  // METODO PARA CAPTURAR DATOS DEL FORMULARIO
  InsertarDepartamento(form: any) {
    var departamento = {
      id_sucursal: form.idSucursalForm,
      nombre: form.nombreForm.toUpperCase(),
      user_name: this.user_name,
      ip: this.ip, ip_local: this.ips_locales
    };

    // VERIFICAR ID DE SUCURSAL
    if (this.data != undefined) {
      departamento.id_sucursal = this.data;
    }

    if (this.departamentos.length === 0) {
      this.RegistrarDepartamento(departamento);
    }
    else {
      this.GuardarDatos(departamento);
    }
  }

  // ALMACENAR DATOS EN BASE DE DATOS
  RegistrarDepartamento(departamento: any) {
    this.rest.RegistrarDepartamento(departamento).subscribe(response => {
      if (response.message === 'error') {
        this.toastr.error('Los datos ingresados tienen un error', '', {
          timeOut: 6000,
        });
      }
      else {
        this.toastr.success('Operación exitosa.', 'Departamento registrado.', {
          timeOut: 6000,
        });
        this.CerrarVentana();
      }
    });
  }

  // GUARDAR DATOS VALIDANDO DUPLICADOS
  contador: number = 0;
  GuardarDatos(departamento: any) {
    // BUSCAR COINCIDENCIAS EN LA LISTA DE DEPARTAMENTOS
    for (var i = 0; i <= this.departamentos.length - 1; i++) {
      if (this.departamentos[i].nombre.toUpperCase() === departamento.nombre.toUpperCase()) {
        this.contador = 1;
        break;
      }
    }
    // VERIFICAR DUPLICIDAD EN NOMBRES
    if (this.contador === 1) {
      this.contador = 0;
      this.toastr.warning('Nombre de departamento ya se encuentra registrado.', '', {
        timeOut: 6000,
      });
    }
    else {
      this.RegistrarDepartamento(departamento);
    }
  }

  // METODO CERRAR VENTANA
  CerrarVentana() {
    this.ventana.close();
  }

}

