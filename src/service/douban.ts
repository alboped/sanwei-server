import { Provide, Inject } from '@midwayjs/core';
import { RedisService } from '@midwayjs/redis';

import { cookieParse } from '../utils/cookie';

@Provide()
export class DoubanService {
  @Inject()
  redisService: RedisService;

  async getDoubanCookie() {
    const douban_cookie = await this.redisService.get('douban_cookie');
    return cookieParse(douban_cookie, {
      cookieParams: {
        domain: 'movie.douban.com',
      },
    });
  }
}
