import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { GroceryRoutingModule } from "./grocery-routing.module";
import { HomeComponent } from './home/home.component';

@NgModule({
    declarations: [HomeComponent],
    imports: [CommonModule, GroceryRoutingModule],
    exports: []
})
export class GroceryModule{

}