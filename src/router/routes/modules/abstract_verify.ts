import type { AppRouteModule } from '/@/router/types';

import { LAYOUT } from '/@/router/constant';
import { t } from '/@/hooks/web/useI18n';

const dashboard: AppRouteModule = {
  path: '/abs_verify',
  name: 'AbsVerify',
  component: LAYOUT,
  redirect: '/abs_verify/index',
  meta: {
    hideChildrenInMenu: true,
    icon: 'simple-icons:about-dot-me',
    title: t('routes.dashboard.abs_verify'),
    orderNo: 100000,
  },
  children: [
    {
      path: 'index',
      name: 'AbsVerifyPage',
      component: () => import('/@/views/abstract_verify/index.vue'),
      meta: {
        title: t('routes.dashboard.abs_verify'),
        icon: 'simple-icons:about-dot-me',
        hideMenu: true,
      },
    },
  ],
};

export default dashboard;
