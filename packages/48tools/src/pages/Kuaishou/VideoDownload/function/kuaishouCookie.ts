/* 保存和读取快手的cookie */
class KuaishouCookie {
  name: string = 'KUAISHOU_COOKIE';

  get cookie(): string | undefined {
    return localStorage.getItem(this.name) ?? undefined;
  }

  set cookie(v: string | undefined) {
    if (v) {
      localStorage.setItem(this.name, v);
    }
  }

  clean(): void {
    localStorage.removeItem(this.name);
  }
}

export const kuaishouCookie: KuaishouCookie = new KuaishouCookie();