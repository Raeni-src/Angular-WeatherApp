import { CommonModule } from '@angular/common'
import { Component, OnInit } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { Router, RouterLink, RouterLinkActive } from '@angular/router'
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'
import { faSearch } from '@fortawesome/free-solid-svg-icons'

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [FontAwesomeModule, CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './homepage.component.html',
  styleUrl: './homepage.component.css'
})

export class HomepageComponent implements OnInit {

  backgroundUrl = 'assets/images/background.jpg'; 
  faSearch = faSearch;
  location: string = '';


  constructor(private router: Router) {}

  ngOnInit(): void {
  }

  onSearch(event: Event): void {
    event.preventDefault();
    if (typeof this.location === 'string' && this.location.trim().length > 0) {
      this.router.navigate(['/trends', this.location])
    }
  }
}
