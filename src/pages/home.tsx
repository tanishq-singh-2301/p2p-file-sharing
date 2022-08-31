import Sender from "@/components/sender";
import { useRef, useState, useContext } from "react";
import { WebSocketCtx } from '@/context/websocket';

const Home = () => {
    const input = useRef<HTMLInputElement | null>(null);
    const { uuid } = useContext(WebSocketCtx);
    const [listen, setListen] = useState<File | null>(null);

    return (
        <div className="h-full w-full">
            <main className="h-full w-full flex flex-col justify-center items-center">

                <input
                    type="file"
                    ref={input}
                    multiple
                    onChange={() => {
                        if (uuid && uuid.length && input.current && input.current.files && input.current.files[0]) {
                            console.log(window.location.href.concat(uuid));
                            setListen(input.current.files[0]);
                        }
                    }}
                />

                {listen && <Sender file={listen} />}

            </main>
        </div>
    )
}

export default Home;