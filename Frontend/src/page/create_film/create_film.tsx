import React, { useCallback, useEffect, useState } from "react";
import { observer, useLocalObservable } from "mobx-react-lite";
import { CreateFilmStore } from "./CreateFilmStore";
import { FormCard } from "../../component/FormCard";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker, DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { Box, Button, CardActions, Checkbox, FormControl, IconButton, InputAdornment, InputLabel, ListItemText, MenuItem, OutlinedInput, Select, SelectChangeEvent, Skeleton, TextField, Tooltip, Typography } from "@mui/material";
import { AccountCircle, Cancel, Send, Upload } from "@mui/icons-material";
import { enNZ } from "date-fns/locale";
import { ErrorPresenter } from "../../component/ErrorPresenter";
import { FilmEditFormBaseFields } from "../../component/films/edit/FilmEditFormBaseFields";
import { FilmGenresStoreProvider, useFilmGenresStore } from "../../store/film_genres_store_context";
import { LoadStatusError } from "../../util/LoadStatus";
import { useNavigate } from "react-router-dom";
import { useFilmListStore } from "../film_list/film_list_store_context";
import { CreateFilmStoreProvider, useCreateFilmStore } from "./create_film_store_context";
import { FilmEditFormStoreProvider } from "../../component/films/edit/film_edit_form_store_context";



export const CreateFilmPage: React.FunctionComponent = observer(() => {
  const store = useLocalObservable(() => new CreateFilmStore())
  const genres = store.genres

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 3,
        flexGrow: 1,
        marginBottom: 3
      }}
    >
      <CreateFilmStoreProvider store={store}>
        <FilmGenresStoreProvider store={genres}>
          <FilmEditFormStoreProvider store={store}>
            <CreateFilmPageContent/>
          </FilmEditFormStoreProvider>
        </FilmGenresStoreProvider>
      </CreateFilmStoreProvider>
    </Box>
  )
})

const CreateFilmPageContent: React.FunctionComponent = observer(() => {
  const store = useCreateFilmStore()
  const navigate = useNavigate()

  const onSubmit = useCallback(async (evt: React.FormEvent) => {
    console.log(store.releaseDate);
    evt.preventDefault()

    const filmId = await store.validateAndSubmit()
    if (filmId !== null) {
      navigate(`/films/${filmId}`)
    }
  }, [store, navigate])

  return (
    <FormCard
      title='Create Film Listing'
      loading={store.isLoading}
      onSubmit={(evt) => onSubmit(evt)}
      actions={(
        <CardActions sx={{display: 'flex', flexDirection: 'row-reverse'}}>
          <Button type="submit" variant="contained" disabled={store.isLoading}>Submit</Button>
        </CardActions>
      )}
    >
      <ImageSelectorAndPreview/>

      <FilmEditFormBaseFields/>

      {(store.saveFilmStatus instanceof LoadStatusError) ? (
        <Typography variant="body1" sx={{color: 'error.main'}}><ErrorPresenter error={store.saveFilmStatus.error}/></Typography>
      ) : undefined}
    </FormCard>
  )
})


const ImageSelectorAndPreview: React.FunctionComponent = observer(() => {
  const store = useCreateFilmStore()

  const [lastUploadError, setLastUploadError] = useState<string | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const onFileChange = useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
    if (evt.target.files && evt.target.files.length === 1) {
      store.photo.setValue(evt.target.files[0])
      setLastUploadError(null)
    }
    else {
      setLastUploadError("Please choose one file to upload.")
    }
  }, [store.photo])

  useEffect(() => {
    if (store.photo.value === null) {
      setImagePreview(null)
    }
    else {
      const url = URL.createObjectURL(store.photo.value)
      setImagePreview(url)
      return () => {
        URL.revokeObjectURL(url)
      }
    }
  }, [store.photo.value])

  const hasError = store.photo.hasError || lastUploadError !== null

  return (
    <>
      <input
        hidden

        disabled={store.isLoading}

        onChange={onFileChange}

        type="file"
        accept="image/jpeg,image/gif,image/png"
        id="create-film-upload-image"
      />

      <Box sx={{textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 1}}>
        <Box>
          {(store.photo.value !== null && imagePreview !== null) ? (
            <img
              src={imagePreview}
              style={{width: '100%', maxHeight: 250, objectFit: 'contain'}}
              alt="Preview of film item"
            />
          ) : (
            <Skeleton variant='rectangular' sx={{width: '100%'}} height={250} animation={false}/>
          )}
        </Box>

        {(hasError) ? (
          <Typography variant="body1" sx={{color: 'error.main'}}>{lastUploadError ?? store.photo.error}</Typography>
        ) : undefined}

        <label htmlFor="create-film-upload-image">
          <Button component='span' disabled={store.isLoading}><Upload/> Upload Photo</Button>
        </label>
      </Box>
    </>
  )
})