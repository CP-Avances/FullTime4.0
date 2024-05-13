import { FormControl, Validators, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Component, OnInit, Inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { ValidacionesService } from '../../../../servicios/validaciones/validaciones.service';
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
import { TituloService } from 'src/app/servicios/catalogos/catTitulos/titulo.service';

@Component({
  selector: 'app-titulo-empleado',
  templateUrl: './titulo-empleado.component.html',
  styleUrls: ['./titulo-empleado.component.css'],
})

export class TituloEmpleadoComponent implements OnInit {

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
      ip: this.ip
    }
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
