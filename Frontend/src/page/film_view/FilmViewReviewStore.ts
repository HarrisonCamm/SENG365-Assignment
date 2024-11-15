import { makeObservable, observable, runInAction } from "mobx";
import {
  LoadStatus,
  LoadStatusDone,
  LoadStatusError,
  LoadStatusNotYetAttempted,
  LoadStatusPending,
} from "../../util/LoadStatus";
import { makeApiPath } from "../../util/network_util";
import { handleServerError } from "../../util/error_util";
import parseISO from "date-fns/parseISO";

// Interface for server review data
interface ServerReview {
  reviewerId: number;
  rating: number;
  review: string;
  reviewerFirstName: number;
  reviewerLastName: number;
  timestamp: string;
}

// Interface for review data with parsed timestamp
export interface FilmViewReviewStoreReview
  extends Omit<ServerReview, "timestamp"> {
  timestamp: Date;
}

// FilmViewReviewStore class
export class FilmViewReviewStore {
  readonly filmId: number;
  loadStatus: LoadStatus = new LoadStatusNotYetAttempted();
  review: FilmViewReviewStoreReview[] | null = null;

  constructor(filmId: number) {
    // Make observables
    makeObservable(this, {
      loadStatus: observable,
      review: observable,
    });

    this.filmId = filmId;
  }

  // Check if the store is currently loading
  get isLoading(): boolean {
    return this.loadStatus instanceof LoadStatusPending;
  }

  // Fetch reviews for the film
  async fetchReview() {
    if (this.isLoading) {
      return;
    }

    this.loadStatus = new LoadStatusPending();

    try {
      const res = await fetch(makeApiPath(`/films/${this.filmId}/reviews`));

      if (!res.ok) {
        handleServerError(res);
        return;
      }

      const body: ServerReview[] = await res.json();
      runInAction(() => {
        this.review = body.map((review) => ({
          ...review,
          timestamp: parseISO(review.timestamp),
        }));
        this.loadStatus = new LoadStatusDone();
      });
    } catch (e) {
      runInAction(() => {
        this.loadStatus = new LoadStatusError(e);
      });
      throw e;
    }
  }
}