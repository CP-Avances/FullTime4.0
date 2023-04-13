import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { DocumentosService } from 'src/app/servicios/documentos/documentos.service';

@Component({
  selector: 'app-ver-documentos',
  templateUrl: './ver-documentos.component.html',
  styleUrls: ['./ver-documentos.component.css']
})

export class VerDocumentosComponent implements OnInit {

  // ARRAY DE CARPETAS
  array_carpetas: any = [];

  constructor(
    public router: Router,
    private route: ActivatedRoute,
    private rest: DocumentosService,
  ) { }

  ngOnInit(): void {
    this.ObtenerCarpetas();
  }

  // METODO PARA OBTENER CARPETAS
  ObtenerCarpetas() {
    this.rest.ListarCarpeta().subscribe(res => {
      this.array_carpetas = res
    })
  }

  // METODO PARA ABRIR UNA CARPETA
  AbrirCarpeta(nombre_carpeta: string) {
    this.router.navigate([nombre_carpeta], { relativeTo: this.route, skipLocationChange: false });
  }

}
