import parseISO from "date-fns/parseISO";
import { PhotoStore } from "../../store/PhotoStore";

// Interface for the film data in the film list page
export interface IFilmListPageFilm {
  title: string;
  genreId: number;
  directorId: number;
  runtime: number;
  releaseDate: string;
  filmId: number;
  directorFirstName: string;
  directorLastName: string;
  highestReview: number | null;
  rating: number;
  ageRating: string;
}

// FilmListPageFilm class
export class FilmListPageFilm {
  readonly film: IFilmListPageFilm;
  readonly photo: PhotoStore;
  readonly releaseDate: Date;

  constructor(data: IFilmListPageFilm) {
    this.film = data;
    this.releaseDate = parseISO(data.releaseDate);
    this.photo = new PhotoStore(`/films/${data.filmId}/image`);

    // Fetch the film's photo
    this.photo.fetchImage();
  }
}
