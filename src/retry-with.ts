import { MonoTypeOperatorFunction, timer, throwError, Observable } from 'rxjs'
import { retryWhen, mergeMap } from 'rxjs/operators'


export interface RetryOptions {
  retryTimes?: number;
  delay?: number;
  canRetryPredicate: (err: any) => boolean
}

function decideIfCanRetry(
  error: any,
  emissionIndex: number,
  delay: number,
  maxRetryTimes: number,
  canRetryPredicate: (err: any) => boolean
): Observable<any> {
  const currentRetry = emissionIndex + 1; // indexes start at 0
  const exponentialBackoffDelay = currentRetry * delay;
  const weMaxedOutRetries = currentRetry > maxRetryTimes;
  // We've maxed out our retries; throw the error no matter what!
  if (weMaxedOutRetries) {
    return throwError(error);
  }
  
  return (
    // We still have retries; we should retry
    canRetryPredicate(error)
      ? timer(exponentialBackoffDelay)
      : throwError(error)
  )
}


/**
 * Custom implementation of the rxjs retryWhen. 
 * You may us NGRetryOptions to assume the error is an HttpErrorResponse from Angular
 * Simply use it in your pipe() method like:
 *
 * @example
 * obs$.pipe(
 *    retryWith({
 *      delay: 500,
 *      retryTimes: 3
 *    }),
 *    catchError( err => {…})
 * )
 * @param options lets the developer specify:
 * - the maximum amount of times we can retry
 * - a base delay between retries
 * - an array of status codes where retrying on makes sense and
 * @returns the custom implementation of retryWhen with exponential backoff
 */
export function retryWith<T, Opts extends RetryOptions>(options: Opts): MonoTypeOperatorFunction<T> {
    // If unspecified, don't delay between retries
    const delay = options.delay ?? 0;
    // If unspecified default to one retry .
    const maxRetryTimes = options.retryTimes ?? 1;

    return retryWhen<T>(errStream$ => errStream$.pipe(
        mergeMap((error, emissionIndex) =>decideIfCanRetry(
            error, emissionIndex, delay,
            maxRetryTimes, options.canRetryPredicate
        ))
    ));
}