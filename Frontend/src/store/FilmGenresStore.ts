import {action, computed, makeObservable, observable, runInAction} from "mobx";
import {
  LoadStatus,
  LoadStatusDone,
  LoadStatusError,
  LoadStatusNotYetAttempted,
  LoadStatusPending
} from "../util/LoadStatus";
import {makeApiPath} from "../util/network_util";
import {handleServerError} from "../util/error_util";

type GetGenresResponseBody = {
  genreId: number
  name: string
}[]

export class FilmGenresStore {
  genresById: Map<number, string> | null = null
  loadStatus: LoadStatus = new LoadStatusNotYetAttempted()

  constructor() {
    makeObservable(this, {
      loadStatus: observable,
      genresById: observable,

      isLoading: computed,

      fetchGenres: action
    })

    this.fetchGenres()
  }

  get isLoading(): boolean {
    return this.loadStatus instanceof LoadStatusPending
  }

  async fetchGenres() {
    if (this.isLoading) {
      return
    }

    this.loadStatus = new LoadStatusPending()
    this.genresById = null

    try {
      const res = await fetch(makeApiPath(`/films/genres`))

      if (!res.ok) {
        handleServerError(res)
      }

      const data: GetGenresResponseBody = await res.json()

      runInAction(() => {
        this.genresById = observable.map()
        for (const {genreId, name} of data) {
          this.genresById.set(genreId, name)
        }
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