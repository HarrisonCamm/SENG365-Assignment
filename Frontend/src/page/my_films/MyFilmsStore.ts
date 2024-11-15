import {
  FilmListFilters,
  FilmListFiltersSortBy, FilmListFiltersStatus,
  FilmListPageStore,
  FilmSupplier
} from "../film_list/FilmListPageStore";
import {FilmStore} from "../../store/FilmStore";
import {FilmListPageFilm} from "../film_list/FilmListPageFilm";
import {uniqBy} from "lodash";
import {
  LoadStatus,
  LoadStatusDone,
  LoadStatusError,
  LoadStatusNotYetAttempted
} from "../../util/LoadStatus";
import {action, computed, makeObservable, observable} from "mobx";
import {FilmDetails} from "../../store/FilmDetailsStore";
import {ApplicationStore} from "../../store/ApplicationStore";
import {PageableFilmStore, PageableFilmStorePage} from "../../component/films/pagination/PageableFilmStore";

export class MyFilmsStore implements FilmSupplier, PageableFilmStore, PageableFilmStorePage {
  readonly myFilms: FilmListPageStore
  readonly myReview: FilmListPageStore

  readonly page: PageableFilmStorePage

  pageIndex: number = 0

  constructor() {
    makeObservable(this, {
      pageIndex: observable,

      myFilmsFilters: computed,
      myReviewFilters: computed,
      films: computed,
      loadStatus: computed,
      isLoading: computed,

      goToFirstPage: action,
      goToLastPage: action,
      goToPrevPage: action,
      goToNextPage: action,

      pageSize: computed,
      totalResultCount: computed,
      filmCount: computed,
      maxPageIndex: computed
    })

    this.page = this
    this.myFilms = new FilmListPageStore(0)
    this.myReview = new FilmListPageStore(0)

    this.myFilms.reload(this.myFilmsFilters)
    this.myReview.reload(this.myReviewFilters)
  }

  get myFilmsFilters(): FilmListFilters {
    return {
      query: "",
      genreIds: [],
      directorId: ApplicationStore.main.user!.id,
      reviewerId: null,
      sortBy: "RELEASED_ASC",
      status: "ANY",
      ageRatings: "TBC"
    }
  }

  get myReviewFilters(): FilmListFilters {
    return {
      query: "",
      genreIds: [],
      directorId: null,
      reviewerId: ApplicationStore.main.user!.id,
      sortBy: "RELEASED_ASC",
      status: "ANY",
      ageRatings: "TBC"
    }
  }

  get films(): FilmListPageFilm[] | null {
    if (this.myFilms.films === null || this.myReview.films === null) {
      return null
    }
    else {
      const filmsArr = []
      if (this.myFilms.pageIndex === this.pageIndex) {
        filmsArr.push(...this.myFilms.films)
      }
      if (this.myReview.pageIndex === this.pageIndex) {
        filmsArr.push(...this.myReview.films)
      }

      return filmsArr
    }
  }

  get loadStatus(): LoadStatus {
    if (this.myFilms.isLoading || this.myReview.isLoading) {
      return this.myFilms.loadStatus
    }
    else if (this.myFilms.loadStatus instanceof LoadStatusError) {
      return this.myFilms.loadStatus
    }
    else if (this.myReview.loadStatus instanceof LoadStatusError) {
      return this.myReview.loadStatus
    }
    else if (this.myFilms.loadStatus instanceof LoadStatusDone && this.myReview.loadStatus instanceof LoadStatusDone) {
      return this.myReview.loadStatus
    }
    else {
      return new LoadStatusNotYetAttempted()
    }
  }

  get isLoading(): boolean {
    return this.myFilms.isLoading || this.myReview.isLoading
  }

  /// PageableFilmStore
  async goToFirstPage(): Promise<void> {
    this.pageIndex = 0
    await Promise.all([
      this.myFilms.goToFirstPage(this.myFilmsFilters),
      this.myReview.goToFirstPage(this.myReviewFilters)
    ])
  }

  async goToLastPage(): Promise<void> {
    const lastPage = this.maxPageIndex
    if (lastPage === null) {
      throw new Error("Last page is unknown")
    }

    this.pageIndex = lastPage

    const promises = []

    if (this.myFilms.maxPageIndex === this.pageIndex) {
      promises.push(this.myFilms.goToLastPage(this.myFilmsFilters))
    }
    if (this.myReview.maxPageIndex === this.pageIndex) {
      promises.push(this.myReview.goToLastPage(this.myReviewFilters))
    }

    await Promise.all(promises)
  }

  async goToPrevPage(): Promise<void> {
    if (this.pageIndex === 0) {
      throw new Error("Already at first page")
    }
    else {
      const promises = []

      if (this.myFilms.pageIndex === this.pageIndex) {
        promises.push(this.myFilms.goToPrevPage(this.myFilmsFilters))
      }
      if (this.myReview.pageIndex === this.pageIndex) {
        promises.push(this.myReview.goToPrevPage(this.myReviewFilters))
      }

      this.pageIndex -= 1

      await Promise.all(promises)
    }
  }

  async goToNextPage(): Promise<void> {
    const maxPageIndex = (this.maxPageIndex === null) ? Infinity : this.maxPageIndex

    if (this.pageIndex + 1 > maxPageIndex) {
      throw new Error("Already at the last page")
    }
    else {
      this.pageIndex += 1

      const promises = []
      if ((this.myFilms.maxPageIndex ?? Infinity) >= this.pageIndex) {
        promises.push(this.myFilms.goToNextPage(this.myFilmsFilters))
      }
      if ((this.myReview.maxPageIndex ?? Infinity) >= this.pageIndex) {
        promises.push(this.myReview.goToNextPage(this.myReviewFilters))
      }

      await Promise.all(promises)
    }
  }

  /// PageableFilmStorePage
  get pageSize(): number {
    return this.myReview.pageSize + this.myFilms.pageSize
  }

  get totalResultCount(): number | null {
    if (this.isLoading) {
      return null
    }
    else {
      return this.myFilms.totalResultCount! + this.myReview.totalResultCount!
    }
  }

  get filmCount(): number | null {
    let count = 0
    if (this.pageIndex === this.myReview.pageIndex) {
      if (this.myReview.filmCount === null) {
        return null
      }
      count += this.myReview.filmCount
    }
    if (this.pageIndex === this.myFilms.pageIndex) {
      if (this.myFilms.filmCount === null) {
        return null
      }
      count += this.myFilms.filmCount
    }
    return count
  }

  get maxPageIndex(): number | null {
    if (this.isLoading) {
      return null
    }
    return Math.max(this.myFilms.maxPageIndex!, this.myReview.maxPageIndex!)
  }
}