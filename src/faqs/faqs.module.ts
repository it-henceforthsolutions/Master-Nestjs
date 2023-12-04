import { Module } from '@nestjs/common';
import { FaqsService } from './faqs.service';
import { FaqsController } from './faqs.controller';
import { CommonModule } from 'src/common/common.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Faqs, faqsModel } from './schema/faqs.schema';
import { UsersModule } from 'src/users/users.module';

@Module({
    imports: [
        UsersModule,
        CommonModule,
        MongooseModule.forFeature([{name:Faqs.name, schema:faqsModel}])
    ],
    controllers: [FaqsController],
    providers: [FaqsService]
})
export class FaqsModule { }
