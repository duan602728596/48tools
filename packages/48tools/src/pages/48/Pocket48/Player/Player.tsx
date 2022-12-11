import { createRoot, type Root } from 'react-dom/client';
import 'antd/dist/reset.css';
import LiveVideo from './LiveVideo';
import '../../../../main.tailwindcss.css';

/* app */
const root: Root = createRoot(document.getElementById('app')!);

root.render(<LiveVideo />);