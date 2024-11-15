import {PhotoStore} from "./PhotoStore";
import {FilmDetailsStore} from "./FilmDetailsStore";

export class FilmStore {
  readonly id: number

  readonly photo: PhotoStore
  readonly details: FilmDetailsStore

  constructor(id: number) {
    this.id = id
    this.photo = new PhotoStore(`/films/${this.id}/image`)
    this.details = new FilmDetailsStore(this.id)

    this.photo.fetchImage()
    this.details.fetchDetails()
  }
}