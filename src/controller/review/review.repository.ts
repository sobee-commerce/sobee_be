import { IReview } from "@/interface"
import { CreateReviewRequest, CreateReviewResponse } from "./dto"
import { DeleteResult } from "mongodb"

export abstract class ReviewRepository {}
