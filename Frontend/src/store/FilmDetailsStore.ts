import {action, computed, makeObservable, observable, runInAction} from "mobx";
import {
  LoadStatus,
  LoadStatusDone,
  LoadStatusError,
  LoadStatusNotYetAttempted,
  LoadStatusPending
} from "../util/LoadStatus";
import {makeApiPath} from "../util/network_util";
import parseISO from "date-fns/parseISO";
import {handleServerError} from "../util/error_util";

export interface FilmDetails {
  filmId: number
  title: string
  genreId: number
  ageRating: string
  directorId: number
  directorFirstName: string
  directorLastName: string
  runtime: number
  numReview: number
  // highestReview: number | null  // Not reliable over the lifetime of the store, as review may have been placed by the current user in the meantime.
  releaseDate: string
  description: string
}

export class FilmDetailsStore {
  readonly filmId: number

  loadStatus: LoadStatus = new LoadStatusNotYetAttempted()
  film: FilmDetails | null = null

  constructor(filmId: number) {
    makeObservable(this, {
      loadStatus: observable,
      film: observable,

      isLoading: computed,
      releaseDate: computed,

      fetchDetails: action
    })

    this.filmId = filmId 
  }

  get isLoading(): boolean {
    return this.loadStatus instanceof LoadStatusPending
  }

  get filmDoesNotExist(): boolean {
    return this.loadStatus instanceof LoadStatusDone && this.film === null
  }

  get releaseDate(): Date | null {
    if (this.film === null) {
      return null
    }
    else {
      return parseISO(this.film.releaseDate)
    }
  }

  async fetchDetails() {
    if (this.isLoading) {
      return
    }

    this.loadStatus = new LoadStatusPending()

    try {
      const res = await fetch(makeApiPath(`/films/${this.filmId}`))

      if (res.status === 404) {
        runInAction(() => {
          this.film = null
          this.loadStatus = new LoadStatusDone()
        })
      }
      else if (res.ok) {
        const data = await res.json()
        runInAction(() => {
          this.film = data
          this.loadStatus = new LoadStatusDone()
        })
      }
      else {
        handleServerError(res)
      }
    }
    catch (e) {
      runInAction(() => {
        this.loadStatus = new LoadStatusError(e)
      })
      throw e
    }
  }
}