import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, OnInit, Inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { TipoComidasService } from 'src/app/servicios/catalogos/catTipoComidas/tipo-comidas.service';

@Component({
  selector: 'app-editar-detalle-menu',
  templateUrl: './editar-detalle-menu.component.html',
  styleUrls: ['./editar-detalle-menu.component.css']
})

export class EditarDetalleMenuComponent implements OnInit {

  // CONTROL DE CAMPOS Y VALIDACIONES DEL FORMULARIO
  valorF = new FormControl('', [Validators.required, Validators.pattern("^[0-9]+(.[0-9][0-9])?$")]);
  nombreF = new FormControl('', [Validators.required, Validators.minLength(4)]);
  observacionF = new FormControl('', [Validators.pattern("[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]{5,48}")]);

  // ASIGNACION DE VALIDACIONES A INPUTS DEL FORMULARIO
  public formulario = new FormGroup({
    valorForm: this.valorF,
    nombreForm: this.nombreF,
    observacionForm: this.observacionF
  });

  constructor(
    private rest: TipoComidasService,
    private toastr: ToastrService,
    public ventana: MatDialogRef<EditarDetalleMenuComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.ImprimirDatos();
  }

  // METODO PARA ACTUALIZAR REGISTRO
  InsertarTipoComida(form: any) {
    let datosTipoComida = {
      nombre: form.nombreForm,
      valor: form.valorForm,
      observacion: form.observacionForm,
      id: this.data.id_detalle,
    };
    this.rest.ActualizarDetalleMenu(datosTipoComida).subscribe(response => {
      this.toastr.success('Operación exitosa.', 'Registro actualizado.', {
        timeOut: 6000,
      })
      this.Salir(2);
    }, error => {
      this.toastr.error('Ups!!! algo salio mal.', 'No se pudo registrar.', {
        timeOut: 6000,
      })
    });
  }

  // METODO PARA MOSTRAR DATOS
  ImprimirDatos() {
    var numero = this.data.valor;
    if (String(this.data.valor).length === 3) {
      numero = String(this.data.valor) + 0;
    }
    this.formulario.setValue({
      nombreForm: this.data.plato,
      valorForm: numero,
      observacionForm: this.data.observacion
    })
  }

  // METODO PARA VALIDAR NUMEROS DECIMALES
  IngresarNumeroDecimal(evt: any) {
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
      this.toastr.info('No se admite el ingreso de letras', 'Usar solo números', {
        timeOut: 6000,
      })
      return false;
    }
  }

  // MENSAJE ERROR NUMEROS DECIMALES
  ObtenerMensajeErrorDecimales() {
    if (this.valorF.hasError('required')) {
      return 'Ingresar un valor hasta con dos decimales';
    }
    return this.valorF.hasError('pattern') ? 'Ingresar dos decimales' : '';
  }

  // METODO PARA LIMPIAR FORMULARIO
  LimpiarCampos() {
    this.formulario.reset();
  }

  // METODO PARA CERRAR REGISTRO
  Salir(opcion: number) {
    this.LimpiarCampos();
    this.ventana.close(opcion);
  }

}
