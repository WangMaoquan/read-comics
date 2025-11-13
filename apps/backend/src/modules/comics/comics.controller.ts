import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ComicsService } from './comics.service';
import { CreateComicDto } from './dto/create-comic.dto';
import { UpdateComicDto } from './dto/update-comic.dto';
import type { ComicFilter } from '@read-comics/types';

@Controller('comics')
export class ComicsController {
  constructor(private readonly comicsService: ComicsService) {}

  @Post()
  @UsePipes(new ValidationPipe())
  create(@Body() createComicDto: CreateComicDto) {
    return this.comicsService.create(createComicDto);
  }

  @Get()
  findAll(@Query() filter?: ComicFilter) {
    return this.comicsService.findAll(filter);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.comicsService.findOne(id);
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe())
  update(@Param('id') id: string, @Body() updateComicDto: UpdateComicDto) {
    return this.comicsService.update(id, updateComicDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.comicsService.remove(id);
  }

  @Get('count')
  count() {
    return this.comicsService.count();
  }
}
