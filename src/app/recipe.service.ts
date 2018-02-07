import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { catchError, map, tap } from 'rxjs/operators';
import { MessageService } from './message.service';
import {Recipe} from './recipes/recipes-list/recipe-item/recipe';
import { YUMMLY } from '../keys';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};
@Injectable()
export class RecipeService {
  private yummly = YUMMLY;
  private recipesUrl = 'api/recipes';
  
  //`http://api.yummly.com/v1/api/recipes?_app_id=${this.yummly['app-id']}&_app_key=${this.yummly['app-key']}`;

  constructor(
    private http: HttpClient,
    private messageService: MessageService) {
     }

  getRecipes(): Observable<Recipe[]> {
    this.log('Recipes found');
    return this.http.get<Recipe[]>(`${this.recipesUrl}`)
    .pipe(
      tap(recipes => this.log('fetched recipes')),
      catchError(this.handleError('getRecipes', []))
    );
  }

  getRecipe(id: number): Observable<Recipe> {
    const url = `${this.recipesUrl}/${id}`;
    return this.http.get<Recipe>(url).pipe(
      tap(_ => this.log(`Fetched Recipe id=${id}`)),
      catchError(this.handleError<Recipe>(`getRecipe id=${id}`))
    );
  }

  private log(message: string) {
    this.messageService.add('RecipeService: ' + message);
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(error);
      this.log(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }

  updateRecipe(recipe: Recipe): Observable<any> {
    return this.http.put(this.recipesUrl, recipe, httpOptions).pipe(
      tap(_ => this.log(`updated recipe id=${recipe.id}`)),
      catchError(this.handleError<any>('updateRecipe'))
    );
  }
  addRecipe (recipe: Recipe): Observable<Recipe> {
    return this.http.post<Recipe>(this.recipesUrl, recipe, httpOptions).pipe(
      tap((recipe: Recipe) => this.log(`added Recipe w/ id=${recipe.id}`)),
      catchError(this.handleError<Recipe>('addRecipe'))
    );
  }
  deleteRecipe(recipe: Recipe | number): Observable<Recipe> {
    const id = typeof recipe === 'number' ? recipe : recipe.id;
    const url = `${this.recipesUrl}/${id}`;

    return this.http.delete<Recipe>(url, httpOptions).pipe(
      tap(_ => this.log(`deleted recipe id=${id}`)),
      catchError(this.handleError<Recipe>('deleteRecipe'))
    );
  }
  searchRecipes(term: string): Observable<Recipe[]> {
    if(!term.trim()) {
      return of([]);
    }
    return this.http.get<Recipe[]>(`api/recipes/?name=${term}`).pipe(
      tap(_ => this.log(`found recipes matching "${term}"`)),
      catchError(this.handleError<Recipe[]>('searchRecipes', []))
    );
  }
}