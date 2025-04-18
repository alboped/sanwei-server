import { Provide, Inject, MidwayConfigService } from '@midwayjs/core';
import puppeteer from 'puppeteer';
import { RedisService } from '@midwayjs/redis';
import { DoubanService } from './douban';

@Provide()
export class AnimeService {
  @Inject()
  redisService: RedisService;

  @Inject()
  configService: MidwayConfigService;

  @Inject()
  doubanService: DoubanService;

  /**
   * 获取热门动漫列表
   * @returns
   */
  async gatAnimeHome() {
    // 从redis缓存中获取热门动漫列表
    const cacheAnimeList = await this.redisService.get('anime/hot');
    if (cacheAnimeList) {
      return JSON.parse(cacheAnimeList);
    }

    const browser = await puppeteer.launch();

    // 设置cookie
    const cookies = await this.doubanService.getDoubanCookie();
    browser.setCookie(...cookies);

    const page = await browser.newPage();
    await page.goto('https://movie.douban.com/tv/');

    await page.waitForSelector('.recent-hot .explore-menu-second-tag-list li');

    await page.$$eval('.recent-hot .explore-menu-second-tag-list li', el =>
      el.filter(node => node.textContent === '动画').map(item => item.click())
    );

    await page.waitForSelector(
      '.recent-hot .subject-list-list .drc-subject-card'
    );

    const animeHotList = await page.$$eval(
      '.recent-hot .subject-list-list .drc-subject-card',
      el =>
        el.map(item => {
          return {
            title: item.querySelector('.drc-subject-info-title-text')
              ?.textContent,
            score: item.querySelector('.drc-rating-num')?.textContent,
            poster: item.querySelector('.drc-cover-pic')?.getAttribute('src'),
            subtitle: item.querySelector('.drc-subject-info-subtitle')
              ?.textContent,
          };
        })
    );

    browser.close();
    this.redisService.set('anime/hot', JSON.stringify(animeHotList));

    return animeHotList.slice(0, 10);
  }

  /**
   * 找动漫列表
   * @returns
   */
  async searchAnimeList() {
    // 从redis缓存中获取热门动漫列表
    const cacheAnimeList = await this.redisService.get('anime/searchList');
    if (cacheAnimeList) {
      return {
        total: 500,
        list: JSON.parse(cacheAnimeList),
      };
    }

    const browser = await puppeteer.launch({
      headless: false,
    });

    // 设置cookie
    const cookies = await this.doubanService.getDoubanCookie();
    browser.setCookie(...cookies);

    const page = await browser.newPage();
    await page.goto('https://movie.douban.com/tv/');

    await page.waitForSelector('.explore-menu .explore-recent-hot-tag');

    await page.$$eval('.explore-menu li.explore-recent-hot-tag', el =>
      el[0].click()
    );

    await new Promise(r => setTimeout(r, 500));

    await page.$$eval('.explore-all div.base-selector', el => el[0].click());

    await new Promise(r => setTimeout(r, 500));

    await page.$$eval('.tag-group-list li.tag-group-item span', el =>
      el.filter(node => node.textContent === '动画').map(item => item.click())
    );

    await page.waitForSelector(
      '.subject-list-main .subject-list-list .drc-subject-card'
    );

    const animeList = await page.$$eval(
      '.subject-list-main .subject-list-list .drc-subject-card',
      el =>
        el.map(item => {
          return {
            title: item.querySelector('.drc-subject-info-title-text')
              ?.textContent,
            score: item.querySelector('.drc-rating-num')?.textContent,
            poster: item.querySelector('.drc-cover-pic')?.getAttribute('src'),
            subtitle: item.querySelector('.drc-subject-info-subtitle')
              ?.textContent,
          };
        })
    );

    browser.close();
    this.redisService.set('anime/searchList', JSON.stringify(animeList));

    return {
      total: 500,
      list: animeList,
    };
  }
}
