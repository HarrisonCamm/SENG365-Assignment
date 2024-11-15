import React, { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { FilmStore } from "../../store/FilmStore";

// Props interface for the FilmPageLoader component
interface FilmPageLoaderProps {
  pageBuilder: (film: FilmStore) => React.ReactElement; // Function to build the page using the FilmStore instance
}

// FilmPageLoader component
export const FilmPageLoader: React.FunctionComponent<FilmPageLoaderProps> = ({ pageBuilder }) => {
  const params = useParams<{ filmId: string }>();
  const filmId = parseInt(params.filmId ?? "NaN", 10);

  const [film, setFilm] = useState(() => new FilmStore(filmId));

  // Load the film data when the filmId changes
  useEffect(() => {
    if (filmId !== film.id) {
      setFilm(new FilmStore(filmId));
    }
  }, [film.id, filmId]);

  // If the filmId is not a valid number, navigate to the 404 page
  if (isNaN(filmId)) {
    return <Navigate to="/404" replace />;
  }

  // Build and return the page using the provided pageBuilder function and the FilmStore instance
  return pageBuilder(film);
};