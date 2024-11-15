import React from "react";
import {Box, Skeleton} from "@mui/material";

interface FilmSkeletonProps {
  opacity?: number,
}

export const FilmSkeleton: React.FunctionComponent<FilmSkeletonProps> = ({opacity}) => {
  return (
    <Box sx={{opacity: opacity}}>
      <Skeleton variant="rectangular" height={300} width={250} sx={{borderRadius: 2}}/>
    </Box>
  )
}