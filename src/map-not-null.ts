import { Observable, pipe } from "rxjs";
import { filter, map } from "rxjs/operators";
import { filterNotNull } from "./filter-not-null";



export function mapNotNull<In, Out>(mapper: (data: In) => Out) {
    return (source: Observable<In>) => source.pipe(
        map(mapper),
        filterNotNull()
    )
}