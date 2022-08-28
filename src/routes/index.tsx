import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Home, DownloadPage } from './imports';

const App = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path='/' element={<Home />} />
                <Route path='/:id' element={<DownloadPage />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App;