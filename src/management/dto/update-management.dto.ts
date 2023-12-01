import { PartialType } from '@nestjs/swagger';
import { CreateManagementDto } from './create-management.dto';

export class UpdateManagementDto extends PartialType(CreateManagementDto) {}
