import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { enableProdMode } from '@angular/core';
import "@angular/compiler"; // import the JIT compiler

// if (environment.production) {
//   enableProdMode();
// }


platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch(err => console.error(err));
