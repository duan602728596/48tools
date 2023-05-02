/* 记录和处理progress */
class ProgressSet {
  public id: string;    // id
  public progressId: string;
  #value: number = 0;   // 当前值

  constructor(id: string) {
    this.id = id;
    this.progressId = `progress-native-text-${ id }`;
  }

  // 手动更新dom
  update(v: number): void {
    if (v > this.#value) {
      const progress: HTMLElement | null = document.getElementById(this.progressId);

      if (progress) {
        progress.innerHTML = `${ v }%`;
        progress.setAttribute('aria-valuenow', `${ v }`);
        progress.setAttribute('aria-valuetext', `${ v }%`);
      }
    }
  }

  get value(): number {
    return this.#value;
  }

  set value(v: number) {
    this.update(v);
    this.#value = v;
  }
}

export default ProgressSet;