import { MidwayConfig, MidwayAppInfo } from '@midwayjs/core';

export default (appInfo: MidwayAppInfo) => {
  return {
    // use for cookie sign key, should change to your own and keep security
    keys: appInfo.name + '_1744363947078_6652',
    egg: {
      port: 7001,
    },
    // security: {
    //   csrf: false,
    // },
    redis: {
      client: {
        port: 6379, // Redis port
        host: '127.0.0.1', // Redis host
        password: 'DWHxs512',
        db: 0,
      },
    },
    db: {
      database: 'sanwei_admin',
      host: 'rm-8vbyt8twdveod3581.mysql.zhangbei.rds.aliyuncs.com',
      port: '3306',
      user: 'dms_user_f7554c6',
      password: 'DWHxs125700',
    },
  } as MidwayConfig;
};
