/* 保存和读取快手的cookie */
class KuaishouCookie {
  static localStorageItemName: string = 'KUAISHOU_COOKIE';

  get cookie(): string | undefined {
    return localStorage.getItem(KuaishouCookie.localStorageItemName) ?? undefined;
  }

  set cookie(v: string | undefined) {
    if (v) {
      localStorage.setItem(KuaishouCookie.localStorageItemName, v);
    }
  }

  clean(): void {
    localStorage.removeItem(KuaishouCookie.localStorageItemName);
  }
}

export const kuaishouCookie: KuaishouCookie = new KuaishouCookie();