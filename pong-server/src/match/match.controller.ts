import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MatchService } from './match.service';
import { CreateMatchDto } from './dto/create-match.dto';
import { UpdateMatchDto } from './dto/update-match.dto';

@Controller('match')
export class MatchController {
  constructor(private readonly matchService: MatchService) { }

  // @Post()
  // create(@Body() createMatchDto: CreateMatchDto) {
  //   return this.matchService.create(createMatchDto);
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.matchService.findOne(+id);
  // }
}
