import { Types, ObjectId } from "mongoose";

export interface token_payload {
    id: Types.ObjectId;
    email?: string;
    scope: string;
    token_gen_at : number;
  }