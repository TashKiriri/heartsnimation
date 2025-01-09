const CANVAS_WIDTH = 840;
const CANVAS_HEIGHT = 680;
const CANVAS_CENTER_X = CANVAS_WIDTH / 2;
const CANVAS_CENTER_Y = CANVAS_HEIGHT / 2;
const IMAGE_ENLARGE = 11;
const HEART_COLOR = "#e31b23";

function heartFunction(t, shrinkRatio = IMAGE_ENLARGE) {
    const x = 17 * Math.pow(Math.sin(t), 3);
    const y = -(16 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(3 * t));
    return {
        x: (x * shrinkRatio) + CANVAS_CENTER_X,
        y: (y * shrinkRatio) + CANVAS_CENTER_Y
    };
}

function scatter(x, y, beta = 0.15) {
    const ratioX = -beta * Math.log(Math.random());
    const ratioY = -beta * Math.log(Math.random());
    const dx = ratioX * (x - CANVAS_CENTER_X);
    const dy = ratioY * (y - CANVAS_CENTER_Y);
    return {
        x: x + dx,
        y: y - dy
    };
}

class Heart {
    constructor(generateFrame = 20) {
        this.points = new Set();
        this.edgeDiffusionPoints = new Set();
        this.centerDiffusionPoints = new Set();
        this.allPoints = [];
        this.generateFrame = generateFrame;
        this.build(2000);
    }

    build(number) {
        for (let i = 0; i < number; i++) {
            const t = Math.random() * 2 * Math.PI;
            const { x, y } = heartFunction(t);
            this.points.add({ x, y });
        }
        const pointList = Array.from(this.points);
        for (const { x, y } of pointList) {
            for (let i = 0; i < 3; i++) {
                const { x: newX, y: newY } = scatter(x, y);
                this.edgeDiffusionPoints.add({ x: newX, y: newY });
            }
        }
    }

    calcPosition(x, y, ratio) {
        const force = 1 / Math.pow((Math.pow((x - CANVAS_CENTER_X), 2) + Math.pow((y - CANVAS_CENTER_Y), 2)), 0.42);
        const dx = ratio * force * (x - CANVAS_CENTER_X) + Math.floor(Math.random() * 30);
        const dy = ratio * force * (y - CANVAS_CENTER_Y) + Math.floor(Math.random() * 3) - 3;
        return { x: x + dx, y: y + dy };
    }

    calc(generateFrame) {
        const ratio = 15 * Math.sin((generateFrame / 10) * Math.PI);
        const haloRadius = 4 + 6 * (1 + Math.sin((generateFrame / 10) * Math.PI));
        const haloNumber = 3000 + 4000 * Math.abs(Math.pow(Math.sin((generateFrame / 10) * Math.PI), 2));

        const allPoints = [];
        for (const { x, y } of this.points) {
            const { x: newX, y: newY } = this.calcPosition(x, y, ratio);
            const size = Math.floor(Math.random() * 3) + 1;
            allPoints.push({ x: newX, y: newY, size });
        }
        this.allPoints.push(allPoints);
    }

    render(renderCanvas, renderFrame) {
        const points = this.allPoints[renderFrame % this.generateFrame];
        for (const { x, y, size } of points) {
            renderCanvas.fillStyle = HEART_COLOR;
            renderCanvas.strokeStyle = "transparent";
            renderCanvas.fillRect(x, y, size, size);
        }
    }
}

function draw() {
    const canvas = document.getElementById('Canvas');
    const context = canvas.getContext('2d');
    const heart = new Heart();

    function render(renderFrame) {
        context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        heart.render(context, renderFrame);
        setTimeout(() => {
            requestAnimationFrame(() => render(renderFrame + 1));
        }, 400 * 10 / 15);
    }

    render(0);
}

draw();
