(function() {
  'use strict';

  // Find or create canvas
  let canvas = document.getElementById('spaceBgCanvas');
  if (!canvas) {
    // Fallback: look for other known background canvas IDs in the markup
    canvas = document.getElementById('plexusBg') || 
             document.getElementById('plexusBgHub') || 
             document.getElementById('plexusBgCodex') || 
             document.getElementById('plexusBgCurrency') || 
             document.getElementById('plexusBgRes') || 
             document.getElementById('plexusBgDrops') ||
             document.getElementById('lightningCanvas');
  }
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  // Track mouse coordinates for subtle parallax
  let mouseX = 0, mouseY = 0;
  let targetMouseX = 0, targetMouseY = 0;

  window.addEventListener('mousemove', (e) => {
    targetMouseX = (e.clientX - width / 2) * 0.05;
    targetMouseY = (e.clientY - height / 2) * 0.05;
  });

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  // Twinkling slowly drifting star class
  class Star {
    constructor() {
      this.reset(true);
    }
    reset(init = false) {
      this.x = Math.random() * width;
      this.y = init ? Math.random() * height : -10;
      this.size = Math.random() * 1.6 + 0.4;
      this.speedX = (Math.random() - 0.2) * 0.1; // Slow drift
      this.speedY = (Math.random() * 0.15 + 0.05);
      this.alpha = Math.random();
      this.twinkleSpeed = 0.003 + Math.random() * 0.01;
      this.color = this.getRandomColor();
    }
    getRandomColor() {
      const colors = [
        'rgba(255, 255, 255, ',
        'rgba(0, 243, 255, ',   // Cosmic Cyan
        'rgba(176, 136, 255, ', // Violet/Purple
        'rgba(255, 183, 0, ',   // Gold
      ];
      return colors[Math.floor(Math.random() * colors.length)];
    }
    update() {
      this.x += this.speedX;
      this.y += this.speedY;

      // Twinkle
      this.alpha += this.twinkleSpeed;
      if (this.alpha > 1 || this.alpha < 0.15) {
        this.twinkleSpeed = -this.twinkleSpeed;
      }

      // Reset if out of bounds
      if (this.y > height || this.x < 0 || this.x > width) {
        this.reset(false);
      }
    }
    draw() {
      // Add subtle parallax offset
      const px = this.x + mouseX * (this.size * 0.4);
      const py = this.y + mouseY * (this.size * 0.4);
      
      ctx.fillStyle = this.color + Math.max(0, Math.min(1, this.alpha)) + ')';
      ctx.beginPath();
      ctx.arc(px, py, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Rotating nebula dust cloud class
  class Nebula {
    constructor(x, y, radius, color) {
      this.x = x;
      this.y = y;
      this.radius = radius;
      this.color = color;
      this.angle = Math.random() * Math.PI * 2;
      this.speed = (Math.random() - 0.5) * 0.0003;
    }
    update() {
      this.angle += this.speed;
    }
    draw() {
      ctx.save();
      // Translate to nebula center with parallax
      const px = this.x + mouseX * 0.15;
      const py = this.y + mouseY * 0.15;
      ctx.translate(px, py);
      ctx.rotate(this.angle);

      const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, this.radius);
      grad.addColorStop(0, this.color);
      grad.addColorStop(0.5, this.color.replace('0.06', '0.025').replace('0.05', '0.02').replace('0.04', '0.015'));
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // High-speed shooting meteor class
  class Meteor {
    constructor() {
      this.reset();
    }
    reset() {
      this.x = Math.random() * width * 1.1 - width * 0.1;
      this.y = -60;
      this.length = Math.random() * 90 + 60;
      this.speedX = Math.random() * 7 + 9; // Zoom fast diagonally
      this.speedY = Math.random() * 6 + 7;
      this.alpha = 1.0;
      this.decay = Math.random() * 0.018 + 0.012;
      this.width = Math.random() * 1.8 + 0.8;
      this.color = this.getRandomColor();
    }
    getRandomColor() {
      const colors = [
        { head: '#ffffff', tail: 'rgba(255, 255, 255, ' },
        { head: '#00f3ff', tail: 'rgba(0, 243, 255, ' },
        { head: '#b088ff', tail: 'rgba(176, 136, 255, ' },
        { head: '#ffb700', tail: 'rgba(255, 183, 0, ' }
      ];
      return colors[Math.floor(Math.random() * colors.length)];
    }
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      this.alpha -= this.decay;
    }
    draw() {
      if (this.alpha <= 0) return;
      ctx.save();
      // Draw linear gradient meteor streak
      const grad = ctx.createLinearGradient(
        this.x, 
        this.y, 
        this.x - this.speedX * (this.length / 12), 
        this.y - this.speedY * (this.length / 12)
      );
      grad.addColorStop(0, this.color.head);
      grad.addColorStop(1, this.color.tail + '0)');

      ctx.strokeStyle = grad;
      ctx.lineWidth = this.width;
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(this.x - this.speedX * (this.length / 15), this.y - this.speedY * (this.length / 15));
      ctx.stroke();
      ctx.restore();
    }
  }

  // Setup background elements
  const stars = [];
  const starCount = 140;
  for (let i = 0; i < starCount; i++) {
    stars.push(new Star());
  }

  // Large rotating cosmic nebulae
  const nebulae = [
    new Nebula(width * 0.2, height * 0.35, Math.min(width, height) * 0.65, 'rgba(176, 136, 255, 0.06)'), // Violet-Purple
    new Nebula(width * 0.8, height * 0.65, Math.min(width, height) * 0.55, 'rgba(0, 243, 255, 0.05)'),  // Cosmic Cyan
    new Nebula(width * 0.5, height * 0.5, Math.min(width, height) * 0.75, 'rgba(120, 80, 240, 0.04)')   // Deep space blue-purple
  ];

  const meteors = [];
  const maxMeteors = 2;

  function animate() {
    // Lerp mouse coordinates for smooth inertia effect
    mouseX += (targetMouseX - mouseX) * 0.08;
    mouseY += (targetMouseY - mouseY) * 0.08;

    // Clear canvas
    ctx.fillStyle = '#06040d';
    ctx.fillRect(0, 0, width, height);

    // Draw Nebulae
    for (let i = 0; i < nebulae.length; i++) {
      nebulae[i].update();
      nebulae[i].draw();
    }

    // Draw Stars
    for (let i = 0; i < stars.length; i++) {
      stars[i].update();
      stars[i].draw();
    }

    // Randomly spawn Meteor
    if (meteors.length < maxMeteors && Math.random() < 0.005) {
      meteors.push(new Meteor());
    }

    // Draw Meteors
    for (let i = meteors.length - 1; i >= 0; i--) {
      const m = meteors[i];
      m.update();
      if (m.alpha <= 0) {
        meteors.splice(i, 1);
      } else {
        m.draw();
      }
    }

    requestAnimationFrame(animate);
  }

  animate();
})();
