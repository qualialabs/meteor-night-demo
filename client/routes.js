Router.route('/', {
  name: 'home',
});

Router.route('/reval/fiddle', {
  name: 'revalFiddle',
  data() {
    return Router.current().params.query;
  },
});
