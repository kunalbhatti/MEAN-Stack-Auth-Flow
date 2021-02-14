import {
  NgModule
} from "@angular/core";
import {
  PreloadAllModules,
  RouterModule,
  Routes
} from '@angular/router';

import {
  LoginGuard
} from "./guards/login.guard";
import {
  PageNotFoundComponent
} from "./page-not-found/page-not-found.component";


const routes: Routes = [{
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full'
  }, {
    path: 'auth',
    loadChildren: () => import('./auth_module/auth.module').then(m => m.AuthModule),
    canActivate: [LoginGuard]
  },
  {
    path: 'app',
    loadChildren: () => import('./grocery_module/grocery.module').then(m => m.GroceryModule)
    // Auth guard has been applied inside the module. 
    // Bring page not found and server error page routes here to apply auth guard here
  },
  {
    path: '**',
    component: PageNotFoundComponent
  }
]

@NgModule({
  declarations: [],
  imports: [RouterModule.forRoot(routes, {
    preloadingStrategy: PreloadAllModules
  })],
  exports: [RouterModule]
})
export class AppRoutingModule {

}
