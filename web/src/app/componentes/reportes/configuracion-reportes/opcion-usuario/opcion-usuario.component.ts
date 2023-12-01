import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-opcion-usuario',
  templateUrl: './opcion-usuario.component.html',
  styleUrls: ['./opcion-usuario.component.css']
})
export class OpcionUsuarioComponent {
  @Output() tipoUsuarioCambio = new EventEmitter<string>();

  tipoUsuario: string;

  constructor() {
    this.tipoUsuario = "activo";
  }

  CambiarTipoUsuario(){
    this.tipoUsuarioCambio.emit(this.tipoUsuario);
  }


}
