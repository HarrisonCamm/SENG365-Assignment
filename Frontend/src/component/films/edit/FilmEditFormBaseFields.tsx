import React from "react";
import { useCallback } from "react";
import { observer } from "mobx-react-lite";
import { useFilmEditFormStore } from "./film_edit_form_store_context";
import { TextFieldProps } from "@mui/material/TextField/TextField";
import {
  Box,
  Button,
  FormControl,
  Typography,
  OutlinedInput,
  Select,
  SelectChangeEvent,
  Skeleton,
  TextField,
  InputAdornment,
  InputLabel,
  MenuItem,
  Tooltip,
} from "@mui/material";
import { useFilmGenresStore } from "../../../store/film_genres_store_context";
import { LoadStatusError } from "../../../util/LoadStatus";
import { ErrorPresenter } from "../../ErrorPresenter";
import { LocalizationProvider, DateTimePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { enNZ } from "date-fns/locale";


const GenrePicker: React.FunctionComponent = observer(() => {
  const COMPONENT_HEIGHT = 50;
  const ITEM_PADDING_TOP = 10;

  const store = useFilmEditFormStore()
  const genres = useFilmGenresStore()

  const onChange = useCallback((evt: SelectChangeEvent<number>) => {
    const value = evt.target.value

    let actualValue: number | null
    if (typeof value === 'string') {
      actualValue = parseInt(value)
      if (isNaN(actualValue)) {
        actualValue = null
      }
    }
    else {
      actualValue = value
    }

    store.genre.setValue(actualValue)
  }, [store])

  if (genres.isLoading) {
    return (
      <Tooltip title='Loading genres...'>
        <Skeleton variant='rectangular' height={COMPONENT_HEIGHT} sx={{borderRadius: 1}}/>
      </Tooltip>
    )
  }
  else if (genres.genresById !== null) {
    return (
      <FormControl sx={{marginTop: 1}}>
        <InputLabel id="create-film-genre-label" required>Genre</InputLabel>
        <Select
          labelId="create-film-genre-label"
          id="create-film-genre-select"
          value={store.genre.value ?? '' as any as number}
          onChange={onChange}
          required
          input={<OutlinedInput label="Genre" required/>}
          MenuProps={{
            PaperProps: {
              style: {
                maxHeight: COMPONENT_HEIGHT * 4.5 + ITEM_PADDING_TOP,
                width: 250
              }
            }
          }}
        >
          {Array.from(genres.genresById.entries()).map(([id, name]) => (
            <MenuItem key={id} value={id}>{name}</MenuItem>
          ))}
        </Select>
      </FormControl>
    )
  }
  else {
    return (
      <Box sx={{padding: 1}}>
        <Typography variant="subtitle1" color="error">Failed to load genre information:</Typography>
        <Typography variant="body1" color="error">
          {(genres.loadStatus instanceof LoadStatusError) ? (
            <ErrorPresenter error={genres.loadStatus.error}/>
          ) : <span>Entered an unexpected state.</span>}
        </Typography>
        <Button onClick={() => genres.fetchGenres()}>Try again</Button>
      </Box>
    )
  }
})

export const FilmEditFormBaseFields: React.FunctionComponent = observer(() => {
  const store = useFilmEditFormStore()

  const onTitleChange = useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
    store.title.setValue(evt.target.value)
  }, [store])

  const onDescriptionChange = useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
    store.description.setValue(evt.target.value)
  }, [store])

  const onDateChange = useCallback((newValue: Date | null) => {
    store.releaseDate.setValue(newValue)
  }, [store])

  const onRuntimeChange = useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
    store.runtime.setValue(evt.target.value)
  }, [store])

  const onAgeRatingChange = useCallback((event: SelectChangeEvent<string>) => {
    store.ageRating.setValue(event.target.value)
  }, [store]);



 

  const AGE_RATINGS = ['G','PG','M','R16','R18','TBC']

  return (
    <>
      <TextField
        id="create-film-title"
        label='Title'
        variant='outlined'
        required
        disabled={store.isLoading}

        value={store.title.value}
        onChange={onTitleChange}
        error={store.title.hasError}
        helperText={store.title.error}
      />

      <GenrePicker/>

      <TextField
        id="create-film-description"
        label='Description'
        variant='outlined'
        required
        disabled={store.isLoading}

        multiline
        minRows={3}

        value={store.description.value}
        onChange={onDescriptionChange}
        error={store.description.hasError}
        helperText={store.description.error}
      />

      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={enNZ}>
        <DateTimePicker
          label="Release Date"
          disabled={store.isLoading}

          onChange={onDateChange}
          value={store.releaseDate.value}
          renderInput={(params) => <ReleaseDatePickerRenderInputComponent {...params}/>}
        />
      </LocalizationProvider>

      <TextField
        id="create-film-runtime"
        label='Runtime'
        required
        variant='outlined'
        disabled={store.isLoading}

        value={store.runtime.value}
        onChange={onRuntimeChange}
        error={store.runtime.hasError}
        helperText={store.runtime.error}

        
      />



        <Select
          id="create-film-runtime"
          value={store.ageRating.value}
          label="Age Rating"
          variant='outlined'
          onChange={onAgeRatingChange}
          error={store.ageRating.hasError}
        >
          {
            AGE_RATINGS.map((value: string) => {
              return <MenuItem value={value}>{value}</MenuItem>
            })
          }
        </Select>

    </>
  )
})


const ReleaseDatePickerRenderInputComponent: React.FunctionComponent<TextFieldProps> = observer((props) => {
  const store = useFilmEditFormStore()

  return (
    <TextField
      required
      {...props}
      helperText={props.helperText ?? store.releaseDate.error ?? props.inputProps?.placeholder}
      error={props.error || store.releaseDate.hasError}
    />
  )
})

