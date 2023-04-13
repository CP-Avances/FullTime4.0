import { FormGroup, Validators, FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, OnInit, Inject } from '@angular/core';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';
import { ToastrService } from 'ngx-toastr';
import { ThemePalette } from '@angular/material/core';
import { Router } from '@angular/router';

import { DepartamentosService } from 'src/app/servicios/catalogos/catDepartamentos/departamentos.service';
import { SucursalService } from 'src/app/servicios/sucursales/sucursal.service';

interface Nivel {
  valor: number;
  nombre: string
}

@Component({
  selector: 'app-editar-departamento',
  templateUrl: './editar-departamento.component.html',
  styleUrls: ['./editar-departamento.component.css']
})

export class EditarDepartamentoComponent implements OnInit {

  // CONTROL DE LOS CAMPOS DEL FORMULARIO
  idSucursal = new FormControl('');
  depaPadre = new FormControl('');
  nombre = new FormControl('', Validators.required);
  nivel = new FormControl('', Validators.required);

  // DATOS DEPARTAMENTO
  sucursales: any = [];
  departamentos: any = [];
  Habilitar: boolean = false;

  // ASIGNAR LOS CAMPOS EN UN FORMULARIO EN GRUPO
  public formulario = new FormGroup({
    nivelForm: this.nivel,
    nombreForm: this.nombre,
    depaPadreForm: this.depaPadre,
    idSucursalForm: this.idSucursal,
  });

  // ARREGLO DE NIVELES EXISTENTES
  niveles: Nivel[] = [
    { valor: 1, nombre: '1' },
    { valor: 2, nombre: '2' },
    { valor: 3, nombre: '3' },
    { valor: 4, nombre: '4' },
    { valor: 5, nombre: '5' }
  ];

  /**
   * VARIABLES PROGRESS SPINNEr
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
    public ventana: MatDialogRef<EditarDepartamentoComponent>,
    @Inject(MAT_DIALOG_DATA) public info: any
  ) { }

  datos: any;

  ngOnInit(): void {
    console.log(this.info);
    if (this.info.establecimiento === true) {
      this.Habilitar = false;
      this.datos = this.info.data;
    }
    else {
      this.datos = this.info;
      this.Habilitar = true;
      this.FiltrarSucursales();
      this.idSucursal.setValue(this.datos.id_sucursal);
    }
    this.CargarDatos();
  }

  // METODO PARA IMPRIMIR DATOS EN FORMULARIO
  CargarDatos() {
    this.nombre.setValue(this.datos.nombre);
    this.nivel.setValue(this.datos.nivel);
    this.rest.BuscarDepartamentoSucursal_(this.datos.id_sucursal, this.datos.id).subscribe(datos => {
      this.departamentos = datos;
      this.departamentos.forEach(obj => {
        if (obj.nombre === this.datos.departamento_padre) {
          this.depaPadre.setValue(obj.id);
        }
      })
    });
  }

  // METODO PARA CONSULTAR SUCURSALES
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
    this.rest.BuscarDepartamentoSucursal_(parseInt(form.idSucursalForm), this.datos.id).subscribe(datos => {
      this.departamentos = datos;
    });
  }

  // METODO PARA CAPTURAR DATOS DE FORMULARIO
  ModificarDepartamento(form: any) {
    var departamento = {
      id_sucursal: form.idSucursalForm,
      depa_padre: form.depaPadreForm,
      nombre: form.nombreForm.toUpperCase(),
      nivel: parseInt(form.nivelForm),
    };

    // VERIFICAR ID DE SUCURSAL
    if (this.info.establecimiento === true) {
      departamento.id_sucursal = this.datos.id_sucursal;
    }

    if (departamento.depa_padre === '') {
      departamento.depa_padre = null;
    }

    if (this.departamentos.length === 0) {
      this.ActualizarDepartamento(departamento);
    }
    else {
      this.GuardarDatos(departamento);
    }
  }


  // METODO DE ALMACENAMIENTO DE DATOS VALIDANDO DUPLICADOS
  contador: number = 0;
  GuardarDatos(departamento: any) {
    for (var i = 0; i <= this.departamentos.length - 1; i++) {
      if (this.departamentos[i].nombre === departamento.nombre) {
        this.contador = 1;
      }
    }
    if (this.contador === 1) {
      this.contador = 0;
      this.toastr.error('Nombre de departamento ya se encuentra registrado.', '', {
        timeOut: 6000,
      });
    }
    else {
      this.ActualizarDepartamento(departamento);
    }
  }

  // METODO DE ACTUALIZACION DE REGISTRO EN BASE DE DATOS
  ActualizarDepartamento(departamento: any) {
    this.habilitarprogress = true;
    this.rest.ActualizarDepartamento(this.datos.id, departamento).subscribe(response => {
      this.habilitarprogress = false;
      if (response.message === 'error') {
        this.toastr.error('Existe un error en los datos.', '', {
          timeOut: 6000,
        });
      }
      else {
        this.toastr.success('Operacion Exitosa.', 'Registro actualizado.', {
          timeOut: 6000,
        });
        this.CerrarVentana();
      }
    });
  }

  // METODO PARA CERRAR VENTANA
  CerrarVentana() {
    this.ventana.close();
  }

}
