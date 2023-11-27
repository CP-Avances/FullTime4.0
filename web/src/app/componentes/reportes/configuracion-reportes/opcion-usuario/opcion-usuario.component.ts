import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-opcion-usuario',
  templateUrl: './opcion-usuario.component.html',
  styleUrls: ['./opcion-usuario.component.css']
})
export class OpcionUsuarioComponent {
  @Output() tipoUsuarioChange = new EventEmitter<string>();

  tipoUsuario: string;

  constructor() {
    this.tipoUsuario = "activo";
  }

  CambiarTipoUsuario(){
    this.tipoUsuarioChange.emit(this.tipoUsuario);
  }
  

}
