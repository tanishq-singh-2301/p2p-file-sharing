import { createContext, useEffect, useState } from "react";
import useWebSocket from "react-use-websocket";
import { WebSocketLike } from "react-use-websocket/dist/lib/types";

interface WebSocketInterface {
    ws: WebSocketLike | null;
    uuid: string | null;
}

const initialValue: WebSocketInterface = {
    uuid: null,
    ws: null
}

const WebSocketCtx = createContext<WebSocketInterface>(initialValue);

const WebSocket = ({ children }: { children: JSX.Element | JSX.Element[] }) => {
    const { getWebSocket, sendJsonMessage, lastMessage } = useWebSocket(process.env.REACT_APP_WS_SOCKET as string);
    const [value, setValue] = useState<WebSocketInterface>(initialValue);

    useEffect(() => sendJsonMessage({ type: "whoami" }), []);
    useEffect(() => {
        const data = lastMessage?.data;

        if (typeof data !== "string") return;
        if (data.length === 0) return;

        try {
            const { uid } = JSON.parse(data);

            if (uid) setValue(state => { return { uuid: uid, ws: getWebSocket() } });
        } catch (error) {
            console.error((error as any).message);
        }
    }, [lastMessage]);

    return (
        <WebSocketCtx.Provider value={value}>
            {(value.ws && value.uuid) ? children : <main className="h-full w-full flex justify-center items-center">Loading</main>}
        </WebSocketCtx.Provider>
    )
};

export {
    WebSocket,
    WebSocketCtx
}