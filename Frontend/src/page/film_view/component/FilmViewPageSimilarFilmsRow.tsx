import React, {useEffect, useState} from "react";
import {observer} from "mobx-react-lite";
import {useFilmViewStore} from "../film_view_store_context";
import {FilmViewSimilarStore} from "../FilmViewSimilarStore";
import {FilmDetails} from "../../../store/FilmDetailsStore";
import {observable} from "mobx";
import {Box, Skeleton, Typography} from "@mui/material";
import {LoadStatusError} from "../../../util/LoadStatus";
import {ErrorPresenter} from "../../../component/ErrorPresenter";
import {FilmSupplierProvider} from "../../film_list/film_supplier_context";
import {FilmSkeleton} from "../../film_list/component/FilmSkeleton";
import {FilmListItem} from "../../film_list/component/FilmListItem";

export const FilmViewPageSimilarFilmsRow: React.FunctionComponent = observer(() => {
  const store = useFilmViewStore()
  const details = store.film.details

  if (details.film !== null) {
    return <FilmViewPageSimilarFilmsRowContent/>
  }
  else if (details.isLoading) {
    return <FilmViewPageSimilarFilmsRowSkeleton/>
  }
  else {
    return <></>
  }
})

const FilmViewPageSimilarFilmsRowSkeleton: React.FunctionComponent = () => {
  return (
    <Box>
      <Skeleton variant='rectangular'/>
      <Skeleton variant='rectangular'/>
      <Skeleton variant='rectangular'/>
    </Box>
  )
}

const makeStore = (film: FilmDetails) => observable(new FilmViewSimilarStore(film), {}, {autoBind: true})

const FilmViewPageSimilarFilmsRowContent: React.FunctionComponent = observer(() => {
  const film = useFilmViewStore().film.details.film!
  const [similarStore, setSimilarStore] = useState<FilmViewSimilarStore>(() => makeStore(film))

  useEffect(() => {
    if (
      similarStore.film.filmId !== film.filmId
      || similarStore.film.directorId !== film.directorId
      || similarStore.film.genreId !== film.genreId
    ) {
      setSimilarStore(makeStore(film))
    }
  }, [similarStore.film.filmId, film.directorId, film.genreId, film])

  let content
  if (similarStore.isLoading) {
    content = <FilmViewPageSimilarFilmsRowContentSkeleton/>
  }
  else if (similarStore.films !== null) {
    if (similarStore.films.length > 0) {
      content = (
        <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 2}}>
          {similarStore.films.map((film, index) => (
            <FilmListItem key={`${film.film.filmId}`} index={index}/>
          ))}
        </Box>
      )
    }
    else {
      content = (
        <Typography variant="body1">No similar films found</Typography>
      )
    }

  }
  else if (similarStore.loadStatus instanceof LoadStatusError) {
    content = <ErrorPresenter error={similarStore.loadStatus.error}/>
  }
  else {
    content = <Typography variant='body1'>We've found ourselves in an unexpected state... Please reload the page to try again.</Typography>
  }


  return (
    <FilmSupplierProvider store={similarStore}>
      <Box>
        <Typography variant='h6'>Similar Films</Typography>
        {content}
      </Box>
    </FilmSupplierProvider>
  )
})

const FilmViewPageSimilarFilmsRowContentSkeleton: React.FunctionComponent = () => {
  return (
    <Box>
      <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 2}}>
        <FilmSkeleton/>
        <FilmSkeleton opacity={0.65}/>
        <FilmSkeleton opacity={0.3}/>
      </Box>
    </Box>
  )
}