(function() {
  'use strict';

  let canvas = document.getElementById('spaceBgCanvas');
  if (!canvas) {
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

  // Track mouse coordinates & gravity portal triggers
  let mouseX = width / 2, mouseY = height / 2;
  let targetMouseX = width / 2, targetMouseY = height / 2;
  let isMouseDown = false;
  let gravityRadius = 0;

  window.addEventListener('mousemove', (e) => {
    targetMouseX = e.clientX;
    targetMouseY = e.clientY;
  });

  window.addEventListener('mousedown', () => {
    isMouseDown = true;
  });

  window.addEventListener('mouseup', () => {
    isMouseDown = false;
  });

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  // Spark particle class shedding from meteor tail
  class MeteorSpark {
    constructor(x, y, vx, vy, color) {
      this.x = x;
      this.y = y;
      this.vx = vx * -0.25 + (Math.random() - 0.5) * 2;
      this.vy = vy * -0.25 + (Math.random() - 0.5) * 2;
      this.size = Math.random() * 1.8 + 0.6;
      this.alpha = 1.0;
      this.decay = Math.random() * 0.05 + 0.035;
      this.color = color;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.alpha -= this.decay;
    }
    draw() {
      ctx.save();
      ctx.globalAlpha = Math.max(0, this.alpha);
      ctx.fillStyle = this.color;
      ctx.shadowBlur = 4;
      ctx.shadowColor = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // Twinkling, drifting star class with realistic larger sizes and 3D layers
  class Star {
    constructor() {
      this.reset(true);
    }
    reset(init = false) {
      this.x = Math.random() * width;
      this.y = init ? Math.random() * height : -20;
      
      // Determine 3D Depth Layer
      const roll = Math.random();
      if (roll < 0.6) {
        // Far stars
        this.layer = 1;
        this.size = Math.random() * 0.8 + 0.6; // Large & visible
        this.speedX = (Math.random() - 0.2) * 0.04;
        this.speedY = Math.random() * 0.06 + 0.02;
        this.parallax = 0.15;
        this.baseAlpha = Math.random() * 0.4 + 0.2;
      } else if (roll < 0.9) {
        // Mid stars
        this.layer = 2;
        this.size = Math.random() * 1.2 + 1.2; // Pronounced mid stars
        this.speedX = (Math.random() - 0.2) * 0.08;
        this.speedY = Math.random() * 0.12 + 0.06;
        this.parallax = 0.45;
        this.baseAlpha = Math.random() * 0.5 + 0.4;
      } else {
        // Close stars
        this.layer = 3;
        this.size = Math.random() * 1.8 + 2.2; // High definition stars
        this.speedX = (Math.random() - 0.2) * 0.15;
        this.speedY = Math.random() * 0.2 + 0.1;
        this.parallax = 0.85;
        this.baseAlpha = Math.random() * 0.4 + 0.6;
      }

      this.alpha = this.baseAlpha;
      this.twinkleSpeed = 0.004 + Math.random() * 0.012;
      this.color = this.getRandomColor();
      
      // Special flare star chance (only close/mid stars)
      this.isFlare = this.layer >= 2 && Math.random() < 0.08;
      this.flareAngle = Math.random() * Math.PI;
      this.flareRotation = (Math.random() - 0.5) * 0.005;
    }
    getRandomColor() {
      const colors = [
        'rgba(255, 255, 255, ',
        'rgba(0, 243, 255, ',   // Cosmic Cyan
        'rgba(176, 136, 255, ', // Purple/Violet
        'rgba(255, 183, 0, ',   // Gold
      ];
      return colors[Math.floor(Math.random() * colors.length)];
    }
    update() {
      // Gravitational warp pull towards cursor if mouse is down
      let dx = mouseX - this.x;
      let dy = mouseY - this.y;
      let dist = Math.hypot(dx, dy);

      if (isMouseDown && dist < 320) {
        // Spiral orbital pull
        const force = (320 - dist) * 0.00015 * this.parallax;
        const angle = Math.atan2(dy, dx) + Math.PI / 2.2;
        this.x += Math.cos(angle) * force * 16;
        this.y += Math.sin(angle) * force * 16;
      } else {
        // Standard cosmic drift
        this.x += this.speedX;
        this.y += this.speedY;
      }

      // Twinkle oscillation
      this.alpha += this.twinkleSpeed;
      if (this.alpha > this.baseAlpha + 0.2 || this.alpha < this.baseAlpha - 0.2) {
        this.twinkleSpeed = -this.twinkleSpeed;
      }
      this.alpha = Math.max(0.1, Math.min(1.0, this.alpha));

      if (this.isFlare) {
        this.flareAngle += this.flareRotation;
      }

      // Reset if out of bounds
      if (this.y > height + 20 || this.x < -20 || this.x > width + 20) {
        this.reset(false);
      }
    }
    draw() {
      // Parallax offsets relative to screen center
      const offsetX = (mouseX - width / 2) * 0.05 * this.parallax;
      const offsetY = (mouseY - height / 2) * 0.05 * this.parallax;
      const px = this.x + offsetX;
      const py = this.y + offsetY;

      ctx.fillStyle = this.color + this.alpha + ')';
      ctx.beginPath();
      ctx.arc(px, py, this.size, 0, Math.PI * 2);
      ctx.fill();

      // Draw cosmic star flares (crosshairs)
      if (this.isFlare && this.alpha > 0.45) {
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(this.flareAngle);
        ctx.strokeStyle = this.color + (this.alpha * 0.5) + ')';
        ctx.lineWidth = 0.6;
        ctx.shadowBlur = 6;
        ctx.shadowColor = ctx.fillStyle;

        ctx.beginPath();
        // Horiz
        ctx.moveTo(-this.size * 5.5, 0);
        ctx.lineTo(this.size * 5.5, 0);
        // Vert
        ctx.moveTo(0, -this.size * 5.5);
        ctx.lineTo(0, this.size * 5.5);
        ctx.stroke();
        ctx.restore();
      }
    }
  }

  // Pulsing, rotating nebula cloud class
  class Nebula {
    constructor(x, y, radius, color, scaleSpeed) {
      this.x = x;
      this.y = y;
      this.radius = radius;
      this.color = color;
      this.angle = Math.random() * Math.PI * 2;
      this.speed = (Math.random() - 0.5) * 0.0002;
      this.scale = 1.0;
      this.scaleSpeed = scaleSpeed;
    }
    update() {
      this.angle += this.speed;
      this.scale += this.scaleSpeed;
      if (this.scale > 1.15 || this.scale < 0.85) {
        this.scaleSpeed = -this.scaleSpeed;
      }
    }
    draw() {
      ctx.save();
      // Screen blend modes for premium glowing overlaps
      ctx.globalCompositeOperation = 'screen';
      
      const offsetX = (mouseX - width / 2) * 0.015;
      const offsetY = (mouseY - height / 2) * 0.015;
      const px = this.x + offsetX;
      const py = this.y + offsetY;
      
      ctx.translate(px, py);
      ctx.rotate(this.angle);

      const r = this.radius * this.scale;
      const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
      grad.addColorStop(0, this.color);
      grad.addColorStop(0.4, this.color.replace('0.06', '0.025').replace('0.05', '0.02').replace('0.04', '0.015'));
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // Realistic 3D Planet class with spherical shading & rings
  class Planet {
    constructor(relX, relY, radius, type, colors, ringSettings = null) {
      this.relX = relX; // Position percentage relative to screen size
      this.relY = relY;
      this.radius = radius;
      this.type = type; // 'gas', 'ice', 'rocky'
      this.colors = colors; // { light, mid, dark }
      this.ringSettings = ringSettings; // { rx, ry, angle, color }
      this.spinAngle = Math.random() * Math.PI * 2;
    }
    update() {
      // Slow orbital spin
      this.spinAngle += 0.0002;
    }
    draw() {
      const baseX = this.relX * width;
      const baseY = this.relY * height;
      
      // Dynamic parallax (planets sit deep in space, slower than stars)
      const px = baseX + (mouseX - width / 2) * 0.012;
      const py = baseY + (mouseY - height / 2) * 0.012;

      ctx.save();

      // 1. Draw BACK part of Saturn-like Ring
      if (this.ringSettings) {
        ctx.save();
        ctx.strokeStyle = this.ringSettings.color;
        ctx.lineWidth = this.radius * 0.12;
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.ringSettings.color;
        
        ctx.beginPath();
        // Ellipse drawn from PI to 2*PI (top half is behind the planet)
        ctx.ellipse(
          px, py, 
          this.ringSettings.rx, 
          this.ringSettings.ry, 
          this.ringSettings.angle, 
          Math.PI, 
          2 * Math.PI
        );
        ctx.stroke();

        // Faint outer ring border
        ctx.strokeStyle = this.ringSettings.color.replace('0.8', '0.3').replace('0.6', '0.2');
        ctx.lineWidth = this.radius * 0.03;
        ctx.beginPath();
        ctx.ellipse(
          px, py, 
          this.ringSettings.rx * 1.25, 
          this.ringSettings.ry * 1.25, 
          this.ringSettings.angle, 
          Math.PI, 
          2 * Math.PI
        );
        ctx.stroke();
        ctx.restore();
      }

      // 2. Draw Planet Sphere Body
      const sphereGrad = ctx.createRadialGradient(
        px - this.radius * 0.3, 
        py - this.radius * 0.3, 
        this.radius * 0.1, 
        px, py, 
        this.radius
      );
      sphereGrad.addColorStop(0, this.colors.light);
      sphereGrad.addColorStop(0.5, this.colors.mid);
      sphereGrad.addColorStop(1, this.colors.dark);

      ctx.fillStyle = sphereGrad;
      ctx.shadowBlur = 40;
      ctx.shadowColor = this.colors.mid;
      ctx.beginPath();
      ctx.arc(px, py, this.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0; // Reset shadow

      // 3. Draw Surface details (Clipped inside the sphere)
      ctx.save();
      ctx.beginPath();
      ctx.arc(px, py, this.radius, 0, Math.PI * 2);
      ctx.clip();

      ctx.translate(px, py);
      ctx.rotate(this.spinAngle);

      if (this.type === 'gas') {
        // Gas giant stripes
        ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.fillRect(-this.radius * 2, -this.radius * 0.4, this.radius * 4, this.radius * 0.16);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
        ctx.fillRect(-this.radius * 2, -this.radius * 0.1, this.radius * 4, this.radius * 0.22);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.fillRect(-this.radius * 2, this.radius * 0.25, this.radius * 4, this.radius * 0.12);
        
        // Large gas storm oval (Jupiter-like storm)
        ctx.fillStyle = 'rgba(160, 50, 50, 0.25)';
        ctx.beginPath();
        ctx.ellipse(this.radius * 0.2, this.radius * 0.15, this.radius * 0.25, this.radius * 0.13, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (this.type === 'ice') {
        // Ice giant stripes
        ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
        ctx.fillRect(-this.radius * 2, -this.radius * 0.5, this.radius * 4, this.radius * 0.1);
        ctx.fillStyle = 'rgba(0, 243, 255, 0.08)';
        ctx.fillRect(-this.radius * 2, this.radius * 0.1, this.radius * 4, this.radius * 0.18);
      } else if (this.type === 'rocky') {
        // Rocky molten craters
        ctx.fillStyle = 'rgba(255, 80, 0, 0.28)';
        ctx.beginPath();
        ctx.arc(-this.radius * 0.35, -this.radius * 0.25, this.radius * 0.32, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = 'rgba(255, 180, 0, 0.22)';
        ctx.beginPath();
        ctx.arc(this.radius * 0.4, this.radius * 0.3, this.radius * 0.25, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // 4. Draw 3D Spherical Shadow (Crescent overlay)
      const shadowGrad = ctx.createRadialGradient(
        px - this.radius * 0.3, 
        py - this.radius * 0.3, 
        this.radius * 0.65, 
        px, py, 
        this.radius * 1.05
      );
      shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
      shadowGrad.addColorStop(0.7, 'rgba(6, 4, 13, 0.72)');
      shadowGrad.addColorStop(1, 'rgba(6, 4, 13, 0.99)');
      ctx.fillStyle = shadowGrad;
      ctx.beginPath();
      ctx.arc(px, py, this.radius + 1, 0, Math.PI * 2);
      ctx.fill();

      // 5. Draw FRONT part of Saturn-like Ring
      if (this.ringSettings) {
        ctx.save();
        ctx.strokeStyle = this.ringSettings.color;
        ctx.lineWidth = this.radius * 0.12;
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.ringSettings.color;
        
        ctx.beginPath();
        // Ellipse drawn from 0 to PI (bottom half is in front of the planet)
        ctx.ellipse(
          px, py, 
          this.ringSettings.rx, 
          this.ringSettings.ry, 
          this.ringSettings.angle, 
          0, 
          Math.PI
        );
        ctx.stroke();

        // Faint outer ring border
        ctx.strokeStyle = this.ringSettings.color.replace('0.8', '0.3').replace('0.6', '0.2');
        ctx.lineWidth = this.radius * 0.03;
        ctx.beginPath();
        ctx.ellipse(
          px, py, 
          this.ringSettings.rx * 1.25, 
          this.ringSettings.ry * 1.25, 
          this.ringSettings.angle, 
          0, 
          Math.PI
        );
        ctx.stroke();
        ctx.restore();
      }

      ctx.restore();
    }
  }

  // Burning Meteor class with particle spark exhaust
  class Meteor {
    constructor() {
      this.reset();
    }
    reset() {
      this.x = Math.random() * width * 0.9 - width * 0.1;
      this.y = -60;
      this.length = Math.random() * 120 + 80;
      this.speedX = Math.random() * 8 + 10; 
      this.speedY = Math.random() * 7 + 8;
      this.alpha = 1.0;
      this.decay = Math.random() * 0.016 + 0.008;
      this.width = Math.random() * 2.2 + 1.2;
      this.color = this.getRandomColor();
    }
    getRandomColor() {
      const colors = [
        { head: '#ffffff', tail: 'rgba(255, 255, 255, ', spark: '#ffb700' },
        { head: '#00f3ff', tail: 'rgba(0, 243, 255, ', spark: '#00f3ff' },
        { head: '#b088ff', tail: 'rgba(176, 136, 255, ', spark: '#b088ff' },
        { head: '#ffb700', tail: 'rgba(255, 183, 0, ', spark: '#ff5500' }
      ];
      return colors[Math.floor(Math.random() * colors.length)];
    }
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      this.alpha -= this.decay;

      // Spawn burning tail spark exhaust particles
      if (this.alpha > 0.15 && Math.random() < 0.7) {
        sparks.push(new MeteorSpark(
          this.x, 
          this.y, 
          this.speedX, 
          this.speedY, 
          this.color.spark
        ));
      }
    }
    draw() {
      if (this.alpha <= 0) return;
      ctx.save();
      // Draw meteor core flare
      ctx.shadowBlur = 15;
      ctx.shadowColor = this.color.head;
      
      const grad = ctx.createLinearGradient(
        this.x, 
        this.y, 
        this.x - this.speedX * (this.length / 10), 
        this.y - this.speedY * (this.length / 10)
      );
      grad.addColorStop(0, this.color.head);
      grad.addColorStop(0.3, this.color.tail + this.alpha + ')');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.strokeStyle = grad;
      ctx.lineWidth = this.width;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(this.x - this.speedX * (this.length / 15), this.y - this.speedY * (this.length / 15));
      ctx.stroke();

      // Draw head node
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.width * 1.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // Setup stars
  const stars = [];
  const starCount = 150;
  for (let i = 0; i < starCount; i++) {
    stars.push(new Star());
  }

  // Setup nebulas
  const nebulae = [
    new Nebula(width * 0.15, height * 0.3, Math.min(width, height) * 0.7, 'rgba(176, 136, 255, 0.06)', 0.0004), 
    new Nebula(width * 0.85, height * 0.7, Math.min(width, height) * 0.6, 'rgba(0, 243, 255, 0.05)', 0.0003),  
    new Nebula(width * 0.5, height * 0.5, Math.min(width, height) * 0.8, 'rgba(120, 80, 240, 0.04)', 0.00025)
  ];

  // Setup 3D realistic planets (spaced out cleanly to prevent overlapping main guides)
  const planets = [
    // Saturn-like golden gas giant in upper right
    new Planet(
      0.82, 0.22, 70, 'gas', 
      { light: '#fed330', mid: '#f39c12', dark: '#2c3e50' }, 
      { rx: 125, ry: 24, angle: -0.2, color: 'rgba(254, 202, 87, 0.75)' }
    ),
    // Neptune-like cyan ice giant in bottom left
    new Planet(
      0.14, 0.8, 55, 'ice', 
      { light: '#00d2ff', mid: '#0072ff', dark: '#0b0c10' }, 
      { rx: 90, ry: 16, angle: 0.25, color: 'rgba(0, 243, 255, 0.55)' }
    ),
    // Volcanic rocky red planet in upper left
    new Planet(
      0.45, 0.14, 38, 'rocky', 
      { light: '#ff3f34', mid: '#7f0000', dark: '#1b0000' }
    )
  ];

  const meteors = [];
  const sparks = [];
  const maxMeteors = 2;

  function animate() {
    // Smooth glide inertia
    mouseX += (targetMouseX - mouseX) * 0.08;
    mouseY += (targetMouseY - mouseY) * 0.08;

    // Void background
    ctx.fillStyle = '#06040d';
    ctx.fillRect(0, 0, width, height);

    // Draw Nebulae
    for (let i = 0; i < nebulae.length; i++) {
      nebulae[i].update();
      nebulae[i].draw();
    }

    // Reset composite operation to normal
    ctx.globalCompositeOperation = 'source-over';

    // Draw Planets (sitting deep in space behind stars)
    for (let i = 0; i < planets.length; i++) {
      planets[i].update();
      planets[i].draw();
    }

    // Draw Constellation Lines (Cosmic Plexus Web) between close Layer 3 stars
    ctx.save();
    ctx.lineWidth = 0.5;
    for (let i = 0; i < starCount; i++) {
      const s1 = stars[i];
      if (s1.layer < 3) continue; // Only draw for close layer stars
      for (let j = i + 1; j < starCount; j++) {
        const s2 = stars[j];
        if (s2.layer < 3) continue;
        
        const dist = Math.hypot(s1.x - s2.x, s1.y - s2.y);
        if (dist < 100) {
          const alpha = (1 - dist / 100) * 0.16 * Math.min(s1.alpha, s2.alpha);
          ctx.strokeStyle = `rgba(0, 243, 255, ${alpha})`;
          ctx.beginPath();
          // Shift offsets for parallax compatibility
          const oX1 = s1.x + (mouseX - width/2)*0.05*s1.parallax;
          const oY1 = s1.y + (mouseY - height/2)*0.05*s1.parallax;
          const oX2 = s2.x + (mouseX - width/2)*0.05*s2.parallax;
          const oY2 = s2.y + (mouseY - height/2)*0.05*s2.parallax;
          ctx.moveTo(oX1, oY1);
          ctx.lineTo(oX2, oY2);
          ctx.stroke();
        }
      }
    }
    ctx.restore();

    // Draw Stars
    for (let i = 0; i < stars.length; i++) {
      stars[i].update();
      stars[i].draw();
    }

    // Spawn Meteor
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

    // Draw Burning Meteor Sparks
    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i];
      s.update();
      if (s.alpha <= 0) {
        sparks.splice(i, 1);
      } else {
        s.draw();
      }
    }

    // Draw pulsing black hole / gravity portal on click
    if (isMouseDown) {
      gravityRadius += (120 - gravityRadius) * 0.08;
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      
      // Pulse ring
      ctx.strokeStyle = 'rgba(0, 243, 255, 0.45)';
      ctx.lineWidth = 1.5;
      ctx.shadowBlur = 12;
      ctx.shadowColor = '#00f3ff';
      ctx.beginPath();
      ctx.arc(mouseX, mouseY, gravityRadius, 0, Math.PI * 2);
      ctx.stroke();

      // Outer ripple
      ctx.strokeStyle = 'rgba(176, 136, 255, 0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(mouseX, mouseY, gravityRadius * 1.5, 0, Math.PI * 2);
      ctx.stroke();

      // Dark core
      const coreGrad = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, gravityRadius * 0.65);
      coreGrad.addColorStop(0, 'rgba(6, 4, 13, 0.95)');
      coreGrad.addColorStop(0.5, 'rgba(176, 136, 255, 0.15)');
      coreGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(mouseX, mouseY, gravityRadius * 0.65, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else {
      gravityRadius = 0;
    }

    requestAnimationFrame(animate);
  }

  animate();
})();
