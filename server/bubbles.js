let Balls = Mongo.Collection.get('balls') || new Mongo.Collection('balls'),
    Users = Mongo.Collection.get('users') || new Mongo.Collection('users'),
    width = 450,
    height = 350,
    maxBalls = 5
;

let gameLoop = () => {
  if (Math.random() < .05 && Balls.find().count() < maxBalls) {
    createRandomBall();
  }
  updateBalls()
};

let createRandomBall = () => {
  let ball,
      attempts = 0,
      maxAttempts = 1000
  ;

  while (attempts < maxAttempts) {
    attempts += 1;
    ball = {
      x: Math.random() * width,
      y: Math.random() * height,
      vx: Math.random() * 2 - 1,
      vy: Math.random() * 2 - 1,
      r: Math.random() * 20 + 30 ,
      color: [ Math.random() * 255, Math.random() * 255, Math.random() * 255 ],
    };
    if (spaceFree(ball)) {
      break;
    }
  }

  Balls.insert(ball);
};

let spaceFree = ball => {
  return Balls.find().fetch().every(otherBall => {
    let distance = Math.sqrt((otherBall.x - ball.x)**2 + (otherBall.y - ball.y)**2);
    return distance > ball.r + otherBall.r + 200;
  });
};

let updateBalls = () => {
  Balls.find().forEach(ball => {
    let x = ball.x + ball.vx * 5,
        y = ball.y + ball.vy * 5,
        vx = ball.vx,
        vy = ball.vy
    ;

    if ((x + ball.r > width && vx > 0) || (x - ball.r < 0 && vx < 0)) {
      vx = -vx;
    }

    if ((y + ball.r > height && vy > 0) || (y - ball.r < 0 && vy < 0)) {
      vy = -vy;
    }

    Balls.update(ball._id, {
      $set: { x, y, vx, vy },
    });
  });
};

// Start game loop, making sure to clean up any currently
// running game loops.
if (global.gameLoopID) {
  Meteor.clearInterval(global.gameLoopID);
}
global.gameLoopID = Meteor.setInterval(gameLoop, 20);