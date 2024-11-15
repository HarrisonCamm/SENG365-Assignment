import {
  FilmListFilters,
  FilmListFiltersSortBy,
  FilmListFiltersStatus,
  FilmListPageStore,
  FilmSupplier,
} from "../film_list/FilmListPageStore";
import { FilmStore } from "../../store/FilmStore";
import { FilmListPageFilm } from "../film_list/FilmListPageFilm";
import { uniqBy } from "lodash";
import {
  LoadStatus,
  LoadStatusDone,
  LoadStatusError,
  LoadStatusNotYetAttempted,
} from "../../util/LoadStatus";
import { computed, makeObservable } from "mobx";
import { FilmDetails } from "../../store/FilmDetailsStore";

// FilmViewSimilarStore class
export class FilmViewSimilarStore implements FilmSupplier {
  readonly film: FilmDetails;
  readonly sameSeller: FilmListPageStore;
  readonly sameGenre: FilmListPageStore;

  constructor(film: FilmDetails) {
    makeObservable(this, {
      sameSellerFilters: computed,
      films: computed,
      loadStatus: computed,
      isLoading: computed,
    });

    this.film = film;
    this.sameSeller = new FilmListPageStore(0);
    this.sameGenre = new FilmListPageStore(0);

    this.sameSeller.reload(this.sameSellerFilters);
    this.sameGenre.reload(this.sameGenreFilters);
  }

  // Get filters for films from the same seller
  get sameSellerFilters(): FilmListFilters {
    return {
      query: "",
      genreIds: [],
      directorId: this.film.directorId,
      reviewerId: null,
      sortBy: "RELEASED_ASC",
      status: "ANY",
      ageRatings: "TBC",
    };
  }

  // Get filters for films from the same genre
  get sameGenreFilters(): FilmListFilters {
    return {
      query: "",
      genreIds: [this.film.genreId],
      directorId: null,
      reviewerId: null,
      sortBy: "RELEASED_ASC",
      status: "ANY",
      ageRatings: "TBC",
    };
  }

  // Get an array of unique films from the same genre and same seller, excluding the current film
  get films(): FilmListPageFilm[] | null {
    if (
      this.sameGenre.films === null ||
      this.sameSeller.films === null
    ) {
      return null;
    } else {
      return uniqBy(
        [...this.sameGenre.films, ...this.sameSeller.films],
        (film) => film.film.filmId
      ).filter((film) => film.film.filmId !== this.film.filmId);
    }
  }

  // Get the load status of the similar films
  get loadStatus(): LoadStatus {
    if (this.sameSeller.isLoading || this.sameGenre.isLoading) {
      return this.sameSeller.loadStatus;
    } else if (this.sameSeller.loadStatus instanceof LoadStatusError) {
      return this.sameSeller.loadStatus;
    } else if (this.sameGenre.loadStatus instanceof LoadStatusError) {
      return this.sameGenre.loadStatus;
    } else if (
      this.sameSeller.loadStatus instanceof LoadStatusDone &&
      this.sameGenre.loadStatus instanceof LoadStatusDone
    ) {
      return this.sameGenre.loadStatus;
    } else {
      return new LoadStatusNotYetAttempted();
    }
  }

  // Check if the similar films are currently loading
  get isLoading(): boolean {
    return this.sameSeller.isLoading || this.sameGenre.isLoading;
  }
}