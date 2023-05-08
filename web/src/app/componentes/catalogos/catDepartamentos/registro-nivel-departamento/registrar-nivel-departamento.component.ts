import { FormGroup, Validators, FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { Component, OnInit, Inject } from '@angular/core';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';
import { ToastrService } from 'ngx-toastr';
import { ThemePalette } from '@angular/material/core';
import { Router } from '@angular/router';

import { DepartamentosService } from 'src/app/servicios/catalogos/catDepartamentos/departamentos.service';
import { SucursalService } from 'src/app/servicios/sucursales/sucursal.service';

import { MetodosComponent } from 'src/app/componentes/administracionGeneral/metodoEliminar/metodos.component';


interface Nivel {
  valor: number;
  nombre: string
}

@Component({
  selector: 'app-registrar-nivel-departamento',
  templateUrl: './registrar-nivel-departamento.component.html',
  styleUrls: ['./registrar-nivel-departamento.component.css']
})

export class RegistrarNivelDepartamentoComponent implements OnInit {

  // CONTROL DE LOS CAMPOS DEL FORMULARIO
  depaPadre = new FormControl('', Validators.required);
  nombre = new FormControl('');
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
    public ventana: MatDialog,
    public ventanacerrar: MatDialogRef<RegistrarNivelDepartamentoComponent>,
    @Inject(MAT_DIALOG_DATA) public info: any
  ) { }

  datos: any;
  listaDepaNiveles: any  = [];
  ngOnInit(): void {
    this.datos = this.info;
    this.CargarDatos();
  }

  // METODO PARA IMPRIMIR DATOS EN FORMULARIO
  CargarDatos() {
    this.nivel.setValue(this.datos.nivel);
    this.rest.BuscarDepartamentoSucursal(this.datos.id_sucursal).subscribe(datos => {
      this.departamentos = datos;
    });

    var id_departamento = this.datos.id;
    var id_establecimiento = this.datos.id_sucursal;
    this.rest.ConsultarNivelDepartamento(id_departamento, id_establecimiento).subscribe(datos => {
      this.listaDepaNiveles = datos;
    })


  }

  public listadepnivel: any = [];
  // METODO PARA CAPTURAR DATOS DE FORMULARIO
  RegistrarNivelDepa(form: any) {
    this.rest.BuscarDepartamento(form.depaPadreForm).subscribe(datos => {
      this.listadepnivel = datos;
      this.nombre.setValue(this.listadepnivel[0].nombre)
      var departamento = {
        id_departamento: this.datos.id,
        departamento: this.datos.nombre,
        nivel: parseInt(form.nivelForm),
        dep_nivel: form.depaPadreForm,
        dep_nivel_nombre: this.listadepnivel[0].nombre.toUpperCase(),
        id_establecimiento: this.datos.id_sucursal
      };

      console.log('departamento: ',departamento);
      this.GuardarDatos(departamento);
    });
   
  }

  // METODO DE ACTUALIZACION DE REGISTRO EN BASE DE DATOS
  ActualizarDepartamento(departamento: any) {
    var cg_depa = {
      depa_padre: departamento.dep_nivel,
      nivel: departamento.nivel
    }

    this.rest.ActualizarNivelDepartamento(departamento.id_departamento, cg_depa).subscribe(response => {
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
    })
  }


  // METODO DE ALMACENAMIENTO DE DATOS VALIDANDO DUPLICADOS
  contador: number = 0;
  GuardarDatos(departamento: any) {

    for (var i = 0; i <= this.listaDepaNiveles.length - 1; i++) {
      if ((this.listaDepaNiveles[i].dep_nivel_nombre === departamento.dep_nivel_nombre) || 
          (this.listaDepaNiveles[i].nivel === departamento.nivel)) {
        this.contador = 1;
      }
    }

    if (this.contador === 1) {
      this.contador = 0;
      this.toastr.error('Nombre de departamento o nivel ya se encuentra registrado.', '', {
        timeOut: 6000,
      });
    }
    else {
      if((this.listaDepaNiveles.length + 1) === departamento.nivel ){
        this.rest.RegistrarNivelDepartamento(departamento).subscribe(response => {
          this.habilitarprogress = false;
          if (response.message === 'error') {
            this.toastr.error('Existe un error en los datos.', '', {
            timeOut: 6000,
            });
          }
          else {
            this.ActualizarDepartamento(departamento);
            this.toastr.success('Operacion Exitosa.', 'Registro Creado.', {
              timeOut: 6000,
            });
          this.CerrarVentana();
          }
        });
      }else{
        this.toastr.error('Le hace falta registrar los niveles inferiores.', '', {
          timeOut: 5000,
        });
      }
    }
  }

  // METODO PARA CERRAR VENTANA
  CerrarVentana() {
    this.ventanacerrar.close();
  }

}
