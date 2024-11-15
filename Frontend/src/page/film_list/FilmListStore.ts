/**
 * Store for the film_view list page.
 */
import {FilmListPageStore} from "./FilmListPageStore";
import {FilmListPageFiltersStore} from "./FilmListPageFiltersStore";
import {action, computed, makeObservable} from "mobx";
import {FilmGenresStore} from "../../store/FilmGenresStore";
import {PageableFilmStore} from "../../component/films/pagination/PageableFilmStore";

export class FilmListStore implements PageableFilmStore {
  readonly page: FilmListPageStore
  readonly filters: FilmListPageFiltersStore

  constructor() {
    makeObservable(this, {
      isLoading: computed,

      reloadPage: action,
      goToNextPage: action,
      goToPrevPage: action,
      goToFirstPage: action,
      goToLastPage: action
    })

    this.page = new FilmListPageStore(0)
    this.filters = new FilmListPageFiltersStore()

    this.page.reload(this.filters.buildFilters())
  }

  get isLoading(): boolean {
    return this.page.isLoading
  }

  async reloadPage() {
    await this.page.reload(this.filters.buildFilters())
  }

  async goToNextPage() {
    await this.page.goToNextPage(this.filters.buildFilters())
  }

  async goToPrevPage() {
    await this.page.goToPrevPage(this.filters.buildFilters())
  }

  async goToFirstPage() {
    await this.page.goToFirstPage(this.filters.buildFilters())
  }

  async goToLastPage() {
    await this.page.goToLastPage(this.filters.buildFilters())
  }
}