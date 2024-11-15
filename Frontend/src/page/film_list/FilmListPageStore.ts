/**
 * Store for a single sub-page in the film_view list page.
 */
import {action, computed, makeObservable, observable, runInAction} from "mobx";
import {
  LoadStatus,
  LoadStatusDone,
  LoadStatusError,
  LoadStatusNotYetAttempted,
  LoadStatusPending
} from "../../util/LoadStatus";
import {FilmListPageFilm, IFilmListPageFilm} from "./FilmListPageFilm";
import {makeApiPath} from "../../util/network_util";
import {handleServerError} from "../../util/error_util";
import {PageableFilmStorePage} from "../../component/films/pagination/PageableFilmStore";

export type FilmListFiltersSortBy = `${'ALPHABETICAL' | 'RELEASED' | 'RATING'}_${'ASC' | 'DESC'}`
export type FilmListFiltersStatus = "ANY" | "OPEN" | "CLOSED"
export type FilmListFiltersAgeRatings = "G" | "PG" | "M" | "R13" | "R16" | "R18"| "TBC"





export interface FilmListFilters {
  query: string
  genreIds: number[]
  directorId: number | null
  reviewerId: number | null
  sortBy: FilmListFiltersSortBy
  status: FilmListFiltersStatus
  ageRatings: FilmListFiltersAgeRatings

}

interface FilmListResult {
  films: IFilmListPageFilm[],
  count: number
}

export interface FilmSupplier {
  films: FilmListPageFilm[] | null
  loadStatus: LoadStatus
  isLoading: boolean
}

export class FilmListPageStore implements FilmSupplier, PageableFilmStorePage {
  readonly pageSize = 10

  pageIndex: number
  totalResultCount: number | null = null

  films: FilmListPageFilm[] | null = null
  loadStatus: LoadStatus = new LoadStatusNotYetAttempted()

  constructor(pageIndex: number) {
    makeObservable(this, {
      pageIndex: observable,
      totalResultCount: observable,
      loadStatus: observable,
      films: observable,

      filmCount: computed,
      maxPageIndex: computed,
      isLoading: computed,

      goToFirstPage: action,
      goToLastPage: action,
      goToNextPage: action,
      goToPrevPage: action,
      reload: action
    })

    this.pageIndex = pageIndex
  }

  get filmCount(): number | null {
    return this.films?.length ?? null
  }

  get maxPageIndex(): number | null {
    if (this.totalResultCount === null) {
      return null
    }
    return Math.ceil(this.totalResultCount / this.pageSize) - 1
  }

  get isLoading(): boolean {
    return this.loadStatus instanceof LoadStatusPending
  }

  async goToFirstPage(filters: FilmListFilters) {
    this.pageIndex = 0
    await this.fetchCurrentPage(filters)
  }

  async goToLastPage(filters: FilmListFilters) {
    if (this.maxPageIndex === null) {
      throw new Error("Last page is not known")
    }
    else {
      this.pageIndex = this.maxPageIndex
      await this.fetchCurrentPage(filters)
    }
  }

  async goToNextPage(filters: FilmListFilters) {
    const maxPageIndex = (this.maxPageIndex === null) ? Infinity : this.maxPageIndex

    if (this.pageIndex + 1 > maxPageIndex) {
      throw new Error("Already at the last page")
    }
    else {
      this.pageIndex += 1
      await this.fetchCurrentPage(filters)
    }
  }

  async goToPrevPage(filters: FilmListFilters) {
    if (this.pageIndex === 0) {
      throw new Error("Already at the first page")
    }
    else {
      this.pageIndex -= 1
      await this.fetchCurrentPage(filters)
    }
  }

  async reload(filters: FilmListFilters) {
    this.pageIndex = 0
    this.totalResultCount = null

    await this.fetchCurrentPage(filters)
  }

  protected buildRequestUrlStringForCurrentPage(filters: FilmListFilters): string {
    const url = new URL(makeApiPath('/films'));

    // Pagination
    url.searchParams.set("startIndex", (this.pageIndex * this.pageSize).toString(10))
    url.searchParams.set("count", this.pageSize.toString(10))

    // Filters
    console.log(filters.query.length == 0)
    if(filters.query.length != 0) {
      url.searchParams.set("q", filters.query)
    }
    
    for (const genreId of filters.genreIds) {
      url.searchParams.append("genreIds", genreId.toString(10))
    }
    if (filters.directorId !== null) {
      url.searchParams.set("directorId", filters.directorId.toString(10))
    }
    if (filters.reviewerId !== null) {
      url.searchParams.set("reviewerId", filters.reviewerId.toString(10))
    }
    url.searchParams.set("sortBy", filters.sortBy)
    url.searchParams.set("status", filters.status)

    return url.toString()
  }

  protected async fetchCurrentPage(filters: FilmListFilters) {
    if (this.isLoading) {
      return
    }

    this.loadStatus = new LoadStatusPending()
    this.films = null

    try {
      const res = await fetch(this.buildRequestUrlStringForCurrentPage(filters))

      if (!res.ok) {
        handleServerError(res)
        return
      }

      const body: FilmListResult = await res.json()

      runInAction(() => {
        this.films = body.films.map((film) => new FilmListPageFilm(film))
        this.totalResultCount = body.count
        this.loadStatus = new LoadStatusDone()
      })
    }
    catch (e) {
      runInAction(() => {
        this.loadStatus = new LoadStatusError(e)
      })
      throw e
    }
  }
}