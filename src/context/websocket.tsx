import { createContext, useEffect, useState } from "react";
import useWebSocket from "react-use-websocket";
import {
	SendJsonMessage,
	WebSocketLike,
} from "react-use-websocket/dist/lib/types";

interface WebSocketInterface {
	ws: WebSocketLike | null;
	uuid: string | null;
	send: SendJsonMessage;
}

let pong: NodeJS.Timer | null;
const initialValue: WebSocketInterface = {
	uuid: null,
	ws: null,
	send: () => undefined,
};

const WebSocketCtx = createContext<WebSocketInterface>(initialValue);

const WebSocket = ({ children }: { children: JSX.Element | JSX.Element[] }) => {
	const [value, setValue] = useState<WebSocketInterface>(initialValue);
	const { getWebSocket, sendJsonMessage, lastMessage } = useWebSocket(
		process.env.REACT_APP_WS_SOCKET as string,
		{
			onClose() {
				if (pong) clearInterval(pong);
			},
		}
	);

	useEffect(() => {
		const data = lastMessage?.data;

		if (typeof data !== "string") return;
		if (data.length === 0) return;

		try {
			const { uid } = JSON.parse(data);
			const ws = getWebSocket();

			if (uid) {
				setValue({
					uuid: uid,
					ws,
					send: sendJsonMessage,
				});

				pong = setInterval(
					() =>
						ws?.readyState === 1 &&
						sendJsonMessage({ type: "pong" }),
					10 * 1000
				);
			}
		} catch (error) {
			console.error(error);
		}

		// eslint-disable-next-line
	}, [lastMessage]);

	// eslint-disable-next-line
	useEffect(() => sendJsonMessage({ type: "whoami" }), []);

	return (
		<WebSocketCtx.Provider value={value}>
			{value.ws && value.uuid ? (
				children
			) : (
				<main className="h-full w-full flex justify-center items-center">
					Loading
				</main>
			)}
		</WebSocketCtx.Provider>
	);
};

export { WebSocket, WebSocketCtx };
