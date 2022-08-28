import { useContext, useEffect } from "react";
import { WebSocketCtx } from '@/context/websocket';

interface SenderProps {}

const Sender = ({ }: SenderProps) => {
    const { uuid, ws } = useContext(WebSocketCtx);

    useEffect(() => {

        

    }, []);

    return(
        <div>

        </div>
    )
}

export default Sender;