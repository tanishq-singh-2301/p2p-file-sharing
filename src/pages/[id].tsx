import { useEffect, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { WebSocketCtx } from '@/context/websocket';
import peerConfig from '@/utils/peerConfig';

interface SocketMessage {
    type?: string;
    sdp?: string;
    myId?: string;
    candidate?: string;
}

const DownloadPage = () => {
    const { pathname } = useLocation();
    const { send, uuid: id, ws } = useContext(WebSocketCtx);

    useEffect(() => {
        const uuid: string = pathname.split("/")[1];
        let pc = new RTCPeerConnection(peerConfig);
        let dc: RTCDataChannel | null;

        pc.addEventListener("datachannel", ({ channel }) => {
            dc = channel;

            (window as any).send = (data: string) => dc?.send(data);

            dc.addEventListener("close", () => {
                pc = new RTCPeerConnection(peerConfig);
                console.log("Closed")
            });
            dc.addEventListener("message", ({ data }) => console.log(data));
            dc.addEventListener("open", () => {
                ws?.close();
                console.log("Opened");
            });
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
                const { type, myId, sdp, candidate } = (JSON.parse(rawData)?.message as SocketMessage);

                if (!type || !myId) return;

                pc.addEventListener("icecandidate", ({ candidate }) => send({
                    type: "sendto",
                    sendTo: uuid,
                    message: {
                        type: "candidate",
                        candidate: JSON.stringify(candidate),
                        myId: id
                    }
                }));

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

                    case "candidate":
                        if (candidate)
                            await pc.addIceCandidate(JSON.parse(candidate));
                        
                        break;
                }
            } catch (error) {
                console.error((error as Error))
            }
        }

        // eslint-disable-next-line
    }, []);

    return (
        <div></div>
    )
}

export default DownloadPage;