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


## Retry with and defaultRetryLogic

Adds retry logic with a certain criteria which is passed by the `RetryOptions` interface.

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



