import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { CurrentUser } from 'src/auth/decorator/current_user.decorator';
import { Role } from 'src/common/enums/role.enum';
import { Roles } from 'src/auth/decorator/roles.decorator';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  create(@CurrentUser() user, @Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentService.create(user.sub, createPaymentDto);
  }

  @Patch(':id')
  @Roles(Role.EDITOR, Role.SUPER_ADMIN, Role.REVIEWER)
  update(
    @Param('id') id: string,
    @Body() updatePaymentDto: Partial<CreatePaymentDto>,
  ) {
    return this.paymentService.updatePayment(id, updatePaymentDto);
  }
}
