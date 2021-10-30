import { MonoTypeOperatorFunction } from 'rxjs'
import {retryWith} from './retry-with'

/**
 * @returns a call to retryWith with default parameters of:
 * delay: 500,
 * codesToRetryOn: [500],
 * retryTimes: 3
 */
export function defaultRetryLogic<T>(canRetryPredicate: (err: any) => boolean): MonoTypeOperatorFunction<T> {
    return retryWith({
        delay: 500,
        retryTimes: 2,
        canRetryPredicate
    })
}


/**
 * @returns a call to retryWith with default parameters of:
 * delay: 500,
 * codesToRetryOn: [500],
 * retryTimes: 3
 */
export function ngDefaultRetryLogic<T>(codesToRetryOn: Array<number> = [500]): MonoTypeOperatorFunction<T> {
    return retryWith({
        delay: 500,
        retryTimes: 2,
        canRetryPredicate(err: any) {
            const status = err?.status ?? -1
            const safeCodes = codesToRetryOn ?? []
            if(safeCodes.length === 0) return false
            return safeCodes.includes(status)
        }
    })
}