import React from "react";
import {observer} from "mobx-react-lite";
import {Avatar, Box, Button, Chip, Link, Skeleton, Stack, Tooltip, Typography} from "@mui/material";
import {useFilmViewStore} from "../film_view_store_context";
import {Link as RouterLink, Navigate} from "react-router-dom";
import {LoadStatusError} from "../../../util/LoadStatus";
import {ErrorPresenter} from "../../../component/ErrorPresenter";
import {UserInfoRow} from "../../../component/UserInfoRow";
import {LocalOffer} from "@mui/icons-material";
import {useFilmGenresStore} from "../../../store/film_genres_store_context";
import {PlaceReviewButton} from "../../film_list/component/place_review_popup/PlaceReviewButton";
import {ApplicationStore} from "../../../store/ApplicationStore";
import {FilmViewPageEditControls} from "./FilmViewPageEditControls";
import G from "../images/G.png";
import PG from "../images/PG.png";
import M from "../images/M.png";
import R13 from "../images/R13.png";
import R16 from "../images/R16.png";
import R18 from "../images/R18.png";
import TBC from "../images/TBC.png";

export const FilmViewPageOverviewColumn: React.FunctionComponent = observer(() => {
  const details = useFilmViewStore().film.details

  if (details.film !== null) {
    return <FilmViewPageOverviewColumnContent/>
  }
  else if (details.isLoading) {
    return <FilmViewPageOverviewColumnSkeleton/>
  }
  else if (details.filmDoesNotExist) {
    return <Navigate to="/404" replace/>
  }
  else {
    return (
      <Box sx={{padding: 1}}>
        <Typography variant="subtitle1" color="error">Failed to load film information:</Typography>
        <Typography variant="body1" color="error">
          {(details.loadStatus instanceof LoadStatusError) ? (
            <ErrorPresenter error={details.loadStatus.error}/>
          ) : "Loading hasn't started yet"}
        </Typography>
        <Button onClick={() => details.fetchDetails()}>Try again</Button>
      </Box>
    )
  }
})

const FilmViewPageOverviewColumnSkeleton: React.FunctionComponent = () => {

  function convertMinutesToHoursAndMinutes(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    const hoursString = hours > 0 ? hours + " hour" + (hours > 1 ? "s" : "") + " " : "";
    const minutesString = remainingMinutes > 0 ? remainingMinutes + " minute" + (remainingMinutes > 1 ? "s" : "") : "";
    return hoursString + minutesString;
  }

  return (
    <Stack spacing={1}>
      <Typography variant='h4'><Skeleton/></Typography>
      <Skeleton variant='rectangular' width={250} sx={{borderRadius: 30}} height={30}/>
      <Stack direction='row' spacing={1}>
        <Skeleton variant='circular' height={48} width={48} sx={{flex: 0, flexBasis: 48}}/>
        <Skeleton sx={{flex: 1}}/>
      </Stack>
      <PlaceReviewButton/>
    </Stack>
  )
}

const FilmViewPageOverviewColumnContent: React.FunctionComponent = observer(() => {
  const store = useFilmViewStore()
  const details = store.film.details
  const film = details.film!

  return (
    <Stack gap={1} sx={{height: '100%'}}>
      <Typography variant='h4'>{film!.title}</Typography>

      <Box>
        <Chip
          color="primary"
          variant="filled"
          label={`Released: ${details.releaseDate!.toLocaleString()}`}
        />
      </Box>

      <FilmViewPageOverviewColumnItemGenre/>

      <Link component={RouterLink} to={`/profile/${film.directorId}`} underline='hover'>
        <UserInfoRow userId={film.directorId} size={48}/>
      </Link>

      <Box>
        <Typography component='span' sx={{paddingRight: 1}}>Runtime</Typography>
        <Typography component='span'>{store.convertTimeToHoursAndMinutes}</Typography>
      </Box>

      <PlaceReviewButton/>

      {(store.isEditable) && (
        <FilmViewPageEditControls/>
      )}
    </Stack>
  )
})

export const FilmViewPageOverviewColumnItemAgeRating: React.FunctionComponent = observer(() => {
  const store = useFilmViewStore()
  const ageRating = store.film.details.film?.ageRating
  switch (ageRating) {
    case 'G':
      return(
        <Avatar src={G}></Avatar>
      )
      break;
    case 'PG':
      return(
        <Avatar sx={{ width: 25, height: 25}} src={PG}></Avatar>
      )
      break;
    case 'M':
      return(
        <Avatar sx={{ width: 25, height: 25}} src={M}></Avatar>
      )
      break;
    case 'R13':
      return(
        <Avatar sx={{ width: 25, height: 25}} src={R13}></Avatar>
      )
      break;
    case 'R16':
      return(
        <Avatar sx={{ width: 25, height: 25}} src={R16}></Avatar>
      )
      break;
    case 'R18':
      return(
        <Avatar sx={{ width: 25, height: 25}} src={R18}></Avatar>
      )
      break;
    case 'TBC':
      return(
        <Avatar sx={{ width: 25, height: 25}} src={TBC}></Avatar>
      )
      break;
    default:
      return(
        <Avatar sx={{ width: 56, height: 56}}>?</Avatar>
      )
  }
})


const FilmViewPageOverviewColumnItemGenre: React.FunctionComponent = observer(() => {
  const store = useFilmViewStore()
  const genres = useFilmGenresStore()

  if (genres.isLoading) {
    return (
      <Tooltip title='Loading Genre'>
        <Typography variant='body1'><Skeleton/></Typography>
      </Tooltip>
    )
  }
  else {
    const genreName = genres.genresById?.get(store.film.details.film!.genreId)

    if (genreName !== undefined) {
      return (
        <Typography variant='body1'><FilmViewPageOverviewColumnItemAgeRating/> {genreName}</Typography>
      )
    }
    else {
      return (
        <Tooltip title={`Genre ID is: ${store.film.details.film!.genreId}`}>
          <Typography variant='body1' color='red' sx={{fontStyle: 'italic'}} onClick={() => genres.fetchGenres()}>
            Failed to find genre. Click to reload.
          </Typography>
        </Tooltip>
      )
    }
  }
})

