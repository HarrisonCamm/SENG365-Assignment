import {handleServerError} from "../../util/error_util";
import {FilmEditFormStore} from "../../component/films/edit/FilmEditFormStore";
import {LoadStatus, LoadStatusDone, LoadStatusError, LoadStatusNotYetAttempted, LoadStatusPending} from "../../util/LoadStatus";
import {formatDateForFilm, makeApiPath} from "../../util/network_util";
import {ApplicationStore} from "../../store/ApplicationStore";
import {FilmGenresStore} from "../../store/FilmGenresStore";
import {futureDateValidator, notEmptyFieldValidator, positiveIntegerValidator} from "../../util/validation";
import {action, computed, makeObservable, observable, runInAction} from "mobx";
import {InputValue} from "../../util/InputValue";








export class CreateFilmStore implements FilmEditFormStore {
  readonly title: InputValue
  readonly genre: InputValue<number | null>
  readonly releaseDate: InputValue<Date | null>
  readonly description: InputValue 
  readonly runtime: InputValue
  readonly photo: InputValue<File | null>
  readonly ageRating: InputValue

  readonly genres: FilmGenresStore

  saveFilmStatus: LoadStatus = new LoadStatusNotYetAttempted()
  saveFilmPhotoStatus: LoadStatus = new LoadStatusNotYetAttempted()

  readonly AGE_RATINGS = ['G', 'PG', 'M', 'R16', 'R18', 'TBC']

  constructor() {
    makeObservable(this, {
      saveFilmStatus: observable,
      saveFilmPhotoStatus: observable,

      isLoading: computed,

      validateAndSubmit: action
    })

    this.genres = new FilmGenresStore()

    this.title = new InputValue<string>("", notEmptyFieldValidator)
    this.genre = new InputValue<number | null>(null, this.genreIdValidator.bind(this))
    this.releaseDate = new InputValue<Date | null>(null, futureDateValidator)
    this.description = new InputValue<string>("", notEmptyFieldValidator)
    this.runtime = new InputValue<string>("", positiveIntegerValidator)
    this.photo = new InputValue<File | null>(null, this.photoValidator.bind(this))
    this.ageRating = new InputValue<string>("TBC", this.ageRatingValidator.bind(this)) 
  }

  protected genreIdValidator(value: number | null): string | null {
    if (value === null) {
      return "A genre is required"
    }
    else if (!this.genres.genresById?.has(value)) {
      return "Invalid genre"
    }
    return null
  }

  protected ageRatingValidator(value: string | null): string | null {
    if (value === null) {
      return ""
    }
    else if (!this.AGE_RATINGS.includes(value)) {
      return "Invalid Age Rating"
    }
    return null
  }



  protected photoValidator(value: File | null): string | null {
    console.log(value)
    if (value === null) {
      return "A photo is required."
    }
    return null
  }

  get isLoading(): boolean {
    return this.genres.isLoading
      || this.saveFilmStatus instanceof LoadStatusPending
      || this.saveFilmPhotoStatus instanceof LoadStatusPending
  }

  
  protected async createFilm(): Promise<number | null> {
    console.log(formatDateForFilm(this.releaseDate.value!))
    if (this.saveFilmStatus instanceof LoadStatusPending) {
      return null
    }

    this.saveFilmStatus = new LoadStatusPending()
    
    try {
      console.log(formatDateForFilm(this.releaseDate.value!));
      const res = await fetch(makeApiPath("/films"), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Authorization': ApplicationStore.main.user!.token
        },
        body: JSON.stringify({
          title: this.title.value,
          description: this.description.value,
          genreId: this.genre.value,
          releaseDate: formatDateForFilm(this.releaseDate.value!),
          runtime: parseInt(this.runtime.value, 10)
        })
      })

      if (!res.ok) {
        handleServerError(res)
        return null
      }

      const body = await res.json()
      runInAction(() => {
        this.saveFilmStatus = new LoadStatusDone()
      })
      return body.filmId
    }
    catch (e) {
      runInAction(() => {
        this.saveFilmStatus = new LoadStatusError(e)
      })
      throw e
    }
  }

  protected async uploadPhoto(filmId: number) {
    if (this.saveFilmPhotoStatus instanceof LoadStatusPending) {
      return
    }

    const photo = this.photo.value!
    runInAction(() => {
      this.saveFilmPhotoStatus = new LoadStatusPending()
    })

    try {
      const res = await fetch(makeApiPath(`/films/${filmId}/image`), {
        method: 'PUT',
        headers: {
          'Content-Type': photo.type,
          'X-Authorization': ApplicationStore.main.user!.token
        },
        body: await photo.arrayBuffer()
      })

      if (!res.ok) {
        handleServerError(res)
        return
      }

      runInAction(() => {
        this.saveFilmPhotoStatus = new LoadStatusDone()
      })
    }
    catch (e) {
      runInAction(() => {
        this.saveFilmPhotoStatus = new LoadStatusError(e)
      })
      throw e
    }
  }

  async validateAndSubmit(): Promise<number | null> {
    const invalid = [this.title, this.genre, this.releaseDate, this.description, this.runtime, this.photo].map(f => f.validate()).includes(false)

    if (invalid) {
      return null
    }

    const filmId = await this.createFilm()
    if (filmId !== null) {
      // Attempt to save the profile photo.
      try {
        await this.uploadPhoto(filmId)
      }
      catch (e) {
        alert("Film creation succeeded uploading the photo failed. Please try again later.")
      }
    }
    return filmId
  }
}