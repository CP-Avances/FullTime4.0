import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { Component, OnInit, Inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { DepartamentosService } from 'src/app/servicios/configuracion/localizacion/catDepartamentos/departamentos.service';
import { SucursalService } from 'src/app/servicios/configuracion/localizacion/sucursales/sucursal.service';

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
  nivel = new FormControl('', Validators.required);
  idSucursal = new FormControl('');

  // DATOS DEPARTAMENTO
  sucursales: any = [];
  departamentos: any = [];
  Habilitar: boolean = false;

  // ASIGNAR LOS CAMPOS EN UN FORMULARIO EN GRUPO
  public formulario = new FormGroup({
    nivelForm: this.nivel,
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

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  constructor(
    private rest: DepartamentosService,
    private toastr: ToastrService,
    public sucursal: SucursalService,
    public ventana: MatDialog,
    public ventanacerrar: MatDialogRef<RegistrarNivelDepartamentoComponent>,
    @Inject(MAT_DIALOG_DATA) public info: any
  ) { }

  datos: any;
  listaDepaNiveles: any = [];

  ngOnInit(): void {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');
    this.datos = this.info;
    this.CargarDatos();
    this.FiltrarSucursales();
  }

  // METODO PARA CONSULTAR SUCURSALES
  FiltrarSucursales() {
    let empresa_id = parseInt(localStorage.getItem('empresa') as string);
    this.sucursales = [];
    this.sucursal.BuscarSucursalEmpresa(empresa_id).subscribe(datos => {
      this.sucursales = datos;
    })
  }

  // METODO PARA IMPRIMIR DATOS EN FORMULARIO
  CargarDatos() {
    var id_departamento = this.datos.id;
    var id_establecimiento = this.datos.id_sucursal;
    this.rest.ConsultarNivelDepartamento(id_departamento, id_establecimiento).subscribe(datos => {
      this.listaDepaNiveles = datos;
    })
  }

  // OBTENER LISTA DE DEPARTAMENTOS
  ObtenerDepartamentos(form: any) {
    this.departamentos = [];
    this.rest.BuscarDepartamentoSucursal(parseInt(form.idSucursalForm)).subscribe(datos => {
      this.departamentos = datos;
    });
  }

  // METODO PARA CAPTURAR DATOS DE FORMULARIO
  RegistrarNivelDepa(form: any) {
    this.rest.BuscarDepartamento(form.depaPadreForm).subscribe(datos => {
      var departamento = {
        id_departamento: this.datos.id,
        departamento: this.datos.nombre,
        nivel: parseInt(form.nivelForm),
        dep_nivel: form.depaPadreForm,
        dep_nivel_nombre: datos[0].nombre.toUpperCase(),
        id_establecimiento: parseInt(this.datos.id_sucursal),
        id_suc_dep_nivel: parseInt(form.idSucursalForm),
        user_name: this.user_name,
        ip: this.ip
      };
      this.GuardarDatos(departamento);
    });

  }

  // METODO DE ALMACENAMIENTO DE DATOS VALIDANDO DUPLICADOS
  contador: number = 0;
  GuardarDatos(departamento: any) {

    // VERIFICAR SI EXISTE DEPARTAMENTO O NIVEL YA REGISTRADO
    for (var i = 0; i <= this.listaDepaNiveles.length - 1; i++) {
      if ((this.listaDepaNiveles[i].id_departamento_nivel === departamento.dep_nivel) ||
        (this.listaDepaNiveles[i].nivel === departamento.nivel)) {
        this.contador = 1;
        break;
      }
    }

    // SI EXISTE UN REGISTRO SE INDICA AL USUARIO
    if (this.contador === 1) {
      this.contador = 0;
      this.toastr.error('Ups!!! algo salio mal.', 'Departamento o nivel ya se encuentra registrado.', {
        timeOut: 3000,
      });
    }
    else {
      // VERIFICAR QUE EL NIVEL DE APROBACION CORRESPONDA EN EL REGISTRO
      if ((this.listaDepaNiveles.length + 1) === departamento.nivel) {
        this.rest.RegistrarNivelDepartamento(departamento).subscribe(response => {
          if (response.message === 'error') {
            this.toastr.error('Existe un error en los datos.', '', {
              timeOut: 3000,
            });
          }
          else {
            this.toastr.success('Operación exitosa.', 'Registro Creado.', {
              timeOut: 3000,
            });
            this.CerrarVentana();
          }
        });
      } else {
        this.toastr.error('Ups!!! algo salio mal.', 'Le hace falta registrar niveles de aprobación inferiores.', {
          timeOut: 3000,
        });
      }
    }
  }

  // METODO PARA CERRAR VENTANA
  CerrarVentana() {
    this.ventanacerrar.close();
  }



}
