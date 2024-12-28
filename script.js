window.onload = function() {
    const startButton = document.getElementById('startButton');
    const videoElement = document.getElementById('fallingRosesVideo');
    const audioElement = document.getElementById('backgroundMusic');

    startButton.onclick = function() {
        // Start the video and audio when the user clicks the "Start" button
        videoElement.play();
        audioElement.play().catch(function(error) {
            console.error("Error trying to play the audio: ", error);
        });

        // Start the animation
        draw();
        startButton.style.display = 'none';  // Hide the button after starting the animation
    };
};

const CANVAS_WIDTH = window.innerWidth; // Make canvas width dynamic
const CANVAS_HEIGHT = window.innerHeight; // Make canvas height dynamic
const CANVAS_CENTER_X = CANVAS_WIDTH / 2;
const CANVAS_CENTER_Y = CANVAS_HEIGHT / 2;
const IMAGE_ENLARGE = 11;
const HEART_COLOR = "#8A2BE2";  // Purple color

// Function to calculate the heart shape coordinates
function heartFunction(t, shrinkRatio = IMAGE_ENLARGE) {
    const x = 17 * Math.pow(Math.sin(t), 3);
    const y = -(16 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
    return {
        x: (x * shrinkRatio) + CANVAS_CENTER_X,
        y: (y * shrinkRatio) + CANVAS_CENTER_Y
    };
}

// Function to scatter the points inside the heart shape
function scatterInside(x, y, beta = 0.15) {
    const ratioX = -beta * Math.log(Math.random());
    const ratioY = -beta * Math.log(Math.random());
    const dx = ratioX * (x - CANVAS_CENTER_X);
    const dy = ratioY * (y - CANVAS_CENTER_Y);
    return {
        x: x - dx,
        y: y - dy
    };
}

// Function to shrink the points near the center
function shrink(x, y, ratio) {
    const force = -1 / Math.pow((Math.pow((x - CANVAS_CENTER_X), 2) + Math.pow((y - CANVAS_CENTER_Y), 2)), 0.6);
    const dx = ratio * force * (x - CANVAS_CENTER_X);
    const dy = ratio * force * (y - CANVAS_CENTER_Y);
    return {
        x: x + dx,
        y: y + dy
    };
}

// Curve function for the halo effect
function curve(p) {
    return (2 * (2 * Math.sin(4 * p))) / (2 * Math.PI);
}

// Heart class to handle the animation
class Heart {
    constructor(generateFrame = 60) {  // Reduced generateFrame to slow down the heartbeat
        this.points = new Set();
        this.edgeDiffusionPoints = new Set();
        this.centerDiffusionPoints = new Set();
        this.allPoints = {};
        this.build(2000);
        this.randomHalo = 1000;
        this.generateFrame = generateFrame;

        for (let frame = 0; frame < generateFrame; frame++) {
            this.calc(frame);
        }
    }

    build(number) {
        // Generate the points for the heart
        for (let i = 0; i < number; i++) {
            const t = Math.random() * 2 * Math.PI;
            const { x, y } = heartFunction(t);
            this.points.add({ x, y });
        }

        const pointList = Array.from(this.points);

        // Scatter points on the edge
        for (const { x, y } of pointList) {
            for (let i = 0; i < 3; i++) {
                const { x: newX, y: newY } = scatterInside(x, y, 0.05);
                this.edgeDiffusionPoints.add({ x: newX, y: newY });
            }
        }

        // Scatter points in the center
        for (let i = 0; i < 10000; i++) {
            const { x, y } = pointList[Math.floor(Math.random() * pointList.length)];
            const { x: newX, y: newY } = scatterInside(x, y, 0.27);
            this.centerDiffusionPoints.add({ x: newX, y: newY });
        }
    }

    calcPosition(x, y, ratio) {
        const force = 1 / Math.pow((Math.pow((x - CANVAS_CENTER_X), 2) + Math.pow((y - CANVAS_CENTER_Y), 2)), 0.42);
        const dx = ratio * force * (x - CANVAS_CENTER_X) + Math.floor(Math.random() * 3) - 1;
        const dy = ratio * force * (y - CANVAS_CENTER_Y) + Math.floor(Math.random() * 3) - 1;
        return { x: x + dx, y: y + dy };
    }

    calc(generateFrame) {
        const ratio = 10 * curve((generateFrame / 60) * Math.PI);  // Slow down heartbeat by adjusting divisor
        const haloRadius = 4 + 6 * (1 + curve((generateFrame / 60) * Math.PI));  // Adjust halo speed too

        const allPoints = [];

        // Update points with new positions
        for (const { x, y } of this.points) {
            const { x: newX, y: newY } = this.calcPosition(x, y, ratio);
            const size = Math.floor(Math.random() * 3) + 1;
            allPoints.push({ x: newX, y: newY, size });
        }

        for (const { x, y } of this.edgeDiffusionPoints) {
            const { x: newX, y: newY } = this.calcPosition(x, y, ratio);
            const size = Math.floor(Math.random() * 2) + 1;
            allPoints.push({ x: newX, y: newY, size });
        }

        for (const { x, y } of this.centerDiffusionPoints) {
            const { x: newX, y: newY } = this.calcPosition(x, y, ratio);
            const size = Math.floor(Math.random() * 2) + 1;
            allPoints.push({ x: newX, y: newY, size });
        }

        this.allPoints[generateFrame] = allPoints;
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

// Function to start the animation
function draw() {
    const canvas = document.getElementById('Canvas');
    const context = canvas.getContext('2d');
    const heart = new Heart();
    let renderFrame = 0;

    // Animation loop
    function render() {
        context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Render heart
        heart.render(context, renderFrame);

        renderFrame++;
        requestAnimationFrame(render);
    }

    render();
}
