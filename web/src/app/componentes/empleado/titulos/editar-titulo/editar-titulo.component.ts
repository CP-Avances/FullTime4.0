import { FormControl, Validators, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, OnInit, Inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { ValidacionesService } from '../../../../servicios/validaciones/validaciones.service';
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
import { TituloService } from 'src/app/servicios/catalogos/catTitulos/titulo.service';

@Component({
  selector: 'app-editar-titulo',
  templateUrl: './editar-titulo.component.html',
  styleUrls: ['./editar-titulo.component.css']
})

export class EditarTituloComponent implements OnInit {

  cgTitulos: any = [];

  observa = new FormControl('', [Validators.required, Validators.maxLength(255)]);
  idTitulo = new FormControl('', [Validators.required])

  public formulario = new FormGroup({
    observacionForm: this.observa,
    idTituloForm: this.idTitulo
  });

  constructor(
    private rest: EmpleadoService,
    private toastr: ToastrService,
    private restTitulo: TituloService,
    private validar: ValidacionesService,
    private ventana: MatDialogRef<EditarTituloComponent>,
    @Inject(MAT_DIALOG_DATA) public titulo: any
  ) { }

  ngOnInit(): void {
    this.ObtenerTitulos();
  }

  // METODO PARA ACTUALIZAR DATOS DE TITULO
  ActualizarTituloEmpleado(form: any) {
    let titulo = {
      observacion: form.observacionForm,
      id_empleado: this.titulo.id_empleado,
      id_titulo: form.idTituloForm,
    }
    // VERIFICAR TITULO SIMILAR AL REGISTRO
    if (titulo.id_titulo === this.titulo.id_titulo) {
      this.AlmacenarTitulo(titulo);
    }
    else {
      // VERIFICAR DUPLICADO DE REGISTRO
      this.rest.BuscarTituloEspecifico(titulo).subscribe(data => {
        this.toastr.warning('Registro ya se encuentra en el sistema.', 'Ups!!! algo salio mal.', {
          timeOut: 3000,
        });
      }, vacio => {
        this.AlmacenarTitulo(titulo);
      });
    }
  }

  // METODO PARA ALMACENAR DATOS EN EL SISTEMA
  AlmacenarTitulo(titulo: any) {
    this.rest.ActualizarTitulo(this.titulo.id, titulo).subscribe(data => {
      this.toastr.success('Actualización Exitosa.', 'Registro actualizado.', {
        timeOut: 6000,
      });
      this.ventana.close(data);
    });
  }

  // METODO PARA LISTAR TITULOS
  ObtenerTitulos() {
    this.restTitulo.ListarTitulos().subscribe(data => {
      this.cgTitulos = data;
      this.LlenarFormulario()
    });
  }

  // METODO PARA MOSTRAR DATOS EN FORMULARIO
  LlenarFormulario() {
    const { observaciones, nombre } = this.titulo;
    const [id_titulo] = this.cgTitulos.filter(o => { return o.nombre === nombre }).map(o => { return o.id });
    this.formulario.patchValue({
      observacionForm: observaciones,
      idTituloForm: id_titulo
    })
  }

  // METODO PARA VALIDAR SOLO INGRESO DE LETRAS
  IngresarSoloLetras(e: any) {
    return this.validar.IngresarSoloLetras(e);
  }

  // METODO PARA VERIFICAR TITULO PAGINA SENESCYT
  VerificarTitulo() {
    window.open("https://www.senescyt.gob.ec/web/guest/consultas", "_blank");
  }

  // METODO PARA CERRAR VENTANA DE REGISTRO
  Cancelar() {
    this.ventana.close(false)
  }

}
