import type { AppRouteModule } from '/@/router/types';
import { LAYOUT } from '/@/router/constant';
import { t } from '/@/hooks/web/useI18n';

const dashboard: AppRouteModule = {
  path: '/result',
  name: 'Result',
  component: LAYOUT,
  redirect: '/result/index',
  meta: {
    hideChildrenInMenu: true,
    icon: 'simple-icons:about-dot-me',
    title: t('routes.dashboard.result'),
    orderNo: 100000,
    hideTab: false,
    hideMenu: true,
  },
  children: [
    {
      path: 'index/:id',
      name: 'ResultPage',
      component: () => import('/@/views/result/index.vue'),
      meta: {
        title: t('routes.dashboard.result'),
        icon: 'simple-icons:about-dot-me',
        hideMenu: true,
      },
    },
  ],
};

export default dashboard;
