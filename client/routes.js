Router.route('/', {
  name: 'bubbles',
});

Router.route('/reval/fiddle', {
  name: 'revalFiddle',
  data() {
    return Router.current().params.query;
  },
});
