import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from '@/routes/index';
import { WebSocket } from '@/context/websocket';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
	<React.StrictMode>
		<WebSocket>
			<App />
		</WebSocket>
	</React.StrictMode>
);