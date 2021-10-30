import {retryWith} from './retry-with'

/**
 * @returns a call to retryWith with default parameters of:
 * delay: 500,
 * codesToRetryOn: [500],
 * retryTimes: 3
 */
export function defaultRetryLogic<T>(): MonoTypeOperatorFunction<T> {
    return retryWith({
        delay: 500,
        codesToRetryOn: [500],
        retryTimes: 2
    })
}