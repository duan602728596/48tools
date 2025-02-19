if (process.env.NODE_ENV !== 'production') {
  const sourcemap: any = await import('source-map-support');

  sourcemap.install();
}

export {};