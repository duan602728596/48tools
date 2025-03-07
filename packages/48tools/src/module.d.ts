import 'webpack/module';
import type Filenamify from 'filenamify/filenamify';
import type { FunctionComponent } from 'react';

declare namespace NodeJS {
  interface Module {
    hot?: webpack.Hot;
  }
}

declare module 'filenamify/browser' {
  export default Filenamify;
}

declare module '*.css' {
  const style: Record<string, string>;

  export default style;
}

declare module '*.sass' {
  const style: Record<string, string>;

  export default style;
}

declare module '*.scss' {
  const style: Record<string, string>;

  export default style;
}

declare module '*.png' {
  const url: string;

  export default url;
}

declare module '*.jpg' {
  const url: string;

  export default url;
}

declare module '*.jpeg' {
  const url: string;

  export default url;
}

declare module '*.gif' {
  const url: string;

  export default url;
}

declare module '*.webp' {
  const url: string;

  export default url;
}

declare module '*.avif' {
  const url: string;

  export default url;
}

declare module '*.component.svg' {
  const ReactComponent: FunctionComponent;

  export default ReactComponent;
}

declare module '*.svg' {
  const url: string;

  export default url;
}