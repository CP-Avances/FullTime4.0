import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';

import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['../main-nav.component.css']
})

export class NavbarComponent implements OnInit {

  UserEmail: string = '';
  UserName: string = '';
  iniciales: string = '';
  urlImagen: any = '';
  mostrarImagen: boolean = false;

  constructor(
    private empleadoService: EmpleadoService,
  ) { }

  ngOnInit(): void {
    this.infoUser();
  }

  infoUser() {
    const id_empleado = parseInt(localStorage.getItem('empleado') as string);
    if (id_empleado.toString() === 'NaN') return id_empleado;

    let fullname = localStorage.getItem('fullname') as string;
    let correo = localStorage.getItem('correo') as string;
    let iniciales = localStorage.getItem('iniciales');
    let view_imagen = localStorage.getItem('view_imagen');
    console.log(fullname, correo, iniciales, view_imagen);

    if (fullname === null && correo === null && iniciales === null && view_imagen === null) {
      this.empleadoService.BuscarUnEmpleado(id_empleado).subscribe(res => {

        localStorage.setItem('fullname', res[0].nombre.split(" ")[0] + " " + res[0].apellido.split(" ")[0])
        localStorage.setItem('fullname_print', res[0].nombre + " " + res[0].apellido)
        localStorage.setItem('correo', res[0].correo)

        this.UserEmail = localStorage.getItem('correo') as string;
        this.UserName = localStorage.getItem('fullname') as string;
        if (res[0]['imagen'] != null) {
          localStorage.setItem('view_imagen', `${environment.url}/empleado/img/` + res[0]['imagen'])
          this.urlImagen = localStorage.getItem('view_imagen');
          this.mostrarImagen = true;
        } else {
          localStorage.setItem('iniciales', res[0].nombre.split(" ")[0].slice(0, 1) + res[0].apellido.split(" ")[0].slice(0, 1))
          this.iniciales = localStorage.getItem('iniciales') as string;
          this.mostrarImagen = false;
        }

      });
    } else {
      this.UserEmail = correo;
      this.UserName = fullname;
      if (iniciales === null) {
        this.urlImagen = view_imagen;
        this.mostrarImagen = true;
      } else {
        this.iniciales = iniciales;
        this.mostrarImagen = false;
      }
    }

  }

}
