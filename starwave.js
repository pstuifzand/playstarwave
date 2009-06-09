function rnd(min,max) {
    return min+Math.floor(Math.random()*(max-min))
}
function rndf(min,max) {
    return min+Math.random()*(max-min);
}

function Starwave(obj, callbacks) {
    // Callbacks
    this.callbacks = callbacks;

    // CanvasElement
    this.obj = obj;

    // Objects
    this.bullets = [];
    this.enemies = [];

    // Player
    this.x = 0;
    this.y = 0;

	this.bullet_count = 100;
	this.prevx = 0;
	this.prevy = 0;

	this.lives = 3;
	this.score = 0;

	this.dead_enemies = 0;
	this.level = 1;

	this.widths = [ 640, 800, 1024, 1280, 1600, 1920 ];

	this.ox = 0;
	this.oy = 0;

	this.paused = true;
    this.demo = true;
	this.targetinglaser = true;

    this.obj.width = this.widths[this.level - 1];
    this.ox = this.obj.offsetLeft;
    this.oy = this.obj.offsetTop;

    var ctx = this.obj.getContext('2d');

    var game = this;
    obj.onmousedown = function(e) {
        if (!game.paused) {
            game.bullets.push({ size: 3, x: e.clientX - game.ox, y: 460 });
            game.bullet_count -= 1;
            game.callbacks.shot_fired(game);
        }
    };

    obj.onmousemove = function(e) {
        game.x = e.clientX - game.ox;
        game.y = e.clientY - game.oy;
    };
}

Starwave.prototype.enemy_generator = function() {
    var ex = rnd(20,this.widths[this.level - 1]-20);

    var en = { x: ex, y: 0, size: rnd(6,15) };
    en.speed = 0.5 + (2*en.size) / 15;

    this.enemies.push(en);

    if (!this.paused) {
        setTimeout('game.enemy_generator()', rnd(800, 1000));
    }
    if (this.demo) {
        setTimeout('game.enemy_generator()', 50);
    }
}


Starwave.prototype.object_mover = function () {
    var ctx = this.obj.getContext('2d');

    var grad = ctx.createLinearGradient(0, 0, 0, 1500);
    grad.addColorStop(1.0,'#0000ff');
    grad.addColorStop(0.0, '#000000');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, this.widths[this.level - 1], 440);
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(0, 440, this.widths[this.level - 1], 40);

    this.y = 460;

    var width = 10;
    var height = 20;

    for (var i in this.enemies) {
        var enemy = this.enemies[i];

        for (var j in this.bullets) {
            var bullet = this.bullets[j];
            
            var dx = enemy.x - bullet.x;
            var dy = enemy.y - bullet.y;

            var len = Math.sqrt((dx*dx) + (dy*dy));
            if (len < (bullet.size+enemy.size)) {
                bullet.dead=true;
                enemy.dead=true;

                this.score += 10;
                this.dead_enemies += 1;

                if (this.dead_enemies >= this.level*10) {
                    this.dead_enemies = 0;
                    this.level++;
                    if (this.level > this.widths.length) {
                        this.level = this.widths.length;
                    }
                    else {
                        this.obj.width = this.widths[this.level - 1];
                    }


                    this.callbacks.level_changed(this);


                    this.ox = this.obj.offsetLeft;
                    this.oy = this.obj.offsetTop;
                }
                $('#score').html(this.score);
            }
        }
    }

    for (var i in this.bullets) {
        var obj = this.bullets[i];

        ctx.beginPath();
        ctx.fillStyle = '#ffffff';
        ctx.arc(obj.x, obj.y, obj.size+1, 0, 360, false);
        ctx.fill();
        ctx.closePath();

        obj.y = obj.y - 5;
        if (obj.y < 0) {
            obj.dead=true;
        }
    }

    for (var i in this.bullets.reverse()) {
        var obj = this.bullets[i];
        if (obj.dead) {
            this.bullets.splice(i, 1);
        }
    }

    for (var i in this.enemies) {
        var obj = this.enemies[i];

        obj.y = obj.y + obj.speed;
        if (obj.y > 480) {
            obj.dead=true;

            if (!this.paused) {
                this.lives -= 1;
                $('#lives').html(this.lives);
            }
        }
    }

    for (var i in this.enemies.reverse()) {
        var obj = this.enemies[i];
        if (obj.dead) {
            this.enemies.splice(i, 1);
        }
    }

    for (var i in this.enemies) {
        var obj = this.enemies[i];

        ctx.beginPath();
        ctx.fillStyle = '#ff0000';
        ctx.arc(obj.x, obj.y, obj.size, 0, 360, false);
        ctx.fill();
        ctx.closePath();
    }

    this.prevy=460;
    if (!this.demo) {
        ctx.beginPath();
        ctx.fillStyle = '#000000';
        ctx.moveTo(this.x, this.y-height);
        ctx.lineTo(this.x+width, this.y+height);
        ctx.lineTo(this.x-width, this.y+height);
        ctx.lineTo(this.x, this.y-height);
        ctx.fill();
        ctx.closePath();
    }

    if (!this.demo && this.targetinglaser) {
        ctx.beginPath();
        ctx.strokeStyle = '#ffff00';
        ctx.moveTo(this.x, this.y-height);
        ctx.lineTo(this.x, 0);
        ctx.stroke();
        ctx.closePath();
    }

    this.prevx = this.x;
    this.prevy = 460;

    if (!this.paused) {
        setTimeout('game.object_mover()', 10);
    }
    if (this.demo) {
        setTimeout('game.object_mover()', 10);
    }
}

Starwave.prototype.toggle_pause = function() {
    this.paused = !this.paused;

    if (!this.demo) {
        if (!this.paused) {
            this.object_mover();
            this.enemy_generator();
        }
    }
    this.demo = false;
}

var game;

$(document).ready(function() {
    var obj = document.getElementById('starwave');

    game = new Starwave(obj, {
        shot_fired:    function(game) { $('#bullets').html(game.bullet_count) },
        level_changed: function(game) { $('#level').html(game.level) }
    });
    game.object_mover();
    game.enemy_generator();
});

$('#playpause').click(function (e) {
    if (game) {
        game.toggle_pause();
    }
});

