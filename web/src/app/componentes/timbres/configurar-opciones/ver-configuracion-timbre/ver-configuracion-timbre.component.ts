import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-ver-configuracion-timbre',
  templateUrl: './ver-configuracion-timbre.component.html',
  styleUrl: './ver-configuracion-timbre.component.css'
})

export class VerConfiguracionTimbreComponent implements OnInit {

  @Input() informacion: any;

  ngOnInit(): void {
    console.log('ver info ', this.informacion)

  }
}
