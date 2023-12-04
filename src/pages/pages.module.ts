import { Module } from '@nestjs/common';
import { PagesService } from './pages.service';
import { PagesController } from './pages.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Pages, pageModel } from './schema/pages.schema';
import { CommonModule } from 'src/common/common.module';
import { UsersModule } from 'src/users/users.module';

@Module({
    imports: [
        UsersModule,
        MongooseModule.forFeature([{name:Pages.name, schema:pageModel}]),
        CommonModule
    ],
    controllers: [PagesController],
    providers: [PagesService]
})
export class PagesModule { }
