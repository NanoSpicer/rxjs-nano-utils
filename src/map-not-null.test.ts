import { mapNotNull } from './map-not-null'
import { cold } from 'jest-marbles'

describe('mapNotNull()', () => {

    it('should not forward values that are null or undefined', () => {
        const src = cold('nuna', {n: null, u: undefined, a: 1})
        // three empty ticks and finally a value 
        const expected = cold('---a', {a:1})
        const mapped = src.pipe(
            mapNotNull(it => it)
        )
        expect(mapped).toBeObservable(expected)
    })
})