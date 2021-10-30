import { Observable, of, EMPTY, concat, race } from 'rxjs'
import { 
  catchError, distinctUntilChanged, endWith, 
  filter, map, mapTo, shareReplay, switchMap 
} from 'rxjs/operators'

/**
 * An aggregate that holds together:
 *
 * @property data$ the stream that has the information
 * @property error$ the stream that has the errors
 * @property loading$ the stream that indicates progress
 */
 export interface Streams<T> {
  data$: Observable<T>;
  error$: Observable<any>;
  loading$: Observable<boolean>;
}


export function streamsOf<T>(data$: Observable<T>): Streams<T> {
  const withCache = data$.pipe(shareReplay(1)); // It doesnt make sense to not cache server events

  // For any value, error or finalization happenning => we are not loading no-more.
  const isDataLoading = withCache.pipe(
    // Any emissions on data => we're not loading any more
    mapTo(false),
    // Any errors => we're not loading any more
    catchError(() => of(false)),
    // if no data or errors, we're done loading anyway.
    endWith(false),
    // If an observable emits a value and then completes
    // just have 1 emission
    distinctUntilChanged()
  );

  // We challenge to a race the server call and a hardcoded true.
  const loading = race(isDataLoading, of(true)).pipe(
    switchMap(isLoading => {
      // Race won by the hardcoded value because the other one always emits false.
      if (isLoading === true) {
        // So we concatenate the same value and the others coming later
        return concat(of(true), isDataLoading);
      } else {
        // Race won by the isDataLoading.
        // Just use it because we're already done loading
        return isDataLoading;
      }
    }),
    distinctUntilChanged()
  );

  const errorStream = withCache.pipe(
    // Any correct emission is not an error emission
    mapTo(null),
    // Anything that is null is a valid emission
    filter(value => value != null),
    catchError(err => of(err))
  );

  const result = withCache.pipe(
    // If an error occurs, the data stream will have no emissions
    catchError(() => EMPTY),
  );

  return {
    data$: result,
    error$: errorStream,
    loading$: loading,
  };
}
