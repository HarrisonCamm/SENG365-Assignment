import {FilmStore} from "../../store/FilmStore";
import {FilmViewReviewStore} from "./FilmViewReviewStore";
import {ApplicationStore} from "../../store/ApplicationStore";
import {action, computed, makeObservable, observable, runInAction} from "mobx";
import {
  LoadStatus,
  LoadStatusDone,
  LoadStatusError,
  LoadStatusNotYetAttempted,
  LoadStatusPending
} from "../../util/LoadStatus";
import {makeApiPath} from "../../util/network_util";
import {handleServerError} from "../../util/error_util";

export class FilmViewStore {
  readonly film: FilmStore
  readonly review: FilmViewReviewStore

  deleteStatus: LoadStatus = new LoadStatusNotYetAttempted()


  constructor(film: FilmStore) {
    makeObservable(this, {
      deleteStatus: observable,

      isEditable: computed,
      isDeleting: computed,

      deleteFilm: action
    })

    this.film = film
    this.review = new FilmViewReviewStore(this.film.id)

    this.review.fetchReview()
  }

  get isEditable(): boolean {
    if (!ApplicationStore.main.isLoggedIn) {
      return false
    }
    else if (
      this.film.details.film === null
      || ApplicationStore.main.user!.id !== this.film.details.film!.directorId
    ) {
      return false
    }

    const numReviewFilm = this.film.details.film.numReview
    const numReviewReview = this.review.review?.length

    console.log(numReviewFilm);
    console.log(numReviewReview);


    console.log((numReviewFilm + (numReviewReview ?? 0)) === 0 || numReviewFilm === undefined);
    return (numReviewFilm + (numReviewReview ?? 0)) === 0 || numReviewFilm === undefined
  }

  get isDeleting(): boolean {
    return this.deleteStatus instanceof LoadStatusPending
  }


  get convertTimeToHoursAndMinutes() {
    const minutes = this.film.details.film?.runtime;
    if (minutes === undefined) {
      return "Unknown";
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    const hoursString = hours > 0 ? hours + " hour" + (hours > 1 ? "s" : "") + " " : "";
    const minutesString = remainingMinutes > 0 ? remainingMinutes + " minute" + (remainingMinutes > 1 ? "s" : "") : "";
    return hoursString + minutesString;
  }




  async deleteFilm(): Promise<boolean> {
    if (this.deleteStatus instanceof LoadStatusPending) {
      return false
    }

    this.deleteStatus = new LoadStatusPending()

    try {
      const res = await fetch(makeApiPath(`/films/${this.film.id}`), {
        method: 'DELETE',
        headers: {
          'X-Authorization': ApplicationStore.main.user!.token
        }
      })

      if (!res.ok) {
        handleServerError(res)
        return false
      }

      runInAction(() => {
        this.deleteStatus = new LoadStatusDone()
      })
      return true
    }
    catch (e) {
      runInAction(() => {
        this.deleteStatus = new LoadStatusError(e)
      })
      throw e
    }
  }
}