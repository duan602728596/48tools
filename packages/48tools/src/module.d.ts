declare module '*.css' {
  const style: { [key: string]: string };

  export default style;
}

declare module '*.sass' {
  const style: { [key: string]: string };

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

declare module '*.component.svg' {
  import type { FunctionComponent } from 'react';

  const ReactComponent: FunctionComponent;

  export default ReactComponent;
}

declare module '*.svg' {
  const url: string;

  export default url;
}

declare module 'worker-loader!*' {
  class WorkerLoader extends Worker {
    constructor(): Worker;
  }

  export default WorkerLoader;
}

declare module '@electron/remote' {
  import type { Remote, Dialog } from 'electron';

  const remote: Remote;
  export const dialog: Dialog;

  export = remote;
}