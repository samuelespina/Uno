import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { HomeComponent } from './components/home/home.component';
import { MatchComponent } from './components/match/match.component';
import { ScoreboardComponent } from './components/scoreboard/scoreboard.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'match', component: MatchComponent },
  { path: 'scoreboard', component: ScoreboardComponent },
];
