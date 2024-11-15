import React from "react";
import {observer} from "mobx-react-lite";
import {useFilmListStore} from "../film_list_store_context";
import {Box, Button, Card, Typography} from "@mui/material";
import {LoadStatusDone, LoadStatusError} from "../../../util/LoadStatus";
import {ErrorPresenter} from "../../../component/ErrorPresenter";
import {FilmListPageContent} from "./FilmListPageContent";
import {FilmSupplierProvider, useFilmSupplierStore} from "../film_supplier_context";
import {useFilmGenresStore} from "../../../store/film_genres_store_context";
import {FilmSkeleton} from "./FilmSkeleton";

export const FilmListPage: React.FunctionComponent = observer(() => {
  const genres = useFilmGenresStore()
  const store = useFilmListStore()

  return (
    <Card sx={{width: '100%', boxSizing: 'border-box', padding: 2}}>
      {(genres.loadStatus instanceof LoadStatusError) ? (
        <Box sx={{padding: 1}}>
          <Typography variant="subtitle1" color="error">Failed to load genre information:</Typography>
          <Typography variant="body1" color="error"><ErrorPresenter error={genres.loadStatus.error}/></Typography>
          <Button onClick={() => genres.fetchGenres()}>Try again</Button>
        </Box>
      ) : undefined}

      <FilmSupplierProvider store={store.page}>
        <FilmListPageRoot/>
      </FilmSupplierProvider>
    </Card>
  )
})

const FilmListPageRoot: React.FunctionComponent = observer(() => {
  const page = useFilmSupplierStore()

  if (page.isLoading) {
    return <FilmListPageSkeleton/>
  }
  else if (page.loadStatus instanceof LoadStatusDone) {
    return <FilmListPageContent/>
  }
  else if (page.loadStatus instanceof LoadStatusError) {
    return <ErrorPresenter error={page.loadStatus.error}/>
  }
  else {
    return <Typography variant='body1'>We've found ourselves in an unexpected state... Please reload the page to try again.</Typography>
  }
})

const FilmListPageSkeleton: React.FunctionComponent = () => {
  return (
    <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 2}}>
      <FilmSkeleton/>
      <FilmSkeleton opacity={0.65}/>
      <FilmSkeleton opacity={0.3}/>
    </Box>
  )
}

