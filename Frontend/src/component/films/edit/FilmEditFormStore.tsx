import {InputValue} from "../../../util/InputValue";
import {FilmGenresStore} from "../../../store/FilmGenresStore";

// Define an interface for the FilmEditFormStore
export interface FilmEditFormStore {
  readonly title: InputValue; // Represents the title of the film as an InputValue object
  readonly genre: InputValue<number | null>; // Represents the genre of the film as an InputValue object, which can be either a number or null
  readonly releaseDate: InputValue<Date | null>; // Represents the release date of the film as an InputValue object, which can be either a Date object or null
  readonly description: InputValue; // Represents the description of the film as an InputValue object
  readonly runtime: InputValue; // Represents the runtime of the film as an InputValue object

  readonly genres: FilmGenresStore; // Represents the film genres store
  readonly ageRating: InputValue; // Represents the age rating of the film as an InputValue object

  get isLoading(): boolean; // Returns a boolean value indicating whether the film edit form is currently loading
}