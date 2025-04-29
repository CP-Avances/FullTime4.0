import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { MatDialogRef } from '@angular/material/dialog';

import { TituloService } from 'src/app/servicios/usuarios/catTitulos/titulo.service';
import { NivelTitulosService } from 'src/app/servicios/usuarios/nivelTitulos/nivel-titulos.service';
import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';

@Component({
  selector: 'app-titulos',
  standalone: false,
  templateUrl: './titulos.component.html',
  styleUrls: ['./titulos.component.css'],
})

export class TitulosComponent implements OnInit {
  ips_locales: any = '';

  // CONTROL DE LOS CAMPOS DEL FORMULARIO
  nombreNivel = new FormControl('', Validators.pattern("[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]{3,48}"))
  nombre = new FormControl('', [Validators.required, Validators.pattern("[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]{3,48}")]);
  nivel = new FormControl('');

  // ASIGNAR LOS CAMPOS EN UN FORMULARIO EN GRUPO
  public formulario = new FormGroup({
    tituloNombreForm: this.nombre,
    tituloNivelForm: this.nivel,
    nombreNivelForm: this.nombreNivel
  });

  // ARREGLO DE NIVELES EXISTENTES
  niveles: any = [];

  HabilitarDescrip: boolean = true;

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  constructor(
    private rest: TituloService,
    private nivel_: NivelTitulosService,
    private toastr: ToastrService,
    public ventana: MatDialogRef<TitulosComponent>,
    public validar: ValidacionesService,
  ) {
  }

  ngOnInit(): void {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');  
    this.validar.ObtenerIPsLocales().then((ips) => {
      this.ips_locales = ips;
    }); 

    this.ObtenerNivelesTitulo();
    this.niveles[this.niveles.length] = { nombre: "OTRO" };
  }

  // METODO PARA LISTAR NIVELES DE TITULO
  ObtenerNivelesTitulo() {
    this.niveles = [];
    this.nivel_.ListarNiveles().subscribe(res => {
      this.niveles = res;
      this.niveles[this.niveles.length] = { nombre: "OTRO" };
    });
  }

  // METODO PARA ACTIVAR FORMULARIO
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

  // METODO PARA VALIDAR INGRESO DE LETRAS
  IngresarSoloLetras(e: any) {
    return this.validar.IngresarSoloLetras(e);
  }

  // METODO PARA REGISTRAR TITULO
  InsertarTitulo(form: any) {
    if (!form.tituloNivelForm || form.tituloNivelForm === 'OTRO') {
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
      this.GuardarTitulo(form, form.tituloNivelForm);
    }
  }

  // METODO PARA REGISTRAR NIVEL DE TITULO
  GuardarNivel(form: any) {
    let nivel = {
      nombre: form.nombreNivelForm,
      user_name: this.user_name,
      ip: this.ip, ip_local: this.ips_locales,
    };
    // VERIIFCAR DUPLICIDAD
    let nombre_nivel = (nivel.nombre).toUpperCase();
    this.nivel_.BuscarNivelNombre(nombre_nivel).subscribe(response => {
      this.toastr.warning('El nivel ingresado ya existe en el sistema.', 'Ups! algo salio mal.', {
        timeOut: 3000,
      });
    }, vacio => {
      // GUARDAR DATOS DE NIVEL EN EL SISTEMA
      this.nivel_.RegistrarNivel(nivel).subscribe(response => {
        this.GuardarTitulo(form, response.id);
      })
    });
  }

  // METODO PARA GUARDAR TITULO
  GuardarTitulo(form: any, idNivel: number) {
    let nombreIngresado = form.tituloNombreForm.trim();
    let nombreFormateado = nombreIngresado.charAt(0).toUpperCase() + nombreIngresado.slice(1).toLowerCase();
    let titulo = {
      nombre: nombreFormateado,
      id_nivel: idNivel,
      user_name: this.user_name,
      ip: this.ip,
      ip_local: this.ips_locales
    };
    let verificar = {
      nombre: nombreIngresado.toUpperCase(),
      nivel: idNivel
    };
  
    this.rest.BuscarTituloNombre(verificar).subscribe(response => {
      this.toastr.warning('El nombre ingresado ya existe en el sistema.', 'Ups! algo salió mal.', {
        timeOut: 3000,
      });
    }, vacio => {
      this.AlmacenarTitulo(titulo);
    });
  }
  

  // METODO PARA ALMACENAR EN LA BASE DE DATOS
  AlmacenarTitulo(titulo: any) {
    this.rest.RegistrarTitulo(titulo).subscribe(response => {
      this.toastr.success('Operación exitosa.', 'Registro guardado.', {
        timeOut: 6000,
      });
      this.CerrarVentana();
    });
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

  // METODO PARA BUSCAR TITULO
  BuscarTitulo() {

  }

}
