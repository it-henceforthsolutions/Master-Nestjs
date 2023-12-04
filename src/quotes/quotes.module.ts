import { Module } from '@nestjs/common';
import { QuotesService } from './quotes.service';
import { QuotesController } from './quotes.controller';
import { CommonModule } from 'src/common/common.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Quotes, QuotesModel } from './schema/quotes.schema';

@Module({
    imports:[
        CommonModule,
        MongooseModule.forFeature([{name:Quotes.name, schema:QuotesModel}])
    ],
    controllers: [QuotesController],
    providers: [QuotesService]
})
export class QuotesModule { }
