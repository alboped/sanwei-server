import { Controller, Get, Inject, ContentType } from '@midwayjs/core';
import { Context } from '@midwayjs/web';

import { MovieService } from '../service/movie';

@Controller('/movie')
export class HomeController {
  @Inject()
  ctx: Context;

  @Inject()
  movieService: MovieService;

  @Get('/')
  @ContentType('application/json')
  async home() {
    const context = await this.movieService.getMovieHome();
    return {
      data: context,
      code: 200,
    };
  }

  @Get('/explore')
  async explore() {
    const context = await this.movieService.searchMovieList();
    return {
      data: context,
      code: 200,
    };
  }
}
