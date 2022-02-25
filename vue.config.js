module.exports = {
    chainWebpack: (config) => {
        const svgRule = config.module.rule('svg');

        svgRule.uses.clear();

        svgRule
            .use('vue-svg-loader')
            .loader('vue-svg-loader')
            .options({
                svgo: false,
            });
    },
    publicPath: process.env.NODE_ENV === 'production'
        ? '/FesGen/'
        : '/'
};