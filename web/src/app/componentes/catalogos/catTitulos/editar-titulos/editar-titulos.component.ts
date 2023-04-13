import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, OnInit, Inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { TituloService } from 'src/app/servicios/catalogos/catTitulos/titulo.service';
import { NivelTitulosService } from 'src/app/servicios/nivelTitulos/nivel-titulos.service';

@Component({
  selector: 'app-editar-titulos',
  templateUrl: './editar-titulos.component.html',
  styleUrls: ['./editar-titulos.component.css']
})

export class EditarTitulosComponent implements OnInit {

  // CONTROL DE LOS CAMPOS DEL FORMULARIO
  nombre = new FormControl('', [Validators.required, Validators.pattern("[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]{3,48}")]);
  nivelF = new FormControl('');
  nombreNivel = new FormControl('', Validators.pattern("[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]{3,48}"))


  // ASIGNAR LOS CAMPOS EN UN FORMULARIO EN GRUPO
  public formulario = new FormGroup({
    tituloNombreForm: this.nombre,
    tituloNivelForm: this.nivelF,
    nombreNivelForm: this.nombreNivel
  });

  // ARREGLO DE NIVELES EXISTENTES
  HabilitarDescrip: boolean = true;
  niveles: any = [];
  idNivel: any = [];

  constructor(
    private ntitulo: NivelTitulosService,
    private rest: TituloService,
    private toastr: ToastrService,
    public ventana: MatDialogRef<EditarTitulosComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
  }

  ngOnInit(): void {
    this.ObtenerNivelesTitulo();
    this.ImprimirDatos();
  }

  // METODO PARA LISTAR NIVELES
  ObtenerNivelesTitulo() {
    this.niveles = [];
    this.ntitulo.ListarNiveles().subscribe(res => {
      this.niveles = res;
      this.niveles[this.niveles.length] = { nombre: "OTRO" };
    });
  }

  // METODO PARA ACTIVAR FORULARIO
  ActivarDesactivarNombre(form: any) {
    if (form.tituloNivelForm === undefined) {
      this.formulario.patchValue({ nombreNivelForm: '' });
      this.HabilitarDescrip = false;
      this.toastr.info('Ingresar nombre de nivel de título.', '', {
        timeOut: 6000,
      });
    }
    else {
      this.formulario.patchValue({ nombreNivelForm: '' });
      this.HabilitarDescrip = true;
    }
  }

  // METODO PARA GUARDAR NIVEL DE TITULO
  GuardarNivel(form: any) {
    let nivel = {
      nombre: form.nombreNivelForm,
    };
    this.ntitulo.RegistrarNivel(nivel).subscribe(response => {
      this.ActualizarTitulo(form, response.id);
    });
  }

  // METODO PARA ACTUALIZAR TITULO
  ActualizarTitulo(form: any, idNivel: number) {
    let titulo = {
      id: this.data.id,
      nombre: form.tituloNombreForm,
      id_nivel: idNivel,
    };
    this.rest.ActualizarUnTitulo(titulo).subscribe(response => {
      this.toastr.success('Operación Exitosa.', 'Registro actualizado.', {
        timeOut: 6000,
      });
      this.CerrarVentana();
    });
  }

  // METODO PARA VALIDAR REGISTRO DE LETRAS
  IngresarSoloLetras(e: any) {
    let key = e.keyCode || e.which;
    let tecla = String.fromCharCode(key).toString();
    // SE DEFINE TODO EL ABECEDARIO QUE SE VA A USAR.
    let letras = " áéíóúabcdefghijklmnñopqrstuvwxyzÁÉÍÓÚABCDEFGHIJKLMNÑOPQRSTUVWXYZ";
    // ES LA VALIDACIÓN DEL KEYCODES, QUE TECLAS RECIBE EL CAMPO DE TEXTO.
    let especiales = [8, 37, 39, 46, 6, 13];
    let tecla_especial = false
    for (var i in especiales) {
      if (key == especiales[i]) {
        tecla_especial = true;
        break;
      }
    }
    if (letras.indexOf(tecla) == -1 && !tecla_especial) {
      this.toastr.info('No se admite datos numéricos', 'Usar solo letras', {
        timeOut: 6000,
      })
      return false;
    }
  }

  // METODO PARA EMITIR MENSAJES DE ERROR
  ObtenerMensajeErrorNombre() {
    if (this.nombre.hasError('required')) {
      return 'Campo Obligatorio';
    }
    return this.nombre.hasError('pattern') ? 'Ingrese un nombre válido' : '';
  }

  ObtenerMensajeErrorNivel() {
    if (this.nombreNivel.hasError('pattern')) {
      return 'Ingrese un nombre válido';
    }
  }

  // METODO PARA REGISTRAR DATOS
  InsertarTitulo(form: any) {
    if (form.tituloNivelForm === undefined || form.tituloNivelForm === 'OTRO') {
      if (form.nombreNivelForm != '') {
        this.GuardarNivel(form);
      }
      else {
        this.toastr.info('Ingrese un nombre de nivel o seleccione uno de la lista de niveles.', '', {
          timeOut: 6000,
        });
      }
    }
    else {
      this.ActualizarTitulo(form, form.tituloNivelForm);
    }
  }

  // METODO PARA MOSTRAR DATOS EN FORMULARIO
  ImprimirDatos() {
    this.idNivel = [];
    this.ntitulo.BuscarNivelNombre(this.data.nivel).subscribe(datos => {
      this.idNivel = datos;
      this.formulario.patchValue({
        tituloNombreForm: this.data.nombre,
        tituloNivelForm: this.data.nivel
      })
      this.nivelF.setValue(this.idNivel[0].id)
    })
  }

  // METODO PARA LIMPIAR FORMULARIO
  LimpiarCampos() {
    this.formulario.reset();
  }

  // METODO PARA CERRAR VENTANA
  CerrarVentana() {
    this.LimpiarCampos();
    this.ventana.close();
  }


}
