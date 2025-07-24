// Frame sequence animation with GSAP ScrollTrigger
class FrameSequence {
	constructor() {
		this.canvas = document.getElementById('sequenceCanvas');
		this.ctx = this.canvas.getContext('2d');
		this.loadingIndicator = document.querySelector('.loading-indicator');

		// Configuration
		this.frameCount = 160; // Adjust based on your actual frame count
		this.frameFormat = 'webp'; // Change to 'png' if your frames are PNG
		this.currentFrame = 0;
		this.targetFrame = 0; // Target frame for smooth interpolation
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
				console.warn(`Failed to load frame ${i}`);
				this.imagesLoaded++;
				if (this.imagesLoaded === this.frameCount) {
					this.loadingIndicator.classList.remove('show');
					this.setupScrollTrigger();
				}
			};

			// Assuming frames are named: frame001.jpg, frame002.jpg, etc.
			const frameNumber = i.toString().padStart(3, '0');
			img.src = `frames/frame${frameNumber}.${this.frameFormat}`;
			this.images[i - 1] = img;
		}
	}

	setupScrollTrigger() {
		// Register ScrollTrigger plugin
		gsap.registerPlugin(ScrollTrigger);

		// Create timeline for frame animation
		const tl = gsap.timeline({
			scrollTrigger: {
				trigger: '.canvas-container',
				start: 'top top',
				end: 'bottom top',
				scrub: 0.5, // Reduced scrub value for smoother response
				onUpdate: (self) => {
					const frameIndex = self.progress * (this.frameCount - 1);
					this.setTargetFrame(frameIndex);
				},
			},
		});

		// Initial frame draw
		this.drawFrame();
		this.startSmoothAnimation();
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
		const smoothingFactor = 0.15; // Slightly increased for more responsiveness

		// Smooth interpolation towards target frame
		this.currentFrame = lerp(
			this.currentFrame,
			this.targetFrame,
			smoothingFactor
		);

		// Only update if there's a meaningful difference
		if (Math.abs(this.targetFrame - this.currentFrame) > 0.05) {
			this.drawFrame();
			requestAnimationFrame(() => this.animateToTarget());
		} else {
			// Snap to target when very close
			this.currentFrame = this.targetFrame;
			this.drawFrame();
			requestAnimationFrame(() => this.animateToTarget());
		}
	}

	updateFrame(frameIndex) {
		// This method is now replaced by setTargetFrame and smooth animation
		this.setTargetFrame(frameIndex);
	}

	drawFrame() {
		const frameIndex = Math.round(this.currentFrame); // Use round instead of floor for better frame selection

		// Clear canvas
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

		if (this.images[frameIndex] && this.images[frameIndex].complete) {
			const img = this.images[frameIndex];

			// Calculate scaling to cover full screen while maintaining aspect ratio
			const canvasAspect = this.canvas.width / this.canvas.height;
			const imgAspect = img.width / img.height;

			let drawWidth,
				drawHeight,
				offsetX = 0,
				offsetY = 0;

			if (canvasAspect > imgAspect) {
				// Canvas is wider than image
				drawWidth = this.canvas.width;
				drawHeight = drawWidth / imgAspect;
				offsetY = (this.canvas.height - drawHeight) / 2;
			} else {
				// Canvas is taller than image
				drawHeight = this.canvas.height;
				drawWidth = drawHeight * imgAspect;
				offsetX = (this.canvas.width - drawWidth) / 2;
			}

			// Draw the image at full opacity (no blending)
			this.ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
		}
	}
}

// Alternative: If you want to use different frame naming convention
// You can modify the image loading part like this:
/*
class FrameSequenceAlternative extends FrameSequence {
    loadImages() {
        this.loadingIndicator.classList.add('show');
        
        for (let i = 0; i < this.frameCount; i++) {
            const img = new Image();
            img.onload = () => {
                this.imagesLoaded++;
                if (this.imagesLoaded === this.frameCount) {
                    this.loadingIndicator.classList.remove('show');
                    this.setupScrollTrigger();
                }
            };
            
            // For frames named: frame_0.jpg, frame_1.jpg, etc.
            img.src = `frames/frame_${i}.${this.frameFormat}`;
            // Or for frames named: 0001.jpg, 0002.jpg, etc.
            // const frameNumber = (i + 1).toString().padStart(4, '0');
            // img.src = `frames/${frameNumber}.${this.frameFormat}`;
            
            this.images[i] = img;
        }
    }
}
*/

// Initialize the frame sequence when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
	new FrameSequence();
});

// Optional: Add smooth scrolling for better user experience
gsap.registerPlugin(ScrollTrigger);

// You can also add additional scroll-triggered animations
gsap.to('.content', {
	y: 0,
	opacity: 1,
	duration: 1,
	scrollTrigger: {
		trigger: '.content',
		start: 'top 80%',
		end: 'bottom 20%',
		toggleActions: 'play none none reverse',
	},
});
