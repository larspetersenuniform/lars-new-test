const nodePath = require('path');

module.exports = initialize;

function initialize() {
  // In Nuxt modules, the current Nuxt instance is available via `this.nuxt`.
  const nuxtApp = this.nuxt;

  // In Nuxt modules, Nuxt config (nuxt.config.js) is available via `this.options`.
  // const nuxtConfig = this.options;

  // Add Uniform Optimize Nuxt plugin
  this.addPlugin(nodePath.resolve(__dirname, 'uniform-optimize-nuxt-plugin.js'));

  // The `vue-renderer:ssr:templateParams` hook is called immediately before the app SSR HTML template is rendered.
  // `templateParams` contains the generated template parameter values that will be used when rendering the HTML template:
  // const templateParams = {
  //   HTML_ATTRS: meta ? meta.htmlAttrs.text(renderContext.nuxt.serverRendered /* addSrrAttribute */) : '',
  //   HEAD_ATTRS: meta ? meta.headAttrs.text() : '',
  //   BODY_ATTRS: meta ? meta.bodyAttrs.text() : '',
  //   HEAD,
  //   APP,
  //   ENV: this.options.env
  // }
  nuxtApp.hook('vue-renderer:ssr:templateParams', (templateParams, renderContext) => {
    // NOTE: renderContext.req is undefined during static export and/or when the Nuxt `target` is "static".
    // renderContext.req is _only_ defined during SSR.
    if (!renderContext.req || !renderContext.req.uniformData) {
      return;
    }

    // Add a `__UNIFORM_DATA__` script tag to the outgoing HTML.
    const uniformDataScript = `<script id="__UNIFORM_DATA__" type="application/json">${JSON.stringify(
      renderContext.req.uniformData
    )}</script>`;

    // NOTE: the `APP` parameter is rendered within the `<body />` element, e.g. <body>{APP}</body>
    // So we append the Uniform data script before the closing `</body>` tag.
    templateParams.APP += uniformDataScript;
  });

  // IMPORTANT: The Uniform optimize plugin is dependent on the plugin loaded by the `cookie-universal-nuxt` module.
  // Therefore, we need to ensure that the optimize plugin is installed after the cookie plugin.
  // Unfortunately, Nuxt modules do not "push" plugins into the plugins-to-install array.
  // Instead, when calling `this.addPlugin` from a module, a plugin is added
  // to the  "front" of the array, i.e. `unshift`.
  // The current Nuxt-recommended approach for guaranteeing plugin install order is
  // to use the `extendPlugins` hook or `extendPlugins` config option:
  // https://nuxtjs.org/api/configuration-extend-plugins
  nuxtApp.hook('builder:extendPlugins', (plugins) => {
    // find the optimize plugin and push it to the end of the plugins array
    const optimizePluginIndex = plugins.findIndex(
      (plugin) => plugin.src && plugin.src.toLowerCase().includes('uniform-optimize-nuxt-plugin')
    );

    if (optimizePluginIndex !== -1) {
      const optimizePlugin = plugins[optimizePluginIndex];
      plugins.splice(optimizePluginIndex, 1);
      plugins.push(optimizePlugin);
    }
  });
}
