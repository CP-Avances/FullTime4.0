import { FormControl, Validators, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Component, OnInit, Inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';
import { EmpleadoService } from 'src/app/servicios/usuarios/empleado/empleadoRegistro/empleado.service';
import { TituloService } from 'src/app/servicios/usuarios/catTitulos/titulo.service';

@Component({
  selector: 'app-titulo-empleado',
  standalone: false,
  templateUrl: './titulo-empleado.component.html',
  styleUrls: ['./titulo-empleado.component.css'],
})

export class TituloEmpleadoComponent implements OnInit {
  ips_locales: any = '';

  cgTitulos: any = [];
  selectTitle: string = '';

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  observa = new FormControl('', [Validators.required, Validators.maxLength(255)]);
  idTitulo = new FormControl('', [Validators.required])

  public formulario = new FormGroup({
    observacionForm: this.observa,
    idTituloForm: this.idTitulo
  });

  constructor(
    public restTitulo: TituloService,
    public restEmpleado: EmpleadoService,
    private toastr: ToastrService,
    private validar: ValidacionesService,
    private ventana: MatDialogRef<TituloEmpleadoComponent>,
    @Inject(MAT_DIALOG_DATA) public empleado: any
  ) { }

  ngOnInit(): void {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');  
    this.validar.ObtenerIPsLocales().then((ips) => {
      this.ips_locales = ips;
    }); 

    this.ObtenerTitulos();
  }

  // METODO PARA LISTAR TITULOS
  ObtenerTitulos() {
    this.restTitulo.ListarTitulos().subscribe(data => {
      this.cgTitulos = data;
    });
  }

  // METODO PARA INSERTAR TITULOS
  InsertarTituloEmpleado(form: any) {
    let titulo = {
      observacion: form.observacionForm,
      id_empleado: this.empleado,
      id_titulo: form.idTituloForm,
      user_name: this.user_name,
      ip: this.ip, ip_local: this.ips_locales
    }
    // VERIFICAR DUPLICADO DE REGISTRO
    this.restEmpleado.BuscarTituloEspecifico(titulo).subscribe(data => {
      this.toastr.warning('Registro ya se encuentra en el sistema.', 'Ups! algo salio mal.', {
        timeOut: 3000,
      });
    }, vacio => {
      this.AlmacenarTitulo(titulo);
    });
  }

  // METODO PARA ALMACENAR DATOS EN EL SISTEMA
  AlmacenarTitulo(titulo: any) {
    this.restEmpleado.RegistrarTitulo(titulo).subscribe(data => {
      this.toastr.success('Operación exitosa.', 'Registro guardado.', {
        timeOut: 6000,
      });
      this.LimpiarCampos();
      this.ventana.close(true)
    });
  }

  // METODO PARA VALIDAR INGRESO DE LETRAS
  IngresarSoloLetras(e: any) {
    return this.validar.IngresarSoloLetras(e);
  }

  // METODO PARA LIMPIAR CAMPOS DEL FORMULARIO
  LimpiarCampos() {
    this.formulario.reset();
  }

  // METODO PARA CERRAR VENTANA DE REGISTRO
  CerrarRegistro() {
    this.ventana.close(false)
  }

  // METODO PARA DIRIGIRSE A LA PAGINA DEL SENESCYT
  VerificarTitulo() {
    window.open("https://www.senescyt.gob.ec/web/guest/consultas", "_blank");
  }
}
