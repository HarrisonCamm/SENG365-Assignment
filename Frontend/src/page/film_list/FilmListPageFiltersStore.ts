import {action, makeObservable, observable} from "mobx";
import {FilmListFilters, FilmListFiltersAgeRatings, FilmListFiltersSortBy, FilmListFiltersStatus} from "./FilmListPageStore";

export class FilmListPageFiltersStore {
  queryString: string = ""
  genreIds: number[] = []
  directorId: number | null = null
  reviewerId: number | null = null
  sortBy: FilmListFiltersSortBy = "RELEASED_ASC"
  status: FilmListFiltersStatus = "ANY"
  ageRatings: FilmListFiltersAgeRatings = "TBC"


  

  constructor() {
    makeObservable(this, {
      queryString: observable,
      genreIds: observable,
      directorId: observable,
      reviewerId: observable,
      sortBy: observable,
      status: observable,
      ageRatings: observable,

      clear: action,
      setQueryString: action,
      setGenreIds: action,
      setSellerId: action,
      setReviewderId: action,
      setSortBy: action,
      setStatus: action
    })
  }


  buildFilters(): FilmListFilters {
    return {
      query: this.queryString,
      genreIds: this.genreIds,
      directorId: this.directorId,
      reviewerId: this.reviewerId,
      sortBy: this.sortBy,
      status: this.status,
      ageRatings: this.ageRatings
    }
  }

  clear() {
    this.queryString = ""
    this.genreIds = []
    this.directorId = null
    this.reviewerId = null
    this.sortBy = "RELEASED_ASC"
    this.status = "ANY"
  }

  setQueryString(newValue: string) {
    this.queryString = newValue
  }

  setGenreIds(newValue: number[]) {
    this.genreIds = newValue
  }

  setSellerId(newValue: number | null) {
    this.directorId = newValue
  }

  setReviewderId(newValue: number | null) {
    this.reviewerId = newValue
  }

  setSortBy(newValue: FilmListFiltersSortBy) {
    this.sortBy = newValue
  }

  setStatus(newValue: FilmListFiltersStatus) {
    this.status = newValue
  }

  setAgeRating(newValue: FilmListFiltersAgeRatings) {
    this.ageRatings = newValue
  }

}