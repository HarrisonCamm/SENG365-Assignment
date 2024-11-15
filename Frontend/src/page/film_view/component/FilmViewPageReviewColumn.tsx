import React from "react";
import {observer} from "mobx-react-lite";
import {useFilmViewStore} from "../film_view_store_context";
import {
  Box,
  Button,
  IconButton,
  Link,
  Rating,
  Skeleton,
  Stack,
  Tooltip,
  Typography
} from "@mui/material";
import {Link as RouterLink} from "react-router-dom";
import {LoadStatusError} from "../../../util/LoadStatus";
import {ErrorPresenter} from "../../../component/ErrorPresenter";
import {FilmViewReviewStoreReview} from "../FilmViewReviewStore";
import {EmojiEvents, Refresh} from "@mui/icons-material";
import {useProfilePhotoBlob} from "../../../hook/useProfilePhotoBlob";
import {ProfilePhotoBlobView} from "../../../component/ProfilePhotoBlobView";

export const FilmViewPageReviewColumn: React.FunctionComponent = observer(() => {
  const store = useFilmViewStore()

  let content
  if (store.review.isLoading) {
    content = (
      <Box>
        <Skeleton width='100%'/>
        <Skeleton width='95%'/>
        <Skeleton width='90%'/>
      </Box>
    )
  } else if (store.review.review !== null) {
    content = <FilmViewPageReviewColumnContent/>
  } else {
    // ERROR
    content = (
      <Box sx={{padding: 1}}>
        <Typography variant="subtitle1" color="error">Failed to load review information:</Typography>
        <Typography variant="body1" color="error">
          {(store.review.loadStatus instanceof LoadStatusError) ? (
            <ErrorPresenter error={store.review.loadStatus.error}/>
          ) : "Loading hasn't started yet"}
        </Typography>
        <Button onClick={() => store.review.fetchReview()}>Try again</Button>
      </Box>
    )
  }

  return (
    <Box sx={{flex: 1, maxHeight: 400, display: 'flex', flexDirection: 'column', overflow: 'auto'}}>
      <Typography variant='h6'>Review History</Typography>
      {content}
    </Box>
  )
})

const FilmViewPageReviewColumnContent: React.FunctionComponent = observer(() => {
  const store = useFilmViewStore()
  const review = store.review.review!

  if (review.length === 0) {
    return (
      <Stack sx={{display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'center'}}>
        <Typography variant="body1">No reviews yet!</Typography>
        <Tooltip title="Refresh">
          <IconButton onClick={() => store.review.fetchReview()} color='primary' size='small'>
            <Refresh/>
          </IconButton>
        </Tooltip>
      </Stack>
    )
  }

  return (
    <>
      <Typography variant='overline' sx={{lineHeight: 1}}>{review.length} review</Typography>

      <table>
        <tbody>
        {review.map((review, index) => (
          <FilmViewPageOverviewColumnReviewReview key={`review-${review.rating}`} review={review} isLeader={index == 0}/>
        ))}
        </tbody>
      </table>
    </>
  )
})

interface FilmViewPageOverviewColumnReviewReviewProps {
  review: FilmViewReviewStoreReview
  isLeader: boolean
}
const FilmViewPageOverviewColumnReviewReview: React.FunctionComponent<FilmViewPageOverviewColumnReviewReviewProps> = observer(({review, isLeader}) => {
  const photoBlob = useProfilePhotoBlob(review.reviewerId)

  return (
    <tr>
      <td style={{verticalAlign: 'middle'}}>
        <Tooltip title={<ProfilePhotoBlobView image={photoBlob.imageData} size={128} style={{verticalAlign: 'middle'}}/>}>
          <IconButton
            component={RouterLink}
            to={`/profile/${review.reviewerId}`}
            size='small'
            color='primary'
          >
            <ProfilePhotoBlobView image={photoBlob.imageData} size={32} style={{verticalAlign: 'middle'}}/>
          </IconButton>
        </Tooltip>
      </td>

      <td>
        <Box>
          <Typography variant='overline' sx={{lineHeight: 1}}>{review.timestamp.toLocaleString()}</Typography>
        </Box>

        <Box>
          <Link component={RouterLink} to={`/profile/${review.reviewerId}`} underline='hover'>
            {review.reviewerFirstName} {review.reviewerLastName}
          </Link>
        </Box>
      </td>
      <Rating name="read-only" value={review.rating} max={10} readOnly />
      <Typography>{review.review}</Typography>
      {/* <td style={{fontWeight: (isLeader) ? 'bold' : 'normal'}}>
        ${review.rating}.00
      </td> */}
    </tr>
  )
})