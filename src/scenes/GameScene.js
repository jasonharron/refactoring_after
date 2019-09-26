/*global Phaser*/
export default class GameScene extends Phaser.Scene {
  constructor () {
    super('GameScene');
  }

  init (data) {
    // Initialization code goes here
  }

  preload () {
    // Preload assets
    this.load.image("ball", "./assets/ball.png");
    this.load.image("wall", "./assets/wall.png");
      
    this.screenX = this.cameras.main.width;
    this.screenY = this.cameras.main.height;
  }

    create(){
    this.gameOptions = {
        // duration of the wall, in milliseconds
        wallDuration: 100,

        // ball start speed, in pixels/second
        ballStartSpeed: 500,
 
        // ball speed increase at each successful bounce, in pixels/second
        ballSpeedIncrease: 20
    };
    
    this.score = 0;
    this.gameOver = false;
    this.canActivateWall = true;
    this.ballSpeed = this.gameOptions.ballStartSpeed;

    //Create the ball
    this.theBall = this.physics.add.image(this.screenX / 2, this.screenY * 6 / 7, "ball");
    this.theBall.body.setCircle(25);
    this.theBall.setBounce(1);
                
    //Create the walls
    this.wallGroup = this.physics.add.group();
    this.createWall(32, game.config.height / 2, 32, game.config.height - 96);
    this.createWall(game.config.width - 32, game.config.height / 2, 32, game.config.height - 96);
    this.createWall(game.config.width / 2, 32, game.config.width - 32, 32);
    this.lowerWall = this.createWall(game.config.width / 2, game.config.height - 32, game.config.width - 32, 32);
   
    //Add collider
    this.physics.add.collider(this.theBall, this.wallGroup, function(ball, wall){
    this.canActivateWall = true;
    if(wall.x == this.lowerWall.x && wall.y == this.lowerWall.y){
            this.ballSpeed += this.gameOptions.ballSpeedIncrease;
            let ballVelocity = this.physics.velocityFromAngle(Phaser.Math.Between(220, 320), this.ballSpeed);
            this.theBall.setVelocity(ballVelocity.x, ballVelocity.y);
            this.score++;
            text.setText(this.score);
        }
    }, null, this);
    this.input.on("pointerdown", this.activateWall, this);
    
    //Add score text
    var text = this.add.text(290, 100, this.score);
    text.setStyle({
        fontSize: '400px',
        fontFamily: 'Arial',
        color: '#222222',
        align: 'center'
    });
    text.setDepth(-10);
}
    
    createWall(posX, posY, width, height){
        let wall = this.physics.add.image(posX, posY, "wall");
        wall.displayWidth = width;
        wall.displayHeight = height;
        this.wallGroup.add(wall);
        wall.setImmovable();
        return wall;
    }
    
    activateWall(){
        if(this.theBall.body.speed === 0){
            let ballVelocity = this.physics.velocityFromAngle(Phaser.Math.Between(220, 320), this.ballSpeed)
            this.theBall.setVelocity(ballVelocity.x, ballVelocity.y);
            this.lowerWall.alpha = 0.1;
            this.lowerWall.body.checkCollision.none = true;
            return;
        }
        if(this.canActivateWall){
            this.canActivateWall = false;
            this.lowerWall.alpha = 1;
            this.lowerWall.body.checkCollision.none = false;
            let wallEvent = this.time.addEvent({
                delay: this.gameOptions.wallDuration,
                callbackScope: this,
                callback: function(){
                    this.lowerWall.alpha = 0.1;
                    this.lowerWall.body.checkCollision.none = true;
                }
            });
        }
    }
    update(){
        if((this.theBall.y > this.screenY || this.theBall.y < 0) && !this.gameOver){
            this.gameOver = true;
            this.cameras.main.shake(800, 0.05);
            this.time.addEvent({
                delay: 800,
                callbackScope: this,
                callback: function(){
                    this.scene.start("GameScene");
                }
            });
        }
    }
}
