import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import { useGlobalStore } from '../store/global';

const routes = [
  {
    path: '/',
    name: 'news',
    component: () => import('@/views/NewsList.vue'),
    meta: {
      titme: "News Bitcoin, Ethereum, Crypto News and Price Data | ZTH"
    },
  },
  {
    path: '/btc-returns',
    name: 'bitcoin return',
    component: HomeView,
    meta: {
      titme: "ZTH | Data Analysis,Bitcoin Open interest,Bitcoin Options,Crypto machine learning"
    },
  },
  {
    path: '/volume-monitor',
    name: 'volume monitor',
    component: () => import('@/views/VolumeMonitor.vue'),
    meta: {
      titme: "Volume All Coins,Order Book,Bitcoin Open interest,Big Transfers | ZTH"
    },
  },
  {
    path: '/news/:id/:title',
    component: () => import('@/views/ArticleDetails.vue'),
    name: 'ArticleDetails',
    props: (route) => ({
      id: route.params.id,
      title: route.params.title,
    }),
    meta: { scrollToTop: true, title: 'Article' },
    
  },
  {
    path: '/long-short',
    name: 'long-short',
    component: () => import('../views/LongShortView.vue'),
    meta: {
      titme: "Bitcoin Long Short Ratio, ETH Longs/Shorts Ratio, Cryptocurrency Longs VS Shorts Ratio, Binance Long And Short Ratio | ZTH",
    },
  },
];

const scrollBehavior = async (to, from, savedPosition) => {
  if (to.meta.scrollToTop) {
    return new Promise((resolve) => {
      setTimeout(() => resolve({ top: 0 }), 100);
    });
  }
  return new Promise((resolve) => {
    setTimeout(() => resolve(savedPosition), 300);
  });
};

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  strict: true, 
  scrollBehavior,
});

router.beforeEach((to, from) => {
  const store = useGlobalStore();
  // reset news pagination counter if come from another page.
  // don't touch the counter when going(forward or back) to news or articles.
  if (!((to.name === 'ArticleDetails' && from.name === "news") || (to.name === "news" && from.name === 'ArticleDetails') || to.name === 'news')) {
    store.newsPaginationCounter  = 1;
    }
  document.title = to.meta.titme ?? 'ZTH';
});

export default router;
