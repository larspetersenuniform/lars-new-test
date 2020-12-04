import Vue from 'vue';
import { UniformOptimizePlugin } from '@uniformdev/optimize-tracker-vue';
import { createDefaultTracker } from '@uniformdev/optimize-tracker-browser';
import { cookieScoringStorage } from '@uniformdev/optimize-tracker';
import { Analytics } from 'analytics';
import googleAnalyticsPlugin from '@analytics/google-analytics';
import segmentPlugin from '@analytics/segment';
import { addAnalyticsPlugin } from '@uniformdev/optimize-tracker-analytics';
import { componentResolver } from '~/components/componentResolver';
import intentManifest from '~/modules/uniform/optimize/intentManifest.json';

// NOTE: `req`, `res`, and `beforeNuxtRender` are only available during SSR
// NOTE2: this plugin depends on `cookie-universal-nuxt` module: https://github.com/microcipcip/cookie-universal/tree/master/packages/cookie-universal-nuxt
export default async (nuxtContext) => {
  const { $cookies, req, $config } = nuxtContext;
  if (req) {
    const serverTracker = createLocalTracker({ cookiesApi: $cookies, nuxtEnv: $config });
    await serverTracker.initialize();

    const trackerRequestContext = getTrackerRequestContext(req);
    const { signalMatches, scoring } = await serverTracker.reevaluateSignals(trackerRequestContext);

    // Attach `signalMatches` and `scoring` data to the `req` object so those data
    // can be used by other Nuxt hooks.
    // For instance, serializing the data to `__UNIFORM_DATA__` script variable so that
    // the tracker can hydrate after SSR.
    req.uniformData = { matches: signalMatches, scoring };

    Vue.use(UniformOptimizePlugin, {
      trackerInstance: serverTracker,
      componentResolver,
      isServer: true,
      initialIntentScores: scoring?.values,
    });
  } else {
    const clientTracker = createLocalTracker({ cookiesApi: $cookies, nuxtEnv: $config });
    await clientTracker.initialize();

    Vue.use(UniformOptimizePlugin, {
      trackerInstance: clientTracker,
      componentResolver,
      isServer: false,
    });
  }
};

function createNuxtCookieStorage(cookiesApi) {
  const cookieStorage = cookieScoringStorage({
    getCookie: (name) => {
      return cookiesApi.get(name, { parseJSON: false });
    },

    setCookie: (name, value) => {
      cookiesApi.set(name, value, {
        maxAge: 30 * 24 * 60 * 60,
        path: '/',
      });
    },
  });

  return cookieStorage;
}

function createLocalTracker({ cookiesApi, nuxtEnv }) {
  const plugins = [];

  const gaId = process.env.GA_UA_ID || nuxtEnv.GA_UA_ID;
  if (gaId) {
    plugins.push(
      googleAnalyticsPlugin({
        trackingId: gaId,
      })
    );
  }

  const segmentId = process.env.SEGMENT_ID || nuxtEnv.SEGMENT_ID;
  if (segmentId) {
    plugins.push(
      segmentPlugin({
        writeKey: segmentId,
      })
    );
  }

  const analytics = Analytics({
    app: 'Uniform Optimize Nuxt.js Example',
    debug: true,
    plugins,
  });

  const trackerInstance = createDefaultTracker({
    intentManifest,
    addPlugins: [addAnalyticsPlugin({ analytics })],
    storage: {
      scoring: createNuxtCookieStorage(cookiesApi),
    },
  });
  return trackerInstance;
}

function getTrackerRequestContext(req) {
  return {
    url: 'https://' + req.headers.host + req.url,
    cookies: req.headers.cookie,
    userAgent: req.headers['user-agent'],
  };
}
