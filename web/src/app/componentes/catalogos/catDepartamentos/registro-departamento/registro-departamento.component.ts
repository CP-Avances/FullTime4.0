import { FormControl, Validators, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, OnInit, Inject } from '@angular/core';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';
import { ToastrService } from 'ngx-toastr';
import { ThemePalette } from '@angular/material/core';
import { Router } from '@angular/router';

import { DepartamentosService } from 'src/app/servicios/catalogos/catDepartamentos/departamentos.service';
import { SucursalService } from 'src/app/servicios/sucursales/sucursal.service';

interface Nivel {
  valor: string;
  nombre: string
}

@Component({
  selector: 'app-registro-departamento',
  templateUrl: './registro-departamento.component.html',
  styleUrls: ['./registro-departamento.component.css'],
})

export class RegistroDepartamentoComponent implements OnInit {

  // CONTROL DE LOS CAMPOS DEL FORMULARIO
  idSucursal = new FormControl('');
  depaPadre = new FormControl(null);
  nombre = new FormControl('', Validators.required);
  nivel = new FormControl('', Validators.required);

  // DATOS DEPARTAMENTO
  sucursales: any = [];
  departamentos: any = [];
  Habilitar: boolean = false;

  // ASIGNAR LOS CAMPOS EN UN FORMULARIO EN GRUPO
  public formulario = new FormGroup({
    idSucursalForm: this.idSucursal,
    depaPadreForm: this.depaPadre,
    nombreForm: this.nombre,
    nivelForm: this.nivel,
  });

  // ARREGLO DE NIVELES EXISTENTES
  niveles: Nivel[] = [
    { valor: '1', nombre: '1' },
    { valor: '2', nombre: '2' },
    { valor: '3', nombre: '3' },
    { valor: '4', nombre: '4' },
    { valor: '5', nombre: '5' }
  ];

  /**
   * VARIABLES PROGRESS SPINNER
   */
  habilitarprogress: boolean = false;
  color: ThemePalette = 'primary';
  mode: ProgressSpinnerMode = 'indeterminate';
  value = 10;

  constructor(
    private rest: DepartamentosService,
    private restS: SucursalService,
    private toastr: ToastrService,
    private router: Router,
    public ventana: MatDialogRef<RegistroDepartamentoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit(): void {
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
      depa_padre: form.depaPadreForm,
      nombre: form.nombreForm.toUpperCase(),
      nivel: parseInt(form.nivelForm),
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
    this.habilitarprogress = true;
    this.rest.RegistrarDepartamento(departamento).subscribe(response => {
      this.habilitarprogress = false;
      if (response.message === 'error') {
        this.toastr.error('Los datos ingresados tienen un error', '', {
          timeOut: 6000,
        });
      }
      else {
        this.toastr.success('Operación Exitosa', 'Departamento registrado', {
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
      this.toastr.error('Nombre de departamento ya se encuentra registrado.', '', {
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

