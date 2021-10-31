import { cold } from "jest-marbles"
import { BehaviorSubject } from "rxjs"
import { streamsOf } from './streams-of'

describe('streamsOf', () => {


    test('loading emits "true" as start and then emits "false" when data is emitted', ()=> {
        const src = cold('--d', {d: 1})
        const {loading$, data$, error$} = streamsOf(src)

        const expectedLoading = cold('t-f', {t: true, f: false})
        expect(loading$).toBeObservable(expectedLoading)

        const expectedData = cold('--d', {d: 1})
        expect(data$).toBeObservable(expectedData)
        
        const expectedError = cold('---')
        expect(error$).toBeObservable(expectedError)

    })

    test('loading emits "true" as start and then emits "false" when an error occurs', ()=> {
        const src = cold('--#', undefined, 'error')
        const {loading$, data$, error$} = streamsOf(src)

        // a stream that emits false and completes when the error is emitted
        const expectedLoading = cold('t-(f|)', {t: true, f: false})
        expect(loading$).toBeObservable(expectedLoading)

        // a stream that finishes upon the rror
        const expectedData = cold('--|') 
        expect(data$).toBeObservable(expectedData)

        // A stream that emits the error as a value and completes right after
        const expectedError = cold('--(a|)', {a:'error'}) 
        expect(error$).toBeObservable(expectedError)

    })

    test('loading emits "false" if an observable has already emitted', () => {
        const src = new BehaviorSubject(1) // An observable that already has a value
        const {loading$} = streamsOf(src)

        const expectedLoading = cold('f', {t:true, f: false})
        expect(loading$).toBeObservable(expectedLoading)

    })

    test('loading emits "true" and then "false" if an observable completes without emissions', () => {
        const src = cold('--|')
        const {loading$} = streamsOf(src)

        const expectedLoading = cold('t-(f|)', {t: true, f: false})
        expect(loading$).toBeObservable(expectedLoading)
    })
})