let Balls = Mongo.Collection.get('balls') || new Mongo.Collection('balls'),
    Users = Mongo.Collection.get('users') || new Mongo.Collection('users'),
    width = 450,
    height = 350,
    maxBalls = 10
;

let gameLoop = () => {
  if (Math.random() < .05 && Balls.find().count() < maxBalls) {
    createRandomBall();
  }
  updateBalls()
};

let createRandomBall = () => {
  Balls.insert({
    x: Math.random() * 100 + (width/2 - 50),
    y: Math.random() * 100 + (height/2 - 50),
    vx: Math.random() * 2 - 1,
    vy: Math.random() * 2 - 1,
    r: Math.random() * 20 + 30 ,
    color: [ Math.random() * 255, Math.random() * 255, Math.random() * 255 ],
  });
};

let updateBalls = () => {
  Balls.find().forEach(ball => {
    let x = ball.x + ball.vx * 5,
        y = ball.y + ball.vy * 5,
        vx = ball.vx,
        vy = ball.vy,
        r = ball.r * 1
    ;

    if ((x + ball.r > width && vx > 0) || (x - ball.r < 0 && vx < 0)) {
      vx = -vx;
    }

    if ((y + ball.r > height && vy > 0) || (y - ball.r < 0 && vy < 0)) {
      vy = -vy;
    }

    Balls.update(ball._id, {
      $set: { x, y, vx, vy, r },
    });
  });
};

// Start game loop, making sure to clean up any currently
// running game loops.
if (global.gameLoopID) {
  Meteor.clearInterval(global.gameLoopID);
}
global.gameLoopID = Meteor.setInterval(gameLoop, 20);