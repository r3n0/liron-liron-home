// Assumes gsap and ScrollTrigger are available as globals via CDN

class FrameSequence {
	constructor() {
		this.canvas = document.getElementById('sequenceCanvas');
		this.ctx = this.canvas.getContext('2d');
		this.loadingIndicator = document.querySelector('.loading-indicator');

		// Configuration
		this.frameCount = 160;
		this.frameFormat = 'webp';
		this.currentFrame = 0;
		this.targetFrame = 0;
		this.images = [];
		this.imagesLoaded = 0;
		this.isAnimating = false;

		this.init();
	}

	init() {
		this.setupCanvas();
		this.loadImages();
	}

	setupCanvas() {
		const resizeCanvas = () => {
			this.canvas.width = window.innerWidth;
			this.canvas.height = window.innerHeight;
			this.drawFrame();
		};
		window.addEventListener('resize', resizeCanvas);
		resizeCanvas();
	}

	loadImages() {
		this.loadingIndicator.classList.add('show');
		for (let i = 1; i <= this.frameCount; i++) {
			const img = new Image();
			img.onload = () => {
				this.imagesLoaded++;
				if (this.imagesLoaded === this.frameCount) {
					this.loadingIndicator.classList.remove('show');
					this.setupScrollTrigger();
				}
			};
			img.onerror = () => {
				console.warn(`Frame ${i} failed to load`);
				this.imagesLoaded++;
				if (this.imagesLoaded === this.frameCount) {
					this.loadingIndicator.classList.remove('show');
					this.setupScrollTrigger();
				}
			};
			const num = String(i).padStart(3, '0');
			img.src = `frames/frame${num}.${this.frameFormat}`;
			this.images.push(img);
		}
	}

	setupScrollTrigger() {
		gsap.registerPlugin(ScrollTrigger);

		this.drawFrame();
		this.startSmoothAnimation();

		const totalFrames = this.frameCount;
		const totalScroll = window.innerHeight * 1.2;
		const firstPhaseEnd = totalScroll * 0.9;

		ScrollTrigger.create({
			trigger: '.canvas-container',
			start: 'top top',
			end: firstPhaseEnd,
			scrub: 0.1,
			pin: '.canvas-container',
			onUpdate: (self) => {
				const frameIndex = self.progress * (totalFrames * 0.9);
				this.setTargetFrame(frameIndex);
			},
		});

		ScrollTrigger.create({
			start: firstPhaseEnd,
			end: totalScroll,
			scrub: 0.5,
			onUpdate: (self) => {
				const progress = self.progress;
				const frameIndex =
					totalFrames * 0.9 + progress * (totalFrames * 0.1);
				this.setTargetFrame(frameIndex);
			},
		});
	}

	setTargetFrame(frameIndex) {
		this.targetFrame = Math.max(
			0,
			Math.min(frameIndex, this.frameCount - 1)
		);
	}

	startSmoothAnimation() {
		if (this.isAnimating) return;
		this.isAnimating = true;
		this.animateToTarget();
	}

	animateToTarget() {
		const lerp = (start, end, factor) => start + (end - start) * factor;
		const smoothing = 0.3;

		this.currentFrame = lerp(
			this.currentFrame,
			this.targetFrame,
			smoothing
		);

		if (Math.abs(this.currentFrame - this.targetFrame) > 0.05) {
			this.drawFrame();
			requestAnimationFrame(() => this.animateToTarget());
		} else {
			this.currentFrame = this.targetFrame;
			this.drawFrame();
			requestAnimationFrame(() => this.animateToTarget());
		}
	}

	drawFrame() {
		const idx = Math.round(this.currentFrame);
		const img = this.images[idx];
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		if (img && img.complete) {
			const canvasAspect = this.canvas.width / this.canvas.height;
			const imgAspect = img.width / img.height;
			let drawW,
				drawH,
				offsetX = 0,
				offsetY = 0;
			if (canvasAspect > imgAspect) {
				drawW = this.canvas.width;
				drawH = drawW / imgAspect;
				offsetY = (this.canvas.height - drawH) / 2;
			} else {
				drawH = this.canvas.height;
				drawW = drawH * imgAspect;
				offsetX = (this.canvas.width - drawW) / 2;
			}
			this.ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
		}
	}
}

document.addEventListener('DOMContentLoaded', () => new FrameSequence());
