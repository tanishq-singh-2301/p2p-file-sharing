import { useEffect, useContext } from "react";
import { useLocation } from "react-router-dom";
import { WebSocketCtx } from "@/context/websocket";
import usePeerOffer from '@/hooks/peerOffer';

const DownloadPage = () => {
	const { pathname } = useLocation();
	const { send, uuid: myId, ws } = useContext(WebSocketCtx);
	const pc = usePeerOffer({ connectTo: pathname.split("/")[1], myId, send, ws, });

	useEffect(() => {
		pc.ondatachannel = ({ channel }) => console.log(channel.label);
	}, [pc]);

	return (
		<div></div>
	);
};

export default DownloadPage;
