import { MonoTypeOperatorFunction } from 'rxjs'
import { retryWhen, mergeMap, throwError } from 'rxjs/operators'


export interface RetryOptions {
    retryTimes?: number;
    codesToRetryOn?: Array<number>;
    delay?: number;
}


function decideIfCanRetry(
    error: any,
    emissionIndex: number,
    delay: number,
    maxRetryTimes: number,
    userSpecifiedRetryCodes: boolean,
    codesToRetryOn: number[]
): Observable<any> {
    const currentRetry = emissionIndex + 1; // indexes start at 0
    const exponentialBackoffDelay = currentRetry * delay;
    const weMaxedOutRetries = currentRetry > maxRetryTimes;
    // We've maxed out our retries; throw the error no matter what!
    if (weMaxedOutRetries) {
      return throwError(error);
    }
    // We still have retries; we should check the error status code if
    // 1. the developer specified status codes AND it's an http error.
    const shouldCheckStatusCode = userSpecifiedRetryCodes && error instanceof HttpErrorResponse;
    if (shouldCheckStatusCode) {
      const httpErr = error as HttpErrorResponse;
      // We can retry, if the current error code is inside the passed list
      const canRetryOnCurrentHttpCode = codesToRetryOn?.includes(httpErr.status) ?? false;
      if (canRetryOnCurrentHttpCode) {
        return timer(exponentialBackoffDelay);
      } else {
        return throwError(error);
      }
    }
    // The error wasn't an HTTP error, we're gonna retry after the delay
    return timer(exponentialBackoffDelay);
  }
}


/**
 * Custom implementation of the rxjs retryWhen.
 * Simply use it in your pipe() method like:
 *
 * @example
 * obs$.pipe(
 *    retryWith({
 *      delay: 500,
 *      codesToRetryOn: [500],
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
export function retryWith<T>(options: RetryOptions): MonoTypeOperatorFunction<T> {
    // If unspecified, don't delay between retries
    const delay = options.delay ?? 0;
    // If unspecified, don't match any statusCode
    const userSpecifiedRetryCodes = options.codesToRetryOn != null && options.codesToRetryOn.length > 0;
    // If unspecified default to one retry .
    const maxRetryTimes = options.retryTimes ?? 1;

    return retryWhen<T>(errStream$ => errStream$.pipe(
        mergeMap((error, emissionIndex) =>decideIfCanRetry(
            error, emissionIndex, delay,
            maxRetryTimes, userSpecifiedRetryCodes,
            options.codesToRetryOn
        ))
    ));
}