Template.bubbles.onCreated(function(){
    let tpl = this,
        Balls = Mongo.Collection.get('balls') || new Mongo.Collection('balls'),
        Users = Mongo.Collection.get('users') || new Mongo.Collection('users')
  ;

  _.extend(tpl, {

    width: 1800,
    height: 1400,

    scaleFactor: undefined,

    initialize() {
      tpl.userID = tpl.configureUser();
    },

    rendered() {
      tpl.getScale();
      $(window).on('resize', function() {
        requestAnimationFrame(tpl.getScale);
      });
      tpl.draw();
    },

    getScale() {
      tpl.scaleFactor = Math.min(tpl.$('gameArea').width() / tpl.width, tpl.$('gameArea').height() / tpl.height);
      tpl.canvas = tpl.$('canvas')[0];
      tpl.canvas.width = tpl.width * tpl.scaleFactor;
      tpl.canvas.height = tpl.height * tpl.scaleFactor;
      tpl.ctx = tpl.canvas.getContext('2d');
    },

    draw() {
      tpl.autorun(comp => {
        tpl.ctx.clearRect(0, 0, tpl.width * tpl.scaleFactor, tpl.height * tpl.scaleFactor);
        tpl.getBalls().forEach(ball => {
          requestAnimationFrame(() => {
            tpl.drawBall(ball)
          });
        });
      });
    },

    configureUser() {
      localStorage.setItem('userID', localStorage.getItem('userID') || Random.id());
      let userID = localStorage.getItem('userID');

      if (!Users.findOne(userID)) {
        Users.insert({ _id: userID, name: 'Player Unknown', score: 0 });
      }

      return userID;
    },

    getUser() {
      return Users.findOne(tpl.userID);
    },

    getUsers() {
      return Users.find().fetch().sort((a, b) => b.score - a.score);
    },

    drawBall(ball) {
      tpl.ctx.beginPath();
      tpl.ctx.arc(ball.x, ball.y, ball.r, 0, 2 * Math.PI);
      tpl.ctx.fillStyle = `rgba(${ball.color[0]}, ${ball.color[1]}, ${ball.color[2]}, .4)`;
      tpl.ctx.fill();
      tpl.ctx.stroke();
    },

    clicked(x, y) {
      let { score } = tpl.getUser();

      tpl.findBalls(x, y).forEach(ball => {
        score += tpl.scoreBall(ball);
        Balls.remove(ball._id);
      });

      Users.update(tpl.userID, {
        $set: { score }
      });
    },

    updateName(name) {
      Users.update(tpl.userID, {
        $set: { name },
      });
    },

    findBalls(x, y) {
      return tpl.getBalls()
        .filter(ball => {
          return x < ball.x + ball.r
            && x > ball.x - ball.r
            && y < ball.y + ball.r
            && y > ball.y - ball.r
          ;
        });
    },

    getBalls() {
      let balls = Balls.find().fetch();
      balls.forEach(ball => {
        ball.r = ball.r * tpl.scaleFactor;
        ball.x = ball.x * tpl.scaleFactor;
        ball.y = ball.y * tpl.scaleFactor;
      });
      return balls;
    },

    scoreBall(ball) {
      let v = Math.sqrt(ball.vx ** 2 + ball.vy ** 2);
      return Math.round((v + 10 / (ball.r - 9.9)) * 100);
    },

    maybeColored(user) {
      return user._id === tpl.userID
        ? 'color: blue'
        : ''
      ;
    },

  }).initialize();

});

Template.bubbles.onRendered(function(){
  let tpl = this;
  tpl.rendered();
});

Template.bubbles.events({

  'click canvas'(e, tpl) {
    let rect = tpl.canvas.getBoundingClientRect(),
        x = e.clientX - rect.left,
        y = e.clientY - rect.top
    ;
    tpl.clicked(x, y);
  },

  'input nameInput input'(e, tpl) {
    tpl.updateName(e.target.value);
  },

});
