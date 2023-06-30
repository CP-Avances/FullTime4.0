import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';

import { TipoComidasService } from 'src/app/servicios/catalogos/catTipoComidas/tipo-comidas.service';

@Component({
  selector: 'app-editar-detalle-menu',
  templateUrl: './editar-detalle-menu.component.html',
  styleUrls: ['./editar-detalle-menu.component.css']
})
export class EditarDetalleMenuComponent implements OnInit {

  // Control de campos y validaciones del formulario
  nombreF = new FormControl('', [Validators.required, Validators.minLength(4)]);
  valorF = new FormControl('', [Validators.required, Validators.pattern("^[0-9]+(.[0-9][0-9])?$")]);
  observacionF = new FormControl('', [Validators.pattern("[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]{5,48}")]);

  // Asignación de validaciones a inputs del formulario
  public TipoComidaForm = new FormGroup({
    nombreForm: this.nombreF,
    valorForm: this.valorF,
    observacionForm: this.observacionF
  });

  constructor(
    private rest: TipoComidasService,
    private toastr: ToastrService,
    public dialogRef: MatDialogRef<EditarDetalleMenuComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.ImprimirDatos();
  }

  InsertarTipoComida(form) {
    let datosTipoComida = {
      nombre: form.nombreForm,
      valor: form.valorForm,
      observacion: form.observacionForm,
      id: this.data.id_detalle,
    };
    this.rest.ActualizarDetalleMenu(datosTipoComida).subscribe(response => {
      this.toastr.success('Operación exitosa.', 'Detalle del Menú actualizado', {
        timeOut: 6000,
      })
      this.Salir();
    }, error => {
      this.toastr.error('Operación Fallida', 'Detalle de Menú no se pudo registrar', {
        timeOut: 6000,
      })
    });
  }

  ImprimirDatos() {
    var numero = this.data.valor;
    if (String(this.data.valor).length === 3) {
      numero = String(this.data.valor) + 0;
    }
    this.TipoComidaForm.setValue({
      nombreForm: this.data.plato,
      valorForm: numero,
      observacionForm: this.data.observacion
    })
  }

  IngresarNumeroDecimal(evt) {
    if (window.event) {
      var keynum = evt.keyCode;
    }
    else {
      keynum = evt.which;
    }
    // Comprobamos si se encuentra en el rango numérico y que teclas no recibirá.
    if ((keynum > 47 && keynum < 58) || keynum == 8 || keynum == 13 || keynum == 6 || keynum == 46) {
      return true;
    }
    else {
      this.toastr.info('No se admite el ingreso de letras', 'Usar solo números', {
        timeOut: 6000,
      })
      return false;
    }
  }

  ObtenerMensajeErrorNombreRequerido() {
    if (this.nombreF.hasError('required')) {
      return 'Campo obligatorio';
    }
  }

  ObtenerMensajeErrorCamposNumericosRequeridos() {
    if (this.valorF.hasError('required')) {
      return 'Ingresar un valor hasta con dos decimales';
    }
    return this.valorF.hasError('pattern') ? 'Ingresar dos decimales' : '';
  }

  ObtenerMensajeErrorObservacion() {
    if (this.observacionF.hasError('pattern')) {
      return 'Ingresar una observación válida';
    }
  }

  LimpiarCampos() {
    this.TipoComidaForm.reset();
  }

  Salir() {
    this.LimpiarCampos();
    this.dialogRef.close();
  }

}
