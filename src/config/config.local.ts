import { EggAppConfig, PowerPartial } from 'egg';
import { MidwayConfig } from '@midwayjs/core';

export type DefaultConfig = PowerPartial<EggAppConfig>;

/**
 * 这里加入这段是因为 egg 默认的安全策略，在 post 请求的时候如果不传递 token 会返回 403
 * 由于大部分新手用户不太了解这个机制，所以在本地和单测环境做了默认处理
 * 请注意，线上环境依旧会有该错误，需要手动开启
 * 如果想了解更多细节，请访问 https://eggjs.org/zh-cn/core/security.html#安全威胁-csrf-的防范
 */
export default {
  security: {
    csrf: false,
  },
  redis: {
    client: {
      port: 6379, // Redis port
      host: '127.0.0.1', // Redis host
      password: 'DWHxs512',
      username: 'default',
      db: 0,
    },
  },
  db: {
    database: 'sanwei_admin',
    host: 'rm-8vbyt8twdveod3581co.mysql.zhangbei.rds.aliyuncs.com',
    port: '3306',
    user: 'dms_user_f7554c6',
    password: 'DWHxs125700',
  },
} as MidwayConfig & DefaultConfig;
