import { useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { WebSocketCtx } from '@/context/websocket';
import peerConfig from '@/utils/peerConfig';

interface SocketMessage {
    type?: string;
    sdp?: string;
    myId?: string;
}

const DownloadPage = () => {
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const { send, uuid: id, ws } = useContext(WebSocketCtx);

    useEffect(() => {
        const uuid: string = pathname.split("/")[1];
        const pc = new RTCPeerConnection(peerConfig);
        let dc: RTCDataChannel | null;

        pc.addEventListener("datachannel", ({ channel }) => {
            dc = channel;

            dc.addEventListener("open", () => console.log("Opened"));
            dc.addEventListener("close", () => console.log("Closed"));
            dc.addEventListener("message", ({ data }) => console.log(data));
        });

        send({
            type: "sendto",
            sendTo: uuid,
            message: {
                type: "can-i-get-a-offer",
                sdp: "",
                myId: id
            }
        });

        if (!ws) return;

        ws.onmessage = async ({ data: rawData }) => {
            if (typeof rawData !== "string") return;
            if (rawData.length === 0) return;

            try {
                const { type, myId, sdp } = (JSON.parse(rawData)?.message as SocketMessage);

                if (!type || !myId) return;

                switch (type) {
                    case "offer":
                        if (!sdp) return;
                        await pc.setRemoteDescription(JSON.parse(sdp));

                        const answer = await pc.createAnswer();
                        await pc.setLocalDescription(answer);

                        const addCandidate = () => {
                            send({
                                type: "sendto",
                                sendTo: uuid,
                                message: {
                                    type: "answer",
                                    sdp: JSON.stringify(pc.localDescription),
                                    myId: id
                                }
                            });

                            pc.removeEventListener("icecandidate", addCandidate)
                        }

                        pc.addEventListener("icecandidate", addCandidate);
                        break;

                    case "inuse":
                        alert("Sender already in use, please get another link");
                        navigate("/")
                        break;
                }
            } catch (error) {
                console.error(error)
            }
        }

        // eslint-disable-next-line
    }, []);

    return (
        <div></div>
    )
}

export default DownloadPage;