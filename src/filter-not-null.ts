import { Observable } from "rxjs";
import { map, filter } from "rxjs/operators";


export function filterNotNull<T>() {
    return (source: Observable<T|null|undefined>) => source.pipe(
        filter(src => src !== null && src !== undefined),
        map((src) => src!)
    )
}