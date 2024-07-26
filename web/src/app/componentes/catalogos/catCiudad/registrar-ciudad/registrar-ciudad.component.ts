import { FormControl, Validators, FormGroup } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { startWith, map } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { MatDialogRef } from '@angular/material/dialog';
import { Observable } from 'rxjs';

import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { ProvinciaService } from 'src/app/servicios/catalogos/catProvincias/provincia.service';
import { CiudadService } from 'src/app/servicios/ciudad/ciudad.service';

@Component({
  selector: 'app-registrar-ciudad',
  templateUrl: './registrar-ciudad.component.html',
  styleUrls: ['./registrar-ciudad.component.css']
})

export class RegistrarCiudadComponent implements OnInit {

  // CONTROL DE LOS CAMPOS DEL FORMULARIO
  nombreContinenteF = new FormControl('', Validators.required);
  idProvinciaF = new FormControl('', Validators.required);
  nombrePaisF = new FormControl('', Validators.required);
  nombreF = new FormControl('', [Validators.required, Validators.pattern("[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]{4,48}")]);

  filteredOptions: Observable<any[]>;
  filteredOpt: Observable<any[]>;

  // DATOS PROVINCIAS
  provincias: any = [];
  continentes: any = [];
  paises: any = [];

  // VARIABLES ACTIVACION
  ver_provincia: boolean = true;
  ver_ciudad: boolean = true;
  ver_pais: boolean = true;

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  // ASIGNAR LOS CAMPOS EN UN FORMULARIO EN GRUPO
  public formulario = new FormGroup({
    nombreContinenteForm: this.nombreContinenteF,
    idProvinciaForm: this.idProvinciaF,
    nombrePaisForm: this.nombrePaisF,
    nombreForm: this.nombreF,
  });

  constructor(
    private rest: CiudadService,
    private restP: ProvinciaService,
    private toastr: ToastrService,
    public ventana: MatDialogRef<RegistrarCiudadComponent>,
    public validar: ValidacionesService,
  ) { }

  ngOnInit(): void {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');

    this.ObtenerContinentes();
  }

  // METODO PARA FILTRAR DATOS DE PAISES
  private _filter(value: string): any {
    if (value != null) {
      const filterValue = value.toLowerCase();
      return this.paises.filter((pais: any) => pais.nombre.toLowerCase().includes(filterValue));
    }
  }

  // METODO PARA FILTRAR DATOS DE PROVINCIAS
  private _filterProvincia(value: string): any {
    if (value != null) {
      const filterValue = value.toLowerCase();
      return this.provincias.filter((provincias: any) => provincias.nombre.toLowerCase().includes(filterValue));
    }
  }

  // METODO PARA LISTAR CONTINENTES
  ObtenerContinentes() {
    this.continentes = [];
    this.restP.BuscarContinente().subscribe(datos => {
      this.continentes = datos;
    })
  }

  // METODO PARA LISTAR CIUDADES
  ciudades: any = [];
  ObtenerCiudades(id_provincia: number) {
    this.ciudades = [];
    this.rest.BuscarCiudadProvincia(id_provincia).subscribe(datos => {
      this.ciudades = datos;
    })
  }

  // METODO PARA LISTAR PAISES
  ObtenerPaises(continente: any) {
    this.paises = [];
    this.restP.BuscarPais(continente).subscribe(datos => {
      this.paises = datos;
      this.filteredOptions = this.nombrePaisF.valueChanges
        .pipe(
          startWith(''),
          map((value: any) => this._filter(value))
        );
      this.ver_pais = false;
    })
  }

  // METODO PARA MOSTRAR DATOS DE PAISES
  FiltrarPaises(form: any) {
    var nombreContinente = form.nombreContinenteForm;
    this.ObtenerPaises(nombreContinente);
  }

  // METODO PARA LISTAR PROVINCIAS
  ObtenerProvincias(pais: any) {
    this.provincias = [];
    this.restP.BuscarProvinciaPais(pais).subscribe(datos => {
      this.provincias = datos;
      this.filteredOpt = this.idProvinciaF.valueChanges
        .pipe(
          startWith(''),
          map((value: any) => this._filterProvincia(value))
        );
      this.ver_provincia = false;
    }, error => {
      this.toastr.info('El país seleccionado no tiene Provincias, Departamentos o Estados registrados', '', {
        timeOut: 6000,
      })
      this.ver_provincia = true;
      this.idProvinciaF.reset();
    })
  }

  // METODO PARA MOSTRAR LISTA DE PROVINCIAS
  FiltrarProvincias(form: any) {
    let idPais = 0;
    this.paises.forEach((obj: any) => {
      if (obj.nombre.toUpperCase() === form.nombrePaisForm.toUpperCase()) {
        idPais = obj.id
      }
    });
    if (idPais === 0) {
      this.toastr.info('Verificar selección de país.', 'Ups!!! algo salio mal.', {
        timeOut: 6000,
      })
      this.provincias = [];
    }
    else {
      this.ObtenerProvincias(idPais);
    }
  }

  // METODO PARA MOSTRAR LISTA DE CIUDADES
  FiltrarCiudades(form: any) {
    let id_provincia = 0;
    this.provincias.forEach((obj: any) => {
      if (obj.nombre.toUpperCase() === form.idProvinciaForm.toUpperCase()) {
        id_provincia = obj.id
      }
    });
    if (id_provincia != 0) {
      this.ObtenerCiudades(id_provincia);
      this.ver_ciudad = false;
    }
  }

  // METODO PARA REGISTRAR CIUDAD
  InsertarCiudad(form: any) {
    let provinciaId = 0;
    //  BUSCAR ID DE PROVINCIA
    this.provincias.forEach((obj: any) => {
      if (obj.nombre.toUpperCase() === form.idProvinciaForm.toUpperCase()) {
        provinciaId = obj.id
      }
    });
    // VERIFICAR SI PROVINCIA EXISTE
    if (provinciaId === 0) {
      this.toastr.warning('Verificar selección de provincia.', 'Ups!!! algo salio mal.', {
        timeOut: 6000,
      })
    }
    else {
      let ciudad = {
        descripcion: form.nombreForm,
        id_provincia: provinciaId,
        user_name: this.user_name,
        ip: this.ip
      };
      // VERIFICAR SI CIUDAD --- NO EXISTE REGISTRO
      if (this.ciudades.length === 0) {
        this.GuardarDatos(ciudad);
      }
      else {
        var contador = 0;
        this.ciudades.forEach((obj: any) => {
          if (ciudad.descripcion.toUpperCase() === obj.descripcion.toUpperCase()) {
            contador = 1;
          }
        })
        // CIUDAD NO EXISTE
        if (contador === 0) {
          this.GuardarDatos(ciudad)
        }
        else {
          this.toastr.error('Ciudad ya se encuentra registrada.', 'Ups!!! algo salio mal.', {
            timeOut: 6000,
          })
        }
      }
    }
  }

  // GUARDAR DATOS DE CIUDAD EN BASE DE DATOS
  GuardarDatos(ciudad: any) {
    this.rest.RegistrarCiudad(ciudad).subscribe(response => {
      this.toastr.success('Operación exitosa.', 'Registro guardado.', {
        timeOut: 6000,
      });
      this.CerrarVentana();
    }, error => {
      this.toastr.error('Ups!!! algo salio mal..', 'Ups!!! algo salio mal.', {
        timeOut: 6000,
      })
    });
  }

  // LIMPIAR CAMPOS DE FORMULARIO
  LimpiarCampos() {
    this.formulario.reset();
    this.ObtenerContinentes();
    this.paises = [];
    this.provincias = [];
  }

  // METODO PARA CERRAR VENTANA DE REGISTRO
  CerrarVentana() {
    this.LimpiarCampos();
    this.ventana.close();
  }

  // METODO PARA VALIDAR INGRESO DE LETRAS
  IngresarSoloLetras(e: any) {
    return this.validar.IngresarSoloLetras(e);
  }

}
