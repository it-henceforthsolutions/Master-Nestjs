import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import * as moment from 'moment';

export type DbBackupDocument = HydratedDocument<DbBackup>

@Schema()
export class DbBackup {
    @Prop({ type: String, default: null })
    name: string

    @Prop({ type: String, default: null })
    unique_key: string

    @Prop({ type: String, default: null })
    date: string

    @Prop({ type: String, default: null })
    file_url: string

    @Prop({ type: String, default: +moment().utc().valueOf() })
    created_at: string
}

export const DbBackupSchema = SchemaFactory.createForClass(DbBackup)