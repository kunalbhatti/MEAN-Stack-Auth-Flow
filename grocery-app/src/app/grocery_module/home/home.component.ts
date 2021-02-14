import {
  Component,
  OnInit
} from '@angular/core';
import {
  Router
} from '@angular/router';
import {
  AuthService
} from './../../services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  user: {
    name: string;
    photoUrl: string;
  }

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.user = {
      name: localStorage.getItem('grocery-user-name'),
      photoUrl: localStorage.getItem('grocery-user-photo')
    }
  }

  logout() {
    this.authService.logout();
    document.getElementById('closeModalBtn').click();
    this.router.navigate(['/', 'auth', 'login']);
  }

}
