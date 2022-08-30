import { useEffect, useContext } from "react";
import { useLocation } from "react-router-dom";
import { WebSocketCtx } from "@/context/websocket";
import usePeerOffer from '@/hooks/peerOffer';

const DownloadPage = () => {
	const { pathname } = useLocation();
	const { send, uuid: myId, ws } = useContext(WebSocketCtx);
	const pc = usePeerOffer({ connectTo: pathname.split("/")[1], myId, send, ws, });

	useEffect(() => {
		window.onbeforeunload = () => pc.close();
		window.onunload = () => pc.close();
		
		pc.ondatachannel = ({ channel }) => {
			console.log(channel.label);

			channel.onopen = () => {
				ws?.close();
				console.log("Opened");
			};
			channel.onclose = () => console.log("Closed");
		};

		// eslint-disable-next-line
	}, [pc]);

	return (
		<div></div>
	);
};

export default DownloadPage;
