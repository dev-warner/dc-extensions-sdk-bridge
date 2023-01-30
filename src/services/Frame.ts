export class Frame {
  private height: number = 0;
  constructor(private frame: HTMLIFrameElement) {}

  getFrame() {
    return this.frame;
  }

  getHeight() {
    return this.height;
  }

  setHeight(height: number) {
    this.height = height;
    this.frame.style.height = height + "px";
  }
}
