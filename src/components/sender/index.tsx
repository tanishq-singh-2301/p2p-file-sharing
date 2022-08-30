import { useContext, useEffect, useState } from "react";
import { WebSocketCtx } from "@/context/websocket";
import usePeerAnswer from "@/hooks/peerAnswer";

const Sender = () => {
	const { uuid: myId, ws, send } = useContext(WebSocketCtx);
	const [online, setOnline] = useState<boolean>(false);
	const pc = usePeerAnswer({ myId, send, ws });

	useEffect(() => {
		const dc = pc.createDataChannel("channel_1");
		const dc2 = pc.createDataChannel("channel_2");

		dc.onopen = () => setOnline(true);
		dc2.onopen = () => console.log("Opened");

		dc.onclose = () => setOnline(false);
		dc2.onclose = () => console.log("Closed");
		
		// eslint-disable-next-line
	}, []);

	return (
		<div>
			{online ? <span>Connected</span> : <span>Not connected</span>}
		</div>
	);
};

export default Sender;
