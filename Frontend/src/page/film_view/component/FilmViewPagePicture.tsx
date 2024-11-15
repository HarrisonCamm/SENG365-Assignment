import {observer} from "mobx-react-lite";
import {useFilmViewStore} from "../film_view_store_context";
import React, {useCallback, useEffect, useState} from "react";
import {Box, CircularProgress, Fab, Skeleton, Tooltip} from "@mui/material";
import {PhotoBlobView} from "../../../component/PhotoBlobView";
import {Upload} from "@mui/icons-material";
import {
  LoadStatus,
  LoadStatusDone,
  LoadStatusError,
  LoadStatusNotYetAttempted,
  LoadStatusPending
} from "../../../util/LoadStatus";
import {computed, makeObservable, observable, runInAction} from "mobx";
import {makeApiPath} from "../../../util/network_util";
import {ApplicationStore} from "../../../store/ApplicationStore";
import {handleServerError} from "../../../util/error_util";
import {ServerError} from "../../../util/ServerError";
import {ErrorPresenter} from "../../../component/ErrorPresenter";


class FilmViewPagePictureStore {
  readonly filmId: number

  saveStatus: LoadStatus = new LoadStatusNotYetAttempted()

  constructor(filmId: number) {
    makeObservable(this, {
      saveStatus: observable,

      isLoading: computed
    })

    this.filmId = filmId
  }

  get isLoading(): boolean {
    return this.saveStatus instanceof LoadStatusPending
  }

  async saveImage(files: FileList | null): Promise<boolean> {
    if (this.isLoading) {
      return false
    }
    else if (files === null || files.length !== 1) {
      this.saveStatus = new LoadStatusError(new ServerError("Please choose a single file."))
      return false
    }

    const file = files[0]

    this.saveStatus = new LoadStatusPending()
    try {
      const res = await fetch(makeApiPath(`/films/${this.filmId}/image`), {
        method: 'PUT',
        headers: {
          'Content-Type': file.type,
          'X-Authorization': ApplicationStore.main.user!.token
        },
        body: await file.arrayBuffer()
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

const makeStore = (filmId: number) => observable(new FilmViewPagePictureStore(filmId), {}, {autoBind: true})

export const FilmViewPagePicture = observer(() => {
  const store = useFilmViewStore()
  const [uploadStore, setUploadStore] = useState(() => makeStore(store.film.id))
  const [tooltipOpen, setTooltipOpen] = useState<boolean>(false)

  useEffect(() => {
    if (uploadStore.filmId !== store.film.id) {
      setUploadStore(makeStore(store.film.id))
    }
  }, [uploadStore.filmId, store.film.id])

  const onTooltipOpen = useCallback(() => {
    setTooltipOpen(true)
  }, [])

  const onTooltipClose = useCallback(() => {
    setTooltipOpen(false)
  }, [])

  const onFileChange = useCallback(async (evt: React.ChangeEvent<HTMLInputElement>) => {
    const success = await uploadStore.saveImage(evt.target.files)
    if (success) {
      store.film.photo.fetchImage()
    }
  }, [store.film.photo, uploadStore])

  return (
    <Box sx={{position: 'relative'}}>
      {(store.film.photo.isLoading || store.film.photo.hasImage) ? (
        <PhotoBlobView
          image={store.film.photo.imageData}
          imageBuilder={(src) => (
            <img
              src={src}
              style={{
                width: '100%',
                maxHeight: 400,
                objectFit: 'contain'
              }}
              alt='Film item'
            />
          )}
          defaultBuilder={() => (
            <Skeleton variant='rectangular' height={400}/>
          )}
        />
      ) : (
        <Skeleton variant='rectangular' height={400} animation={false}/>
      )}

      {store.isEditable && (
        <>
          <input
            hidden

            disabled={uploadStore.isLoading}

            onChange={onFileChange}

            type="file"
            accept="image/jpeg,image/gif,image/png"
            id="update-film-upload-image"
          />

          <label htmlFor="update-film-upload-image">
            <Tooltip
              title={(uploadStore.saveStatus instanceof LoadStatusError) ? <ErrorPresenter error={uploadStore.saveStatus.error}/> : 'Upload new picture'}
              open={(uploadStore.saveStatus instanceof LoadStatusError) ? true : tooltipOpen}
              onOpen={onTooltipOpen}
              onClose={onTooltipClose}
            >
                <Fab
                  component='span'
                  disabled={uploadStore.isLoading}
                  color='primary'
                  size='medium'
                  sx={{
                    position: 'absolute',
                    top: 3,
                    right: 3
                  }}
                >
                  {(uploadStore.isLoading) ? (
                    <CircularProgress size={32} />
                  ) : (
                    <Upload sx={{fontSize: 32}}/>
                  )}
                </Fab>
            </Tooltip>
          </label>
        </>
      )}
    </Box>
  )
})