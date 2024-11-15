import React, {useCallback, useEffect, useState} from "react";
import {observer, useLocalObservable} from "mobx-react-lite";
import {useFilmViewStore} from "../../../film_view/film_view_store_context";
import {InputValue} from "../../../../util/InputValue";
import {action, autorun, computed, makeObservable, observable, runInAction} from "mobx";
import {Box, IconButton, InputAdornment, Rating, TextField, Tooltip, Typography} from "@mui/material";
import {Cancel, Send} from "@mui/icons-material";
import {FilmViewReviewStoreReview} from "../../../film_view/FilmViewReviewStore";
import {notEmptyFieldValidator} from "../../../../util/validation";
import {
  LoadStatus,
  LoadStatusDone,
  LoadStatusError,
  LoadStatusNotYetAttempted,
  LoadStatusPending
} from "../../../../util/LoadStatus";
import {makeApiPath} from "../../../../util/network_util";
import {ApplicationStore} from "../../../../store/ApplicationStore";
import {handleServerError} from "../../../../util/error_util";
import {ErrorPresenter} from "../../../../component/ErrorPresenter";

class PlaceReviewEntryStore {
  readonly rating: InputValue

  loadStatus: LoadStatus = new LoadStatusNotYetAttempted()

  constructor(initialValue: number) {
    makeObservable(this, {
      loadStatus: observable,

      isLoading: computed,

      validateAndSubmitReview: action
    })

    this.rating = new InputValue<string>(initialValue.toString(10), notEmptyFieldValidator)

  }

  get isLoading(): boolean {
    return this.loadStatus instanceof LoadStatusPending
  }

  protected async submit(filmId: number) {
    if (this.isLoading) {
      return
    }

    this.loadStatus = new LoadStatusPending()
    try {
      const res = await fetch(makeApiPath(`/films/${filmId}/reviews`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Authorization': ApplicationStore.main.user!.token
        },
        body: JSON.stringify({
          rating: parseInt(this.rating.value, 10)

        })
      })

      if (!res.ok) {
        handleServerError(res)
        return
      }

      runInAction(() => {
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

  async validateAndSubmitReview(filmId: number): Promise<boolean> {
    if (this.rating.validate()) {
      await this.submit(filmId)
      return true
    }
    else {
      return false
    }
  }
}

const extraCustomValidator = (value: InputValue, highestReviewSoFar: FilmViewReviewStoreReview | null, ignoreEditStatus: boolean = false): string | null => {
  const intVal = parseInt(value.value, 10)
  if ((ignoreEditStatus || value.valueEdited) && !isNaN(intVal) && highestReviewSoFar !== null) {
    if (intVal <= highestReviewSoFar.rating) {
      return "Your review must beat the highest so far."
    }
  }

  return null
}

interface PlaceReviewEntryFieldProps {
  onClose: VoidFunction
}
export const PlaceReviewEntryField: React.FunctionComponent<PlaceReviewEntryFieldProps> = observer(({onClose}) => {
  const store = useFilmViewStore()
  const highestReviewSoFar = (store.review.review!.length > 0) ? store.review.review![0] : null

  const [extraErrorText, setExtraErrorText] = useState<string | null>(null)
  const localStore = useLocalObservable(
    () => new PlaceReviewEntryStore((highestReviewSoFar?.rating ?? 0) + 1)
  )

  useEffect(() => {
    return autorun(() => {
      setExtraErrorText(extraCustomValidator(localStore.rating, highestReviewSoFar))
    })
  }, [localStore.rating, highestReviewSoFar])

  const onSubmit = useCallback(async (evt: React.FormEvent) => {
    evt.preventDefault()

    if (extraCustomValidator(localStore.rating, highestReviewSoFar, true) === null) {
      // Loading time!
      const success = await localStore.validateAndSubmitReview(store.film.id)

      if (success) {
        store.review.fetchReview()
        onClose()
      }
    }
  }, [store.film.id, store.review, onClose, localStore, highestReviewSoFar])
    

  return (
    <Box >
      <Rating name="customized-10" defaultValue={5} max={10} />
      <Tooltip title='Cancel' sx={{top: 0, right: 0 }}>
        <IconButton edge='end' color='error' size='small' sx={{flex: 0}} onClick={onClose} disabled={localStore.isLoading}>
          <Cancel/>
        </IconButton>
      </Tooltip>
    <Box component='form' sx={{display: 'flex', flexDirection: 'row'}} onSubmit={onSubmit}>
      

      <TextField
        id='PlaceReviewEntryField'
        label='Review'
        variant="outlined"


        multiline
        rows={4}

        sx={{flex: 1}}
        disabled={localStore.isLoading}
        autoFocus

        value={localStore.rating.value}
        onChange={(evt) => localStore.rating.setValue(evt.target.value)}
        error={localStore.loadStatus instanceof LoadStatusError || localStore.rating.hasError || (extraErrorText !== null)}
        helperText={(localStore.loadStatus instanceof LoadStatusError)
          ? <>Error: <ErrorPresenter error={localStore.loadStatus.error}/></>
          : localStore.rating.error ?? extraErrorText
        }

        InputProps={{

          endAdornment: (
            <InputAdornment position='end'>
              <Tooltip title='Submit Review'>
                <IconButton edge='end' color='primary' type='submit' disabled={localStore.isLoading}>
                  <Send/>
                </IconButton>
              </Tooltip>
            </InputAdornment>
          )
        }}
      />






    </Box>
    </Box>
  )
})