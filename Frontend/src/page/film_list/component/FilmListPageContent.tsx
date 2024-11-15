import React, {useCallback} from "react";
import {observer} from "mobx-react-lite";
import {useFilmListStore} from "../film_list_store_context";
import {Box, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent} from "@mui/material";
import {FilmListItem} from "./FilmListItem";
import {FilmListFiltersSortBy} from "../FilmListPageStore";
import {runInAction} from "mobx";
import {FilmPaginationControl} from "../../../component/films/pagination/FilmPaginationControl";

export const FilmListPageContent: React.FunctionComponent = observer(() => {
  const store = useFilmListStore()

  return (
    <>
      <Box sx={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 2}}>
        <FilmPaginationControl store={store}/>

        <FilmListPageSortSelector/>
      </Box>

      <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 2}}>
        {store.page.films!.map((film, index) => (
          <FilmListItem key={`${film.film.filmId}`} index={index}/>
        ))}
      </Box>
    </>
  )
})

const FilmListPageSortSelector: React.FunctionComponent = observer(() => {
  const store = useFilmListStore()

  const onSortByChange = useCallback((evt: SelectChangeEvent) => {
    runInAction(() => {
      store.filters.setSortBy(evt.target.value as FilmListFiltersSortBy)
      store.reloadPage()
    })
  }, [store])

  return (
    <FormControl>
      <InputLabel id='FilmListPageSortSelector-label'>Sort By</InputLabel>
      <Select
        labelId='FilmListPageSortSelector-label'
        id='FilmListPageSortSelector-input'
        value={store.filters.sortBy}
        label='Sort By'
        onChange={onSortByChange}
      >
        <MenuItem value='ALPHABETICAL_ASC'>Alphabetical Ascending</MenuItem>
        <MenuItem value='ALPHABETICAL_DESC'>Alphabetical Descending</MenuItem>
        <MenuItem value='RATING_ASC'>Rating Ascending</MenuItem>
        <MenuItem value='RATING_DESC'>Rating Descending</MenuItem>
        <MenuItem value='RELEASED_DESC'>Release Date Newest-oldest</MenuItem>
        <MenuItem value='RELEASED_ASC'>Release Date Newest-oldest</MenuItem>
        <MenuItem value='RESERVE_ASC'>Runtime Ascending</MenuItem>
        <MenuItem value='RESERVE_DESC'>Runtime Descending</MenuItem>
      </Select>
    </FormControl>
  )
})
