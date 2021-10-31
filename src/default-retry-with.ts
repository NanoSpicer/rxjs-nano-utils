import { MonoTypeOperatorFunction } from 'rxjs'
import {retryWith} from './retry-with'

/**
 * @returns a call to retryWith with default parameters of:
 * delay: 500,
 * codesToRetryOn: [500],
 * retryTimes: 3
 */
export function defaultRetryLogic<T>(canRetry?: (err: any) => boolean): MonoTypeOperatorFunction<T> {
    return retryWith({
        delay: 500,
        retryTimes: 2,
        // Always retry by default
        canRetryPredicate: canRetry ?? (() => true)
    })
}


/**
 * @returns a call to retryWith with default parameters of:
 * delay: 500,
 * codesToRetryOn: [500],
 * retryTimes: 3
 */
export function ngDefaultRetryLogic<T>(
    codesToRetryOn: Array<number> = [500],
    canRetry?: (err: any, codes: Array<number>) => boolean
): MonoTypeOperatorFunction<T> {
    const safeCodes = codesToRetryOn ?? []
    const defaultImpl = (err: any, codes: Array<number>) => {
        const status = err.status ?? -1
        if(codes.length === 0) return false
        return codes.includes(status)
    }
    return retryWith({
        delay: 500,
        retryTimes: 2,
        canRetryPredicate: (err: any) => (
            canRetry != null
                ? canRetry(err, safeCodes) 
                : defaultImpl(err, safeCodes)
        )
    })
}