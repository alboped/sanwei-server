import { Controller, Get, Inject, ContentType } from '@midwayjs/core';
import { Context } from '@midwayjs/web';

import { AnimeService } from '../service/anime';

@Controller('/anime')
export class HomeController {
  @Inject()
  ctx: Context;

  @Inject()
  animeService: AnimeService;

  @Get('/')
  @ContentType('application/json')
  async home() {
    const context = await this.animeService.gatAnimeHome();
    return {
      data: context,
      code: 200,
    };
  }

  @Get('/explore')
  @ContentType('application/json')
  async searchAnimeList() {
    const context = await this.animeService.searchAnimeList();
    return {
      data: context,
      code: 200,
    };
  }
}
