import { FormControl, Validators, FormGroup } from "@angular/forms";
import { Component, OnInit } from "@angular/core";
import { startWith, map } from "rxjs/operators";
import { ToastrService } from "ngx-toastr";
import { MatDialogRef } from "@angular/material/dialog";
import { Observable } from "rxjs";

import { ProvinciaService } from "src/app/servicios/configuracion/localizacion/catProvincias/provincia.service";
import { ValidacionesService } from "src/app/servicios/generales/validaciones/validaciones.service";

@Component({
  selector: "app-registro-provincia",
  templateUrl: "./registro-provincia.component.html",
  styleUrls: ["./registro-provincia.component.css"],
})

export class RegistroProvinciaComponent implements OnInit {
  ips_locales: any = '';

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  paises: any = [];
  continentes: any = [];

  filteredOptions: Observable<any[]>;

  // CONTROL DE CAMPOS Y VALIDACIONES DEL FORMULARIO
  nombreContinenteF = new FormControl("");
  nombreProvinciaF = new FormControl("", [
    Validators.required,
    Validators.pattern(
      "[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]{4,48}"
    ),
  ]);
  nombrePaisF = new FormControl("", [Validators.required]);

  // ASIGNACION DE VALIDACIONES A INPUTS DEL FORMULARIO
  public formulario = new FormGroup({
    nombreContinenteForm: this.nombreContinenteF,
    nombreProvinciaForm: this.nombreProvinciaF,
    nombrePaisForm: this.nombrePaisF,
  });

  constructor(
    private rest: ProvinciaService,
    private toastr: ToastrService,
    public ventana: MatDialogRef<RegistroProvinciaComponent>,
    public validar: ValidacionesService,
  ) { }

  ngOnInit(): void {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');  
    this.validar.ObtenerIPsLocales().then((ips) => {
      this.ips_locales = ips;
    });
    this.BuscarProvincias();
    this.continentes = this.ObtenerContinentes();
  }

  // METODO PARA FILTRAR DATOS
  private _filter(value: string): any {
    if (value != null) {
      const filterValue = value.toLowerCase();
      return this.paises.filter((pais: any) =>
        pais.nombre.toLowerCase().includes(filterValue)
      );
    }
  }

  // CONSULTAR LISTA DE CONTINENTES
  ObtenerContinentes() {
    this.continentes = [];
    this.rest.BuscarContinente().subscribe((datos) => {
      this.continentes = datos;
    });
  }

  // CONSULTAR LISTA DE PAISES DE ACUERDO AL CONTINENTE
  ObtenerPaises(continente: any) {
    this.paises = [];
    this.rest.BuscarPais(continente).subscribe((datos) => {
      this.paises = datos;
      this.filteredOptions = this.nombrePaisF.valueChanges.pipe(
        startWith(""),
        map((value: any) => this._filter(value))
      );
    });
  }

  // METODO PARA REALIZAR BUSQUEDAS POR FILTROS
  FiltrarPaises(form: any) {
    var nombreContinente = form.nombreContinenteForm;
    this.ObtenerPaises(nombreContinente);
  }

  // METODO PARA BUSCAR PROVINCIAS
  BuscarProvincias() {
    this.provincias = [];
    this.rest.BuscarProvincias().subscribe((response) => {
      this.provincias = response;
    });
  }

  // METODO PARA GUARDAR EL REGISTRO DE PROVINCIA
  provincias: any = [];
  contador: number = 0;
  InsertarProvincia(form: any) {
    let idPais = 0;
    // VALIDACION PAIS
    this.paises.forEach((obj: any) => {
      if (obj.nombre.toUpperCase() === form.nombrePaisForm.toUpperCase()) {
        idPais = obj.id;
      }
    });
    if (idPais === 0) {
      this.toastr.error(
        "Verificar selección de país",
        "Ups!!! algo salio mal.",
        {
          timeOut: 6000,
        }
      );
    } else {
      let provincia = {
        nombre: form.nombreProvinciaForm,
        id_pais: idPais,
        user_name: this.user_name,
        ip: this.ip, ip_local: this.ips_locales,
      };
      // VALIDAR SI EXISTE REGISTRO DE PROVINCIA
      if (this.provincias.length != 0) {
        this.contador = 0;
        this.provincias.forEach((obj: any) => {
          if (
            obj.nombre.toUpperCase() === form.nombreProvinciaForm.toUpperCase()
          ) {
            this.contador = this.contador + 1;
          }
        });
        if (this.contador === 0) {
          this.GuardarProvincia(provincia);
        } else {
          this.toastr.error(
            "Provincia ya se encuentra registrada.",
            "Ups!!! algo salio mal.",
            {
              timeOut: 6000,
            }
          );
        }
      } else {
        this.GuardarProvincia(provincia);
      }
    }
  }

  // METODO PARA REGISTRAR PROVINCIA EN BASE DE DATOS
  GuardarProvincia(provincia: any) {
    this.rest.RegistrarProvincia(provincia).subscribe(
      (response) => {
        this.toastr.success("Registro guardado exitosamente.", "", {
          timeOut: 6000,
        });
        this.CerrarVentana();
      },
      (error) => {
        this.toastr.error("Ups!!! algo salio mal.", "Ups!!! algo salio mal.", {
          timeOut: 6000,
        });
      }
    );
  }

  // METODO DE VALIDACION DE INGRESO DE LETRAS
  IngresarSoloLetras(e: any) {
    return this.validar.IngresarSoloLetras(e);
  }

  // METODO PARA LIMPIAR CAMPOS DEL FORMULARIO
  LimpiarCampos() {
    this.formulario.reset();
    this.ObtenerContinentes();
    this.paises = [];
  }

  // METODO PARA CERRAR FORMULARIO DE REGISTRO
  CerrarVentana() {
    this.LimpiarCampos();
    this.ventana.close();
  }

}
