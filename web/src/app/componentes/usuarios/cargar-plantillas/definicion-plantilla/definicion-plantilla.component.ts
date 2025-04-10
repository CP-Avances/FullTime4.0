import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-definicion-plantilla',
  standalone: false,
  templateUrl: './definicion-plantilla.component.html',
  styleUrls: ['./definicion-plantilla.component.css']
})

export class DefinicionPlantillaComponent implements OnInit {

  expansion: boolean = false;

  constructor(
  ) {
  }

  ngOnInit(): void {
  }

}
