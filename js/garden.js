function Vector(x, y) {
    this.x = x;
    this.y = y;
}

Vector.prototype = {
    rotate: function (theta) {
        const x = this.x;
        const y = this.y;
        this.x = Math.cos(theta) * x - Math.sin(theta) * y;
        this.y = Math.sin(theta) * x + Math.cos(theta) * y;
        return this;
    },
    mult: function (f) {
        this.x *= f;
        this.y *= f;
        return this;
    },
    clone: function () {
        return new Vector(this.x, this.y);
    },
    length: function () {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    },
    subtract: function (v) {
        this.x -= v.x;
        this.y -= v.y;
        return this;
    },
    set: function (x, y) {
        this.x = x;
        this.y = y;
        return this;
    }
};

function Petal(stretchA, stretchB, startAngle, angle, growFactor, bloom) {
    this.stretchA = stretchA;
    this.stretchB = stretchB;
    this.startAngle = startAngle;
    this.angle = angle;
    this.bloom = bloom;
    this.growFactor = growFactor;
    this.r = 1;
    this.isfinished = false;
}

Petal.prototype = {
    draw: function() {
        const ctx = this.bloom.garden.ctx;
        const v1 = new Vector(0, this.r).rotate(Garden.degrad(this.startAngle));
        const v2 = v1.clone().rotate(Garden.degrad(this.angle));
        const v3 = v1.clone().mult(this.stretchA);
        const v4 = v2.clone().mult(this.stretchB);
        ctx.strokeStyle = this.bloom.c;
        ctx.beginPath();
        ctx.moveTo(v1.x, v1.y);
        ctx.bezierCurveTo(v3.x, v3.y, v4.x, v4.y, v2.x, v2.y);
        ctx.stroke();
    },
    render: function() {
        if (this.r <= this.bloom.r) {
            this.r += this.growFactor;
            this.draw();
        } else {
            this.isfinished = true;
        }
    }
};

function Bloom(p, r, c, pc, garden) {
    this.p = p;
    this.r = r;
    this.c = c;
    this.pc = pc;
    this.petals = [];
    this.garden = garden;
    this.init();
    this.garden.addBloom(this);
}

Bloom.prototype = {
    draw: function() {
        var p, isfinished = true;
        this.garden.ctx.save();
        this.garden.ctx.translate(this.p.x, this.p.y);
        for (let i = 0; i < this.petals.length; i++) {
            p = this.petals[i];
            p.render();
            isfinished *= p.isfinished;
        }
        this.garden.ctx.restore();
        if (isfinished === true) {
            this.garden.removeBloom(this);
        }
    },
    init: function() {
        const angle = 360 / this.pc;
        const startAngle = Garden.randomInt(0, 90);
        for (let i = 0; i < this.pc; i++) {
            this.petals.push(new Petal(Garden.random(Garden.options.petalStretch.min, Garden.options.petalStretch.max),
                Garden.random(Garden.options.petalStretch.min, Garden.options.petalStretch.max),
                startAngle + i * angle,
                angle,
                Garden.random(Garden.options.growFactor.min, Garden.options.growFactor.max),
                this));
        }
    }
};

function Garden(ctx, element) {
    this.blooms = [];
    this.element = element;
    this.ctx = ctx;
}

Garden.prototype = {
    render: function() {
        for (let i = 0; i < this.blooms.length; i++) {
            this.blooms[i].draw();
        }
    },
    addBloom: function(b) {
        this.blooms.push(b);
    },
    removeBloom: function(b) {
        var bloom;
        for (let i = 0; i < this.blooms.length; i++) {
            bloom = this.blooms[i];
            if (bloom === b) {
                this.blooms.splice(i, 1);
                return this;
            }
        }
        return this;
    },
    createRandomBloom: function(x, y) {
        this.createBloom(x,
            y,
            Garden.randomInt(Garden.options.bloomRadius.min, Garden.options.bloomRadius.max),
            Garden.randomrgba(Garden.options.color.rmin,
                Garden.options.color.rmax,
                Garden.options.color.gmin,
                Garden.options.color.gmax,
                Garden.options.color.bmin,
                Garden.options.color.bmax,
                Garden.options.color.opacity),
            Garden.randomInt(Garden.options.petalCount.min, Garden.options.petalCount.max));
    },
    createBloom: function(x, y, r, c, pc) {
        new Bloom(new Vector(x, y), r, c, pc, this);
    },
    clear: function() {
        this.blooms = [];
        this.ctx.clearRect(0, 0, this.element.width, this.element.height);
    }
};

Garden.options = {
    petalCount: {
        min: 8,
        max: 15
    },
    petalStretch: {
        min: 0.1,
        max: 3
    },
    growFactor: {
        min: 0.1,
        max: 1
    },
    bloomRadius: {
        min: 8,
        max: 10
    },
    density: 10,
    growSpeed: 1000 / 60,
    color: {
        rmin: 128,
        rmax: 255,
        gmin: 0,
        gmax: 128,
        bmin: 0,
        bmax: 128,
        opacity: 0.1
    },
    tanAngle: 60
};
Garden.random = function (min, max) {
    return Math.random() * (max - min) + min;
};
Garden.randomInt = function (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};
Garden.circle = 2 * Math.PI;
Garden.degrad = function (angle) {
    return Garden.circle / 360 * angle;
};
Garden.raddeg = function (angle) {
    return angle / Garden.circle * 360;
};
Garden.rgba = function (r, g, b, a) {
    return `rgba(${r},${g},${b},${a})`;
};
Garden.randomrgba = function (rmin, rmax, gmin, gmax, bmin, bmax, a) {
    const r = Math.round(Garden.random(rmin, rmax));
    const g = Math.round(Garden.random(gmin, gmax));
    const b = Math.round(Garden.random(bmin, bmax));
    const limit = 5;
    if (Math.abs(r - g) <= limit && Math.abs(g - b) <= limit && Math.abs(b - r) <= limit) {
        return Garden.rgba(rmin, rmax, gmin, gmax, bmin, bmax, a);
    } else {
        return Garden.rgba(r, g, b, a);
    }
};