import { Provide, Inject } from '@midwayjs/core';
import puppeteer from 'puppeteer';
import { RedisService } from '@midwayjs/redis';
import { DoubanService } from './douban';

@Provide()
export class MovieService {
  @Inject()
  redisService: RedisService;

  @Inject()
  doubanService: DoubanService;

  /**
   * 获取豆瓣电影首页的正在热映和热门电影信息
   * @returns 返回包含正在热映和热门电影信息的对象
   */
  async getMovieHome() {
    try {
      // 从redis缓存中获取热门电影列表
      const cacheData = await this.redisService.get('movie/hot');
      if (cacheData) {
        return JSON.parse(cacheData);
      }

      const browser = await puppeteer.launch();

      // 设置cookie
      const cookies = await this.doubanService.getDoubanCookie();
      browser.setCookie(...cookies);

      const page = await browser.newPage();
      await page.goto('https://movie.douban.com/');

      // 获取正在热映的电影列表
      const cinemaData = await page.$$eval(
        '#screening [data-title].ui-slide-item',
        node =>
          node.map(item => {
            return {
              title: item.querySelector('.title')?.textContent?.trim(),
              score: item.querySelector('.subject-rate')?.textContent,
              poster: item.querySelector('.poster img')?.getAttribute('src'),
              code: item.getAttribute('data-dstat-areaid'),
            };
          })
      );

      // 截取前10条数据，并去掉code字段
      const firstIndex = cinemaData.findIndex(
        item => !!item.code?.endsWith('_1')
      );
      const cinemaHot = cinemaData
        .slice(firstIndex, firstIndex + 10)
        .map(item => {
          delete item.code;
          return item;
        });

      // 热门电影列表选择器
      const selector =
        '#recent-hot .recent-hot-movie [data-swiper-slide-index="0"]';

      const hotDataEl = await page.waitForSelector(selector);

      // 获取热门电影列表
      const hotData = await hotDataEl.$$eval('.subject-card', node =>
        node.map(item => {
          return {
            title: item
              .querySelector('.subject-card-item-title-text')
              ?.textContent?.trim(),
            score: item.querySelector('.subject-card-item-rating-score')
              ?.textContent,
            poster: item
              .querySelector('.subject-card-item-cover img')
              ?.getAttribute('src'),
          };
        })
      );

      const hot = hotData.slice(0, 10);

      await browser.close();

      this.redisService.set('movie/hot', JSON.stringify({ cinemaHot, hot }));

      return { cinemaHot, hot };
    } catch (error) {
      throw {};
    }
  }

  /**
   * 找电影列表信息
   * @returns 电影列表数组，每个元素包含电影标题、评分、海报链接和副标题
   */
  async searchMovieList() {
    // 从redis缓存中获取电影列表
    const cacheMovieList = await this.redisService.get('movie/searchList');
    if (cacheMovieList) {
      return {
        total: 500,
        list: JSON.parse(cacheMovieList),
      };
    }

    const browser = await puppeteer.launch();

    // 设置cookie
    const cookies = await this.doubanService.getDoubanCookie();
    browser.setCookie(...cookies);

    const page = await browser.newPage();
    await page.goto('https://movie.douban.com/explore');

    const movieLi = await page.waitForSelector('.subject-list-list');

    const movieList = await movieLi.$$eval('li', node =>
      node.map(item => {
        return {
          title: item
            .querySelector('.drc-subject-info-title-text')
            ?.textContent?.trim(),
          score: item.querySelector('.drc-rating-num')?.textContent,
          poster: item.querySelector('.drc-cover-pic')?.getAttribute('src'),
          subtitle: item.querySelector('.drc-subject-info-subtitle')
            ?.textContent,
        };
      })
    );

    browser.close();

    this.redisService.set('movie/searchList', JSON.stringify(movieList));

    return {
      total: 500,
      list: movieList,
    };
  }
}
