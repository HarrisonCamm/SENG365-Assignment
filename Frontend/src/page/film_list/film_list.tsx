import React from "react";
import {Box, Grid, LinearProgress, Typography} from "@mui/material";
import {observer, useLocalObservable} from "mobx-react-lite";
import {FilmListStore} from "./FilmListStore";
import {FilmListStoreProvider, useFilmListStore} from "./film_list_store_context";
import {FilmListPage} from "./component/FilmListPage";
import {FilmFilters} from "./component/FilmFilters";
import {FilmGenresStore} from "../../store/FilmGenresStore";
import {FilmGenresStoreProvider, useFilmGenresStore} from "../../store/film_genres_store_context";


export const FilmListPageRoot: React.FunctionComponent = observer(() => {
  const store = useLocalObservable(() => new FilmListStore())
  const genres = useLocalObservable(() => new FilmGenresStore())

  return (
    <FilmGenresStoreProvider store={genres}>
      <FilmListStoreProvider store={store}>
        <FilmListContent/>
      </FilmListStoreProvider>
    </FilmGenresStoreProvider>
  )
})

const FilmListContent = observer(() => {
  const store = useFilmListStore()
  const genres = useFilmGenresStore()

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column'
      }}
    >
      {(store.isLoading || genres.isLoading) && <LinearProgress sx={{width: '100%'}} color='secondary'/>}

      <Box  sx={{width: '100%', maxWidth: 'xl', marginTop: 3, marginBottom: 3}}>
        <Typography variant='h3' sx={{marginBottom: 1}}>Browse Films</Typography>

        <Grid
          container
          spacing={1}
        >
          <Grid item xs={12} lg={3}>
            <FilmFilters/>
          </Grid>

          <Grid item xs={12} lg={9}>
            <FilmListPage/>
          </Grid>
        </Grid>
      </Box>
    </Box>
  )
})