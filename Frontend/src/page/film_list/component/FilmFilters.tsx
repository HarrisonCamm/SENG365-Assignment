import React, {useCallback} from "react";
import {observer} from "mobx-react-lite";
import {useFilmListStore} from "../film_list_store_context";
import {
  Button,
  Card,
  CardContent,
  CardHeader, Checkbox,
  FormControl, InputLabel, ListItemText, MenuItem, OutlinedInput, Select, SelectChangeEvent,
  Skeleton,
  TextField,
  Tooltip,
  Typography
} from "@mui/material";
import {runInAction} from "mobx";
import {FilmListFiltersAgeRatings, FilmListFiltersStatus} from "../FilmListPageStore";
import {useFilmGenresStore} from "../../../store/film_genres_store_context";

export const FilmFilters: React.FunctionComponent = observer(() => {
  const store = useFilmListStore()

  const onSubmit = useCallback((evt: React.FormEvent) => {
    evt.preventDefault()
    store.reloadPage()
  }, [store])

  const onClear = useCallback(() => {
    runInAction(() => {
      const priorSortBy = store.filters.sortBy
      store.filters.clear()
      store.filters.setSortBy(priorSortBy)

      store.reloadPage()
    })
  }, [store])

  return (
    <Card sx={{
      width: '100%',
      position: 'sticky',
      top: 5,
      maxHeight: 'calc(100vh - 10px)',
      overflowY: 'auto'
    }}>
      <CardHeader title="Filters" />
      <CardContent
        component='form'
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          boxSizing: 'border-box',
          gap: 1
        }}
        onSubmit={onSubmit}
      >
        <FilmFiltersFormSearchBox/>
        <FilmFiltersFormGenresSelector/>
        <FilmFiltersFormAgeRatingSelector/>

        <Button type='submit' variant='contained' disabled={store.page.isLoading}>Apply</Button>
        <Button type='button' variant='outlined' disabled={store.page.isLoading} onClick={onClear}>Clear</Button>
      </CardContent>
    </Card>
  )
})

const FilmFiltersFormSearchBox: React.FunctionComponent = observer(() => {
  const store = useFilmListStore()
  const filters = store.filters

  const onQueryChange = useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
    filters.setQueryString(evt.target.value)
  }, [filters])

  return (
    <>
      <TextField
        id="filter-search-query"
        label='Search'
        variant='outlined'
        sx={{flex: 1}}

        autoFocus

        value={filters.queryString}
        onChange={onQueryChange}
      />
    </>
  )
})

const FilmFiltersFormGenresSelector: React.FunctionComponent = observer(() => {
  const COMPONENT_HEIGHT = 48;
  const ITEM_PADDING_TOP = 8;

  const genres = useFilmGenresStore()
  const store = useFilmListStore()
  const filters = store.filters

  const onChange = useCallback((evt: SelectChangeEvent<number[]>) => {
    const value = evt.target.value

    let actualValue: number[]
    if (typeof value === 'string') {
      actualValue = value.split(',').map(parseInt)
    }
    else {
      actualValue = value
    }

    filters.setGenreIds(actualValue)
  }, [filters])

  if (genres.isLoading) {
    return (
      <Tooltip title='Loading genres...'>
        <Skeleton variant='rectangular'/>
      </Tooltip>
    )
  }
  else if (genres.genresById !== null) {
    return (
      <FormControl sx={{marginTop: 1}}>
        <InputLabel id="filter-genres-label">Genres</InputLabel>
        <Select
          labelId="filter-genres-label"
          id="filter-genres-select"
          multiple
          value={filters.genreIds}
          onChange={onChange}
          input={<OutlinedInput label="Genres" />}
          renderValue={(selected) => selected.map(id => genres.genresById?.get(id) ?? 'UNKNOWN').join(', ')}
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
            <MenuItem key={id} value={id}>
              <Checkbox checked={filters.genreIds.indexOf(id) > -1} />
              <ListItemText primary={name} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    )
  }
  else {
    return <Typography variant="subtitle1" color="error">Failed to load genres.</Typography>
  }
})

// const FilmFiltersFormStatusSelector: React.FunctionComponent = observer(() => {
//   const store = useFilmListStore()
//   const filters = store.filters

//   const onChange = useCallback((evt: SelectChangeEvent) => {
//     filters.setStatus(evt.target.value as FilmListFiltersStatus)
//   }, [filters])

//   return (
//     <FormControl sx={{marginTop: 1}}>
//       <InputLabel id='FilmFiltersFormOpenClosedSelector-label'>Film Status</InputLabel>
//       <Select
//         labelId='FilmFiltersFormOpenClosedSelector-label'
//         id='FilmFiltersFormOpenClosedSelector-input'
//         value={store.filters.status}
//         label='Film Status'
//         onChange={onChange}
//       >
//         <MenuItem value='ANY'>Any</MenuItem>
//         <MenuItem value='OPEN'>Open Only</MenuItem>
//         <MenuItem value='CLOSED'>Closed Only</MenuItem>
//       </Select>
//     </FormControl>
//   )
// })



const FilmFiltersFormAgeRatingSelector: React.FunctionComponent = observer(() => {
  const store = useFilmListStore()
  const filters = store.filters
  const AGE_RATING_OPTIONS = ["G", "PG", "M", "R13", "R16", "R18", "TBC"]

  const onChange = useCallback((evt: SelectChangeEvent) => {
    filters.setAgeRating(evt.target.value as FilmListFiltersAgeRatings)
  }, [filters])

  return (
    <FormControl sx={{marginTop: 1}}>
      <InputLabel id='FilmFiltersFormOpenClosedSelector-label'>Age Rating</InputLabel>
      <Select
        labelId='FilmFiltersFormOpenClosedSelector-label'
        id='FilmFiltersFormOpenClosedSelector-input'
        value={store.filters.ageRatings}
        label='Age Rating'
        onChange={onChange}
      >
        {
            AGE_RATING_OPTIONS.map((value: string) => {
              return <MenuItem value={value}>{value}</MenuItem>
            })
          }
      </Select>
    </FormControl>
  )
})


const FilmFiltersFormSortBySelector: React.FunctionComponent = observer(() => {
  const store = useFilmListStore()
  const filters = store.filters

  const onChange = useCallback((evt: SelectChangeEvent) => {
    filters.setStatus(evt.target.value as FilmListFiltersStatus)
  }, [filters])

  return (
    <FormControl sx={{marginTop: 1}}>
      <InputLabel id='FilmFiltersFormOpenClosedSelector-label'>Sort By</InputLabel>
      <Select
        labelId='FilmFiltersFormOpenClosedSelector-label'
        id='FilmFiltersFormOpenClosedSelector-input'
        value={store.filters.status}
        label='Film Status'
        onChange={onChange}
      >
        <MenuItem value='ANY'>Any</MenuItem>
        <MenuItem value='OPEN'>Open Only</MenuItem>
        <MenuItem value='CLOSED'>Closed Only</MenuItem>
      </Select>
    </FormControl>
  )
})










