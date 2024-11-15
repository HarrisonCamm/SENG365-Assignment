import React, {useEffect, useState} from "react";
import {observer} from "mobx-react-lite";
import {
  alpha,
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Chip,
  Rating,
  Skeleton,
  Tooltip,
  Typography, useTheme
} from "@mui/material";
import {PhotoBlobView} from "../../../component/PhotoBlobView";
import {useFilmListStore} from "../film_list_store_context";
import {Link} from "react-router-dom";
import {FilmListPageFilm} from "../FilmListPageFilm";
import intervalToDuration from "date-fns/intervalToDuration";
import {LocalOffer, Tag} from "@mui/icons-material";
import {UserInfoRow} from "../../../component/UserInfoRow";
import {useFilmSupplierStore} from "../film_supplier_context";
import {useFilmGenresStore} from "../../../store/film_genres_store_context";

interface FilmListItemProps {
  index: number
}
export const FilmListItem: React.FunctionComponent<FilmListItemProps> = observer(({index}) => {
  const page = useFilmSupplierStore()
  const film = page.films![index]

  console.log(film.film)

  function convertMinutesToHoursAndMinutes(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    const hoursString = hours > 0 ? hours + " hour" + (hours > 1 ? "s" : "") + " " : "";
    const minutesString = remainingMinutes > 0 ? remainingMinutes + " minute" + (remainingMinutes > 1 ? "s" : "") : "";
    return hoursString + minutesString;
  }
  
  return (
    <Card sx={{minWidth: 250, flex: 1, display: 'flex'}}>
      <CardActionArea component={Link} to={`/films/${film.film.filmId}`} sx={{flex: 1}}>
        <Box sx={{position: 'relative'}}>
          <PhotoBlobView
            image={film.photo.imageData}
            imageBuilder={(src) => (
              <CardMedia
                component='img'
                height={400}
                src={src}
                alt={film.film.title}
              />
            )}
            defaultBuilder={() => (
              <CardMedia component='div'>
                <Skeleton height={140} variant="rectangular" animation={false}/>
              </CardMedia>
            )}
          />

          <FilmListItemClosingChip film={film}/>
        </Box>

        <CardContent>
          <Typography variant='h6' component='div'>{film.film.title}</Typography>
          <FilmListItemGenre film={film}/>
          <Box sx={{paddingTop: 1}}>
            <UserInfoRow userId={film.film.directorId}/>
          </Box>

          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'end'
          }}>
            <Box sx={{flex: 1}}>
              
              <Typography variant='button' component='div'>{}</Typography>
            </Box>
            {(film.film.highestReview !== null) && (
              <Box sx={{flex: 1, textAlign: 'right'}}>
                <Typography variant='button' component='div'>{film.film?.rating}<Rating name="one-star" value={1} max={1} /></Typography>
                
              </Box>
            )}
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  )
})

interface FilmListItemSubComponentProps {
  film: FilmListPageFilm
}

const FilmListItemGenre: React.FunctionComponent<FilmListItemSubComponentProps> = observer(({film}) => {
  const genres = useFilmGenresStore()

  if (genres.isLoading) {
    return (
      <Tooltip title='Loading Genre'>
        <Typography variant='body1'><Skeleton/></Typography>
      </Tooltip>
    )
  }
  else {
    const genreName = genres.genresById?.get(film.film.genreId)

    if (genreName !== undefined) {
      return (
        <Typography variant='body1'> {genreName}</Typography>
      )
    }
    else {
      return (
        <Tooltip title={`Genre ID is: ${film.film.genreId}`}>
          <Typography variant='body1' color='red' sx={{fontStyle: 'italic'}}>
            Failed to find genre.
          </Typography>
        </Tooltip>
      )
    }
  }
})

const FilmListItemClosingChip: React.FunctionComponent<FilmListItemSubComponentProps> = observer(({film}) => {
  const releaseDate = film.releaseDate
  const isReleased = new Date() > releaseDate

  let message
  if (isReleased) {
    message = `Released on ${releaseDate.toLocaleString()}`
  }
  else {
    message = `Releases on ${releaseDate.toLocaleString()}`

  }

  return (
    <Tooltip title={releaseDate.toLocaleString()}>
      <Chip
        sx={{
          position: 'absolute',
          top: 2,
          right: 2,
          cursor: 'pointer'
        }}
        size='small'
        color="primary"
        label={message}
      />
    </Tooltip>
  )
})




