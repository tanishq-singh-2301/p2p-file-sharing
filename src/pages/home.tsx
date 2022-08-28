import Sender from "@/components/sender";
import { useRef, useState, useContext } from "react";
import { WebSocketCtx } from '@/context/websocket';

const Home = () => {
    const input = useRef<HTMLInputElement | null>(null);
    const { uuid } = useContext(WebSocketCtx);
    const [listen, setListen] = useState<boolean>(false);

    return (
        <div className="h-full w-full">
            <main className="h-full w-full flex flex-col justify-center items-center">

                <input
                    type="file"
                    ref={input}
                    multiple
                    onChange={() => {
                        if (uuid && uuid.length) {
                            console.log(window.location.href.concat(uuid));
                            setListen(true);
                        }
                    }}
                />

                {listen && <Sender />}

            </main>
        </div>
    )
}

export default Home;