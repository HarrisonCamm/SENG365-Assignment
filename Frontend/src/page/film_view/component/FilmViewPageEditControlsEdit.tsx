import React, {useCallback, useEffect, useState} from "react";
import {observer} from "mobx-react-lite";
import {Check, Edit} from "@mui/icons-material";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle, LinearProgress,
  Paper,
  Typography
} from "@mui/material";
import {useFilmViewStore} from "../film_view_store_context";
import {InputValue} from "../../../util/InputValue";
import {futureDateValidator, notEmptyFieldValidator, positiveIntegerValidator} from "../../../util/validation";
import {FilmGenresStore} from "../../../store/FilmGenresStore";
import {FilmDetailsStore} from "../../../store/FilmDetailsStore";
import {action, computed, makeObservable, observable, runInAction} from "mobx";
import {useFilmGenresStore} from "../../../store/film_genres_store_context";
import {FilmEditFormStore} from "../../../component/films/edit/FilmEditFormStore";
import {FilmEditFormStoreProvider} from "../../../component/films/edit/film_edit_form_store_context";
import {FilmEditFormBaseFields} from "../../../component/films/edit/FilmEditFormBaseFields";
import {
  LoadStatus,
  LoadStatusDone,
  LoadStatusError,
  LoadStatusNotYetAttempted,
  LoadStatusPending
} from "../../../util/LoadStatus";
import {ErrorPresenter} from "../../../component/ErrorPresenter";
import {formatDateForFilm, makeApiPath} from "../../../util/network_util";
import {ApplicationStore} from "../../../store/ApplicationStore";
import {handleServerError} from "../../../util/error_util";


interface ActionPatchBody {
  title?: string
  description?: string
  genreId?: number
  releaseDate?: string
  runtime?: number
  ageRating?: string
}

class FilmViewPageEditControlsEditStore implements FilmEditFormStore {
  readonly filmId: number

  readonly title: InputValue
  readonly genre: InputValue<number | null>
  readonly releaseDate: InputValue<Date | null>
  readonly description: InputValue
  readonly runtime: InputValue

  readonly genres: FilmGenresStore
  readonly ageRating: InputValue

  

  saveStatus: LoadStatus = new LoadStatusNotYetAttempted()

  constructor(genres: FilmGenresStore, initialDetails: FilmDetailsStore) {
    makeObservable(this, {
      saveStatus: observable,

      isLoading: computed,
      isEdited: computed,
      isDone: computed,

      updateFilm: action
    })

    this.filmId = initialDetails.filmId
    this.genres = genres

    this.title = new InputValue<string>(initialDetails.film!.title, notEmptyFieldValidator)
    this.genre = new InputValue<number | null>(initialDetails.film!.genreId, this.genreIdValidator.bind(this))
    this.releaseDate = new InputValue<Date | null>(initialDetails.releaseDate!, futureDateValidator)
    this.description = new InputValue<string>(initialDetails.film!.description, notEmptyFieldValidator)
    this.runtime = new InputValue<string>(initialDetails.film!.runtime.toString(10), positiveIntegerValidator)
    this.ageRating = new InputValue<string>(initialDetails.film!.ageRating, positiveIntegerValidator)
  }

  get isLoading(): boolean {
    return this.saveStatus instanceof LoadStatusPending
  }

  get isEdited(): boolean {
    return this.title.valueEdited
      || this.genre.valueEdited
      || this.releaseDate.valueEdited
      || this.description.valueEdited
      || this.runtime.valueEdited
  }

  get isDone(): boolean {
    return this.saveStatus instanceof LoadStatusDone
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

  protected buildPatchBody(): ActionPatchBody | null {
    let body: ActionPatchBody = {}

    if (this.title.valueEdited) {
      if (this.title.validate()) {
        body.title = this.title.value
      }
      else {
        return null
      }
    }

    if (this.description.valueEdited) {
      if (this.description.validate()) {
        body.description = this.description.value
      }
      else {
        return null
      }
    }

    if (this.genre.valueEdited) {
      if (this.genre.validate()) {
        body.genreId = this.genre.value!
      }
      else {
        return null
      }
    }

    if (this.releaseDate.valueEdited) {
      if (this.releaseDate.validate()) {
        body.releaseDate = formatDateForFilm(this.releaseDate.value!)
      }
      else {
        return null
      }
    }

    if (this.runtime.valueEdited) {
      if (this.runtime.validate()) {
        body.runtime = parseInt(this.runtime.value!, 10)
      }
      else {
        return null
      }
    }

    return body
  }

  async updateFilm(): Promise<boolean> {
    if (!this.isEdited) {
      // Nothing to do!
      return true
    }
    else if (this.isLoading) {
      return false
    }

    this.saveStatus = new LoadStatusPending()

    try {
      const body = this.buildPatchBody()

      const res = await fetch(makeApiPath(`/films/${this.filmId}`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-Authorization': ApplicationStore.main.user!.token
        },
        body: JSON.stringify(body)
      })

      if (!res.ok) {
        handleServerError(res)
        return false
      }

      runInAction(() => {
        this.saveStatus = new LoadStatusDone()
      })
      return true
    }
    catch (e) {
      runInAction(() => {
        this.saveStatus = new LoadStatusError(e)
      })
      throw e
    }
  }
}

export const FilmViewPageEditControlsEdit: React.FunctionComponent = observer(() => {
  const [open, setOpen] = useState<boolean>(false)

  const openPopup = useCallback(() => {
    setOpen(true)
  }, [])

  const closePopup = useCallback(() => {
    setOpen(false)
  }, [])

  return (
    <>
      <Button
        sx={{
          flex: 1
        }}
        onClick={openPopup}
      >
        <Edit/>&nbsp;&nbsp;Edit Film
      </Button>

      {(open) && <FilmViewPageEditControlsEditPopup onClose={closePopup}/>}
    </>
  )
})

const makeStore = (genres: FilmGenresStore, initialDetails: FilmDetailsStore) =>
  observable(new FilmViewPageEditControlsEditStore(genres, initialDetails), {}, {autoBind: true})

interface FilmViewPageEditControlsEditPopupProps {
  onClose: VoidFunction
}
const FilmViewPageEditControlsEditPopup: React.FunctionComponent<FilmViewPageEditControlsEditPopupProps> = observer(({onClose}) => {
  const store = useFilmViewStore()
  const genres = useFilmGenresStore()

  const [localStore, setLocalStore] = useState<FilmViewPageEditControlsEditStore>(() => makeStore(genres, store.film.details))
  useEffect(() => {
    if (store.film.id !== localStore.filmId) {
      setLocalStore(makeStore(genres, store.film.details))
    }
  }, [localStore.filmId, store.film.id])

  const onSubmit = useCallback(async (evt: React.FormEvent) => {
    evt.preventDefault()

    if (localStore.isDone) {
      return
    }

    const success = await localStore.updateFilm()

    if (success) {
      setTimeout(() => {
        onClose()
        store.film.details.fetchDetails()
      }, 750)
    }
  }, [localStore, onClose, store.film.details])

  const onDialogClose = useCallback(() => {
    if (!localStore.isLoading) {
      onClose()
    }
  }, [localStore.isLoading, onClose])

  return (
    <FilmEditFormStoreProvider store={localStore}>
      <Dialog open={true} onClose={onDialogClose}>
        {(localStore.isLoading) && <LinearProgress/>}

        {(localStore.isDone) ? (
          <DialogContent>
            <Check color='success' sx={{fontSize: 64}} />
          </DialogContent>
        ) : (
          <form onSubmit={onSubmit}>
            <DialogTitle>Edit Film</DialogTitle>

            <DialogContent>
              <Box sx={{display: 'flex', flexDirection: 'column', gap: 2, paddingTop: 1}}>
                <FilmEditFormBaseFields/>

                {(localStore.saveStatus instanceof LoadStatusError) ? (
                  <Typography variant="body1" sx={{color: 'error.main'}}><ErrorPresenter error={localStore.saveStatus.error}/></Typography>
                ) : undefined}
              </Box>
            </DialogContent>

            <DialogActions sx={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
              <Button
                sx={{marginLeft: 0}}
                type='button'
                onClick={onDialogClose}
                disabled={localStore.isLoading}
              >
                Cancel
              </Button>

              <Button
                variant='contained'
                type='submit'
                disabled={localStore.isLoading}
              >
                Submit
              </Button>
            </DialogActions>
          </form>
        )}
      </Dialog>
    </FilmEditFormStoreProvider>
  )
})