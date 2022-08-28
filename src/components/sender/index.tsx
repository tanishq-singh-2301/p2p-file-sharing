import { useContext, useEffect } from "react";
import { WebSocketCtx } from '@/context/websocket';
import peerConfig from '@/utils/peerConfig';

interface SocketMessage {
    type?: string;
    sdp?: string;
    myId?: string;
    candidate?: string;
}

const Sender = () => {
    const { uuid, ws, send } = useContext(WebSocketCtx);

    useEffect(() => {
        let pc = new RTCPeerConnection(peerConfig);
        let dc = pc.createDataChannel("data-channel");

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

        if (!ws) return;

        ws.onmessage = async ({ data: rawData }) => {
            if (typeof rawData !== "string") return;
            if (rawData.length === 0) return;

            try {
                const { type, myId, sdp, candidate } = (JSON.parse(rawData)?.message as SocketMessage);

                if (!type || !myId) return;

                pc.addEventListener("icecandidate", ({ candidate }) => candidate && send({
                    type: "sendto",
                    sendTo: myId,
                    message: {
                        type: "candidate",
                        candidate: JSON.stringify(candidate),
                        myId: uuid
                    }
                }));

                switch (type) {
                    case "can-i-get-a-offer":
                        const offer = await pc.createOffer();
                        pc.setLocalDescription(offer)

                        const addCandidate = () => {
                            send({
                                type: "sendto",
                                sendTo: myId,
                                message: {
                                    type: "offer",
                                    sdp: JSON.stringify(pc.localDescription),
                                    myId: uuid
                                }
                            });

                            pc.removeEventListener("icecandidate", addCandidate)
                        }

                        pc.addEventListener("icecandidate", addCandidate);
                        break;

                    case "answer":
                        if (sdp){
                            await pc.setRemoteDescription(JSON.parse(sdp));
                        }

                        break;

                    case "candidate":
                        if (candidate)
                            await pc.addIceCandidate(JSON.parse(candidate));
                        break;
                }
            } catch (error) {
                console.error((error as Error));
            }
        }

        // eslint-disable-next-line
    }, []);

    return (
        <div></div>
    )
}

export default Sender;