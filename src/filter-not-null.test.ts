import { cold } from 'jest-marbles'
import { filterNotNull } from './filter-not-null'

describe('filterNotNull()', () => {

    it('should not emit "null" or "undefined" values although admitting falsy ones', () => {

        const src = cold('foanuv', {
            // falsy values should be emitted
            f: false, o: 0,  a: [], 
            n: null,
            u: undefined,

            // actual value
            v: 1
        })

        const mapped = src.pipe(filterNotNull())

        // An observable that 
        const expected = cold('foa--v', {f: false, o: 0,  a: [], v:1})
        expect(mapped).toBeObservable(expected)


    })
})