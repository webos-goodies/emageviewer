function norm(x, y) {
  return Math.sqrt(x * x + y * y);
}


class Transformer {

  constructor(element) {
    const bounds = element.getBoundingClientRect();
    this.centerX = (bounds.left + bounds.right) / 2;
    this.centerY = (bounds.top + bounds.bottom) / 2;
  }

  norm(x, y) {
    const dx = x - this.centerX, dy = y - this.centerY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  angle(x, y) {
    const dx = x - this.centerX, dy = y - this.centerY;
    return Math.atan2(dy, dx) * 180 / Math.PI;
  }

}


class App {

  constructor() {
    this.element = document.body.querySelector('img');
    this.aspect  = this.element.width / this.element.height;
    this.scale   = 1;
    this.rotate  = 0;
    this.transX  = 0;
    this.transY  = 0;
    this.drag    = null;
    this.clicked = 0;
  }

  run() {
    this.reset();
    this.element.addEventListener('mousedown', this.onMouseDown.bind(this));
    window.addEventListener('mouseup', this.onMouseUp.bind(this));
    window.addEventListener('mousemove', this.onMouseMove.bind(this));
  }

  reset() {
    const viewWidth  = document.documentElement.offsetWidth;
    const viewHeight = document.documentElement.offsetHeight;
    const viewAspect = viewWidth / viewHeight;
    if(viewAspect >= this.aspect) {
      this.element.style.width  = (viewHeight * this.aspect) + 'px';
      this.element.style.height = viewHeight + 'px';
    } else {
      this.element.style.width  = viewWidth + 'px';
      this.element.style.height = (viewWidth / this.aspect) + 'px';
    }
    this.scale  = 1;
    this.rotate = 0;
    this.transX = 0;
    this.transY = 0;
    this.update();
  }

  update() {
    const scale = Math.max(0.1, this.scale);
    this.element.style.transform = `
      translate(${this.transX}px, ${this.transY}px) scale(${scale}) rotate(${this.rotate}deg)`;
  }

  onMouseDown(e) {
    this.drag = { op:'transform', x:e.clientX, y:e.clientY,
                  scale:this.scale, rotate:this.rotate, transX:this.transX, transY:this.transY };
    if(e.altKey) { this.drag.op = 'translate'; }
    e.stopPropagation();
    e.preventDefault();
  }

  onMouseUp(e) {
    if(!this.drag) { return; }
    this.drag = null;
    if(e.timeStamp - this.clicked > 300) {
      e.stopPropagation();
      e.preventDefault();
      this.clicked = e.timeStamp;
    } else {
      this.reset();
      e.stopPropagation();
      e.preventDefault();
    }
  }

  onMouseMove(e) {
    if(!this.drag) { return; }
    e.stopPropagation();
    e.preventDefault();

    if(this.drag.op == 'transform') {
      const t = new Transformer(this.element);
      const scale  = (t.norm(e.clientX, e.clientY) - t.norm(this.drag.x, this.drag.y)) * 0.005;
      this.scale   = this.drag.scale * (1 + scale);
      const rotate = (t.angle(e.clientX, e.clientY) - t.angle(this.drag.x, this.drag.y));
      this.rotate  = this.drag.rotate + rotate;
      if(e.ctrlKey || e.metaKey) {
        this.scale = this.drag.scale;
        if(e.shiftKey || e.altKey) { this.rotate = Math.floor(this.rotate); }
      } else if(e.shiftKey) {
        this.rotate = this.drag.rotate;
      }
    } else {
      this.transX = this.drag.transX + e.clientX - this.drag.x;
      this.transY = this.drag.transY + e.clientY - this.drag.y;
    }
    this.update();
  }

}

(new App()).run();
