# RxJs utils
A very small set of RxJs utilities that I often use on my Angular apps.


## Filter not null

Filter not null filters out all emissions that are `null` or `undefined` 

```typescript
// No emissions if there's a network error
this.http.get(...).pipe(
  filterNotNull(),
  catchError(err => of(null)
)
```


## Map not null

Performs the given mapping operation and if the result wasn't `null` or `undefined` triggers an emission.

```typescript
// No emissions on even numbers
of(1,2,3,4,5,6).pipe(
  mapNotNull(it => it%2===0 ? null : it)
)
// Emits: 1, 3, 5 and completes
```

## Streams Of

From a given stream returns three streams: 
* `data$` the data stream itself. If an error occurs doesn't emit errors nor data
* `error$` only emits an error on the regular pipeline if the source stream emits an error
* `loading$` emits `true` when the source observable is still processing and false when it sends data, an error or completes

It's really useful to use this one to match your components full state:

```html
<!-- component.html -->
<div>
  <loading-spinner *ngIf="loading$|async"></loading-spinner>
  <app-error *ngIf="error$|async as err" [error]="err></app-error>
  <div *ngIf="data$|async as data"> {{data | json }}</div>
</div>
```

```typescript
@Component({...})
export class YourComponent implements OnInit {
  
  loading$: Observable<boolean>
  error$: Observable<any>
  data$: Observable<Type>
  
  constructor(
    private actRoute: ActivatedRoute, 
    private apiService: ApiService
  ) {
    const dataStream = this.actRoute.paramMap.pipe(
      map(params => params.get('id')),
      switchMap(id => this.apiService.get(id))
    )
    
    const { data$, error$, loading$ } = streamsOf(dataStream)
    
    this.data$ = data; this.error$ = error; this.loading$ = loading
  
  }

}
```


## retryWith, defaultRetryLogic and ngDefaultRetryLogic

Adds retry logic with a certain criteria which is passed by the `RetryOptions` interface.


* `retryWith` (options). It's a wrapper that hides a little bit the RxJS boilerplate that one needs to write in order to get retries on a stream
* `defaultRetryLogic()` is a wrapper on top of the previous operation setting `retries: 2, delay: 500ms` you may pass a callback to determine whether a retry should happen based on the error that just got emitted.
* `ngDefaultRetryLogic()` yet another wrapper on the previous one. This one assumes that the shape of the error is of an `HttpErrorResponse` and it lets you to pass a list of http error codes where to perform a retry; by default it only retries on a 500 error code.

```typescript

throwError(new Error('Something bad')).pipe(
  // Only retry if the error message is 'Something bad' 
  defaultRetryLogic(err => err.message === 'Something bad')
).subscribe({
  // After three retries will print "crash" and the error message
  error: err => console.log('crash!', err)
})

this.http.get(...).pipe(
  ngDefaultRetryLogic() // Only retries if the backend returns a 500
)
```




