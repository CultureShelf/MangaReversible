import { Component } from '@angular/core';

@Component({
  selector: 'app-test',
  template: `<p>{{ message }}</p>`
})
export class TestComponent  {

  message = '';

  constructor() {}
}