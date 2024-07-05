import { Router, ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { startWith, map } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';

import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['../main-nav.component.css']
})

export class SearchComponent implements OnInit {

  filteredOptions: Observable<string[]>;
  options: string[] = [];
  buscar_empl: any = [];
  rol: any
  myControl = new FormControl();

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.options.filter(option => option.toLowerCase().indexOf(filterValue) === 0);
  }

  constructor(
    private empleadoService: EmpleadoService,
    private router: Router,
    private route: ActivatedRoute
  ) { 
    this.rol = localStorage.getItem('rol');
    //console.log('rolll: ',this.rol)
  }

  ngOnInit(): void {
    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value))
    );
    this.BarraBusquedaEmpleados();
  }

  BarraBusquedaEmpleados() {
    //Verificacion de elementos para saber si esta o no el elemento inicial
    let firstElement: string = '';
    if (!!sessionStorage.getItem('lista-empleados')) {
      const jsonString = sessionStorage.getItem('lista-empleados') as string;
      const jsonObject = JSON.parse(jsonString);
      firstElement = jsonObject[Object.keys(jsonObject)[0]].id;
    }

    if (!!sessionStorage.getItem('lista-empleados') && firstElement != '0') { //se aumento -> &&
      // console.log('ya hay lista en la sesion iniciada');
      let empleados = JSON.parse(sessionStorage.getItem('lista-empleados') as string);

      empleados.forEach((obj: any) => {
        this.options.push(obj.empleado)
      });
      this.buscar_empl = empleados
    } else {
      // console.log('entra aqui solo al iniciar sesion');
      this.empleadoService.BuscarListaEmpleados().subscribe(res => {
        let ObjetoJSON = JSON.stringify(res)
        sessionStorage.setItem('lista-empleados', ObjetoJSON)
        res.forEach((obj: any) => {
          this.options.push(obj.empleado)
        });
        this.buscar_empl = res
      })
    }
  };

  abrirInfoEmpleado(nombre: string) {
    this.buscar_empl.forEach((element: any) => {
      if (element.empleado === nombre) {
        this.router.navigate(['/verEmpleado/', element.id],
          { relativeTo: this.route, skipLocationChange: false });
      }
    });

  }

}
